# Bot MT5 — Estrategia mecánica (sesión NY)

Bot de ejecución para MetaTrader 5 que opera **una estrategia mecánica de rango/rompimiento**
en la sesión de Nueva York, sobre varias cuentas de fondeo a la vez.

> ⚠️ **Aviso:** automatizar trading con dinero real conlleva riesgo. Este bot **ejecuta reglas**,
> no garantiza resultados. Se arranca en `dry_run` (solo marca señales) para validar contra tu
> análisis antes de arriesgar capital.

## Cómo funciona (arquitectura)

- **1 proceso por cuenta.** La librería `MetaTrader5` se conecta a un solo terminal por proceso.
  Para 4 firmas → 4 terminales instalados + 4 procesos (`python -m bot.run --account Firma1`).
- **Riesgo 1% independiente por cuenta** (10k → $100, 25k → $250, …). Lotaje calculado con
  `tick_value`/`tick_size` reales del símbolo (`bot/risk.py`).
- **SL por ATR** = `1.25 × ATR(100)` (portado de tu Pine, en `bot/indicators.py`; SMA o Wilder).
- **Motor de estrategia** separado de la ejecución: rango → cierre M15 fuera ≥ 8 pips → SL/TP →
  BE en 1:3 → filtros de noticias → cierre manual por hora. (en construcción)

## Estructura

```
trading-bot/
├─ bot/
│  ├─ indicators.py   # ATR / SL (portado de tu Pine)  ✅
│  ├─ risk.py         # tamaño de posición 1%           ✅
│  ├─ mt5_client.py   # conexión y órdenes MT5          ✅
│  ├─ strategy.py     # reglas de entrada/salida        ⏳ (pendiente confirmar horarios/símbolo)
│  └─ run.py          # loop principal por cuenta        ⏳
├─ config.example.yaml
└─ requirements.txt
```

## Instalación (en tu PC Windows con MT5)

```bash
python -m venv venv && venv\Scripts\activate
pip install -r requirements.txt
copy config.example.yaml config.yaml   # y edítalo con tus cuentas
```

## Uso

**Validar la estrategia (backtest, sin riesgo)** — exportá velas M15 a CSV (`time,open,high,low,close`):
```bash
python -m tools.backtest --csv datos_m15.csv --symbol NAS100 --pip 1.0
```

**Test de la lógica (velas sintéticas):**
```bash
python -m tools.test_synth
```

**Correr en vivo (dry-run por defecto):**
```bash
python -m bot.run --account "Firma1-10k"          # solo marca señales
python -m bot.run --account "Firma1-10k" --live    # ejecuta (cuando estés listo)
```

## Estado

- ✅ Sesión anclada a NY (DST automático), símbolo/TP por mes.
- ✅ Motor de estrategia (rango, rompimiento ≥8p, débil→confirma, doble barrido, SL ATR, TP por mes) — **6/6 tests pasan**.
- ✅ Gestión de trade: BE en 1:3, cierre por TP/SL, cierre manual por hora.
- ✅ Riesgo 1% → lotaje con specs reales del símbolo.
- ✅ Noticias ForexFactory (FOMC/Powell bloquean; Waller permitido).
- ✅ Loop por cuenta (dry-run) + backtest sobre CSV.

## Pendiente de confirmar contigo

1. **Pip en índices:** asumí `1 pip = 1.0 punto` (entonces "8 pips" = 8 puntos en NAS100/US30). ¿Correcto?
2. **Cierre manual meses especiales:** mapeé tus horas ARG a NY (Mar/Jun 15:30 NY, Nov 16:30 NY). Confirmar.
3. **ATR:** dejé SMA(100)×1.25 (tu Pine). ¿Probamos también Wilder(14) en backtest?
4. Regla noticia 11/12 con trade previo a 1:0.5 → falta afinar el manejo pre-noticia (hook listo).
