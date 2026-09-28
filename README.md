# Archive Index

https://rozykuzy.github.io/

Helmut Lang(1986–2005)과 Carol Christian Poell 두 아카이브를 한 화면에서 보는 색인.

- **데이터** 이 저장소에는 매물 데이터가 없다. 같은 사이트의 두 원본 인덱스
  [/helmut-lang/](https://rozykuzy.github.io/helmut-lang/) · [/ccp/](https://rozykuzy.github.io/ccp/)가
  매일 발행하는 페이지 안의 `<script id="__data">`를 열 때마다 읽는다. 두 인덱스가 갱신되면 여기도 바로 바뀐다.
- **읽는 규칙** `engine.js` — 두 원본 템플릿의 연도·모티프·검색·표기 규칙을 그대로 떼어 온 생성 파일.
  원본 템플릿이 바뀌면 `tools/extract.mjs`로 다시 만든다.
- **저장** 브라우저 localStorage `hlx.saved` · `ccpx.saved` — 두 원본 인덱스와 같은 키라 어느 쪽에서 저장해도 같은 목록이다.
- **배포** 빌드 단계 없음. `main` 브랜치 루트가 그대로 GitHub Pages로 나간다.

| 파일 | 하는 일 |
|---|---|
| `index.html` | 틀 · 메타 · 보안 정책 |
| `app.js` | 화면 전부 (처음 · 두 아카이브 · 상세 · 검색 · 저장 · 소개) |
| `app.css` | 디자인 |
| `engine.js` | 읽는 규칙 (생성 파일, 손으로 고치지 않는다) |
| `404.html` | 없는 주소 |
| `tools/` | engine.js 생성 · 로컬 미리보기 · 브라우저 검증 (`fixtures/`에 두 원본 페이지를 받아 두고 돌린다) |

engine.js 다시 만들기:

```
curl -s https://rozykuzy.github.io/helmut-lang/ -o fixtures/helmut-lang/index.html
curl -s https://rozykuzy.github.io/ccp/ -o fixtures/ccp/index.html
cd tools && npm install && node extract.mjs ../fixtures/helmut-lang/index.html ../fixtures/ccp/index.html ../engine.js
```
