#!/usr/bin/env python3
"""Builds the site: _src/pages/*.html -> the five pages at the repo root.

Each page body marks its sections as IDA "functions":

    <!--fn name="govtech_red_team" note="red team"-->  ...html...  <!--/fn-->

and the build wraps each one in its disassembly header and footer, numbers it
with a .text address, and lists it in the Functions window on the left.
{{avatar}}, {{beagle}} and {{avatar_big}} become pixel-art SVGs drawn here.

    python3 build.py
"""
from __future__ import annotations

import html
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "_src"

PAGES = [  # (key, file, tab label, <title>, description)
    ("home", "index.html", "home", "Aaron Toh · h8ckth3b0xes",
     "Aaron Toh (h8ckth3b0xes): red teamer and exploit developer in Singapore."),
    ("cyber", "cyber.html", "cyber", "Cyber · Aaron Toh",
     "Red teaming, adversary simulation and exploit development: where Aaron Toh has worked and what he has built."),
    ("projects", "projects.html", "projects", "Projects · Aaron Toh",
     "Things Aaron Toh has built, from a personal finance operating system to games and AI tools."),
    ("sport", "sport.html", "sport", "Sport · Aaron Toh",
     "Team Singapore baseball #5, Asian Games 2023, and what sport taught a red teamer."),
    ("life", "life.html", "life", "Life · Aaron Toh",
     "Food, hikes, the gym and the people: Aaron Toh off the keyboard."),
]
EXTRA = [("404", "404.html", "Segmentation fault · Aaron Toh", "This page doesn't exist.")]

# ------------------------------------------------------------------ pixel art
PALETTE = {
    "o": "#0d141c", "r": "#d0383a", "b": "#9e2629", "s": "#f0c39a", "h": "#2a2a2e",
    "e": "#11161c", "m": "#c47e62", "w": "#e3a857", "d": "#0d141c", "n": "#f2efe6",
    "W": "#f4f1ea", "k": "#14171c", "c": "#d0383a", "g": "#2a3846", "a": "#1a2430",
    "L": "#95cf86", "Y": "#e3a857",
}
AVATAR = [  # 16x16: him, in the national-team cap and an amber hoodie
    "......oooo......",
    "....oorrrroo....",
    "...orrrrrrrro...",
    "..orrrrrrrrrro..",
    "..obbbbbbbbbbbbo",
    "..ohssssssssho..",
    "..ossessssesso..",
    "..osssssssssso..",
    "..osssmmmmssso..",
    "...ossssssssso..",
    "....oossssoo....",
    "..oowwwddwwwoo..",
    ".owwwwwddwwwwwo.",
    ".owwwwwwwwwwwwo.",
    ".owwwwwwwwwwwwo.",
    ".oooooooooooooo.",
]
JERSEY = [  # 16x18: the same him, in a Singapore jersey with a 5
    "......oooo......",
    "....oorrrroo....",
    "...orrrrrrrro...",
    "..orrrrrrrrrro..",
    "..obbbbbbbbbbbbo",
    "..ohssssssssho..",
    "..ossessssesso..",
    "..osssssssssso..",
    "..osssmmmmssso..",
    "...ossssssssso..",
    "....oossssoo....",
    "..oonnnnnnnnoo..",
    ".onnnnnnnnnnnno.",
    ".onnnnrrrnnnnno.",
    ".onnnnrnnnnnnno.",
    ".onnnnrrrnnnnno.",
    ".onnnnnnrnnnnno.",
    ".onnnnrrrnnnnno.",
]
BEAGLE = [  # a beagle asleep on a server rack (a nod, not a copy)
    "............WWWW....",
    "..........WWWWWWk...",
    ".........kWWWWWWW...",
    "........kkWWWkWWW...",
    "........kk.WWWW.....",
    "..WWWWWWWWWWWc......",
    ".WWWWWWWWWWWWW......",
    "..WW..WW...WW.WW....",
    "gggggggggggggggggggg",
    "gaaaaaaaaaaaaaaaaaag",
    "gaLaLaYaaaaaaaaaaaag",
    "gaaaaaaaaaaaaaaaaaag",
    "gaLaYaLaaaaaaaaaaaag",
    "gggggggggggggggggggg",
]


def pixels(rows: list[str], label: str, attrs: str = "") -> str:
    width = max(len(r) for r in rows)
    rects = []
    for y, row in enumerate(rows):
        for x, ch in enumerate(row.ljust(width, ".")):
            if ch != ".":
                rects.append('<rect x="{}" y="{}" width="1" height="1" fill="{}"/>'.format(x, y, PALETTE[ch]))
    return ('<svg viewBox="0 0 {w} {h}" role="img" aria-label="{l}" shape-rendering="crispEdges"{a}>{r}</svg>'
            .format(w=width, h=len(rows), l=html.escape(label), a=attrs, r="".join(rects)))


ART = {
    "{{avatar}}": pixels(AVATAR, "Pixel-art Aaron in a red cap", ' data-avatar tabindex="0"'),
    "{{avatar_plain}}": pixels(AVATAR, "Pixel-art Aaron"),
    "{{jersey}}": pixels(JERSEY, "Pixel-art Aaron in a Singapore jersey, number 5"),
    "{{beagle}}": pixels(BEAGLE, "A beagle asleep on a server rack"),
}

# ------------------------------------------------------------------ functions
FN = re.compile(r'<!--fn name="([a-z0-9_]+)"(?: note="([^"]*)")?-->(.*?)<!--/fn-->', re.S)


def functions(body: str, base: int) -> tuple[str, list[tuple[str, str]]]:
    index: list[tuple[str, str]] = []
    addr = base

    def wrap(m: re.Match) -> str:
        nonlocal addr
        name, note, inner = m.group(1), m.group(2) or "", m.group(3)
        a = "{:08X}".format(addr)
        end = "{:08X}".format(addr + 0x1F0)
        index.append((a, name))
        head = ('<div class="fn-head"><div><span class="a">.text:{a}</span><span class="c">; =============== S U B R O U T I N E ===============</span></div>'
                '<div><span class="a">.text:{a}</span>{n}</div>'
                '<div><span class="a">.text:{a}</span><span class="p">{name}</span> <span class="k">proc near</span></div></div>').format(
                    a=a, name=name, n='<span class="c">; {}</span>'.format(html.escape(note)) if note else "")
        foot = '<div class="fn-end" aria-hidden="true"><span class="a">.text:{}</span>{} endp</div>'.format(end, name)
        addr += 0x200
        return '<section class="fn" id="{}">{}<div class="fn-body">{}</div>{}</section>'.format(name, head, inner, foot)

    return FN.sub(wrap, body), index


ATLAS_ALIAS = {"United States": "United States of America", "DR Congo": "Dem. Rep. Congo",
               "Central African Republic": "Central African Rep.", "Bosnia and Herzegovina": "Bosnia and Herz.",
               "Dominican Republic": "Dominican Rep.", "Equatorial Guinea": "Eq. Guinea", "South Sudan": "S. Sudan",
               "Solomon Islands": "Solomon Is.", "North Macedonia": "Macedonia", "Eswatini": "eSwatini"}


def travel_json() -> None:
    """assets/data/travel.json: what the map draws. Cities only once he has named them."""
    import json, sys
    sys.path.insert(0, str(SRC))
    import countries as C, cities as Ci
    coords = {c: {n: (la, lo) for n, la, lo in v} for c, v in Ci.OPTIONS.items()}
    picked = []
    for country, names in getattr(Ci, "VISITED_CITIES", {}).items():
        for n in names:
            la, lo = coords[country][n]
            picked.append({"name": n, "country": country, "lat": la, "lon": lo})
    for country, name, la, lo in getattr(Ci, "EXTRA_CITIES", []):
        picked.append({"name": name, "country": country, "lat": la, "lon": lo})
    a = lambda n: ATLAS_ALIAS.get(n, n)
    data = {"home": {"name": Ci.HOME[0], "lat": Ci.HOME[1], "lon": Ci.HOME[2]},
            "visited": sorted(a(c) for c in C.VISITED), "wishlist": sorted(a(c) for c in C.WISHLIST),
            "display": {a(c): c for c in C.ALL if a(c) != c}, "cities": picked}
    (ROOT / "assets" / "data" / "travel.json").write_text(json.dumps(data, ensure_ascii=False, indent=1))


def countries() -> str:
    """The Life page's world: every country as a breakpoint, hit or not."""
    import sys
    sys.path.insert(0, str(SRC))
    import countries as C
    hit = C.VISITED | {C.HOME}
    total = len(C.ALL)
    conts = sum(1 for names in C.WORLD.values() if any(c in hit for c in names))
    atlas = ('<div class="atlas" id="atlas">'
             '<div class="hud"><div><b>{hit}</b><span>/ {total} countries</span></div><div><b>{conts}</b><span>/ 7 continents</span></div>'
             '<div><b data-s="places">soon</b><span>places pinned</span></div><div><b data-s="far">–</b><span>furthest from home</span></div></div>'
             '<div class="stage"><canvas aria-label="Interactive globe of the countries Aaron has visited. Drag to spin."></canvas>'
             '<div class="tip" hidden></div><pre class="tlog" hidden></pre>'
             '<p class="noscript">The interactive globe needs JavaScript; every country is listed below.</p></div>'
             '<div class="mtools"><button type="button" data-a="globe" aria-pressed="true">◍ globe</button>'
             '<button type="button" data-a="flat" aria-pressed="false">▭ flat</button>'
             '<button type="button" data-a="spin" aria-pressed="true">⟳ spin</button>'
             '<button type="button" data-a="trace" class="go">▶ trace route</button>'
             '<span class="hint">drag to spin · tap a pin · tap a country in the list to fly there</span></div>'
             '</div>').format(hit=len(hit), total=total, conts=conts)
    out = ['<div class="world">', atlas,
           '<div class="wsum"><span class="big">{}</span><span>/ {} countries hit</span><span class="pct">{:.1f}% of the world</span></div>'.format(len(hit), total, 100 * len(hit) / total),
           '<div class="wbar" aria-hidden="true"><span style="width:{:.2f}%"></span></div>'.format(100 * len(hit) / total),
           '<div class="wtools"><input type="search" id="wfind" placeholder="find a country" aria-label="Find a country" autocomplete="off">'
           '<span class="lg"><i class="d hit"></i>been</span><span class="lg"><i class="d home"></i>home</span>'
           '<span class="lg"><i class="d wish"></i>next</span><span class="lg"><i class="d"></i>not yet</span></div>']
    for cont, names in C.WORLD.items():
        n = sum(1 for c in names if c in hit)
        out.append('<details class="cont" open><summary><span>{}</span><span class="cnt">{} / {}</span></summary><ul>'.format(cont, n, len(names)))
        for c in sorted(names, key=lambda x: (x not in hit, x not in C.WISHLIST, x)):
            cls = "home" if c == C.HOME else "hit" if c in C.VISITED else "wish" if c in C.WISHLIST else ""
            tag = {"home": "home", "hit": "been", "wish": "next"}.get(cls, "")
            out.append('<li class="{}" data-n="{}" data-atlas="{}"><i class="d {}"></i>{}{}</li>'.format(
                cls, html.escape(c.lower()), html.escape(ATLAS_ALIAS.get(c, c)), cls, html.escape(c), '<em>{}</em>'.format(tag) if tag else ""))
        out.append("</ul></details>")
    out.append("</div>")
    return "".join(out)


LAYOUT = (SRC / "layout.html").read_text()


def favicon() -> str:
    from urllib.parse import quote
    svg = pixels(AVATAR, "h8ckth3b0xes").replace('role="img" aria-label="h8ckth3b0xes" ', 'xmlns="http://www.w3.org/2000/svg" ')
    return "data:image/svg+xml," + quote(svg)


def all_functions() -> list[dict]:
    out = []
    for i, (key, file, label, _, _) in enumerate(PAGES):
        body = (SRC / "pages" / file).read_text()
        for j, m in enumerate(FN.finditer(body)):
            text = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>|\{\{[a-z_]+\}\}", " ", m.group(3)))).strip()
            head = re.search(r"<h[12][^>]*>(.*?)</h[12]>", m.group(3), re.S)
            title = html.unescape(re.sub(r"<[^>]+>", "", head.group(1))).strip() if head else ""
            out.append({"page": label, "file": file, "name": m.group(1), "note": title or (m.group(2) or ""),
                        "k": text[:400].lower(),
                        "addr": "{:06X}".format((0x401000 + i * 0x10000 + j * 0x200) & 0xFFFFFF)})
    return out


def build() -> None:
    travel_json()
    import json
    index = json.dumps(all_functions(), ensure_ascii=False).replace("</", "<\\/")
    pages = [(k, o, l, t, d) for k, o, l, t, d in PAGES] + [(k, o, None, t, d) for k, o, t, d in EXTRA]
    for i, (key, out, _, title, desc) in enumerate(pages):
        body = (SRC / "pages" / out).read_text()
        body, fns = functions(body, 0x401000 + i * 0x10000)
        for k, v in ART.items():
            body = body.replace(k, v)
        if "{{countries}}" in body:
            body = body.replace("{{countries}}", countries())
        tabs = "".join(
            '<a href="{f}"{cur}>{lbl}<span class="ext">.asm</span></a>'.format(
                f=f, lbl=lbl, cur=' aria-current="page"' if k == key else "")
            for k, f, lbl, _, _ in PAGES)
        fnlist = "".join('<li><a href="#{n}"><span>{a}</span><span>{n}</span></a></li>'.format(a=a[-6:], n=n) for a, n in fns)
        page = (LAYOUT.replace("{{title}}", html.escape(title)).replace("{{desc}}", html.escape(desc))
                .replace("{{page}}", key).replace("{{file}}", "" if out == "index.html" else out)
                .replace("{{favicon}}", favicon()).replace("{{tabs}}", tabs).replace("{{fnlist}}", fnlist)
                .replace("{{count}}", str(len(fns))).replace("{{index}}", index).replace("{{body}}", body))
        for k, v in ART.items():
            page = page.replace(k, v)
        assert "{{" not in page, (out, re.findall(r"\{\{[a-z_]+\}\}", page))
        (ROOT / out).write_text(page)
        print("built", out, "·", len(fns), "functions")


if __name__ == "__main__":
    build()
