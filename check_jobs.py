import json
import re
import sys
import time
from datetime import datetime, timezone
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

DATA_PATH = "data.json"
TIMEOUT = 20
HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; QuantJobTrackerBot/1.0)"}

GRAD_YEAR_PATTERNS = [r"\b2027\b", r"class of 2027", r"graduating in 2027"]
TRADING_PATTERNS = [r"quant(itative)?\s+trad", r"\btrading\b.*\bnew grad\b", r"trader.*new grad", r"new grad.*trader"]
NEWGRAD_PATTERNS = [r"new grad", r"entry[- ]level", r"university grad", r"campus"]


def fetch(url):
    req = Request(url, headers=HEADERS)
    with urlopen(req, timeout=TIMEOUT) as resp:
        raw = resp.read()
    try:
        return raw.decode("utf-8", errors="ignore")
    except Exception:
        return raw.decode("latin-1", errors="ignore")


def strip_tags(html):
    text = re.sub(r"<script.*?</script>", " ", html, flags=re.S | re.I)
    text = re.sub(r"<style.*?</style>", " ", text, flags=re.S | re.I)
    text = re.sub(r"<[^>]+>", " ", text)
    return re.sub(r"\s+", " ", text).lower()


def matches(text):
    has_year = any(re.search(p, text) for p in GRAD_YEAR_PATTERNS)
    has_trading = any(re.search(p, text) for p in TRADING_PATTERNS)
    has_newgrad = any(re.search(p, text) for p in NEWGRAD_PATTERNS)
    return has_year and has_trading and has_newgrad


def check_firm(firm):
    url = firm.get("careersUrl")
    if not url:
        firm["status"] = "unknown"
        return firm
    try:
        html = fetch(url)
        text = strip_tags(html)
        firm["status"] = "open" if matches(text) else "closed"
    except (URLError, HTTPError, TimeoutError, Exception):
        firm["status"] = "unknown"
    return firm


def main():
    with open(DATA_PATH) as f:
        data = json.load(f)

    for firm in data["firms"]:
        check_firm(firm)
        time.sleep(1)

    data["lastChecked"] = datetime.now(timezone.utc).isoformat()

    with open(DATA_PATH, "w") as f:
        json.dump(data, f, indent=2)
        f.write("\n")


if __name__ == "__main__":
    main()
