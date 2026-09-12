# newbiethon

해커톤 프로젝트 골격입니다. 현재 ID/PW 기반 간단 로그인 기능이 구현되어 있습니다.

## 기술 스택

- Frontend: Vite + React (JavaScript)
- Backend: FastAPI (Python)

## 폴더 구조

```
.
├─ frontend/   # Vite + React 앱
├─ backend/    # FastAPI 앱
├─ .gitignore
└─ README.md
```

## Frontend 실행

```bash
cd frontend
npm install
npm run dev
```

기본 주소: http://localhost:5173

## Backend 실행

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn app:app --reload
```

기본 주소: http://127.0.0.1:8000

헬스 체크: `GET /health` → `{"status": "ok"}`

사용자 데이터는 `backend/app.db` (SQLite 파일)에 저장되며, 서버를 재시작해도 유지됩니다.
이 파일은 Git에서 제외됩니다.

## 인증 API

- `POST /auth/register` — `{ "username": "...", "password": "..." }` → 성공 시 `{ "success": true, "user_id": 1 }`, 중복 ID면 `{ "success": false, "message": "이미 사용 중인 아이디입니다." }`
- `POST /auth/login` — `{ "username": "...", "password": "..." }` → 성공 시 `{ "success": true, "user_id": 1 }`, 실패 시 `{ "success": false, "message": "아이디 또는 비밀번호가 올바르지 않습니다." }`

Frontend는 `frontend/.env` (미포함, `.env.example` 참고)의 `VITE_API_BASE_URL`로 Backend 주소를 설정합니다. 기본값은 `http://localhost:8000`입니다.

**보안 한계 (해커톤 MVP)**: 현재 비밀번호는 평문으로 저장됩니다. JWT/OAuth/이메일 인증 등은 구현되어 있지 않습니다. 실제 서비스로 확장할 경우 bcrypt 등 안전한 해싱 방식으로 반드시 교체해야 합니다.

## 협업 규칙

- 각자 최신 `main`에서 feature 브랜치를 생성해 작업합니다.
- 비밀키 등 민감한 값은 커밋하지 않습니다 (`.env`는 Git에서 제외됩니다).
