"""
Cliente MT5 para UNA cuenta. Cada firma/cuenta corre en su propio proceso
apuntando a su propio terminal (path). La librería MetaTrader5 se conecta a
un solo terminal por proceso.

Requiere: pip install MetaTrader5 (solo Windows).
"""

from __future__ import annotations
from dataclasses import dataclass
from typing import Optional
import pandas as pd

try:
    import MetaTrader5 as mt5
except Exception:  # permite importar/planear en entornos sin MT5 (ej. Linux)
    mt5 = None

from .risk import SymbolSpec

TF = {
    "M1": 1, "M5": 5, "M15": 15, "M30": 30, "H1": 16385, "H4": 16388, "D1": 16408,
}  # valores de mt5.TIMEFRAME_* (se resuelven en runtime si mt5 existe)


@dataclass
class AccountConfig:
    name: str
    terminal_path: str   # ruta al terminal64.exe de esa firma
    login: int
    password: str
    server: str


class MT5Client:
    def __init__(self, cfg: AccountConfig):
        if mt5 is None:
            raise RuntimeError("MetaTrader5 no está instalado (solo Windows).")
        self.cfg = cfg

    def connect(self) -> None:
        ok = mt5.initialize(
            path=self.cfg.terminal_path,
            login=self.cfg.login,
            password=self.cfg.password,
            server=self.cfg.server,
        )
        if not ok:
            raise ConnectionError(f"[{self.cfg.name}] initialize falló: {mt5.last_error()}")

    def shutdown(self) -> None:
        mt5.shutdown()

    def balance(self) -> float:
        return float(mt5.account_info().balance)

    def symbol_spec(self, symbol: str) -> SymbolSpec:
        mt5.symbol_select(symbol, True)
        s = mt5.symbol_info(symbol)
        return SymbolSpec(
            tick_value=s.trade_tick_value,
            tick_size=s.trade_tick_size,
            volume_min=s.volume_min,
            volume_max=s.volume_max,
            volume_step=s.volume_step,
            digits=s.digits,
        )

    def candles(self, symbol: str, timeframe: str, n: int) -> pd.DataFrame:
        tf = getattr(mt5, f"TIMEFRAME_{timeframe}")
        rates = mt5.copy_rates_from_pos(symbol, tf, 0, n)
        df = pd.DataFrame(rates)
        df["time"] = pd.to_datetime(df["time"], unit="s", utc=True)
        return df

    def market_order(
        self, symbol: str, side: str, lots: float, sl: float, tp: float,
        comment: str = "mecanico",
    ):
        """side: 'buy' o 'sell'. sl/tp en precio."""
        tick = mt5.symbol_info_tick(symbol)
        price = tick.ask if side == "buy" else tick.bid
        order_type = mt5.ORDER_TYPE_BUY if side == "buy" else mt5.ORDER_TYPE_SELL
        req = {
            "action": mt5.TRADE_ACTION_DEAL,
            "symbol": symbol,
            "volume": lots,
            "type": order_type,
            "price": price,
            "sl": sl,
            "tp": tp,
            "deviation": 20,
            "magic": 770077,
            "comment": comment,
            "type_time": mt5.ORDER_TIME_GTC,
            "type_filling": mt5.ORDER_FILLING_IOC,
        }
        return mt5.order_send(req)

    def modify_sl_tp(self, position_ticket: int, sl: Optional[float] = None, tp: Optional[float] = None):
        pos = [p for p in mt5.positions_get() if p.ticket == position_ticket]
        if not pos:
            return None
        p = pos[0]
        req = {
            "action": mt5.TRADE_ACTION_SLTP,
            "position": position_ticket,
            "symbol": p.symbol,
            "sl": sl if sl is not None else p.sl,
            "tp": tp if tp is not None else p.tp,
        }
        return mt5.order_send(req)

    def close_position(self, position_ticket: int):
        pos = [p for p in mt5.positions_get() if p.ticket == position_ticket]
        if not pos:
            return None
        p = pos[0]
        tick = mt5.symbol_info_tick(p.symbol)
        side = mt5.ORDER_TYPE_SELL if p.type == mt5.POSITION_TYPE_BUY else mt5.ORDER_TYPE_BUY
        price = tick.bid if p.type == mt5.POSITION_TYPE_BUY else tick.ask
        req = {
            "action": mt5.TRADE_ACTION_DEAL,
            "symbol": p.symbol,
            "volume": p.volume,
            "type": side,
            "position": position_ticket,
            "price": price,
            "deviation": 20,
            "magic": 770077,
            "comment": "cierre",
            "type_time": mt5.ORDER_TIME_GTC,
            "type_filling": mt5.ORDER_FILLING_IOC,
        }
        return mt5.order_send(req)
