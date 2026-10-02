"""Φέρνει τα πιο πρόσφατα νέα από τον Κόμβο Επικοινωνίας του ΕΚΠΑ (hub.uoa.gr)
και τα αποθηκεύει στο data/uoa-news.json. Τρέχει αυτόματα κάθε μέρα από το GitHub."""
import json, re, sys, html, urllib.request
import xml.etree.ElementTree as ET
from email.utils import parsedate_to_datetime
from datetime import datetime, timezone

FEED = "https://hub.uoa.gr/feed/"
OUT = "data/uoa-news.json"
MAX_ITEMS = 8
NS = {"content": "http://purl.org/rss/1.0/modules/content/", "media": "http://search.yahoo.com/mrss/"}

def first_img(s):
    m = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', s or "")
    return m.group(1) if m else ""

def clean(s, n=220):
    t = html.unescape(re.sub(r"<[^>]+>", " ", s or ""))
    t = re.sub(r"\s+", " ", t).strip()
    return (t[:n].rsplit(" ", 1)[0] + "…") if len(t) > n else t

def main():
    try:
        req = urllib.request.Request(FEED, headers={"User-Agent": "Mozilla/5.0 (CEI Lab website)"})
        raw = urllib.request.urlopen(req, timeout=30).read()
        root = ET.fromstring(raw)
    except Exception as e:
        print("Δεν ήταν δυνατή η λήψη του feed:", e)
        return 0  # κρατάμε τα προηγούμενα νέα
    items = []
    for it in root.iter("item"):
        title = html.unescape((it.findtext("title") or "").strip())
        link = (it.findtext("link") or "").strip()
        if not title or not link.startswith("http"):
            continue
        try:
            date = parsedate_to_datetime(it.findtext("pubDate")).date().isoformat()
        except Exception:
            date = ""
        content = it.findtext("content:encoded", namespaces=NS) or ""
        desc = it.findtext("description") or ""
        img = ""
        m = it.find("media:content", NS)
        if m is None:
            m = it.find("media:thumbnail", NS)
        if m is not None:
            img = m.get("url", "")
        enc = it.find("enclosure")
        if not img and enc is not None and "image" in (enc.get("type") or ""):
            img = enc.get("url", "")
        img = img or first_img(content) or first_img(desc)
        items.append({"title": title, "link": link, "date": date, "image": img if img.startswith("http") else "",
                      "summary": clean(desc or content)})
        if len(items) >= MAX_ITEMS:
            break
    if not items:
        print("Το feed δεν είχε άρθρα.")
        return 0
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump({"updated": datetime.now(timezone.utc).isoformat(timespec="minutes"), "items": items}, f, ensure_ascii=False, indent=2)
    print(f"Αποθηκεύτηκαν {len(items)} νέα.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
