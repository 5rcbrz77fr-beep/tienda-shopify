"""Carga config.yaml a estructuras simples."""
from __future__ import annotations
from dataclasses import dataclass, field
from typing import Any
import yaml


@dataclass
class AppConfig:
    raw: dict[str, Any]

    @classmethod
    def load(cls, path: str = "config.yaml") -> "AppConfig":
        with open(path, "r", encoding="utf-8") as f:
            return cls(raw=yaml.safe_load(f))

    # accesos cómodos
    @property
    def accounts(self) -> list[dict]:
        return self.raw.get("accounts", [])

    @property
    def risk_pct(self) -> float:
        return float(self.raw["risk"]["pct"])

    @property
    def usar_balance_fondeo(self) -> bool:
        return bool(self.raw["risk"].get("usar_balance_fondeo", True))

    def pip_size(self, symbol: str) -> float:
        return float(self.raw["symbols"]["pip_size"].get(symbol, 1.0))

    @property
    def nas100(self) -> str:
        return self.raw["symbols"].get("default", "NAS100")

    @property
    def us30(self) -> str:
        return self.raw["symbols"]["by_month"].get(6, "US30")

    @property
    def strat(self) -> dict:
        return self.raw["strategy"]

    @property
    def news_cfg(self) -> dict:
        return self.raw.get("news", {})

    @property
    def safety(self) -> dict:
        return self.raw.get("safety", {})

    @property
    def dry_run(self) -> bool:
        return bool(self.safety.get("dry_run", True))
