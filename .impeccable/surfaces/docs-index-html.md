---
version: 1
slug: "docs-index-html"
primary_target: "docs/index.html"
related_targets: ["docs/styles.css","docs/app.js"]
---

# B 본문: 도서관 검색 화면

방문자 모드: Operate. 사용자가 2026-11-11 비교 시안 B를 선택했다. 이전 폰트와 책의 인상, 건조함이 고정 조건이다. 기존 검색·ISBN·지역·목록·지도·전역 일일 사용량을 보존한다.

추가 기능 범위: 지도 크게 보기는 같은 본문 안에서 전체 너비를 사용하고 목록 본문을 일시 감춘다. 결과 제목·필터·지도 크기 복귀 동작은 남긴다. 크기 변경과 번호 선택은 줌을 바꾸지 않는다. 복사는 입력 중인 후보가 아닌 검색 결과를 만든 책 스냅샷이며, 기본 크기에서는 결과 요약에만, 크게 보기에서는 지도 위에만 제목·ISBN 복사 도구를 표시한다. 복귀 버튼은 ‘지도 원래 크기로’다. 시·도 순서는 유지하고 시·군·구 이름만 가나다순으로 표시한다. 소개 문장과 푸터 슬로건은 사용자 지시로 삭제한다. 기존 B 시각 체계 안의 기능 확장이다.

비교 근거: C:/Users/User/Documents/Codex/2026-11-11_FindLibrary_concepts/outputs/.impeccable/mocks/decision/B-text.html 및 B-text-desktop.png. 코드 기반 방향으로 선택되었으며 생성 이미지의 공간 계약이 아니다.

## Direction contract

THESIS: 책의 본문처럼 검은 활자와 여백으로 정보를 읽게 한다. 장식 카드 대신 가로 검색과 목록·지도의 익숙한 작업 구조를 쓴다.

OWN-WORLD: #f8f8f4 바탕, #20201e 활자와 검색 버튼, #52665b 보조색, #d7dbd1 구분선. 이전 Georgia/Times New Roman/serif 표제와 Inter/Noto Sans KR/system-ui 본문. 네모난 입력과 가는 구분선, 질감과 장식 그림자 없음.

STORY: 책 이름·저자 또는 ISBN으로 빌릴 책을 선택하고 지역을 정한다. 후보 조회는 최대 30개임을 알린다. 대출 상태를 비교하고 지도 핀에서 이름·주소·홈페이지를 바로 확인한다. 집계 실패는 0으로 표시하지 않는다.

FIRST VIEWPORT: 폭 1272px 내외, 좌우 넓은 여백. 상단에 46px 명조 제목과 작은 Find Library, 오른쪽 전체 사용량. 아래 표준 탭과 가로 검색·책 선택·지역·검색 버튼. 결과는 왼쪽 목록, 오른쪽 지도. 지도는 목록 길이와 무관한 높이이며 긴 목록을 읽을 때 화면 안에 머문다. 모바일은 세로 검색, 결과의 목록/지도 전환.

FORM: 문학책 본문(grounded candidate 1, 사용자가 고른 B), seed:47c4b3bd6aaef0b1. 실내의 밝은 화면에서 책과 도서관 정보를 읽는 장면. 시그니처는 선택 책의 서지 정보가 짧은 본문 주석처럼 검색 아래 이어지고, 지도에서 도서관 이름 링크를 바로 여는 동작. 종이 질감이나 가짜 책 장식은 쓰지 않는다.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
