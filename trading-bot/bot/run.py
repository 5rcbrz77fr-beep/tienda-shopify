"""
Loop principal por cuenta. Corre en tu PC Windows con MT5 abierto.

    python -m bot.run --account "Firma1-10k"          # dry-run (por defecto)
    python -m bot.run --account "Firma1-10k" --live    # ejecuta de verdad

Cada firma = su propio terminal + su propio proceso.
Arranca SIEMPRE en dry_run salvo que pases --live y config lo permita.
"""
from __future__ import annotations
import argparse
import time as _time

from .config import AppConfig
from .session import plan_for, ny_now, NY
from .indicators import AtrStop
from .strategy import evaluate_day
from .risk import lots_for_risk
from .mt5_client import MT5Client, AccountConfig
from . import news as newsmod


def _pick_account(cfg: AppConfig, name: str) -> dict:
    for a in cfg.accounts:
        if a["name"] == name:
            return a
    raise SystemExit(f"Cuenta '{name}' no está en config.yaml")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--account", required=True)
    ap.add_argument("--config", default="config.yaml")
    ap.add_argument("--live", action="store_true")
    ap.add_argument("--poll", type=int, default=20, help="segundos entre chequeos")
    args = ap.parse_args()

    cfg = AppConfig.load(args.config)
    acc = _pick_account(cfg, args.account)
    dry = cfg.dry_run or not args.live

    client = MT5Client(AccountConfig(
        name=acc["name"], terminal_path=acc["terminal_path"],
        login=acc["login"], password=acc["password"], server=acc["server"],
    ))
    client.connect()
    print(f"[{acc['name']}] conectado. Modo: {'DRY-RUN' if dry else 'LIVE'}")

    atr = AtrStop(
        period=cfg.strat["sl"]["atr_period"],
        mult=cfg.strat["sl"]["atr_mult"],
        method=cfg.strat["sl"]["atr_method"],
    )
    min_pips = float(cfg.strat["min_breakout_pips"])

    traded_dates: set = set()
    events_cache: dict = {}   # fecha -> lista de eventos bloqueantes

    try:
        while True:
            now = ny_now()
            plan = plan_for(now.date(), nas100=cfg.nas100, us30=cfg.us30)
            symbol = plan.symbol
            pip = cfg.pip_size(symbol)

            # Solo dentro de la ventana de entrada y una vez por día
            in_window = plan.range_end <= now <= plan.breakout_end
            already = plan.trade_date in traded_dates
            has_position = _has_open(client, symbol)

            if in_window and not already and not has_position:
                # Noticias (cachea por día)
                if plan.trade_date not in events_cache and cfg.news_cfg.get("source") != "off":
                    try:
                        allow = tuple(cfg.news_cfg.get("allow_speakers", ["Waller"]))
                        events_cache[plan.trade_date] = newsmod.blocking_events(newsmod.fetch_events(), allow)
                    except Exception as e:
                        print(f"[news] no disponible: {e}")
                        events_cache[plan.trade_date] = []
                blk_events = events_cache.get(plan.trade_date, [])
                news_times = [e.when.astimezone(NY) for e in blk_events]

                blocked, ev = newsmod.is_blocked(
                    now, blk_events,
                    minutes_before=int(cfg.news_cfg.get("allow_if_speaks_after_min", 30)),
                    minutes_after=int(cfg.news_cfg.get("allow_if_speaks_after_min", 30)),
                    allow_speakers=tuple(cfg.news_cfg.get("allow_speakers", ["Waller"])),
                )
                if blocked:
                    print(f"[{symbol}] bloqueado por noticia: {ev.title} @ {ev.when}")
                else:
                    df = client.candles(symbol, cfg.strat["timeframe"], 300)
                    hist = df[df["time"] < plan.range_end]
                    if len(hist) >= atr.period + 2:
                        atr_dist = atr.distance(hist)
                        dec = evaluate_day(df, plan, atr_dist, pip, min_pips, news_times=news_times)
                        if dec.action == "trade":
                            spec = client.symbol_spec(symbol)
                            bal = acc.get("balance_fondeo") if cfg.usar_balance_fondeo else client.balance()
                            lots = lots_for_risk(float(bal), cfg.risk_pct, abs(dec.entry - dec.sl), spec)
                            print(f"[{symbol}] SEÑAL {dec.direction} entry {dec.entry} SL {dec.sl} TP {dec.tp} lots {lots}")
                            if not dry and lots > 0:
                                r = client.market_order(symbol, dec.direction, lots, dec.sl, dec.tp)
                                print(f"  -> order_send: {getattr(r, 'retcode', r)}")
                            traded_dates.add(plan.trade_date)

            # Cierre manual por hora
            if has_position and now >= plan.manual_close and not dry:
                for p in _open_positions(client, symbol):
                    client.close_position(p.ticket)
                    print(f"[{symbol}] cierre manual de {p.ticket}")

            _time.sleep(args.poll)
    finally:
        client.shutdown()


def _open_positions(client: MT5Client, symbol: str):
    import MetaTrader5 as mt5
    return [p for p in (mt5.positions_get(symbol=symbol) or []) if p.magic == 770077]


def _has_open(client: MT5Client, symbol: str) -> bool:
    try:
        return len(_open_positions(client, symbol)) > 0
    except Exception:
        return False


if __name__ == "__main__":
    main()
