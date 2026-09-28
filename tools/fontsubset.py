#!/usr/bin/env python3
"""fonts/index-sans.woff2 — Pretendard Variable cut down to this site's own interface text.

Pretendard is Copyright (c) 2021 Kil Hyung-jin, licensed under the SIL Open Font License 1.1 with
the Reserved Font Name "Pretendard". A subset is a Modified Version under that licence, so the cut
file is renamed "Index Sans" (it may not carry the reserved name) and ships with the licence
(fonts/OFL.txt, and nameID 13/14 inside the file). The copyright line is kept as it was.

  cd site && python3 tools/fontsubset.py [PretendardVariable.woff2]      # needs fonttools + brotli
  python3 tools/fontsubset.py --check                                    # coverage only, no write

The source file comes from the npm package (npm pack pretendard → package/dist/web/variable/woff2/).
Kept: Latin, digits and punctuation whole; every Hangul syllable in app.js, engine.js, index.html
and 404.html; every Hangul syllable in the data fields the interface draws in this face (source,
category, year claim, size, sale kind) on both fixture pages; and EXTRA below — names that are
likely to turn up next (platforms, categories). Listing titles are not drawn in this face's Hangul
(app.css: Index Latin), so they are not needed here.
"""
import json, re, sys, os
from pathlib import Path

SITE = Path(__file__).resolve().parent.parent
OUT = SITE / 'fonts' / 'index-sans.woff2'
SRC_DEFAULT = '/tmp/pt/package/dist/web/variable/woff2/PretendardVariable.woff2'
FILES = ['app.js', 'engine.js', 'index.html', '404.html']
FIXTURES = ['fixtures/helmut-lang/index.html', 'fixtures/ccp/index.html']
FIELDS = ['r', 's', 'q', 'z', 'sk']
EXTRA = ('야후옥션 야후 플리마 메루카리 메르카리 라쿠마 세컨드스트리트 후루츠패밀리 번개장터 당근 중고나라 '
         '조조유즈드 트레팩 래그태그 빈티드 포시마크 디팝 그레일드 베스티어 이베이 '
         '아우터 데님 팬츠 상의 테일러링 신발 가방·액세서리 기타 셔츠 주얼리 소품 가방 '
         '본인기 프라다기 초기 초반 중반 후반 년대 무렵 구입 낙찰 즉시 구매 판매 완료 '
         '일본 한국 해외 미국 영국 이탈리아 오스트리아 프랑스 독일 벨기에 '
         '월 화 수 목 금 토 일 요일 오전 오후 시 분 초 건 곳 점 원 엔')
HANGUL = re.compile('[가-힣]')
FEATURES = 'kern,liga,calt,tnum,case,ss01,ss02,ss03,ss04,ss05,ss06'
UNICODES = ('U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,'
            'U+2000-206F,U+20A9,U+20AC,U+2122,U+2190-2199,U+2212,U+2215,U+25A0-25FF,U+3000-303F,U+FF01-FF5E,U+FFE6')


def data_of(page):
    t = page.read_text('utf8')
    m = t.find('id="__data"')
    if m < 0: return {}
    s = t.find('>', m) + 1
    return json.loads(t[s:t.find('</script>', s)])


def wanted():
    chars = set()
    for f in FILES:
        chars |= set(HANGUL.findall((SITE / f).read_text('utf8')))
    for fx in FIXTURES:
        p = SITE / fx
        if not p.exists(): continue
        d = data_of(p)
        for it in d.get('items', []):
            for k in FIELDS:
                chars |= set(HANGUL.findall(str(it.get(k) or '')))
        for s in d.get('sources', []) or []:
            chars |= set(HANGUL.findall((s.get('name') or '') + (s.get('how') or '') + (s.get('m') or '')))
        for k in (d.get('sections') or {}): chars |= set(HANGUL.findall(k))
    chars |= set(HANGUL.findall(EXTRA))
    return chars


def covered(font_path):
    from fontTools.ttLib import TTFont
    return set(chr(c) for c in TTFont(str(font_path)).getBestCmap())


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    need = wanted()
    if '--check' in sys.argv:
        have = covered(OUT)
        miss = sorted(need - have)
        print(f'{OUT.name}: {len(need)} Hangul needed, {len(miss)} missing' + (': ' + ''.join(miss) if miss else ''))
        sys.exit(1 if miss else 0)
    src = args[0] if args else SRC_DEFAULT
    from fontTools import subset
    from fontTools.ttLib import TTFont
    opts = subset.Options()
    opts.flavor = 'woff2'
    opts.layout_features = FEATURES.split(',')
    opts.name_IDs = ['*']
    opts.name_legacy = True
    opts.name_languages = ['*']
    opts.notdef_outline = True
    opts.hinting = False
    opts.desubroutinize = True
    font = subset.load_font(src, opts)
    sub = subset.Subsetter(opts)
    uni = set()
    for part in UNICODES.split(','):
        a, _, b = part[2:].partition('-')
        uni |= set(range(int(a, 16), int(b or a, 16) + 1))
    sub.populate(unicodes=uni | {ord(c) for c in need})
    sub.subset(font)
    # the reserved name may not stay on a Modified Version (OFL 1.1, condition 3)
    name = font['name']
    for rec in name.names:
        v = rec.toUnicode()
        if 'Pretendard' in v and rec.nameID not in (0,):
            rec.string = v.replace('Pretendard Variable', 'Index Sans').replace('PretendardVariable', 'IndexSans').replace('Pretendard', 'Index Sans')
    lic = 'This Font Software is licensed under the SIL Open Font License, Version 1.1. Modified (subset and renamed) from Pretendard by Kil Hyung-jin.'
    for pid, eid, lid in ((3, 1, 0x409), (1, 0, 0)):
        name.setName(lic, 13, pid, eid, lid)
        name.setName('https://openfontlicense.org', 14, pid, eid, lid)
    OUT.parent.mkdir(exist_ok=True)
    subset.save_font(font, str(OUT), opts)
    have = covered(OUT)
    miss = sorted(need - have)
    print(f'wrote {OUT.relative_to(SITE)} · {os.path.getsize(OUT)//1024} KB · {len(need)} Hangul' + (f' · missing from the source: {"".join(miss)}' if miss else ''))


if __name__ == '__main__':
    main()
