"""
Backtest de la estrategia sobre un CSV de velas M15.

CSV con columnas: time, open, high, low, close
  - time puede ser epoch (segundos) o ISO 8601.
Uso:
  python -m tools.backtest --csv datos_m15.csv --symbol NAS100 --pip 1.0
"""
from __future__ import annotations
import argparse
import pandas as pd

from bot.session import plan_for, NY
from bot.indicators import AtrStop
from bot.strategy import evaluate_day
from bot.manage import simulate


def load_csv(path: str, tz_offset_hours: float = 0.0) -> pd.DataFrame:
    """
    Acepta varios formatos:
      - Mi formato:      time,open,high,low,close   (time epoch o ISO)
      - Export de MT5:   <DATE> <TIME> <OPEN> <HIGH> <LOW> <CLOSE> ...  (tab)
      - TradingView:     time/Date, open, high, low, close
    tz_offset_hours: offset del reloj del CSV respecto a UTC real. Los datos de
      MT5 vienen en hora del SERVIDOR del broker (ej. GMT+2 => tz_offset_hours=2);
      se restan para llevar a UTC real (necesario para anclar a NY).
    """
    # detectar separador (coma, tab o ;)
    df = pd.read_csv(path, sep=None, engine="python")
    df.columns = [c.strip().strip("<>").lower() for c in df.columns]

    if "date" in df.columns and "time" in df.columns:
        ts = pd.to_datetime(df["date"].astype(str) + " " + df["time"].astype(str),
                             utc=True, errors="coerce")
    else:
        col = "time" if "time" in df.columns else df.columns[0]
        t = df[col]
        if pd.api.types.is_numeric_dtype(t):
            ts = pd.to_datetime(t, unit="s", utc=True)
        else:
            ts = pd.to_datetime(t, utc=True, errors="coerce")

    # llevar de hora del broker a UTC real
    if tz_offset_hours:
        ts = ts - pd.to_timedelta(tz_offset_hours, unit="h")

    out = pd.DataFrame({
        "time": ts,
        "open": pd.to_numeric(df["open"], errors="coerce"),
        "high": pd.to_numeric(df["high"], errors="coerce"),
        "low": pd.to_numeric(df["low"], errors="coerce"),
        "close": pd.to_numeric(df["close"], errors="coerce"),
    }).dropna().sort_values("time").reset_index(drop=True)
    return out


def run(csv: str, symbol: str, pip: float, atr_period: int, atr_mult: float,
        atr_method: str, min_pips: float, tz_offset: float = 0.0):
    df = load_csv(csv, tz_offset_hours=tz_offset)
    atr = AtrStop(period=atr_period, mult=atr_mult, method=atr_method)

    ny_dates = sorted({ts.tz_convert(NY).date() for ts in df["time"]})
    trades, wins, r_total = 0, 0, 0.0
    print(f"{'Fecha':<12} {'Símbolo':<7} {'Dir':<4} {'Salida':<7} {'R':>7}")
    print("-" * 44)

    for day in ny_dates:
        plan = plan_for(day, nas100=symbol, us30="US30")
        hist = df[df["time"] < plan.range_end]
        if len(hist) < atr_period + 2:
            continue
        atr_dist = atr.distance(hist)
        if atr_dist <= 0:
            continue

        dec = evaluate_day(df, plan, atr_distance=atr_dist, pip_size=pip, min_pips=min_pips)
        if dec.action != "trade":
            continue

        res = simulate(dec, plan, df)
        trades += 1
        r_total += res.r_multiple
        if res.r_multiple > 0:
            wins += 1
        print(f"{str(day):<12} {plan.symbol:<7} {dec.direction:<4} {res.outcome:<7} {res.r_multiple:>7.2f}")

    print("-" * 44)
    wr = (wins / trades * 100) if trades else 0
    print(f"Trades: {trades} | Ganadores: {wins} ({wr:.0f}%) | R total: {r_total:+.2f} | R prom: {(r_total/trades if trades else 0):+.2f}")


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--csv", required=True)
    p.add_argument("--symbol", default="NAS100")
    p.add_argument("--pip", type=float, default=1.0)
    p.add_argument("--atr-period", type=int, default=100)
    p.add_argument("--atr-mult", type=float, default=1.25)
    p.add_argument("--atr-method", default="sma", choices=["sma", "wilder"])
    p.add_argument("--min-pips", type=float, default=8.0)
    p.add_argument("--tz-offset", type=float, default=0.0,
                   help="offset horario del CSV vs UTC (MT5 broker suele ser 2 o 3)")
    a = p.parse_args()
    run(a.csv, a.symbol, a.pip, a.atr_period, a.atr_mult, a.atr_method, a.min_pips, a.tz_offset)
