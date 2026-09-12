# newbiethon

해커톤 프로젝트 초기 골격입니다. 아직 실제 서비스 기능은 구현되어 있지 않습니다.

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

## 협업 규칙

- 각자 최신 `main`에서 feature 브랜치를 생성해 작업합니다.
- 비밀키 등 민감한 값은 커밋하지 않습니다 (`.env`는 Git에서 제외됩니다).
