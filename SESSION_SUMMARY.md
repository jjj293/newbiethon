# 세션 요약 — 룸메이트 매칭 서비스 (newbiethon)

이 문서는 Claude와 함께 진행한 작업 내역을 정리한 요약입니다. 백엔드 매칭 API 구현부터 로그인 화면 스타일링, 결과 화면 디자인까지의 흐름을 담고 있습니다.

## 1. 백엔드: 룸메이트 매칭 API (FastAPI + SQLAlchemy)

`backend/` 아래에 다음 파일들을 순서대로 구현했습니다.

- **database.py** — SQLite(`roommate.db`) 연결, `SessionLocal`, `Base`, `get_db` 의존성
- **models.py** — `User`, `UserRegion`, `Lifestyle`, `Preference`, `BudgetPreference` 5개 테이블
- **schemas.py** — Pydantic 스키마. camelCase ↔ snake_case 자동 변환(`alias_generator` + `populate_by_name=True`)
- **matching.py** — DB/FastAPI에 의존하지 않는 순수 계산 로직
  - `passes_hard_filter()`: 성별 일치, 지역 교집합, 예산 범위 겹침(나이·흡연 여부는 사용 안 함)
  - `calculate_match_score()`: lifestyle 유사도(80점) + guest/pet 일치(20점)
  - `calculate_complement_score()`: social↔privacy, noise↔sleep, cleanliness↔conflict, useful difference를 조합한 보완 점수
  - `generate_strengths_and_risks()`: 항목별 점수 차이 + 교차 lifestyle 관계를 기반으로 한 강점/위험 문구 생성 (LLM 미사용, 템플릿 기반)
  - `find_top_matches()`: Hard Filter → 점수 계산 → matchScore/complementScore 각각 상위 3명 선정
- **seed.py** — 17명의 테스트 사용자 (동일 성향, 정반대 성향, 매칭 높고 보완 낮은 케이스, 매칭 중간이고 보완 높은 케이스, 지역/예산/성별 필터 탈락 케이스 등 의도적으로 다양하게 구성)
- **main.py** — `POST /auth/register`, `POST /auth/login`, `GET /users/{id}`, `PUT /users/{id}`, `GET /matches/{user_id}`

실제로 서버를 띄우고 seed 데이터로 전 구간을 검증했습니다.

### 발견/수정한 이슈
- **Windows 한글 인코딩**: `PYTHONUTF8=1` 없이 실행하면 한글 문자열이 DB에 깨진 채로 저장됨 → 항상 `PYTHONUTF8=1`로 실행하도록 안내
- **`UserOut` 직렬화 버그**: `user.regions`가 ORM 객체 리스트인데 스키마는 `List[str]`을 기대 → `_to_user_out()` 변환 헬퍼로 해결
- **Pylance import 오류**: VS Code가 venv 인터프리터를 안 보고 있었던 것 + `models.py`가 `model.py`(단수)로 저장되어 있었던 오타

## 2. 기존 로그인 기능과 통합

원래 있던 raw-sqlite 기반 로그인(`app.py`)을 매칭 API와 하나의 서버로 합쳤습니다.

- `app.py`를 `APIRouter`로 변경, `main.py`에서 `include_router()`로 포함
- **로그인 계정과 매칭 프로필을 하나의 `User` 테이블로 통합**하기로 결정
  - `User`에 `username`, `password_hash`(salt + PBKDF2 해시) 추가
  - `gender`/`age`/`is_smoker`를 nullable로 변경 (회원가입 직후엔 비어있음)
  - `POST /auth/register`: 계정 정보만 채운 bare user 생성 (id는 uuid)
  - `PUT /users/{user_id}`: 온보딩 설문(라이프스타일/선호도/예산)으로 프로필 완성
  - `GET /matches/{user_id}`: 프로필 미완성 사용자는 400 반환, 후보 목록에서도 자동 제외
- 회원가입 → 온보딩 전 매칭 조회 시도(400) → 온보딩 → 매칭 성공까지 실제로 curl로 검증 완료

## 3. 픽셀아트 아바타

`design/pixel_avatar/`에 SVG 기반 픽셀아트 캐릭터를 코드로 직접 생성 (16×32 픽셀 그리드).

- `avatar_default.svg` — 시뮬레이션 중 기본 아바타
- 결과 화면용 6종: `avatar_sleep`(초승달), `avatar_social`(말풍선), `avatar_cleanliness`(빗자루), `avatar_noise`(헤드폰), `avatar_conflict`(빨간 느낌표), `avatar_privacy`(자물쇠) 배지 버전
- 브라우저에서 실제 렌더링 확인하며 헤드폰 아이콘 등을 다듬음

## 4. 로그인 화면 스타일링

컬러 차트(배경 흰색, 텍스트 #1A1A1A/#8A8A8A, 포인트 그린/핑크/옐로우/블루)를 `frontend/src/App.css`에 반영.

- ID/PW 입력칸: 둥근 모서리의 긴 직사각형, 세로 배치, 포커스 시 색상 강조(ID=하늘색, PW=핑크)
- 로그인/회원가입 버튼: 그린/옐로우 배경
- 메시지(성공/실패): 처음엔 알약 모양 배경으로 만들었다가, 이후 요청에 따라 **배경 없이 텍스트만** 표시하도록 변경

### 제목 폰트 (산돌구름 '퍼즐체') 트러블슈팅
- 처음엔 CDN 링크가 없어 데스크톱 앱에서만 쓸 수 있는 폰트인 줄 알았으나, 사용자가 실제 웹폰트 스트리밍 임베드 코드(`o6cdhdutve.execute-api...amazonaws.com`)를 찾아냄
- 실제로 curl로 요청해보니 "라이선스 인증 실패 — 도메인/개발서버 IP 미등록" 응답 확인
- `localhost`는 도메인 형식 검증에서 거부됨 → `127.0.0.1`로 등록하면 될 것으로 안내, 실제로 API 레벨에서는 정상 응답(진짜 `@font-face` + `.woff2`) 확인
- 브라우저 프리뷰 도구의 제약으로 127.0.0.1 포트 접속 확인에는 실패했으나, 사용자가 최종적으로 "그냥 안 쓸게"로 결정 → **폴백 폰트 'Jua'(Google Fonts)를 그대로 사용**하기로 확정

## 5. Git / PR

- "커밋할 게 없다"는 문제 → 스테이징 안 함 + 잘못된 디렉터리에서 명령 실행이 원인으로 진단
- `gh` CLI 미설치 + 비공개 저장소라 PR을 직접 생성하지 못하고, GitHub compare URL과 PR 제목/본문 초안을 제공
  - `https://github.com/jjj293/newbiethon/compare/main...feature/matching?expand=1`
- 작업 중 발견한 별개 이슈(`frontend/body.txt`, `body2.txt` 디버그 파일이 실수로 커밋되어 main에 병합됨)는 범위를 분리해 별도 정리 작업으로 제안

## 6. 매칭 결과 화면 디자인 목업

`design/matching_result_mockup/index.html` — 매칭 순위(그린) 위, 보완 순위(블루) 아래 배치.

- 메인/로그인 화면과 동일한 파스텔 팔레트, Jua 폰트로 톤 통일
- 후보 카드마다 1/2/3위 배지, 매칭 점수/보완 점수, 잘 맞는 점(+)/안 맞는 점(-)
- 강점·위험 문구는 `matching.py`가 실제로 생성하는 문장을 그대로 사용 (임의 텍스트 아님)
- Artifact로 발행 완료, `git commit`으로 저장소에도 반영됨 (`결과 화면 수정` 커밋)

## 현재 남은 작업 (참고용)
- 매칭 결과 화면을 실제 React 컴포넌트로 구현하고 `GET /matches/{user_id}` API에 연결
- 회원가입 직후 gender/age/희망지역을 입력받는 "기본 프로필" 페이지가 아직 없음 (온보딩 흐름에 필요)
- `frontend/body.txt`, `body2.txt` 디버그 파일 정리 (별도 작업 카드로 제안됨)
- 로그인 화면 산돌구름 폰트는 보류 상태, 현재 Jua로 확정
