"""
Simulación de la gestión de un trade a lo largo de velas M15 posteriores.
Se usa tanto en backtest como referencia para la gestión en vivo:

  - BE en 1:3: al alcanzar 3R de ganancia flotante, mover SL a entry.
  - Cierre por TP / SL (según lo que toque primero dentro de la vela).
  - Cierre manual a la hora de plan.manual_close si no tocó TP/SL.
"""
from __future__ import annotations
from dataclasses import dataclass
from datetime import datetime
import pandas as pd

from .strategy import Decision
from .session import SessionPlan


@dataclass
class TradeResult:
    outcome: str        # "tp" | "sl" | "be" | "manual"
    r_multiple: float   # resultado en múltiplos de R (riesgo)
    exit_time: datetime
    exit_price: float


def simulate(dec: Decision, plan: SessionPlan, df15: pd.DataFrame,
             move_be_at_rr: float = 3.0) -> TradeResult:
    assert dec.action == "trade" and dec.entry is not None
    entry, sl, tp = dec.entry, dec.sl, dec.tp
    risk = abs(entry - sl)
    is_buy = dec.direction == "buy"
    be_moved = False
    cur_sl = sl

    after = df15[df15["time"] > dec.entry_time].sort_values("time")
    for c in after.itertuples(index=False):
        # ¿alcanzó 3R para mover a BE?
        if not be_moved:
            fav = (c.high - entry) if is_buy else (entry - c.low)
            if fav >= move_be_at_rr * risk:
                cur_sl = entry
                be_moved = True

        hit_tp = (c.high >= tp) if is_buy else (c.low <= tp)
        hit_sl = (c.low <= cur_sl) if is_buy else (c.high >= cur_sl)

        # Si en la misma vela toca ambos, asumimos SL primero (conservador)
        if hit_sl:
            r = (cur_sl - entry) / risk if is_buy else (entry - cur_sl) / risk
            return TradeResult("be" if be_moved and cur_sl == entry else "sl", r, c.time, cur_sl)
        if hit_tp:
            r = (tp - entry) / risk if is_buy else (entry - tp) / risk
            return TradeResult("tp", r, c.time, tp)

        # Cierre manual por hora
        if c.time >= plan.manual_close:
            px = c.close
            r = (px - entry) / risk if is_buy else (entry - px) / risk
            return TradeResult("manual", r, c.time, px)

    # sin datos suficientes
    last = after.iloc[-1] if not after.empty else None
    if last is not None:
        px = float(last["close"])
        r = (px - entry) / risk if is_buy else (entry - px) / risk
        return TradeResult("manual", r, last["time"], px)
    return TradeResult("manual", 0.0, dec.entry_time, entry)
