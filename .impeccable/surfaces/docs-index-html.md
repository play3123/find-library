---
version: 1
slug: "docs-index-html"
primary_target: "docs/index.html"
related_targets: ["docs/styles.css","docs/app.js"]
---

# 검색 화면 리디자인

방문자 모드: Operate. 기존 검색·도서선택·지역선택·목록·지도·홈페이지 링크를 보존한다. 사용자의 자율 디자인 진행 승인에 따라 정례 선택 질문을 생략하고 코드로 구현한다.

## 검토한 근거 방향

1. 도시 보행 안내: 짙은 녹색 안내판과 높은 대비, 목적지 중심 숫자.
2. 서점 재고 라벨: 선명한 흰 표면과 파란 선택 상태, 밀도 높은 목록.
3. 도서 대출표: 보라 잉크와 명확한 입력 순서. 책 분야의 직접적 관습이라는 위험.
4. 공원 안내 체계: 잎색 바탕과 읽기 쉬운 열린 공간.
5. 현장 도감의 색인: 숲색 표지, 광택 없는 밝은 회녹색 작업면, 동일 번호로 목록과 지도를 연결. 배정된 방향.
6. 문예지 차례: 푸른 검정과 대비 있는 서체. 긴 읽기보다 검색 작업에는 덜 적합.
7. 음반 내지의 트랙 색인: 남색과 레몬색, 조밀한 순서 표기.

배정 seed:097c4b575a3551d3, grounded candidate 5.

카탈로그 도전안 판정(사용자 식별/제품 명료성): acetate manual declined/declined(유지할 강점: 정보 계층의 일관성); bitmap specimen declined/declined(일관된 문자·숫자 대비); ticket wallet competitive/declined(상태를 사라지게 하지 않고 명시); timetable rack declined/declined(데이터 열 정렬); midnight transit competitive/competitive(목록·지도 연결은 같은 제품상 필요로 구현하되 전철 노선도 모방은 배제); exposure record declined/declined(실패를 색만으로 구분하지 않음). 미확정 서비스 주장과 자료를 추가하지 않는다.

## Direction contract

THESIS: 한 권의 책에서 실제 도서관 선택까지, 검색과 결과를 같은 작업면에 둔다. 거대한 소개 영역과 겹겹의 장식 카드를 없앤다.

OWN-WORLD: 짙은 숲색 헤더·검색 버튼, 옅은 회녹색 바탕, 흰 결과면, 황토색 대출중·짙은 초록 대출가능. 일관된 sans UI와 8px 모서리. 식별 번호는 실제 목록과 지도에서만 쓴다.

STORY: 도서명/ISBN 입력, 도서 선택, 지역 선택, 검색, 대출 상태와 위치를 비교하고 홈페이지로 이동한다. 실패·빈 결과·집계 미연결은 서로 구분한다.

FIRST VIEWPORT: 72px 헤더의 브랜드와 서비스 전체 일일 사용량, 짧은 페이지 제목 아래 320px 검색 사이드바와 나머지 결과 작업면. 결과 상단에 권·지역 요약, 다음에 지도와 목록. 모바일은 검색 뒤 결과, 목록/지도 전환 버튼으로 이동한다. 주요 검색 버튼은 조건 입력 바로 아래 놓인다.

FORM: 현장 도감의 색인(ordered grounded candidate 5), seed:097c4b575a3551d3. 표준 웹 컨트롤을 쓰고 도감 장식으로 위장하지 않는다. 시그니처는 목록 번호 선택 시 같은 번호의 지도 핀을 강조·이동하는 동작이다. 이용 장면은 실내에서 빌릴 책을 빠르게 찾는 밝은 화면이며, 가독성 높은 밝은 작업면을 쓴다.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
