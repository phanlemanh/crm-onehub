import tomllib
from functools import lru_cache
from pathlib import Path

CONFIG = Path(__file__).resolve().parent.parent / "config.toml"


@lru_cache(maxsize=1)
def config() -> dict:
    with CONFIG.open("rb") as handle:
        return tomllib.load(handle)


def thresholds() -> dict[str, int]:
    return config()["tiers"]


def tier_of(new_30d: int) -> str:
    limits = thresholds()
    if new_30d >= limits["cao"]:
        return "cao"
    if new_30d >= limits["vua"]:
        return "vua"
    if new_30d >= limits["thap"]:
        return "thap"
    return "ngu"
