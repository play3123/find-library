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
   - `KV_REST_API_URL`, `KV_REST_API_TOKEN` (Vercel Storage에서 Redis 연결 시 생성)
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

## 오늘 전체 사용량

- 모든 이용자의 정보나루 API **호출 시도**를 Redis에서 원자적으로 합산합니다. 성공·오류·타임아웃 시도를 포함하고, 캐시 적중과 국립중앙도서관 호출은 제외합니다.
- 한국시간 00:00마다 새 날짜 키를 사용하므로 서버 재시작·여러 Vercel 인스턴스·브라우저 변경과 무관합니다.
- `GET /api/usage`에서 서비스 전체 합계를 읽습니다. 화면은 검색 후, 창으로 복귀할 때, 60초마다, 한국시간 날짜가 바뀔 때 갱신합니다.
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` 이름도 지원합니다. 저장소가 없거나 응답하지 않으면 숫자 0으로 대체하지 않으며, 집계할 수 없는 정보나루 호출은 실행하지 않습니다.
- `DATA4LIBRARY_DAILY_LIMIT`으로 표시 기준을 설정할 수 있습니다(기본 500). 이 값은 공급처가 알려준 잔여량이 아니며, 이번 변경은 별도 차단 정책을 추가하지 않습니다.
- 다른 앱에서 같은 인증키로 호출한 분량이나 집계 도입 전 사용량은 복원할 수 없습니다. 화면 안내에도 집계 범위를 명시합니다.
- Preview는 브랜치별 이름공간을 사용해 운영 집계와 분리합니다. `USAGE_COUNTER_NAMESPACE`를 명시적으로 덮어쓰면 그 값을 사용합니다.
- 날짜별 합계는 7일 후 만료하며, 집계 재시도는 같은 이벤트 ID로 중복 합산을 방지합니다. 외부 호출 직전에 기록하는 방식이므로, 기록 직후 프로세스가 중단된 경우 기록된 시도와 공급처 수신량은 차이 날 수 있습니다.

## 개발과 검증

```bash
npm ci
npm test
npm run dev
```

`npm run dev`는 `http://127.0.0.1:4173`에서 정적 화면을 제공하고 운영 공개 API를 프록시합니다. 운영 API의 데이터와 할당량을 사용하는 실제 조회이므로 대량 호출하지 않습니다. 로컬 주소가 카카오 허용 도메인에 없으면 목록은 동작하지만 지도 SDK는 실패 상태를 표시합니다.

`test/`는 동시 집계, 응답 유실 후 재시도, 한국시간 자정, Preview 격리, 저장소 실패, 실제 Express 경로의 호출/캐시/오류 처리와 인증키 비노출을 검증합니다.
