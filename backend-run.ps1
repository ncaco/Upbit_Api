# 가상환경 생성
if (!(Test-Path -Path ".\venv")) {
    python -m venv venv
}

# 가상환경 활성화
if (!(Get-Command python).Path.Contains("venv")) {
    . .\venv\Scripts\Activate.ps1
}

# pip 업그레이드
python.exe -m pip install --upgrade pip

# 의존성 설치
pip install -r requirements.txt

# npm 의존성 설치
npm install

# 백엔드 서버와 프론트엔드 동시 실행
Start-Process powershell { uvicorn main:app --reload }
npm run dev