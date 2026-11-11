---
name: Find Library
description: 책과 지역을 선택하고, 같은 번호로 목록과 지도를 연결하는 밝은 검색 작업면.
colors:
  forest: "#183f35"
  green: "#24624c"
  green-hover: "#164b38"
  ink: "#20382e"
  muted: "#56685f"
  ground: "#eef2ed"
  panel: "#e4ece3"
  white: "#fff"
  line: "#d5dfd4"
  success-bg: "#e2f1e7"
  success-text: "#235436"
  amber: "#865119"
  amber-bg: "#fff0d9"
  error: "#a12f32"
  error-bg: "#fff0ee"
  unknown-bg: "#e9edeb"
  unknown-text: "#536159"
  unknown-pin: "#64726b"
  selected-row: "#f0f6ec"
  secondary: "#d0dfd0"
  secondary-hover: "#c1d3bf"
  field-border: "#aebfae"
  focus: "#a77a22"
  map-ground: "#e1e9dd"
  map-bar: "#f7f9f4"
typography:
  headline:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Malgun Gothic", sans-serif'
    fontSize: "29px"
    fontWeight: 720
    lineHeight: 1.35
    letterSpacing: "-0.035em"
  title:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Malgun Gothic", sans-serif'
    fontSize: "18px"
    fontWeight: 720
    lineHeight: 1.5
    letterSpacing: "-0.02em"
  body:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Malgun Gothic", sans-serif'
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
  button:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Malgun Gothic", sans-serif'
    fontSize: "14px"
    fontWeight: 650
    lineHeight: 1.6
  result-title:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Malgun Gothic", sans-serif'
    fontSize: "14px"
    fontWeight: 700
    lineHeight: 1.65
  label:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Malgun Gothic", sans-serif'
    fontSize: "13px"
    fontWeight: 650
    lineHeight: 1.6
  detail:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Malgun Gothic", sans-serif'
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.6
  badge:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Malgun Gothic", sans-serif'
    fontSize: "11px"
    fontWeight: 650
    lineHeight: 1.6
rounded:
  badge: "4px"
  compact: "5px"
  control: "6px"
  mode-track: "7px"
  popover: "8px"
  panel: "12px"
  circle: "50%"
spacing:
  micro: "4px"
  small: "8px"
  control-gap: "10px"
  compact: "12px"
  regular: "16px"
  section: "20px"
  panel: "24px"
  mobile-workspace: "28px"
  workspace: "30px"
  wide-workspace: "36px"
  desktop-gutter: "40px"
components:
  button-primary:
    backgroundColor: "{colors.green}"
    textColor: "{colors.white}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  button-primary-hover:
    backgroundColor: "{colors.green-hover}"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.forest}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  button-secondary-hover:
    backgroundColor: "{colors.secondary-hover}"
  button-icon:
    backgroundColor: "transparent"
    rounded: "{rounded.control}"
    width: "36px"
    height: "36px"
  input-search:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "10px 12px"
  mode-selected:
    backgroundColor: "{colors.white}"
    textColor: "{colors.forest}"
    typography: "{typography.label}"
    rounded: "{rounded.compact}"
    padding: "9px 4px"
  search-panel:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "24px"
  library-row:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    padding: "19px 20px"
  library-row-selected:
    backgroundColor: "{colors.selected-row}"
  status-badge-success:
    backgroundColor: "{colors.success-bg}"
    textColor: "{colors.success-text}"
    typography: "{typography.badge}"
    rounded: "{rounded.badge}"
    padding: "2px 7px"
  status-badge-unavailable:
    backgroundColor: "{colors.amber-bg}"
    textColor: "{colors.amber}"
    typography: "{typography.badge}"
    rounded: "{rounded.badge}"
    padding: "2px 7px"
  status-badge-unknown:
    backgroundColor: "{colors.unknown-bg}"
    textColor: "{colors.unknown-text}"
    typography: "{typography.badge}"
    rounded: "{rounded.badge}"
    padding: "2px 7px"
  map-pin:
    backgroundColor: "{colors.green}"
    textColor: "{colors.white}"
    rounded: "{rounded.circle}"
    width: "34px"
    height: "34px"
    padding: "0"
  map-selection:
    backgroundColor: "{colors.forest}"
    textColor: "{colors.white}"
    padding: "15px 18px"
---

# Design System: Find Library

## Overview

**Creative North Star: "현장 도감의 색인"**

짙은 숲색 표지와 밝은 회녹색 작업면 위에서 한 권의 책을 찾고, 방문할 도서관을 비교한다. 흰 결과면과 담백한 UI 글자가 정보를 나누며, 목록과 지도에 반복되는 실제 식별 번호가 이 화면의 시그니처다. 도감은 재료와 색인의 비유이며, 장식용 종이나 식물 삽화로 구현하지 않는다.

검색과 비교에 집중하는 Operate 화면이다. 브랜드명 Find Library와 한국어 서비스명을 유지하며, 입력 상태·대출 상태·연결 실패가 각자의 문구로 드러난다. 기관 소속이나 실시간 대출 보장처럼 확인되지 않은 주장을 시각적 신뢰 장치로 추가하지 않는다.

**Key Characteristics:**
- 숲색 헤더와 주요 행동, 회녹색 작업 바탕, 흰 결과면의 명확한 층위.
- 한 가지 sans UI 계열과 절제된 크기 차이로 구성하는 검색 중심 정보 계층.
- 동일 번호로 연결하는 목록 행과 지도 핀, 선택된 도서관의 명시적 맥락.
- 대출가능·대출중·상태 미확인을 색과 문구로 함께 구별하는 상태 체계.
- 모바일에서 검색 뒤 결과를 읽고 목록과 지도를 전환하는 단일 열 흐름.

현재 구현의 근거는 `docs/styles.css`, `docs/index.html`, `docs/app.js`다. 이전 Claude 참고 문서는 git 기준 `9a4ef33`에 남아 있다. 방향 계약의 초기 모서리 수치보다 실제 패널·컨트롤 토큰을 우선한다.

## Colors

녹색 계열은 작업면과 행동을 묶고, 황토색과 적색은 의미가 있는 상태에 배정한다. 값은 frontmatter가 소유한다.

### Primary
- **숲색 표지 (`forest`):** 헤더, 결과 수, 선택된 목록 번호, 선택 도서관 맥락의 배경.
- **길찾기 녹색 (`green`, `green-hover`):** 검색 버튼, 본문 링크, 대출가능 지도 핀과 그 행동 상태.

### Secondary
- **대출중 황토 (`amber`, `amber-bg`):** 대출중 배지와 지도 핀. 오류나 알 수 없는 상태에 재사용하지 않는다.
- **오류 적색 (`error`, `error-bg`):** 입력·요청 오류를 문구와 함께 전달하는 알림.
- **초점 황토 (`focus`):** 키보드 초점 외곽선. 대출 상태색과 목적이 다른 접근성 토큰이다.

### Neutral
- **안내 잉크 (`ink`)와 보조 잉크 (`muted`):** 제목·본문과 주소·설명·출처를 구분한다.
- **밝은 지면 (`ground`), 검색 작업면 (`panel`), 흰 결과면 (`white`):** 화면·입력 그룹·검색 결과의 층위.
- **잎맥 구분선 (`line`)과 입력 테두리 (`field-border`):** 결과 행과 필드의 경계.
- **대출가능 바탕·문자 (`success-bg`, `success-text`):** 긍정 상태 배지의 대비 조합.
- **미확인 바탕·문자·핀 (`unknown-bg`, `unknown-text`, `unknown-pin`):** 대출 상태를 확인하지 못한 결과.
- **선택 지면 (`selected-row`):** 현재 지도에서 선택한 목록 행.
- **보조 행동 (`secondary`, `secondary-hover`):** 후보 조회처럼 주요 검색 전의 보조 단계.
- **지도 지면·띠 (`map-ground`, `map-bar`):** 지도 대기 영역과 제목·상태 영역.

**The Status Has Words Rule.** 대출 상태는 색만으로 전달하지 않는다. 대출가능·대출중·상태 미확인 문구를 유지하고, 연결 실패를 결과 없음이나 사용량 0으로 바꾸지 않는다.

## Typography

**Body / UI Font:** frontmatter의 시스템 sans 스택. 한글은 사용 환경의 지원 서체로 렌더링하며 별도 웹폰트를 로드하지 않는다.

**Character:** 짧은 질문, 읽기 쉬운 필드, 주소와 대출 상태를 빠르게 비교하는 실용적인 UI다. 별도의 브랜드 display 서체 토큰은 정의되어 있지 않다.

### Hierarchy
- **Headline:** 페이지 제목. 모바일에서는 크기만 (23px)로 줄인다.
- **Title:** 검색 패널과 결과 제목. 모바일 검색 패널 제목은 (17px), 결과 제목은 기본 title 크기를 유지한다.
- **Result title:** 도서관명. 긴 이름은 줄바꿈하고 목록 번호의 옆 열을 유지한다.
- **Body:** 입력값과 설명의 기준. 보조 결과 요약과 선택 도서관 이름은 (13px)로 조정한다.
- **Button / Label:** 행동명과 필드 이름. UI를 영문 대문자나 과도한 자간으로 장식하지 않는다.
- **Detail / Badge:** 주소·전화·안내와 짧은 상태. 결과 메타데이터는 작지만 명확한 대비를 유지한다.

**The Stable Number Rule.** 사용량·결과 수·도서관 코드는 tabular-nums를 사용한다. 실제 목록 번호는 필터 전 결과에 부여한 번호를 유지하며, 지도와 목록 사이에서 의미가 바뀌지 않는다.

## Layout

공통 컨테이너 최대 너비는 (1560px)다. 기본 헤더 좌우 여백은 (40px), 최소 높이는 (76px)이며, 본문은 위 (36px), 좌우 (40px), 아래 (28px)다. 본문은 검색 패널 (300px)과 나머지 결과면의 두 열이며 간격은 workspace 토큰을 쓴다. 검색 패널은 panel padding과 radius 토큰을 적용한다.

결과면은 목록 `minmax(240px, .85fr)`와 지도 `minmax(280px, 1.15fr)`로 나눈 하나의 흰 컨테이너다. 기본 최소 높이는 (536px), 지도는 (440px)다. 목록을 각각 떠 있는 카드로 분리하지 않고 구분선이 있는 연속 행으로 읽는다. 행의 주소·연락처 열은 번호 뒤 (37px) 들여쓰기다.

- **넓은 화면, 최소 (1600px):** 검색 열 (320px), 열 간격 wide-workspace, 패널 여백 (28px), 결과 최소 높이 (600px), 지도 최소 높이 (500px).
- **중간 화면, 최대 (1190px):** 본문 좌우 (28px), 검색 열 (280px), 열 간격 (24px), 패널 여백 (20px). 결과 내부는 목록 다음 지도 순서의 한 열이며 지도 최소 높이는 (320px)다.
- **모바일, 최대 (720px):** 헤더 최소 높이 (70px), 본문 좌우 (20px), 검색·결과는 한 열이며 간격은 mobile-workspace다. 패널 여백은 세로 (23px)·가로 (20px)다. 도서 입력과 후보 조회 버튼은 같은 줄로, 지역 필드는 두 열로 유지한다. 결과 보기 스위치가 나타나며 목록 또는 지도 한쪽만 표시한다. 지도 최소 높이는 (390px)다.

모바일 사용량은 오른쪽 정렬로 두 줄까지 배치한다. 상세 설명 팝오버는 뷰포트 안에 들어가도록 너비를 제한한다. 제목·주소·오류 문구는 줄바꿈하며 고정 높이로 잘라내지 않는다.

## Elevation & Depth

일반 작업면은 평평하다. 깊이는 바탕색·흰 결과면·가는 행 구분선으로 전달한다. 그림자는 떠 있는 사용량 설명과 지도 위 핀에만 존재한다. 선택은 행 배경과 번호 반전, 핀의 외곽선과 확대, 선택 도서관 띠로 드러낸다.

### Shadow Vocabulary
- **설명 팝오버:** `0 8px 30px #102d2a26`.
- **지도 핀:** `0 2px 6px #16362a40`.

**The Flat Work Surface Rule.** 기본 패널·검색 결과·버튼에 일반 카드 그림자를 더하지 않는다. 떠 있는 설명과 지도 오버레이의 기존 그림자만 깊이 신호로 사용한다.

## Shapes

큰 검색 패널과 결과 컨테이너는 panel 모서리, 버튼·필드는 control 모서리를 쓴다. 상태 배지는 badge 모서리, 목록 번호·결과 수는 compact 모서리다. 모드 선택 트랙은 mode-track, 사용량 설명 팝오버는 popover를 사용한다. 지도 핀과 작은 상태 점만 원형이다. 이 값들을 하나의 임의 모서리 수치로 통일하지 않는다.

필드는 (1px) 실선과 흰 바탕, 결과 행은 (1px) 아래 구분선이다. 기본 focus-visible은 focus 색의 (3px) 외곽선과 (3px) offset이다. 선택 도서관 맥락의 프로그램 초점은 밝은 잎색 `#dce9b9`의 (3px) inset 외곽선, offset (-5px)로 어두운 배경 위에서 보인다.

## Components

### Buttons

주요 버튼은 검색 행동이다. 기본 여백과 색은 frontmatter를 따른다. 최종 검색은 전체 너비·최소 높이 (48px)이며 검색 아이콘과 문구를 함께 쓴다. 후보 조회는 secondary 변형이며 데스크톱 검색 열에서는 입력 다음 줄 전체 너비, 모바일에서는 입력 옆으로 배치한다. 새로고침은 투명 icon 변형이며 accessible name을 유지한다.

주요 버튼의 disabled 상태는 `#cbd6c9` 바탕과 `#596b59` 문자다. 조건 미충족 사유는 버튼 아래 문구로 알려준다. 후보 조회와 검색 중에는 문구가 각각 `조회 중`, `도서관 확인 중`으로 바뀐다. 배경·문자 전환은 (160ms ease-out)이다.

### Inputs / Fields

입력과 select 최소 높이는 (46px)다. 레이블은 항상 필드 위에 있고, 힌트는 아래에서 조건을 설명한다. 비활성 필드는 `#f2f5f0` 바탕·`#6b776d` 문자·line 테두리다. ISBN 모드 전환 시 숨긴 흐름의 입력을 비활성화한다. 후보 선택은 조회 전 비활성 상태이고, 지역의 하위 선택은 상위 지역과 조회 상태에 맞춘다.

오류는 error 조합의 인라인 status 문구로 표시하며 긴 문구가 줄바꿈한다. 검색 중 결과 영역에 `aria-busy`를 부여하고 폼 입력을 잠시 비활성화한다. 실패 뒤에는 입력 조건을 유지하며 오류를 빈 결과로 표시하지 않는다.

### Navigation / Segmented Controls

헤더 브랜드는 홈 링크이며 별도의 메뉴 구조는 없다. 검색 모드는 실제 radio를 사용하고 선택 항목만 흰 바탕으로 드러낸다. radio의 키보드 초점은 보이는 라벨에도 외곽선을 표시한다. 모바일 목록·지도 전환은 `aria-pressed`가 현재 보기를 나타내는 버튼 그룹이다. 이용 안내 링크는 접힌 도움말을 연다. 최상단 건너뛰기 링크는 키보드 초점 시 나타난다.

### Status Chips

배지는 짧고 평평한 직사각형이다. `Y`는 대출가능, `N`은 대출중, 그 외 값은 상태 미확인이다. 대출가능만 보기 필터는 `Y`만 포함하며 미확인을 대출중으로 단정하지 않는다. 지도 핀도 같은 의미의 녹색·황토·중성색을 사용한다.

### Containers / Result Rows

검색 패널은 tonal container이며 결과는 연속 행으로 구성된 하나의 white container다. 행은 마지막 구분선만 제거한다. 선택 행은 selected-row 배경과 반전된 번호 버튼을 함께 보여준다. 도서관명·대출 배지·주소·홈페이지·전화·코드를 순서대로 배치하고, 존재하지 않는 홈페이지 링크를 만들지 않는다.

### Number-linked Map Selection

각 목록 번호 버튼은 해당 지도 핀과 동일한 번호다. 목록 번호 버튼은 (27px) 정사각형, 지도 핀은 map-pin 크기의 원형이며 흰 테두리 (2px)를 쓴다. 핀 선택 시 forest 외곽선 (3px), offset (2px), scale (1.12)를 적용한다. 위치를 확인한 선택은 지도 level (4)에서 해당 좌표로 이동한다. 좌표를 찾지 못해도 도서관 선택 맥락과 주소를 표시하고 미확인 문구를 제공한다.

모바일에서 목록 번호를 누르면 지도 보기로 전환하고, 보이는 선택 도서관 region에 프로그램 초점을 보낸다. region은 선택 도서관명으로 레이블하며 `tabindex=-1`로 프로그램 초점만 받는다. 이어지는 Tab은 해당 도서관 홈페이지 링크로 이동한다. 검색 성공 시 모바일은 결과 시작으로 스크롤하고 결과 region에 초점을 보낸다. 지도 핀 자체를 누른 경우 초점을 임의로 이동하지 않는다.

### Empty / Loading / Error / Unknown States

검색 전에는 책 아이콘과 다음 행동 안내를 보여준다. 결과 0건, 필터로 남은 0건, 요청 실패는 각각 다른 문구다. 검색 중에는 (1.3s ease-in-out) 교차 배경의 skeleton과 상태 문구를 쓴다. reduced-motion 환경에서는 애니메이션·transition을 제거한다.

지도 연결 실패는 상태 띠에 설명하고 결과 목록을 유지한다. 좌표 확인 중·일부 주소 미확인·전체 위치 표시도 문구로 구분한다. 사용량은 확인 중, 집계 확인 불가, 날짜별 전체 호출 수의 세 상태를 구분한다. 날짜와 갱신 시각의 설명은 header details 안에 둔다.

코드와 검수 캡처에서 위 시각·초점 동작을 확인했다. `.impeccable/review/finish-review.md`의 ship 판정은 수정된 모바일 초점 문제와 그 회귀 확인에 한정된다. 캡처 환경의 기존 사용량 스냅샷 미연결과 Kakao 도메인 거부는 성공 상태의 검증 근거가 아니다. 프로덕션에서 실제 지도·핀 생성·이동을 확인하는 통합 검증은 별도 게이트이며 이 문서가 완료를 보증하지 않는다.

## Do's and Don'ts

### Do:
- **Do** 숲색 행동과 회녹색 작업면, 흰 결과면의 역할을 유지한다.
- **Do** 같은 도서관의 목록과 지도에 같은 번호를 사용한다.
- **Do** 대출가능·대출중·상태 미확인을 문구와 색으로 함께 표시한다.
- **Do** 모바일에서 숨긴 목록을 벗어난 초점을 보이는 선택 도서관 맥락으로 옮긴다.
- **Do** 화면 크기에 따른 목록·지도 구조와 reduced-motion 동작을 함께 유지한다.

### Don't:
- **Don't** 집계 연결 실패를 사용량 0으로, 요청 실패를 빈 결과로 바꾸지 않는다.
- **Don't** 필터를 바꿀 때 남은 도서관 번호를 다시 매겨 지도와의 연결을 끊지 않는다.
- **Don't** 평평한 결과 행에 일반 카드 그림자나 불필요한 장식 레이어를 더하지 않는다.
- **Don't** 확인되지 않은 기관 소속·실시간 상태 보장·성공 검증 주장을 추가하지 않는다.
- **Don't** 방향 계약의 초기 수치를 근거로 구현의 패널·컨트롤 모서리를 임의 통일하지 않는다.