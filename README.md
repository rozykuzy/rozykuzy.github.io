# Archive Index

https://rozykuzy.github.io/

Helmut Lang(1986–2005)과 Carol Christian Poell 두 아카이브를 한 화면에서 보는 색인.

- **데이터** 이 저장소에는 매물 데이터가 없다. 같은 사이트의 두 브랜드 페이지
  [/helmut-lang/](https://rozykuzy.github.io/helmut-lang/) · [/ccp/](https://rozykuzy.github.io/ccp/)가
  매일 발행하는 페이지 안의 `<script id="__data">`를 열 때마다 읽는다. 두 인덱스가 갱신되면 여기도 바로 바뀐다.
- **읽는 규칙** `engine.js` — 두 브랜드 페이지 템플릿의 연도·모티프·검색·표기 규칙을 그대로 떼어 온 생성 파일.
  템플릿이 바뀌면 `tools/extract.mjs`로 다시 만든다.
- **저장** 브라우저 localStorage `hlx.saved` · `ccpx.saved` — 두 브랜드 페이지와 같은 키라 어느 쪽에서 저장해도 같은 목록이다.
- **디자인 (2026-09-29, v3 "catalogue")** 경매 도록과 패션 색인의 중간. Helmut Lang은 종이(#f1efe9), Carol Christian Poell은
  카본(#0e0d0c), 둘 다 옅은 그레인(`grain.png`, 배경에만 — 사진 위에는 없다). 처음 화면은 두 이름과 그 둘레의 매물 사진(날마다 같은 섞기),
  이름에 올리면 그 아카이브만 남는다. 사진 크기는 처음 화면 너비의 1%와 높이의 1%×k(휴대폰 .55 · 600px부터 .9 · 768px부터 1.77) 중 작은 쪽(`--u`, 컨테이너 단위)이 기준이라
  넓고 낮은 화면에서도 이름을 덮지 않는다. 위 줄은 위 끝에, 아래 줄은 아래 끝(갱신 줄 위)에 붙는다. 크기는 `:nth-child`에 width로
  쓰지 않고 변수로만 준다 — 거기 width를 쓰면 넓은 화면 규칙보다 우선한다(2026-09-29 실제로 한 번 겹침). 바꾼 뒤에는
  `node tools/collage.cjs`로 휴대폰부터 3440px까지 28개 크기에서 사진이 글자·서로·가장자리에 닿지 않는지 확인한다. 방에는 사진 보기와 목록 보기(번호 · 연도 · 제목 · 사이즈 · 판매처 · 가격, 줄에 올리면 사진)가 있고
  선택은 이 브라우저에만 기억한다(`aix.layout`). 연도 필터는 연도마다 막대. 상세 사진은 누르면 두 배로 가까이 본다.
- **글꼴** 셋, 모두 SIL OFL 1.1, 이 사이트가 직접 둔다(외부 글꼴 요청 없음).
  `fonts/index-sans.woff2` — Pretendard Variable(길형진)을 이 사이트 글자만 남기고 줄인 파일. 예약 글꼴 이름 때문에 Index Sans로 바꿨고
  라이선스는 `fonts/OFL.txt`. 화면 글(`app.css`의 content 포함)이 바뀌면 `python3 tools/fontsubset.py`로 다시 자르고 `--check`로 확인한다.
  `fonts/serif.woff2` — Instrument Serif(라틴, 이름과 큰 숫자), `fonts/OFL-InstrumentSerif.txt`.
  `fonts/mono.woff2` — Geist Mono(라틴만 남긴 가변 글꼴, 가격·연도·번호), `fonts/OFL-GeistMono.txt`.
- **움직임** `html.fx`(동작 줄이기를 켜지 않은 경우) 아래에서만 움직인다. 도착(이름·사진·카드·숫자)과 변화(탭 밑줄·방 전환·상세 사진·
  스크롤에 따라 흐르는 처음 화면 사진·내려 읽을 때 비켜 서는 머리)만 움직이고, 반복하는 것은 판매처 띠 하나다. 동작 줄이기면 모두 제자리다.
  그레인 층에 `mix-blend-mode`를 쓰지 않는다 — 고정 층에 블렌드가 있으면 Chromium의 화면 전환이 시작되지 않는다(2026-09-29 확인).
- **배포** 빌드 단계 없음. `main` 브랜치 루트가 그대로 GitHub Pages로 나간다.

| 파일 | 하는 일 |
|---|---|
| `index.html` | 틀 · 메타 · 보안 정책 |
| `app.js` | 화면 전부 (처음 · 두 아카이브 · 상세 · 검색 · 저장 · 소개) |
| `app.css` | 디자인 |
| `engine.js` | 읽는 규칙 (생성 파일, 손으로 고치지 않는다) |
| `404.html` | 없는 주소 |
| `fonts/` | Index Sans · Index Serif · Index Mono와 라이선스 |
| `grain.png` | 종이·카본의 그레인 (100px 타일) |
| `tools/` | engine.js 생성 · 글꼴 자르기 · 로컬 미리보기 · 브라우저 검증 (`fixtures/`에 두 브랜드 페이지를 받아 두고 돌린다: suite · suite_fx · collage · a11y · keys · since · fail · perf) |

engine.js 다시 만들기:

```
curl -s https://rozykuzy.github.io/helmut-lang/ -o fixtures/helmut-lang/index.html
curl -s https://rozykuzy.github.io/ccp/ -o fixtures/ccp/index.html
cd tools && npm install && node extract.mjs ../fixtures/helmut-lang/index.html ../fixtures/ccp/index.html ../engine.js
```
