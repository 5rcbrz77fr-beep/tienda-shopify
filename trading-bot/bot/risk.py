"""
Gestión de riesgo y cálculo de lotaje.

Regla: arriesgar `risk_pct` del balance de CADA cuenta.
Ej: cuenta 10k, riesgo 1% -> $100 en riesgo. El lotaje se calcula
para que, si el precio recorre la distancia del SL, la pérdida sea
exactamente ~ el dinero en riesgo.
"""

from __future__ import annotations
from dataclasses import dataclass
import math


@dataclass
class SymbolSpec:
    """Datos que vienen de mt5.symbol_info(symbol)."""
    tick_value: float   # trade_tick_value: valor monetario de 1 tick por 1 lote
    tick_size: float    # trade_tick_size: tamaño mínimo de movimiento de precio
    volume_min: float
    volume_max: float
    volume_step: float
    digits: int


def _round_step(volume: float, step: float) -> float:
    # Redondea HACIA ABAJO al múltiplo del step (nunca pasarse del riesgo).
    return math.floor(volume / step) * step


def lots_for_risk(
    balance: float,
    risk_pct: float,
    sl_distance_price: float,
    spec: SymbolSpec,
) -> float:
    """
    Devuelve el lotaje para arriesgar `risk_pct` del balance con un SL
    de `sl_distance_price` (en precio, no en pips).
    """
    if sl_distance_price <= 0 or spec.tick_size <= 0:
        return 0.0

    risk_money = balance * risk_pct
    # Pérdida por 1 lote si el precio recorre toda la distancia del SL:
    ticks = sl_distance_price / spec.tick_size
    loss_per_lot = ticks * spec.tick_value
    if loss_per_lot <= 0:
        return 0.0

    raw = risk_money / loss_per_lot
    vol = _round_step(raw, spec.volume_step)
    vol = max(spec.volume_min, min(spec.volume_max, vol))
    return round(vol, 2)


def pips_to_price(pips: float, spec: SymbolSpec, pip_size: float) -> float:
    """Convierte pips a precio. pip_size lo defines por símbolo en el config."""
    return pips * pip_size
