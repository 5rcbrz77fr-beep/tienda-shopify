"""
Indicadores. Portado 1:1 de tu código Pine del SL:

    TR   = max(high-low, |high-close[1]|, |low-close[1]|)
    ATR  = SMA(TR, 100)            # tu versión usa SMA (no Wilder)
    SL_d = 1.25 * ATR              # distancia del stop

Todo es parametrizable (periodo, multiplicador, SMA vs Wilder).
"""

from __future__ import annotations
from dataclasses import dataclass
import pandas as pd


def true_range(df: pd.DataFrame) -> pd.Series:
    """True Range clásico. df necesita columnas: high, low, close."""
    prev_close = df["close"].shift(1)
    tr = pd.concat(
        [
            df["high"] - df["low"],
            (df["high"] - prev_close).abs(),
            (df["low"] - prev_close).abs(),
        ],
        axis=1,
    ).max(axis=1)
    return tr


def atr(df: pd.DataFrame, period: int = 100, method: str = "sma") -> pd.Series:
    """
    ATR. method='sma' reproduce tu Pine tal cual.
    method='wilder' usa el suavizado clásico de Wilder (RMA).
    """
    tr = true_range(df)
    if method == "wilder":
        return tr.ewm(alpha=1 / period, adjust=False).mean()
    return tr.rolling(period).mean()  # SMA (tu versión)


@dataclass
class AtrStop:
    period: int = 100
    mult: float = 1.25
    method: str = "sma"  # "sma" (tu Pine) o "wilder"

    def distance(self, df: pd.DataFrame) -> float:
        """Distancia del SL en precio, sobre la última vela cerrada."""
        a = atr(df, self.period, self.method)
        return float(a.iloc[-1] * self.mult)
