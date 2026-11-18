"""Φέρνει αυτόματα τα πιο πρόσφατα νέα:
  - από τον Κόμβο Επικοινωνίας του ΕΚΠΑ (hub.uoa.gr)       -> "items"
  - από τις ανακοινώσεις του Τμήματος Κοινωνιολογίας        -> "soc"
και τα αποθηκεύει στο data/uoa-news.json. Τρέχει κάθε μέρα από το GitHub.
Αν μια πηγή δεν απαντήσει, κρατά τα προηγούμενα νέα της."""
import json, re, sys, html, urllib.request
import xml.etree.ElementTree as ET
from email.utils import parsedate_to_datetime
from datetime import datetime, timezone

FEEDS = {
    "items": ["https://hub.uoa.gr/feed/"],
    "soc": [
        "https://www.soc.uoa.gr/feed/",
        "https://www.soc.uoa.gr/nea/all/feed/",
        "html:https://www.soc.uoa.gr/nea/all/",
    ],
}
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

def fetch_html(url):
    """Εναλλακτικά: διαβάζει απευθείας τη σελίδα ανακοινώσεων (WordPress)."""
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (CoIn Lab website)"})
    page = urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "replace")
    items, seen = [], set()
    pat = r'<h[2-4][^>]*>\s*<a[^>]+href="(https?://(?:www\.)?soc\.uoa\.gr/(\d{4})/(\d{2})/(\d{2})/[^"]+)"[^>]*>(.*?)</a>'
    for m in re.finditer(pat, page, re.S | re.I):
        link = m.group(1)
        if link in seen:
            continue
        seen.add(link)
        items.append({"title": clean(m.group(5), 300), "link": link,
                      "date": f"{m.group(2)}-{m.group(3)}-{m.group(4)}", "image": "", "summary": ""})
        if len(items) >= MAX_ITEMS:
            break
    return items

def fetch(url):
    if url.startswith("html:"):
        return fetch_html(url[5:])
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (CoIn Lab website)"})
    root = ET.fromstring(urllib.request.urlopen(req, timeout=30).read())
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
        items.append({"title": title, "link": link, "date": date,
                      "image": img if img.startswith("http") else "", "summary": clean(desc or content)})
        if len(items) >= MAX_ITEMS:
            break
    return items

def main():
    try:
        data = json.load(open(OUT, encoding="utf-8"))
    except Exception:
        data = {}
    changed = False
    for key, urls in FEEDS.items():
        for url in urls:
            try:
                items = fetch(url)
            except Exception as e:
                print(f"[{key}] Δεν ήταν δυνατή η λήψη από {url}: {e}")
                continue
            if items:
                data[key] = items
                changed = True
                print(f"[{key}] Αποθηκεύτηκαν {len(items)} νέα από {url}")
                break
            print(f"[{key}] Χωρίς άρθρα στο {url}")
    if changed:
        data["updated"] = datetime.now(timezone.utc).isoformat(timespec="minutes")
        with open(OUT, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    return 0

if __name__ == "__main__":
    sys.exit(main())
