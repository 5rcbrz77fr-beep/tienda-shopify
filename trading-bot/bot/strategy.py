"""
Motor de la estrategia mecánica (rango de apertura NY + rompimiento M15).

Reglas implementadas (de tu documento):
  1. Rango = high/low entre range_start y range_end (02:00–09:30 NY).
  2. Entrada = una vela M15 CIERRA fuera del rango >= min_pips (8), dentro de
     la ventana de entrada (09:30–10:45 NY).
  3. Rompimiento débil (< 8 pips): esperar confirmación de la(s) vela(s)
     siguiente(s):
       - si la siguiente cierra con cuerpo DENTRO del rango -> no operar.
       - si cierra en contra pero NO reingresa al rango -> seguir esperando.
       - si una vela cierra a favor >= 8 pips -> confirmar entrada.
  4. Si barre con mecha un lado y rompe (cierra) el otro -> no operar.
  5. SL = distancia ATR (1.25*ATR100 por tu Pine). TP = rr * SL.
  6. Regla de noticia en la vela siguiente a la entrada: si hay noticia en la
     vela inmediatamente posterior al rompimiento, se exige que esa vela cierre
     a favor del quiebre; si cierra en contra -> no operar.

Devuelve una Decision con log de motivos (para dry-run/backtest).
"""

from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, Sequence
import pandas as pd

from .session import SessionPlan, NY


@dataclass
class Decision:
    action: str                      # "trade" | "no_trade"
    reasons: list[str] = field(default_factory=list)
    direction: Optional[str] = None  # "buy" | "sell"
    entry: Optional[float] = None
    sl: Optional[float] = None
    tp: Optional[float] = None
    rr: Optional[float] = None
    range_high: Optional[float] = None
    range_low: Optional[float] = None
    entry_time: Optional[datetime] = None


def _in_window(df: pd.DataFrame, start: datetime, end: datetime) -> pd.DataFrame:
    t = df["time"]
    return df[(t >= start) & (t < end)].sort_values("time").reset_index(drop=True)


def _has_news(candle_open: datetime, tf_minutes: int, news_times: Sequence[datetime]) -> bool:
    candle_close = candle_open + pd.Timedelta(minutes=tf_minutes)
    for n in news_times:
        if candle_open <= n < candle_close:
            return True
    return False


def evaluate_day(
    df15: pd.DataFrame,
    plan: SessionPlan,
    atr_distance: float,
    pip_size: float,
    min_pips: float = 8.0,
    tf_minutes: int = 15,
    news_times: Sequence[datetime] = (),
) -> Decision:
    """
    df15: velas M15 del día (columnas: time[UTC tz-aware], open, high, low, close),
          con suficiente historia previa para el ATR ya calculado por el caller.
    """
    d = Decision(action="no_trade", reasons=[])
    min_price = min_pips * pip_size

    # --- 1) Rango ---
    rng = _in_window(df15, plan.range_start, plan.range_end)
    if rng.empty:
        d.reasons.append("Sin velas en la ventana de rango.")
        return d
    rh = float(rng["high"].max())
    rl = float(rng["low"].min())
    d.range_high, d.range_low = rh, rl

    # --- 2) Ventana de rompimiento ---
    bo = _in_window(df15, plan.range_end, plan.breakout_end)
    if bo.empty:
        d.reasons.append("Sin velas en la ventana de entrada.")
        return d

    swept_up = False    # algún high previo por encima del rango
    swept_dn = False    # algún low previo por debajo del rango
    pending: Optional[str] = None  # "up" | "down" (rompimiento débil en curso)

    rows = list(bo.itertuples(index=False))
    for i, c in enumerate(rows):
        o, h, l, cl, t = c.open, c.high, c.low, c.close, c.time
        close_up = cl > rh
        close_dn = cl < rl
        up_pips = (cl - rh) / pip_size if close_up else 0.0
        dn_pips = (rl - cl) / pip_size if close_dn else 0.0

        # Regla 4: mecha un lado y cierra el otro (barrido doble) -> no operar
        if close_up and (swept_dn or l < rl):
            d.reasons.append(f"{t}: barrió abajo y cerró arriba (doble barrido) -> no operar.")
            return d
        if close_dn and (swept_up or h > rh):
            d.reasons.append(f"{t}: barrió arriba y cerró abajo (doble barrido) -> no operar.")
            return d

        # Confirmación fuerte inmediata
        strong = None
        if close_up and up_pips >= min_pips:
            strong = "up"
        elif close_dn and dn_pips >= min_pips:
            strong = "down"

        # Manejo de rompimiento débil pendiente
        if pending == "up":
            if close_up and up_pips >= min_pips:
                strong = "up"
            elif rl <= cl <= rh:
                d.reasons.append(f"{t}: reingresó al rango tras quiebre débil -> no operar.")
                return d
            elif close_dn:
                d.reasons.append(f"{t}: quiebre débil arriba y luego cierre abajo -> no operar.")
                return d
            else:
                d.reasons.append(f"{t}: sigue débil arriba (<{min_pips}p), espero confirmación.")
                continue
        elif pending == "down":
            if close_dn and dn_pips >= min_pips:
                strong = "down"
            elif rl <= cl <= rh:
                d.reasons.append(f"{t}: reingresó al rango tras quiebre débil -> no operar.")
                return d
            elif close_up:
                d.reasons.append(f"{t}: quiebre débil abajo y luego cierre arriba -> no operar.")
                return d
            else:
                d.reasons.append(f"{t}: sigue débil abajo (<{min_pips}p), espero confirmación.")
                continue

        if strong is not None:
            # Regla 6: noticia en la vela siguiente -> exigir cierre a favor
            nxt = rows[i + 1] if i + 1 < len(rows) else None
            if nxt is not None and _has_news(nxt.time, tf_minutes, news_times):
                favor = (strong == "up" and nxt.close > rh) or (strong == "down" and nxt.close < rl)
                if not favor:
                    d.reasons.append(f"{nxt.time}: noticia y la vela no cerró a favor -> no operar.")
                    return d
                entry_row = nxt
            else:
                entry_row = c

            return _build_signal(d, plan, strong, entry_row, atr_distance, rh, rl)

        # Rompimiento débil nuevo
        if close_up and 0 < up_pips < min_pips:
            pending = "up"
            swept_up = True
            d.reasons.append(f"{t}: quiebre débil arriba ({up_pips:.1f}p<{min_pips}) -> espero.")
            continue
        if close_dn and 0 < dn_pips < min_pips:
            pending = "down"
            swept_dn = True
            d.reasons.append(f"{t}: quiebre débil abajo ({dn_pips:.1f}p<{min_pips}) -> espero.")
            continue

        # Actualizar barridos por mecha
        if h > rh:
            swept_up = True
        if l < rl:
            swept_dn = True

    d.reasons.append("Fin de ventana sin rompimiento válido -> no operar.")
    return d


def _build_signal(d: Decision, plan: SessionPlan, direction_key: str, row,
                  atr_distance: float, rh: float, rl: float) -> Decision:
    side = "buy" if direction_key == "up" else "sell"
    entry = float(row.close)  # en vivo se entra al open de la vela siguiente (mercado)
    if side == "buy":
        sl = entry - atr_distance
        tp = entry + plan.tp_rr * atr_distance
    else:
        sl = entry + atr_distance
        tp = entry - plan.tp_rr * atr_distance
    d.action = "trade"
    d.direction = side
    d.entry = entry
    d.sl = round(sl, 5)
    d.tp = round(tp, 5)
    d.rr = plan.tp_rr
    d.entry_time = row.time
    d.reasons.append(
        f"{row.time}: ENTRADA {side.upper()} @ {entry} | SL {d.sl} | TP {d.tp} | RR 1:{plan.tp_rr}"
    )
    return d
