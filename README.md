# Archive Index

https://rozykuzy.github.io/

Helmut Lang(1986–2005)과 Carol Christian Poell 두 아카이브를 한 화면에서 보는 색인.

- **데이터** 이 저장소에는 매물 데이터가 없다. 같은 사이트의 두 브랜드 페이지
  [/helmut-lang/](https://rozykuzy.github.io/helmut-lang/) · [/ccp/](https://rozykuzy.github.io/ccp/)가
  매일 발행하는 페이지 안의 `<script id="__data">`를 열 때마다 읽는다. 두 인덱스가 갱신되면 여기도 바로 바뀐다.
- **읽는 규칙** `engine.js` — 두 브랜드 페이지 템플릿의 연도·모티프·검색·표기 규칙을 그대로 떼어 온 생성 파일.
  템플릿이 바뀌면 `tools/extract.mjs`로 다시 만든다.
- **저장** 브라우저 localStorage `hlx.saved` · `ccpx.saved` — 두 브랜드 페이지와 같은 키라 어느 쪽에서 저장해도 같은 목록이다.
- **글꼴** `fonts/index-sans.woff2` — Pretendard Variable(SIL OFL 1.1, 길형진)을 이 사이트 글자만 남기고 줄인 파일.
  예약 글꼴 이름 때문에 이름을 Index Sans로 바꿨고 라이선스는 `fonts/OFL.txt`. 화면 글이 바뀌면
  `python3 tools/fontsubset.py`로 다시 자르고, `--check`로 빠진 글자가 없는지 본다.
- **움직임** `html.fx`(동작 줄이기를 켜지 않은 경우) 아래에서만 움직인다. 도착(이름·카드·숫자)과 변화(탭 밑줄·방 전환·상세 사진)만 움직이고
  반복하는 것은 판매처 띠 하나다. 동작 줄이기면 모두 제자리에 있고 띠는 목록이 된다.
- **배포** 빌드 단계 없음. `main` 브랜치 루트가 그대로 GitHub Pages로 나간다.

| 파일 | 하는 일 |
|---|---|
| `index.html` | 틀 · 메타 · 보안 정책 |
| `app.js` | 화면 전부 (처음 · 두 아카이브 · 상세 · 검색 · 저장 · 소개) |
| `app.css` | 디자인 |
| `engine.js` | 읽는 규칙 (생성 파일, 손으로 고치지 않는다) |
| `404.html` | 없는 주소 |
| `fonts/` | Index Sans(Pretendard 부분 글꼴)와 라이선스 |
| `tools/` | engine.js 생성 · 글꼴 자르기 · 로컬 미리보기 · 브라우저 검증 (`fixtures/`에 두 브랜드 페이지를 받아 두고 돌린다: suite · suite_fx · a11y · keys · since · fail · perf) |

engine.js 다시 만들기:

```
curl -s https://rozykuzy.github.io/helmut-lang/ -o fixtures/helmut-lang/index.html
curl -s https://rozykuzy.github.io/ccp/ -o fixtures/ccp/index.html
cd tools && npm install && node extract.mjs ../fixtures/helmut-lang/index.html ../fixtures/ccp/index.html ../engine.js
```
