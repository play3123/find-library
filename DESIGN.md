---
name: Find Library
description: 책의 본문처럼 활자와 여백으로 소장 도서관과 대출 상태를 읽는 검색 도구.
colors:
  ink: '#20201e'
  muted: '#5b6258'
  ground: '#f8f8f4'
  white: '#fff'
  accent: '#52665b'
  accent-hover: '#354a3d'
  line: '#d7dbd1'
  field-border: '#b7beb2'
  soft: '#edf0e9'
  success-bg: '#e9efe9'
  success: '#355543'
  amber: '#795125'
  amber-bg: '#f4ede3'
  error: '#983d38'
  error-bg: '#faf0ed'
  unknown-bg: '#e9ece6'
  unknown-text: '#5d665b'
  unknown-pin: '#677168'
  selected-row: '#f0f3eb'
  field-disabled-bg: '#f0f2ec'
  field-disabled-text: '#72796d'
  button-hover: '#3b4038'
  button-disabled-bg: '#e4e8df'
  button-disabled-text: '#616b5b'
typography:
  display:
    fontFamily: Georgia, "Times New Roman", serif
    fontSize: 46px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: -0.025em
  headline:
    fontFamily: Georgia, "Times New Roman", serif
    fontSize: 26px
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: -0.025em
  map-title:
    fontFamily: Georgia, "Times New Roman", serif
    fontSize: 24px
    fontWeight: 500
    lineHeight: 1.65
    letterSpacing: -0.025em
  result-title:
    fontFamily: Georgia, "Times New Roman", serif
    fontSize: 22px
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: -0.025em
  body:
    fontFamily: '"Inter", "Noto Sans KR", system-ui, sans-serif'
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.65
  button:
    fontFamily: '"Inter", "Noto Sans KR", system-ui, sans-serif'
    fontSize: 13px
    fontWeight: 600
    lineHeight: 1.65
  detail:
    fontFamily: '"Inter", "Noto Sans KR", system-ui, sans-serif'
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: '"Inter", "Noto Sans KR", system-ui, sans-serif'
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.65
  badge:
    fontFamily: '"Inter", "Noto Sans KR", system-ui, sans-serif'
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.7
  usage-count:
    fontFamily: Georgia, "Times New Roman", serif
    fontSize: 22px
    fontWeight: 400
    lineHeight: 1.7
rounded:
  square: '0'
  circle: 50%
spacing:
  tight: 7px
  small: 9px
  label-gap: 12px
  detail: 14px
  compact: 15px
  section: 20px
  column: 22px
  result-row: 23px
  group: 28px
  results: 30px
  desktop-gutter: 40px
  result-columns: 56px
components:
  button-primary:
    backgroundColor: '{colors.ink}'
    textColor: '{colors.white}'
    typography: '{typography.button}'
    rounded: '{rounded.square}'
    padding: 9px 12px
  button-primary-hover:
    backgroundColor: '{colors.button-hover}'
  button-primary-disabled:
    backgroundColor: '{colors.button-disabled-bg}'
    textColor: '{colors.button-disabled-text}'
  button-secondary:
    backgroundColor: '{colors.white}'
    textColor: '{colors.ink}'
    rounded: '{rounded.square}'
    padding: 9px 10px
  button-secondary-hover:
    backgroundColor: '{colors.soft}'
  button-tool:
    backgroundColor: '{colors.white}'
    textColor: '{colors.accent}'
    typography: '{typography.label}'
    rounded: '{rounded.square}'
    padding: 6px 10px
    height: 36px
  button-icon:
    backgroundColor: transparent
    textColor: '{colors.accent}'
    width: 30px
    height: 32px
  input-search:
    backgroundColor: '{colors.white}'
    textColor: '{colors.ink}'
    typography: '{typography.body}'
    rounded: '{rounded.square}'
    padding: 9px 11px
  input-disabled:
    backgroundColor: '{colors.field-disabled-bg}'
    textColor: '{colors.field-disabled-text}'
  mode-selected:
    backgroundColor: transparent
    textColor: '{colors.ink}'
    typography: '{typography.body}'
    padding: 3px 0 10px
  library-row:
    backgroundColor: transparent
    textColor: '{colors.ink}'
    padding: 23px 0
  library-row-selected:
    backgroundColor: '{colors.selected-row}'
  map-pin:
    backgroundColor: '{colors.accent}'
    textColor: '{colors.white}'
    rounded: '{rounded.circle}'
    width: 32px
    height: 32px
    padding: '0'
  map-info:
    textColor: '{colors.ink}'
    padding: 14px
    width: 250px
  map-selection:
    textColor: '{colors.ink}'
    typography: '{typography.detail}'
    padding: 14px 0 0
  usage-help:
    backgroundColor: '{colors.white}'
    textColor: '{colors.ink}'
    rounded: '{rounded.square}'
    padding: 20px
    width: 330px
  status-badge-success:
    backgroundColor: '{colors.success-bg}'
    textColor: '{colors.success}'
    typography: '{typography.badge}'
    rounded: '{rounded.square}'
    padding: 1px 6px
  status-badge-unavailable:
    backgroundColor: '{colors.amber-bg}'
    textColor: '{colors.amber}'
    typography: '{typography.badge}'
    rounded: '{rounded.square}'
    padding: 1px 6px
  status-badge-unknown:
    backgroundColor: '{colors.unknown-bg}'
    textColor: '{colors.unknown-text}'
    typography: '{typography.badge}'
    rounded: '{rounded.square}'
    padding: 1px 6px
---

# Design System: Find Library

## Overview

**Creative North Star: "책의 본문"**

밝은 지면 위에 검은 활자, 가는 구분선, 절제된 회녹색을 놓는다. 세리프 제목과 산세리프 본문이 책의 본문 같은 건조한 인상을 만들며, 여백과 활자의 크기로 정보의 순서를 드러낸다. 종이 질감이나 책 장식을 덧붙여 분위기를 설명하지 않는다.

Find Library / 대출가능 도서관 검색의 이름을 유지한다. 한 권의 책을 고르고 지역의 도서관을 비교하는 도구답게 입력·대출 상태·지도 선택을 명확히 보여준다. 확인되지 않은 기관 소속이나 실시간 대출 보장을 시각적 신뢰 장치로 추가하지 않는다.

**Key Characteristics:**
- 밝은 지면과 잉크색 주요 행동, 회녹색 링크·초점의 절제된 대비.
- Georgia 계열 제목과 Inter / Noto Sans KR 계열 본문의 역할 분리.
- 직각 필드와 얇은 구분선, 그림자 없는 기본 작업면.
- 목록과 지도의 동일 번호, 이름을 직접 확인할 수 있는 지도 핀.
- 대출 상태·요청 실패·집계 실패를 문구로 구별하는 정보 표현.

현재 구현의 근거는 docs/styles.css, docs/index.html, docs/app.js다. frontmatter는 기본 토큰을 소유하며 반응형 예외·초점·경계·동작은 아래 설명과 .impeccable/design.json에 둔다. 페이지 구성의 근거는 별도 surface 문서가 소유한다.

## Colors

밝은 지면과 잉크색을 중심으로, 회녹색은 링크와 보조 신호에 사용한다. 정확한 값은 frontmatter가 소유한다.

### Primary
- **회녹색 (accent, accent-hover):** 링크, 키보드 초점, 대출가능 지도 핀, 입력 caret.
- **잉크색 (ink, button-hover):** 기본 글자, 큰 구분선, 선택 모드 밑줄과 주요 검색 버튼.

### Secondary
- **대출가능 (success, success-bg):** 목록과 지도 정보창의 대출가능 배지.
- **대출중 황토 (amber, amber-bg):** 대출중 배지와 지도 핀.
- **오류 적갈색 (error, error-bg):** 입력·요청 실패의 인라인 안내.

### Neutral
- **지면·흰 면 (ground, white):** 화면과 입력·팝오버·지도 이름표. 검색·목록을 흰 카드로 둘러싸지 않는다.
- **보조 잉크 (muted):** 주소, 힌트, 출처와 사용량 설명.
- **구분선·필드 경계 (line, field-border):** 목록 행·선택 정보, 필드·설명 팝오버의 경계.
- **옅은 회녹색 (soft), 선택 지면 (selected-row):** 보조 hover·번호 선택·지도 준비 영역, 선택된 결과 행.
- **미확인 (unknown-text, unknown-bg, unknown-pin):** 대출 상태를 확인하지 못한 배지와 핀.
- **비활성 필드·검색 (field-disabled-*, button-disabled-*):** 조건 미충족과 요청 중의 비활성 상태.

**The Status Has Words Rule.** 대출가능·대출중·상태 미확인을 색과 문구로 함께 표시한다. 요청 실패를 결과 없음으로, 집계 실패를 0회로 바꾸지 않는다.

## Typography

**Display / Heading Font:** Georgia, Times New Roman, serif.
**Body / UI Font:** Inter, Noto Sans KR, system-ui, sans-serif.

**Character:** 큰 제목과 도서관 이름은 세리프의 활자감을 유지하고, 조작과 메타데이터는 산세리프로 조용하게 읽힌다. 별도 웹폰트를 로드하지 않으며 실제 글리프는 설치된 서체와 운영체제의 폴백에 따른다.

### Hierarchy
- **Display:** 페이지 제목. 최대 너비 (1190px)에서 (39px), (720px)에서 (31px / 1.35 / -0.04em), (360px)에서 (27px)로 줄인다.
- **Headline:** 결과 제목. 모바일에서는 (24px)다. 지도 제목은 map-title이며 모바일에서는 (23px)다.
- **Result title:** 도서관명. 최대 (1190px)에서 (20px), (980px)에서 (19px), (720px)에서 (20px)다. 긴 이름은 줄바꿈한다.
- **Body / Detail:** 기본 본문·입력과 주소·선택 정보. 도움말은 최대 (75ch), 모바일 주소는 (12px)다.
- **Label / Badge:** 필드 이름·힌트·출처·대출 상태. 검색 방식은 데스크톱 (14px), 모바일 (13px)이며 선택은 밑줄로 표시한다.
- **Usage count:** 전체 사용량은 모바일 (18px)다. 결과 수는 같은 세리프 계열의 (22px / 1.5), 모바일 (19px)다. 수치와 도서관 코드는 tabular-nums를 쓴다.
- **Selected book / Brand:** 선택 책 제목과 브랜드명은 세리프 (17px)다. 선택 책 제목은 모바일 (16px), 브랜드는 최대 (1190px)에서 (15px)다.

**The Two Voices Rule.** 제목과 도서관 이름은 세리프, 입력·설명·상태는 산세리프를 사용한다. 한글이 사용 환경의 지원 서체로 표시되는 것은 현재 폰트 스택의 의도된 동작이다.

## Layout

공통 컨테이너는 min(1272px, calc(100% - 80px))이며 중앙에 놓는다. 헤더는 위 (44px), 아래 (28px)의 여백과 잉크색 아래 구분선이다. 검색은 헤더 아래 가로 작업 줄이며, 위 (22px)·아래 (20px) 여백과 같은 아래 구분선을 갖는다.

검색 폼의 기본 열은 minmax(0,1.06fr) minmax(0,1.25fr) minmax(230px,1fr) 112px이고, 열 간격 (22px), 행 간격 (13px)이다. 검색 방식은 첫 행 전체 너비를 쓴다. 도서명 입력과 후보 조회는 한 줄, 지역 선택은 간격 (9px)의 두 열이다. ISBN 입력은 두 열을 차지한다. 선택 책·준비 안내·오류는 폼 전체 너비 아래에 이어진다.

결과 영역은 위 (30px) 여백을 갖는다. 결과 내부는 minmax(0,1.12fr) minmax(0,1fr) 두 열, 열 간격 (56px), 상단 정렬이다. 왼쪽 열은 결과 제목·요약·필터와 연속 목록을 함께 소유한다. 목록은 제목 아래 (20px) 뒤 잉크색 윗선에서 시작한다. 오른쪽 지도 열은 독립적인 제목·지역·범례를 가지며 position: sticky; top: 22px다. 두 열을 하나의 공통 헤더 행 높이에 종속시키지 않는다.

지도 자체의 높이는 clamp(320px,44svh,500px)다. 결과 목록 길이에 맞춰 늘어나지 않는다. 지도 아래에는 상태 안내와 선택 도서관 정보를 놓는다. 목록 행은 기본 세로 (23px) 여백이며, 번호 열 뒤 주소는 (33px) 들여쓴다.

- **최대 (1190px):** 검색 열 간격 (15px), 열 구성 minmax(0,1fr) minmax(0,1.2fr) minmax(210px,1fr) 105px, 결과 열 간격 (34px).
- **최대 (980px):** 검색은 같은 크기의 두 열로 나누고 지역은 왼쪽 아래에 놓는다. 검색 버튼은 오른쪽 정렬·너비 (155px), ISBN은 전체 너비다. 결과는 동일한 두 열·간격 (26px)을 유지하며 필터는 결과 요약 다음 줄에 놓인다.
- **최대 (720px):** 공통 너비는 calc(100% - 44px), 헤더 여백은 위 (26px)·아래 (20px)다. 검색 폼은 한 열·행 간격 (15px), 검색 버튼은 전체 너비다. 도서명과 후보 조회는 같은 줄, 지역은 두 열을 유지한다. 선택 책 정보는 세로로 배치한다.
- **모바일 결과:** 위 여백 (24px), 하나의 열이다. 결과 제목·필터·목록/지도 전환은 왼쪽 열 안에 유지하고 목록 또는 지도 하나를 표시한다. 지도 열은 sticky를 해제하며 높이는 clamp(320px,58svh,460px)다. 목록 윗여백은 (0), 행 여백은 세로 (20px), 주소 들여쓰기는 (29px)다. 사용량은 헤더 아래 왼쪽에 이어지며 설명 팝오버는 화면 안으로 너비를 제한한다.

지도 컨테이너 크기가 바뀌면 현재 중심과 열린 정보창을 유지하며 다시 계산한다. 모바일 지도 전환에서는 선택 도서관의 위치가 보이도록 중심을 맞춘다.

지도 크게 보기는 모달이나 새 창 대신 같은 본문에서 결과 그리드를 한 열로 바꾼다. 결과 헤더·필터는 유지하고 목록 본문을 일시 감춘다. 지도는 전체 본문 너비와 clamp(420px,72svh,780px) 높이를 사용한다. 원래 크기 버튼과 Escape로 복귀하며 전환 직전의 중심·배율을 보존한다. 확대 상태에서는 sticky를 해제한다. 지도 제목/크기 버튼과 지역/범례를 두 줄로 정렬한다.

## Elevation & Depth

검색·목록·버튼·사용량 팝오버는 그림자가 없는 평평한 면이다. 깊이는 여백·구분선·바탕색과 선택 상태로 전달한다. 지도 핀에만 작은 그림자를 써 지도 위의 위치를 읽게 한다. 네이티브 Kakao InfoWindow 외곽은 공급자 UI가 소유하며 앱은 내부 콘텐츠를 스타일링한다.

### Shadow Vocabulary
- **지도 핀:** box-shadow: 0 2px 5px #20201e26.

**The Flat Page Rule.** 검색·목록·버튼은 평평하게 유지한다. 지도 핀의 작은 그림자 외에 장식용 카드 그림자를 추가하지 않는다.

## Shapes

필드·검색 버튼·상태 배지·팝오버는 직각이다. 원형은 지도 핀, 범례 점, 작은 사용량 안내 표시처럼 의미가 있는 작은 표식에만 쓴다. 입력은 (1px) field-border, 결과의 시작과 지도 윗선은 (1px) ink, 행 구분선은 (1px) line이다.

기본 키보드 초점은 accent의 (2px) 외곽선과 (4px) offset이다. 선택 지도 핀은 ink의 (2px) 외곽선과 (2px) offset이며 확대 효과는 없다. 선택 도서관 정보의 프로그램 초점은 accent의 (2px) 외곽선과 (5px) offset이다.

## Components

### Buttons

주요 검색 버튼은 ink 바탕·white 문자, 보조 후보 조회는 white 바탕·ink 문자와 (1px) ink 경계다. 둘 다 최소 높이 (44px)이며 frontmatter의 padding은 기본값이다. 주요 버튼은 (13px / 600), 보조 버튼은 (12px / 600)다. 보조 버튼은 모바일에서 좌우 여백 (14px)을 쓴다. 검색 버튼은 데스크톱에서 필드 라벨 아래 높이에 맞춰 윗여백 (27px), 모바일에서는 (0)이다. HTML의 검색 아이콘은 현재 CSS에서 숨기며 문구로 행동을 알린다.

hover는 주요 버튼의 button-hover, 보조 버튼의 soft를 쓴다. 배경 전환은 (160ms ease-out)이다. 비활성 검색은 별도 바탕·문자와 line 경계를 사용하고 이유를 폼 안내로 설명한다. 후보 조회·최종 검색 중에는 각각 ‘조회 중’·‘도서관 확인 중’으로 바뀐다. 사용량 새로고침은 투명 아이콘 버튼이며 accessible name을 유지한다.

### Inputs / Fields

입력과 select는 최소 높이 (44px), 직각, white 바탕과 field-border의 (1px) 경계다. 라벨은 항상 위, 힌트는 아래에 있다. 체크박스·라디오는 (14px)이고 accent를 쓴다. 비활성 필드는 별도 중성 바탕·문자와 line 경계를 쓴다.

검색 방식 변경 시 숨긴 입력은 비활성화한다. 후보는 최대 30개임을 표시하고 도서명·저자가 바뀌면 이전 후보를 무효화한다. 지역의 하위 선택은 상위 지역에 맞춘다. 요청 중에는 입력을 비활성화하고 결과에 aria-busy를 표시한다. 오류는 줄바꿈하는 인라인 안내이며 입력 조건을 보존한다.

### Navigation / Segmented Controls

브랜드는 홈 링크다. 검색 방식은 실제 radio와 보이는 밑줄 라벨을 사용한다. 선택 라벨은 ink와 아래 (2px) 선이며 초점은 보이는 라벨에도 표시한다. 모바일 목록·지도 전환은 투명 버튼과 같은 밑줄 문법을 쓰며 aria-pressed로 현재 보기를 알린다. 이용 안내는 접힌 도움말을 열고 건너뛰기 링크는 키보드 초점 시 나타난다.

### Status Chips

배지는 직각이며 여백·서체·색은 frontmatter를 따른다. Y는 대출가능, N은 대출중, 그 외는 상태 미확인이다. 대출가능만 보기에는 Y만 포함한다. 필터 뒤에도 목록 번호를 다시 매기지 않아 지도와의 대응을 유지한다.

### Containers / Result Rows

결과는 바탕 위에 이어지는 행이다. 세리프 도서관명과 짧은 대출 배지를 같은 제목 영역에 놓고 주소·홈페이지·전화·도서관 코드를 그 아래에서 읽는다. 선택 행은 selected-row로 강조하고 번호에 soft 바탕과 밑줄을 준다. 긴 제목·주소는 줄바꿈하며 누락된 홈페이지 링크를 생성하지 않는다.

### Number-linked Map Selection

목록 번호 버튼은 (22px × 29px), 지도 번호 핀은 (32px × 32px)다. 핀은 white의 (2px) 테두리와 상태색을 가지며 선택은 외곽선으로 표현한다. hover·키보드 초점 시 도서관 이름표를 표시한다. 이름표는 white 바탕, field-border의 (1px) 경계, 최대 너비 (240px)이며 긴 이름은 말줄임한다. 이름표가 보이는 동안 해당 핀의 쌓임 순서를 높인다.

핀을 누르면 Kakao 네이티브 InfoWindow 안에 도서관명·대출 상태·주소를 표시한다. 내부는 기본 너비 (250px), 여백 (14px), 최대 (980px)에서 너비 (230px)다. 도서관명은 실제 URL이 있으면 홈페이지 링크이며 새 창을 열고 없으면 등록된 홈페이지가 없다고 알린다. 키보드로 핀을 활성화하면 링크 또는 닫기 버튼으로 초점을 보낸다. Escape나 닫기 버튼은 정보창을 닫고 원래 핀으로 돌아간다.

목록 번호나 지도 핀을 선택할 때 현재 배율을 유지한다. 선택 위치가 현재 지도 밖에 있을 때만 중심을 맞춘다. 지도 아래 선택 정보는 이름 링크와 주소를 유지한다. 모바일에서는 선택 정보 region에 초점을 보내고 보이는 위치로 스크롤한다. 좌표 미확인은 주소와 홈페이지를 참고하도록 안내하며 도서관 선택 자체를 버리지 않는다. 정보창의 Escape는 먼저 정보창만 닫으며 같은 키 입력으로 크게 보기까지 닫지 않는다.

### Book Copy Actions

검색 결과 요약과 지도 옆에서 책 제목·ISBN을 각각 복사한다. 버튼은 label 크기의 (12px) 글자, (36px) 최소 높이, (6px 10px) 여백, field-border 경계와 직각 모서리를 쓴다. 지도 옆에는 검색한 책 제목을 한 줄로 표시하고 긴 제목의 전체 내용은 title 속성으로 제공한다.

복사 대상은 현재 검색 결과를 만든 책의 스냅샷이다. 입력 중인 새 후보를 복사 대상으로 바꾸지 않는다. ISBN 직접 검색은 국립중앙도서관 후보 조회로 일치하는 ISBN의 제목을 보완하며 제목을 확인하지 못하면 ISBN 복사는 유지하고 제목 버튼을 비활성화한다. 성공은 상태 문구로 알리고 자동 복사 실패는 선택 가능한 읽기 전용 텍스트와 수동 복사 안내를 제공한다. 상단 소개 문장과 푸터 슬로건은 사용하지 않는다.

### Usage Disclosure

헤더의 사용량은 서비스 전체 정보나루 API 호출의 한국시간 날짜별 합계를 나타낸다. ‘확인 중’·‘집계 확인 불가’·확인된 수치를 구별한다. details 설명은 (330px) 너비, (20px) 여백과 (1px) field-border를 쓰며 그림자는 없다. 모바일에서는 min(330px,calc(100vw - 44px))로 제한한다. 설명은 합계의 범위와 날짜·갱신 시각을 밝힌다.

### Empty / Loading / Error / Unknown States

검색 전 안내, 결과 0건, 필터 결과 0건, 요청 실패를 구별한다. 새 검색은 이전 제목·도서 요약·결과를 남기지 않고 현재 지역의 소장 정보·대출 상태를 조회 중이라는 새 제목·요약을 표시한다. skeleton은 높이 (82px), 아래 여백 (18px), 바탕 #e8ece2에서 #dbe2d4로 (1.3s ease-in-out infinite alternate) 전환한다. reduced-motion 환경에서는 애니메이션·transition을 제거한다.

지도 준비·연결 실패·좌표 확인 중·일부 주소 미확인·위치 표시 완료를 각각 설명하고 지도 오류가 있어도 목록을 유지한다. 공급처 데이터의 실시간성이나 향후 가용성을 화면이 보장하지 않는다.

## Do's and Don'ts

### Do:
- **Do** 세리프 제목과 산세리프 본문의 역할을 유지하고 한글 시스템 폴백을 존중한다.
- **Do** 주요 검색은 잉크색, 링크·초점·대출가능 핀은 회녹색으로 구분한다.
- **Do** 검색과 결과를 가는 구분선으로 나누고 직각 필드와 연속 목록 행을 유지한다.
- **Do** 목록과 지도에 같은 번호를 쓰고 지도 높이를 목록 길이와 독립적으로 유지한다.
- **Do** 모바일 지도 전환 뒤 지도 크기와 선택 도서관의 가시성을 다시 맞춘다.
- **Do** 실제 홈페이지 URL이 있을 때 도서관 이름을 링크로 표시하고 실패·미확인 상태를 문구로 남긴다.

### Don't:
- **Don't** 숲색 헤더, 둥근 tonal 검색 패널, 단일 산세리프 제목으로 이전 시각 체계를 되살리지 않는다.
- **Don't** 종이 질감, 가짜 책 장식, 장식용 그림자나 분리된 카드 그리드를 추가하지 않는다.
- **Don't** 지도 높이를 긴 결과 목록에 맞춰 늘리거나 모바일에서 두 결과 보기를 동시에 강제하지 않는다.
- **Don't** 대출 상태를 색만으로 전달하거나 오류·미확인 집계를 0으로 표시하지 않는다.
- **Don't** 확인되지 않은 기관 로고·소속·실시간성 보장이나 존재하지 않는 홈페이지 링크를 추가하지 않는다.
