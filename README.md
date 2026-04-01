# find-library

대출 가능한 도서관을 검색하는 웹 앱입니다.

## 구성
- `docs/`: 정적 프론트엔드 (검색 UI + 카카오 지도)
- `render-api/`: Express API 서버 로직
- `api/index.js`: Vercel Serverless Function 엔트리 (Express app 래핑)
- `vercel.json`: Vercel 라우팅/런타임 설정

## Vercel 배포
1. 이 저장소를 Vercel에 import 합니다.
2. 아래 환경변수를 프로젝트에 등록합니다.
   - `DATA4LIBRARY_AUTHKEY`
   - `NLK_KEY`
   - `KAKAO_JS_KEY`
   - `ALLOWED_ORIGIN` (예: `https://your-project.vercel.app`)
3. 배포 후 접속:
   - 웹: `/`
   - API health: `/api/health`

## 로컬 실행 (Express 단독)
```bash
cd render-api
npm install
node server.js
```

## 참고
- 프론트는 기본적으로 same-origin API 호출을 사용합니다 (`docs/config.js`의 `API_BASE`는 빈 문자열).
- `/api/*` 요청은 Vercel에서 `api/index.js`로 라우팅됩니다.
