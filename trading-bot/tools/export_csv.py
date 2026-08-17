"""
Exporta velas M15 desde tu MT5 a un CSV listo para el backtest.

Requisitos: MT5 ABIERTO y logueado en tu PC, y `pip install MetaTrader5`.

Uso (ejemplos):
  python -m tools.export_csv --symbol NAS100 --bars 20000 --out nas100_m15.csv
  python -m tools.export_csv --symbol US30   --bars 20000 --out us30_m15.csv

El CSV queda con columnas: time,open,high,low,close  (time = epoch en segundos),
que es justo lo que espera:  python -m tools.backtest --csv nas100_m15.csv
"""
from __future__ import annotations
import argparse
import csv

try:
    import MetaTrader5 as mt5
except Exception:
    mt5 = None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--symbol", required=True, help="ej. NAS100, US30 (tal cual lo llama tu broker)")
    ap.add_argument("--bars", type=int, default=20000, help="cuántas velas M15 traer (20000 ~ 8 meses)")
    ap.add_argument("--out", required=True, help="archivo CSV de salida")
    args = ap.parse_args()

    if mt5 is None:
        raise SystemExit("Instala primero: pip install MetaTrader5 (solo Windows).")

    if not mt5.initialize():
        raise SystemExit(f"No pude conectar con MT5 (¿está abierto y logueado?): {mt5.last_error()}")

    mt5.symbol_select(args.symbol, True)
    rates = mt5.copy_rates_from_pos(args.symbol, mt5.TIMEFRAME_M15, 0, args.bars)
    mt5.shutdown()

    if rates is None or len(rates) == 0:
        raise SystemExit(f"No obtuve velas para '{args.symbol}'. Revisa el nombre exacto del símbolo.")

    with open(args.out, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["time", "open", "high", "low", "close"])
        for r in rates:
            w.writerow([int(r["time"]), r["open"], r["high"], r["low"], r["close"]])

    print(f"OK: {len(rates)} velas M15 de {args.symbol} -> {args.out}")
    print(f"Ahora corre:  python -m tools.backtest --csv {args.out} --symbol {args.symbol} --pip 1.0")


if __name__ == "__main__":
    main()
