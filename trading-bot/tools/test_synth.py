"""
Test de la lógica de estrategia con velas SINTÉTICAS (sin MT5, sin red).
Valida: rompimiento fuerte, débil->confirma, débil->reingresa, doble barrido,
sin rompimiento. Ejecutar:  python -m tools.test_synth
"""
from __future__ import annotations
from datetime import date, time, datetime
import pandas as pd

from bot.session import plan_for, NY
from bot.strategy import evaluate_day

DAY = date(2025, 8, 12)   # agosto -> NAS100, TP 1:4, NY en EDT
PIP = 1.0
ATR = 5.0                 # distancia SL fija para el test
RH, RL = 100.0, 90.0      # rango objetivo


def _candle(t: time, o, h, l, c):
    return {"time": pd.Timestamp(datetime.combine(DAY, t), tz=NY), "open": o, "high": h, "low": l, "close": c}


def build_day(breakouts):
    """Velas de rango que fijan RH/RL, + velas de rompimiento dadas."""
    rows = []
    # velas de rango 02:00..09:15 (dentro de [02:00, 09:30))
    hh, mm = 2, 0
    first = True
    while (hh, mm) < (9, 30):
        if first:
            rows.append(_candle(time(hh, mm), 95, RH, RL, 96))  # fija el alto/bajo del rango
            first = False
        else:
            rows.append(_candle(time(hh, mm), 96, 99, 91, 95))
        mm += 15
        if mm == 60:
            mm = 0
            hh += 1
    # velas de rompimiento
    for t, (o, h, l, c) in breakouts.items():
        rows.append(_candle(t, o, h, l, c))
    return pd.DataFrame(rows)


def run(name, breakouts, expect_action, expect_dir=None):
    plan = plan_for(DAY)
    df = build_day(breakouts)
    dec = evaluate_day(df, plan, atr_distance=ATR, pip_size=PIP, min_pips=8.0)
    ok = dec.action == expect_action and (expect_dir is None or dec.direction == expect_dir)
    print(f"[{'OK ' if ok else 'FAIL'}] {name}: -> {dec.action} {dec.direction or ''}")
    for r in dec.reasons[-2:]:
        print(f"        · {r}")
    assert ok, f"{name} esperaba {expect_action}/{expect_dir}, obtuvo {dec.action}/{dec.direction}"
    return dec


if __name__ == "__main__":
    # A) Rompimiento fuerte arriba (10 pips) -> BUY
    run("A fuerte arriba", {time(9, 30): (100, 111, 99, 110)}, "trade", "buy")

    # B) Débil (4p) y luego confirma (12p) -> BUY
    run("B debil->confirma", {
        time(9, 30): (100, 105, 99, 104),
        time(9, 45): (104, 113, 103, 112),
    }, "trade", "buy")

    # C) Débil (4p) y reingresa al rango -> NO opera
    run("C debil->reingresa", {
        time(9, 30): (100, 105, 99, 104),
        time(9, 45): (104, 106, 94, 95),
    }, "no_trade")

    # D) Barre abajo con mecha y cierra arriba -> NO opera
    run("D doble barrido", {time(9, 30): (100, 111, 85, 108)}, "no_trade")

    # E) Sin rompimiento (cierra dentro) -> NO opera
    run("E sin rompimiento", {
        time(9, 30): (96, 99, 91, 97),
        time(9, 45): (97, 99, 92, 96),
    }, "no_trade")

    # F) Fuerte abajo (10p) -> SELL
    run("F fuerte abajo", {time(9, 30): (90, 91, 79, 80)}, "trade", "sell")

    print("\n✅ Todos los escenarios pasaron.")
