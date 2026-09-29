# Archive Index

https://rozykuzy.github.io/

Helmut Lang(1986–2005)과 Carol Christian Poell 두 아카이브를 한 화면에서 보는 색인.

- **데이터** 이 저장소에는 매물 데이터가 없다. 같은 사이트의 두 브랜드 페이지
  [/helmut-lang/](https://rozykuzy.github.io/helmut-lang/) · [/ccp/](https://rozykuzy.github.io/ccp/)가
  매일 발행하는 페이지 안의 `<script id="__data">`를 열 때마다 읽는다. 두 인덱스가 갱신되면 여기도 바로 바뀐다.
- **읽는 규칙** `engine.js` — 두 브랜드 페이지 템플릿의 연도·모티프·검색·표기 규칙을 그대로 떼어 온 생성 파일.
  템플릿이 바뀌면 `tools/extract.mjs`로 다시 만든다.
- **저장** 브라우저 localStorage `hlx.saved` · `ccpx.saved` — 두 브랜드 페이지와 같은 키라 어느 쪽에서 저장해도 같은 목록이다.
- **디자인 (2026-09-29, v4 "plain")** 흰 면, 글꼴 하나, 사진이 먼저. 처음 화면은 두 아카이브(사진 세 장 · 이름 · 매물 수 한 줄),
  오늘 들어온 매물, 가격 내림 목록. 방에는 사진 보기와 목록 보기(번호 · 연도 · 제목 · 사이즈 · 판매처 · 가격, 줄에 올리면 사진)가 있고
  선택은 이 브라우저에만 기억한다(`aix.layout`). 1280px부터 왼쪽에 필터 열이 붙는다. 상세 사진은 누르면 두 배로 가까이 본다.
  - 색 `--bg #fff` · `--ink #111` · `--mid #6b6b6b`(보조 글) · `--soft #a3a3a3`(연도 막대·체크 칸 테두리, 글자에는 쓰지 않는다) ·
    `--line #e6e6e6` · `--tint #f5f5f5`(사진 자리) · `--sig #b3261e`(가격 내림 · 저장한 매물의 변화 · 불러오지 못함에만).
  - 글자 크기 12(보조) · 13(본문·목록·버튼) · 15(워드마크 600 · 필터 제목) · 17/19(상세 제목·가격) · 18/20(처음 화면 이름) ·
    18/22(검색 입력) · 24/28(방 제목). 앞은 휴대폰, 뒤는 넓은 화면. 한 화면에 다섯 크기를 넘지 않는다(`suite_fx`가 잰다).
  - 자간은 크기에 따라 하나: 13px 이하 0 · 15–17px −.01em · 18px −.015em · 20px −.02em · 24–28px −.025em. 굵기는 400 · 500,
    워드마크만 600(그래서 15px −.02em, 바닥글 13px −.01em).
  - 모서리 0, 그림자 없음, 선은 1px. 버튼은 높이 40–44px, 주 버튼만 검정 바탕.
- **글꼴** 하나, SIL OFL 1.1, 이 사이트가 직접 둔다(외부 글꼴 요청 없음).
  `fonts/index-sans.woff2` — Pretendard Variable(길형진)을 이 사이트 글자만 남기고 줄인 파일. 예약 글꼴 이름 때문에 Index Sans로 바꿨고
  라이선스는 `fonts/OFL.txt`. 상품명은 같은 파일을 라틴 범위로만 쓰는 `Index Latin`으로 그린다 — 한글·일본어 상품명은 기기 글꼴로,
  일본어를 한국어보다 앞에 둔다(한국어 글꼴이 일본어 상품명의 한자를 한자음 글꼴로 섞어 그리지 않게).
  화면 글(`app.css`의 content 포함)이 바뀌면 `python3 tools/fontsubset.py`로 다시 자르고 `--check`로 확인한다.
- **움직임** `html.fx`(동작 줄이기를 켜지 않은 경우) 아래에서만, 누른 것에 답할 때만 움직인다: 탭 밑줄, 방 전환(0.2초 겹쳐 바뀜),
  상세로 가는 사진, 카드에 올리면 두 번째 사진, 저장 표시, 내려 읽을 때 비켜 서는 머리. 도착 연출과 반복하는 움직임은 없다. 동작 줄이기면 모두 제자리다.
- **배포** 빌드 단계 없음. `main` 브랜치 루트가 그대로 GitHub Pages로 나간다.

| 파일 | 하는 일 |
|---|---|
| `index.html` | 틀 · 메타 · 보안 정책 |
| `app.js` | 화면 전부 (처음 · 두 아카이브 · 상세 · 검색 · 저장 · 소개) |
| `app.css` | 디자인 |
| `engine.js` | 읽는 규칙 (생성 파일, 손으로 고치지 않는다) |
| `404.html` | 없는 주소 |
| `fonts/` | Index Sans와 라이선스 |
| `tools/` | engine.js 생성 · 글꼴 자르기 · 로컬 미리보기 · 브라우저 검증 (`fixtures/`에 두 브랜드 페이지를 받아 두고 돌린다: suite · suite_fx · a11y · keys · since · fail · dvbar · perf) |

engine.js 다시 만들기:

```
curl -s https://rozykuzy.github.io/helmut-lang/ -o fixtures/helmut-lang/index.html
curl -s https://rozykuzy.github.io/ccp/ -o fixtures/ccp/index.html
cd tools && npm install && node extract.mjs ../fixtures/helmut-lang/index.html ../fixtures/ccp/index.html ../engine.js
```
