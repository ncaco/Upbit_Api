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

# 서버 실행
uvicorn main:app --reload 