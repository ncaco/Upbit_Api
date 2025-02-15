from fastapi import APIRouter, HTTPException
import requests
from jwt import encode
import uuid
import os
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

router = APIRouter(
    prefix="/api/upbit",
    tags=["5. Status"]
)

# Upbit API 설정
UPBIT_API_URL = "https://api.upbit.com/v1"
ACCESS_KEY = os.getenv('UPBIT_OPEN_API_ACCESS_KEY')
SECRET_KEY = os.getenv('UPBIT_OPEN_API_SECRET_KEY')

@router.get("/status/wallet")
async def get_wallet_status():
    """
    입출금 현황 조회
    
    Returns:
        - currency: 화폐를 의미하는 영문 대문자 코드
        - wallet_state: 입출금 상태
            - working: 입출금 가능
            - withdraw_only: 출금만 가능
            - deposit_only: 입금만 가능
            - paused: 입출금 중단
            - unsupported: 입출금 미지원
        - block_state: 블록 상태
            - normal: 정상
            - delayed: 지연
            - inactive: 비활성
        - block_height: 블록 높이
        - block_updated_at: 블록 갱신 시각
    """
    try:
        payload = {
            'access_key': ACCESS_KEY,
            'nonce': str(uuid.uuid4()),
        }
        
        jwt_token = encode(payload, SECRET_KEY)
        headers = {"Authorization": f"Bearer {jwt_token}"}
        
        response = requests.get(
            f"{UPBIT_API_URL}/status/wallet",
            headers=headers
        )
        response.raise_for_status()
        
        return response.json()
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/api_keys")
async def get_api_keys():
    """
    API 키 리스트 조회
    
    Returns:
        - access_key: 액세스 키
        - expire_at: 만료 시간 (ISO8601 형식)
    """
    try:
        payload = {
            'access_key': ACCESS_KEY,
            'nonce': str(uuid.uuid4()),
        }
        
        jwt_token = encode(payload, SECRET_KEY)
        headers = {"Authorization": f"Bearer {jwt_token}"}
        
        response = requests.get(
            f"{UPBIT_API_URL}/api_keys",
            headers=headers
        )
        response.raise_for_status()
        
        return response.json()
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 