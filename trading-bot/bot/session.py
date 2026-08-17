"""
Lógica de sesión anclada a hora de Nueva York.

Insight clave: tú piensas en hora Argentina (UTC-3, no cambia), y el "/" de
los horarios aparece porque Nueva York cambia de horario (EST/EDT). En hora
de NY la sesión SIEMPRE es la misma; zoneinfo maneja el DST automáticamente.

    Rango:            02:00 -> 09:30  (NY)   = apertura de la bolsa
    Ventana entrada:  09:30 -> 10:45  (NY)
    Cierre manual:    16:30           (NY)   (normal)

Símbolo y TP por mes (según tus reglas):
    - Jun/Jul/Nov -> US30 ; resto del año -> NAS100
    - Mar/Jun/Nov -> TP 1:2.5 ; resto -> TP 1:4
"""

from __future__ import annotations
from dataclasses import dataclass
from datetime import datetime, time, date
from zoneinfo import ZoneInfo

NY = ZoneInfo("America/New_York")
ARG = ZoneInfo("America/Argentina/Buenos_Aires")
UTC = ZoneInfo("UTC")

# Horario canónico en hora de NY
RANGE_START = time(2, 0)
RANGE_END = time(9, 30)        # también = inicio de ventana de entrada
BREAKOUT_END = time(10, 45)
MANUAL_CLOSE = time(16, 30)

# Cierre manual especial por mes (en hora NY). PENDIENTE confirmar contigo:
# tú diste (hora ARG) Mar/Jun 16:30 y Nov 17:30 -> convertido a NY.
MANUAL_CLOSE_BY_MONTH = {
    3: time(15, 30),   # Marzo
    6: time(15, 30),   # Junio
    11: time(16, 30),  # Noviembre (~ igual al normal)
}

US30_MONTHS = {6, 7, 11}
TP_2_5_MONTHS = {3, 6, 11}


@dataclass
class SessionPlan:
    trade_date: date            # fecha en NY
    symbol: str
    tp_rr: float
    range_start: datetime       # tz-aware (NY)
    range_end: datetime
    breakout_end: datetime
    manual_close: datetime

    def arg(self, dt: datetime) -> datetime:
        return dt.astimezone(ARG)


def symbol_for_month(month: int, nas100: str = "NAS100", us30: str = "US30") -> str:
    return us30 if month in US30_MONTHS else nas100


def tp_rr_for_month(month: int, special: float = 2.5, default: float = 4.0) -> float:
    return special if month in TP_2_5_MONTHS else default


def plan_for(day: date, nas100: str = "NAS100", us30: str = "US30") -> SessionPlan:
    """Construye el plan de sesión para una fecha (interpretada en NY)."""
    m = day.month

    def at(t: time) -> datetime:
        return datetime.combine(day, t, tzinfo=NY)

    close_t = MANUAL_CLOSE_BY_MONTH.get(m, MANUAL_CLOSE)
    return SessionPlan(
        trade_date=day,
        symbol=symbol_for_month(m, nas100, us30),
        tp_rr=tp_rr_for_month(m),
        range_start=at(RANGE_START),
        range_end=at(RANGE_END),
        breakout_end=at(BREAKOUT_END),
        manual_close=at(close_t),
    )


def ny_now() -> datetime:
    return datetime.now(tz=UTC).astimezone(NY)
