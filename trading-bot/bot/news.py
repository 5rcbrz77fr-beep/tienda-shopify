"""
Filtro de noticias con el calendario semanal de ForexFactory.

Endpoint público (JSON): https://nfs.faireconomy.media/ff_calendar_thisweek.json
Cada evento: {title, country, date (ISO con tz), impact, forecast, previous}

Reglas:
  - No operar si hay FOMC o habla Powell dentro de la ventana de bloqueo.
  - Ventana: [E - minutes_before, E + minutes_after] alrededor del evento E.
    Con before=after=30, la regla "si habló 30min antes ya se puede operar"
    queda cubierta (el trade cae fuera de la ventana).
  - Speakers permitidos (ej. Waller) NO bloquean.
"""

from __future__ import annotations
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Optional
import json
import urllib.request

FF_URL = "https://nfs.faireconomy.media/ff_calendar_thisweek.json"

# Palabras clave que consideramos "bloqueantes" (USD, alto impacto)
BLOCK_KEYWORDS = ("FOMC", "Federal Funds Rate", "Powell")


@dataclass
class NewsEvent:
    title: str
    country: str
    when: datetime      # tz-aware
    impact: str

    def matches_block(self, allow_speakers: tuple[str, ...]) -> bool:
        if self.country != "USD":
            return False
        title = self.title
        # Permitidos (ej. Waller) no bloquean
        if any(sp.lower() in title.lower() for sp in allow_speakers):
            return False
        if any(k.lower() in title.lower() for k in BLOCK_KEYWORDS):
            return True
        # Cualquier evento de alto impacto en USD también bloquea (opcional)
        return self.impact.lower() == "high"


def fetch_events(url: str = FF_URL, timeout: int = 15) -> list[NewsEvent]:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        data = json.loads(r.read().decode("utf-8"))
    out: list[NewsEvent] = []
    for it in data:
        try:
            when = datetime.fromisoformat(it["date"])
        except Exception:
            continue
        out.append(NewsEvent(
            title=it.get("title", ""),
            country=it.get("country", ""),
            when=when,
            impact=it.get("impact", ""),
        ))
    return out


def blocking_events(events: list[NewsEvent], allow_speakers: tuple[str, ...] = ("Waller",)) -> list[NewsEvent]:
    return [e for e in events if e.matches_block(allow_speakers)]


def is_blocked(
    signal_time: datetime,
    events: list[NewsEvent],
    minutes_before: int = 30,
    minutes_after: int = 30,
    allow_speakers: tuple[str, ...] = ("Waller",),
) -> tuple[bool, Optional[NewsEvent]]:
    """¿El horario de la señal cae en la ventana de bloqueo de algún evento?"""
    for e in blocking_events(events, allow_speakers):
        start = e.when - timedelta(minutes=minutes_after)   # ventana simétrica
        end = e.when + timedelta(minutes=minutes_before)
        if start <= signal_time <= end:
            return True, e
    return False, None
