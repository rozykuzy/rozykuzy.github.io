# Archive Index

https://rozykuzy.github.io/

Helmut Lang(1986–2005)과 Carol Christian Poell 두 아카이브, 그리고 브랜드 131개를 한 화면에서 보는 색인.

- **데이터** 이 저장소에는 매물 데이터가 없다. 같은 사이트의 두 브랜드 페이지
  [/helmut-lang/](https://rozykuzy.github.io/helmut-lang/) · [/ccp/](https://rozykuzy.github.io/ccp/)가
  매일 발행하는 페이지 안의 `<script id="__data">`를 열 때마다 읽는다. 두 인덱스가 갱신되면 여기도 바로 바뀐다.
- **읽는 규칙** `engine.js` — 두 브랜드 페이지 템플릿의 연도·모티프·검색·표기 규칙을 그대로 떼어 온 생성 파일.
  템플릿이 바뀌면 `tools/extract.mjs`로 다시 만든다.
- **저장** 브라우저 localStorage `hlx.saved` · `ccpx.saved` — 두 브랜드 페이지와 같은 키라 어느 쪽에서 저장해도 같은 목록이다.
  브랜드 매물은 `brx.saved` 하나에 `<slug>|<매물 키>` 로, 값은 같은 `{k,p,u,d,g}`. 지난 방문일도 `aix.visit.brx`(slug → 날짜) 하나에 둔다
- **브랜드 (2026-10-19)** 같은 사이트 `/BRAND/` 를 읽는다 — 브랜드 파이프라인(`rozykuzy/BRAND`)이 매일 발행하는 `index.json`(131개, 매물 없는 브랜드는 `c: 0`,
  Carol Christian Poell은 `ex: "ccp"` = 이 사이트의 CCP 방) · `b/<slug>.json`(CCP 페이지 `__data` 와 같은 모양 + `brand`) · `new.json`(그날 신규, 400개까지).
  **첫 발행 전에는 `/BRAND/` 가 404 — 브랜드 조각은 모두 숨고 사이트는 지금과 똑같다**(`tools/samecheck.cjs` 로 19화면 배치·글·색 비교, 같음).
  - 브랜드 방 `?brand=<slug>` — 아카이브 방과 같은 틀 · 주소 규약(category · year · price · source · year-basis · label · show · size · q · sort · item) · 상세 · 저장 · 뒤로가기.
    매물 키는 아카이브와 같은 주소의 FNV-1a. 머리 숫자 줄 앞은 `Dated listings`(큰 브랜드 — 연도·시즌이 적힌 매물만) 또는 `All seasons`
  - 읽는 규칙은 CCP 규칙 그대로(`engine.js` 를 한 번 더 실행해 얻은 **브랜드 전용 사본** — CCP 방의 날짜·환율·검색어와 섞이지 않는다).
    그 사본에서 CCP 모티프는 비우고, CCP 이름이 들어가던 자리(검색에서 빼는 이름 · Find elsewhere 검색어)에 브랜드 이름(`q.en` · `q.ja` · `q.ko`)을 넣는다.
    CCP 모델 번호는 브랜드 매물에 보이지 않는다. 처음 수집된 날(신규 ≥ 매물)의 브랜드는 신규로 치지 않는다(아카이브 첫날과 같은 규칙)
  - Brands A–Z(Helmut Lang + 색인의 131 — CCP는 한 번, 그 아카이브로 = 132) · 메뉴의 Brands 판(5–6열, 개수) · New in 세 번째 탭 Brands(All에 포함) ·
    처음 화면 두 아카이브 아래 Brands 한 줄(그날 신규가 많은 브랜드 4곳, 모자라면 매물 많은 순) · 검색 창은 브랜드 이름도 찾는다(그 방으로; 매물 검색은 방마다)
- **디자인 (2026-10-19, v5 "maison")** leclaireur.com의 감도(구성 · 글자 · 간격 · 움직임 · 기능)를 이 사이트의 이름 · 글 · 사진으로 다시 그린 것.
  잰 방법: REA(`rea-agents` 6.7.0 `capture-browser-scenario`, PC Chrome 155)로 홈 · 디자인 페이지 · 크리에이터 A–Z · 목록 · 브랜드 · 상품 · 필터 · 검색을
  1440 · 390px로 캡처(스크린샷 · DOM · 접근성 트리)하고, 같은 페이지의 계산된 글자 크기 · 자간 · 상자를 잼(`aix-work\measure-le.mjs`).
  로고 · 엠블럼 · 사진 · 문구 · 코드는 가져오지 않았다. 워드마크는 이 사이트의 `ARCHIVE INDEX`.
  - **틀** 검정 띠(96px · 폰 64px, 아래 선 #262626, 스크롤해도 위에 붙음) — 왼쪽 메뉴(New in · Helmut Lang · Carol Christian Poell(1440px 미만은 CCP) · Brands),
    가운데 워드마크, 오른쪽 검색 · 저장(하트, 흰 원 안 개수). 넓은 화면 + 마우스는 메뉴에 올리면 흰 판(분류 · 보기 · 개수)이 내려온다.
    폰은 왼쪽에서 들어오는 검정 메뉴. 바닥은 검정, 대문자 열 제목(Archives · Index)
  - **처음** 두 아카이브를 사진 한 장씩(그날 날짜로 고정한 고르기, 크게 받을 수 있는 판매처 · 연도 적힌 매물 먼저) — 이름 · 숫자 · Enter.
    New today(탭: All · 두 아카이브) 카드 줄, View all new, Price drops 카드 줄과 아카이브별 버튼
  - **아카이브** 사진 띠 위 이름(52px) · 숫자 줄 → 분류 줄(대문자, 밑줄이 따라감) → 한 줄 막대(Filter and sort · 검색 · Grid/List · 정렬 · 개수, 화면 위에 붙음)
    → 회색 판(#efefef) 4:5 사진 4열(1800px부터 5열 · 768–1023 3열 · 폰 2열, 간격 30 · 20 · 8px), 가운데 정렬: 연도 줄 · 대문자 제목(두 줄) · 가격 · 상태 · 판매처
  - **Filter and sort** 모든 화면에서 왼쪽에서 들어오는 서랍(480px, 폰 전체) — Sort by · Year(막대) · Year basis · Motif/Technique · Source · Price · Origin/Material · Status · Size,
    `—`/`+` 로 접힘, 아래 Clear · Show N items. 그늘을 누르거나 Esc로 닫힘
  - **상세** 상품 페이지처럼: 왼쪽 사진(회색 판, 누르면 두 배), 오른쪽 브랜드 · 연도 / 대문자 제목 / 가격 / 상태 / 모티프 태그 / View listing(검정) · Buy via proxy · Save · Copy link,
    그 아래 접는 칸 Details(열림) · Price history · Sold records · Same title. 위 줄 72px(폰 56px): 브랜드 · 순번 · ← → · Close
  - **New in** `?view=new` 두 아카이브와 브랜드의 오늘 신규 전부(탭) · **Brands** `?view=brands` A–Z(글자 줄 → 글자마다 이름 3열 · 개수, 매물 없는 브랜드는 이름만)
  - **화면 글** 메뉴 · 필터 · 버튼 · 개수는 영어(대문자는 CSS), 매물이 스스로 말하는 것(연도 근거 · 판매처 · 통관 · 기간 · 소개)은 한국어 그대로(ROK 결정 2026-10-19).
    분류 · 모티프 · 가격대는 화면에서만 영어로 보이고 주소(`category=outer` 등)와 데이터는 그대로
  - **토큰** 색 `--ink #000` · `--ink2 #151515`(제목 · 가격 · 버튼) · `--mid #6b6b6b`(5.3:1) · `--dim #767676`(꺼진 탭, 4.5:1) · `--soft #a3a3a3` · `--line #e5e5e5`(선 · 표시만) ·
    `--tile #efefef`(사진 판) · `--sig #b3261e`(가격 내림 · 실패). 띠 · 바닥 #000, 바닥 보조 글 #a6a6a6
  - **글자 크기** 10 · 11 · 12 · 13 · 14 · 15(본문) · 18 · 20 · 22/26 · 32 · 36/48/52. 대문자 작은 글은 자간 .08–.12em, 14px 이상 .02–.04em, 문장형 제목 −.01em.
    워드마크 .3–.32em. `suite_fx` 가 화면마다 크기 · 자간이 이 목록 안인지 잰다
  - **간격** 바깥 여백 15 · 30 · 50px, 버튼 높이 48px(주 버튼 검정), 모서리 0(저장 개수 원만), 그림자 없음, 선 1px
- **글꼴** 둘, 모두 SIL OFL 1.1, 이 사이트가 직접 둔다(외부 글꼴 요청 없음).
  `fonts/figtree.woff2` · `figtree-ext.woff2` — Figtree(The Figtree Project Authors, 라틴 가변, @fontsource-variable/figtree 5.3.0 그대로) · 라이선스 `fonts/OFL-figtree.txt`.
  `fonts/index-sans.woff2` — Pretendard Variable(길형진)을 이 사이트 한글만 남기고 줄인 것(예약 글꼴 이름 때문에 Index Sans) · `fonts/OFL.txt`.
  한글은 Figtree에 없으므로 같은 줄에서 Index Sans로 넘어간다. 상품명은 Figtree 다음 기기 글꼴(일본어 먼저) — 일본어 제목이 한 벌로 그려지게.
  화면 한글이 바뀌면 `python3 tools/fontsubset.py --check` 로 빠진 글자 0 확인(2026-10-19: 302자, 0)
- **움직임** `html.fx`(동작 줄이기를 켜지 않은 경우) 아래에서만: 사진이 나타남, 카드에 올리면 두 번째 사진, 아카이브 사진 1.03배, 분류 밑줄,
  서랍 · 메뉴 · 검색 판이 들어옴(.35초), 저장 표시, 상세로 가는 사진. 도착 연출 · 반복 없음. 동작 줄이기면 모두 제자리
- **v6 (2026-10-19, 전체 점검 뒤)** 디자인 · 접근성 · 성능/SEO · 코드/보안 네 갈래 점검(design-critique · design-system · accessibility-review ·
  modern-web-guidance · performance-optimization · technical-seo · code-review · security-and-hardening)에서 나온 것을 고친 판.
  - **데이터가 화면을 깨지 못하게** 매물의 `__` 칸은 데이터에서 오지 않는다(지움) · 통화는 대문자 세 글자만 · `v`(같은 상품명)는 객체만 · `h`(가격 변동)는 점의 목록만 ·
    `sources` 는 목록만 · 사진은 `okUrl` 을 지난 것만 센다 · 상세는 먼저 그려 보고 안 되면 열지 않는다(주소에서 item 지움).
    브랜드의 두 자리 시즌이 내년보다 늦은 연도로 읽히면(AW88 → 2088) 연도를 정하지 않는다(시즌 표기는 그대로)
  - **불러오기** 요청마다 30초 한도 · 네트워크 실패와 5xx는 한 번 더 · 404만 "없음". 브랜드 색인을 못 읽으면(404 말고) 브랜드 주소는 그대로 두고
    `Brands · Could not load` + Retry(전에는 A–Z로 바뀌었다). 브랜드 방을 떠나면 그 파일 내려받기를 멈춘다. 브랜드 방 주소로 열면 그 파일을 색인과 같이 요청.
    3,000개 넘는 브랜드 파일은 50ms씩 나눠 읽는다. 최근 8개 브랜드 방만 메모리에 둔다(저장 화면에서는 비우지 않음)
  - **다운로드** 브랜드 방 · A–Z는 두 아카이브를 받지 않는다(A–Z 사진은 브랜드 색인 `ph`). 아카이브 방에서는 다른 아카이브 페이지를 낮은 우선순위로 캐시에만 받아 둔다.
    저장 화면은 저장한 매물이 있는 아카이브만 읽는다. 저장 화면 · New in은 다운로드마다 한 번만 기다리고 한 프레임에 한 번만 다시 그린다(브랜드 9곳 3,585번 → 10번)
  - **화면 흔들림(CLS 0.5–0.66 → 0.00x)** 기다리는 카드가 카드 크기 · `main` 최소 높이 · 분류 줄 49px · 개수 칸 96px · 처음 화면 Brands 자리 · 사진 띠 0.15초
  - **검색** 브랜드 이름 + 다른 말(`guidi boots` · `リックオウエンス ジャケット` · `グイディブーツ`)은 그 브랜드 방에서 나머지 말로(`/?brand=guidi&q=boots`).
    이름만이면 Brands에서 그 이름. "Brand names are not search terms" 문장 없앰. Enter는 브랜드가 먼저. 스크린 리더에는 짧은 한 줄(`#sStat`)
  - **처음 화면** 두 아카이브 → New today(탭에 Brands, All에 포함, 폰은 HL · CCP 글자) → Brands(폰 2개) → Price drops. 구역 이름과 같은 표시(NEW · PRICE DROP)는 카드에서 뺌
  - **Brands** 메뉴 판은 방이 있는 이름만 + `All brands 132`. A–Z에 All / Listed(주소에 남기지 않음). 매물 없는 브랜드 주소는 A–Z의 그 이름으로(밑줄)
  - **상세** 분류 · 표기 영어(`catEn` · `markEn`), 브랜드 줄은 그 방으로 가는 링크(그 방 안에서는 글자만), 연도 없음은 한 말 `연도 미확인`
  - **키보드 · 스크린 리더** 다시 그려도 포커스가 제자리(분류 · 토큰 · Remove · 탭 · 저장) · 검색칸 Enter는 목록으로 · 필터 서랍은 dialog, 뒤는 inert(검색 · 메뉴도) ·
    동작 줄이기에서도 서랍이 바로 포커스 · 상세 Tab이 접힌 칸까지 · 이동은 `#live` 한 줄 · 닫으면 마지막에 연 매물 카드로 · Load more는 새 첫 매물로(한 번 누른 뒤부터만 자동) ·
    영어 UI에 `lang="en"` · 지운 가격은 "was" · 사진 띠 위 글 대비(어둡게 .56) · 처음 화면 방 링크 포커스 링 · 체크 상자 테두리 `--dim`
  - **SEO** 고정 canonical 지움(스크립트가 화면마다 씀) · 화면마다 description · Saved는 noindex · WebSite JSON-LD · sitemap에 Brands · New in · robots `Disallow: /tools/` ·
    `referrer no-referrer` · 한글 글꼴 preload 낮은 우선순위 · manifest theme_color #000
  - **두 번째 점검(코드 · 접근성 리뷰)** 처음 화면에서 연 브랜드 매물도 주소로 다시 열림 · 뒤로가기로 돌아온 상세는 같은 목록의 같은 자리 ·
    층(상세 · 검색 · 메뉴 · 서랍)의 inert와 스크롤 잠금은 `layers()` 한 곳 · 검색 Enter는 이름이 맞는 브랜드만(그 밖은 목록) · 저장에서 지우면 다음 매물로 포커스
  - **실제 데이터 미리보기(PC)에서 고친 것** 처음 화면 New today · Price drops에서 다시 올린 매물(제목 · 가격 · 사이즈 · 판매처가 같음)은 한 자리만 —
    탭의 수와 New in은 매물 그대로 · 검색의 Try 줄은 결과가 없을 때만 · 필터 연도의 No year 한 줄
  - 검사: `tools/suite_v6.cjs`(85) — 위 항목을 픽스처를 바꿔 끼워 확인(가짜 통화 · 구멍 난 offers · 503 색인 · 큰 브랜드 6,800개 · 브랜드 9곳 저장 · 10개 방 메모리 · 떠날 때 멈춤 · 다시 올린 매물)
- **배포** 빌드 단계 없음. `main` 브랜치 루트가 그대로 GitHub Pages로 나간다.

| 파일 | 하는 일 |
|---|---|
| `index.html` | 틀 · 메타 · 보안 정책 |
| `app.js` | 화면 전부 (처음 · 두 아카이브 · New in · Brands · 상세 · 검색 · 저장 · 소개) |
| `app.css` | 디자인 |
| `engine.js` | 읽는 규칙 (생성 파일, 손으로 고치지 않는다) |
| `404.html` | 없는 주소 |
| `fonts/` | Figtree · Index Sans와 두 라이선스 |
| `tools/` | engine.js 생성 · 글꼴 자르기 · 로컬 미리보기 · 브라우저 검증 (`fixtures/`에 두 브랜드 페이지를 받아 두고 돌린다: suite · suite_v6 · suite_fx · a11y · keys · since · fail · dvbar · perf · shots5 · shots_brands · samecheck) |
| `tools/brandfix.mjs` | 브랜드 테스트 자료 `fixtures/BRAND/` — CCP 픽스처의 매물을 세 브랜드(rick-owens · guidi · uma-wang)로 바꿔 단 것 + 131개 색인 + new.json. 발행하지 않는다 |

로컬 검증(`fixtures/` 는 저장소에 없다 — 받거나 만든다):

```
node tools/brandfix.mjs ../brand/brands.json        # fixtures/BRAND (브랜드 등록부 경로)
cd tools && node serve.mjs                          # 8930: /helmut-lang/ · /ccp/ · /BRAND/ 픽스처. BRAND=off → /BRAND/ 404 · FAIL=hl,ccp,brand → 503
node suite.cjs && node suite_v6.cjs && node suite_fx.cjs && node a11y.cjs  # suite · suite_v6 는 필요한 서버(BRAND=off · FAIL=brand · SLOW)를 스스로 더 띄운다
PORT=8931 FAIL=hl node serve.mjs & PORT=8932 SLOW=2500 node serve.mjs & node fail.cjs
```

engine.js 다시 만들기:

```
curl -s https://rozykuzy.github.io/helmut-lang/ -o fixtures/helmut-lang/index.html
curl -s https://rozykuzy.github.io/ccp/ -o fixtures/ccp/index.html
cd tools && npm install && node extract.mjs ../fixtures/helmut-lang/index.html ../fixtures/ccp/index.html ../engine.js
```
