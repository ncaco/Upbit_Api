from fastapi import APIRouter, HTTPException
import requests
from jwt import encode
import uuid
import os
from dotenv import load_dotenv
from typing import Optional, List
from pydantic import BaseModel

# .env 파일 로드
load_dotenv()

router = APIRouter(
    prefix="/api/upbit",
    tags=["3. Withdraws"]
)

# Upbit API 설정
UPBIT_API_URL = "https://api.upbit.com/v1"
ACCESS_KEY = os.getenv('UPBIT_OPEN_API_ACCESS_KEY')
SECRET_KEY = os.getenv('UPBIT_OPEN_API_SECRET_KEY')

class WithdrawRequest(BaseModel):
    amount: str
    currency: str
    net_type: str = None
    secondary_address: str = None
    transaction_type: str = None

class KRWWithdrawRequest(BaseModel):
    amount: str
    two_factor_type: str = "none"
    two_factor_code: str = None

@router.get("/withdraws")
async def get_withdraws(
    currency: str = None,
    state: str = None,
    uuids: List[str] = None,
    txids: List[str] = None,
    limit: int = 100,
    page: int = 1,
    order_by: str = "desc"
):
    """
    출금 리스트 조회
    
    Args:
        currency: Currency 코드
        state: 출금 상태
            - WAITING: 대기중
            - PROCESSING: 진행중
            - DONE: 완료
            - FAILED: 실패
            - CANCELLED: 취소됨
            - REJECTED: 거절됨
        uuids: 출금 UUID의 목록
        txids: 출금 TXID의 목록
        limit: 개수 제한 (default: 100, max: 100)
        page: 페이지 수 (default: 1)
        order_by: 정렬 방식
            - asc: 오름차순
            - desc: 내림차순 (default)
            
    Returns:
        - type: 입출금 종류
        - uuid: 출금의 고유 아이디
        - currency: 화폐를 의미하는 영문 대문자 코드
        - net_type: 출금 네트워크
        - txid: 출금의 트랜잭션 아이디
        - state: 출금 상태
        - created_at: 출금 생성 시간
        - done_at: 출금 완료 시간
        - amount: 출금 금액/수량
        - fee: 출금 수수료
        - transaction_type: 출금 유형 (default: 일반출금, internal: 바로출금)
    """
    try:
        query = []
        if currency:
            query.append(f"currency={currency}")
        if state:
            query.append(f"state={state}")
        if uuids:
            for uuid_str in uuids:
                query.append(f"uuids[]={uuid_str}")
        if txids:
            for txid in txids:
                query.append(f"txids[]={txid}")
        if limit:
            query.append(f"limit={limit}")
        if page:
            query.append(f"page={page}")
        if order_by:
            query.append(f"order_by={order_by}")
            
        payload = {
            'access_key': ACCESS_KEY,
            'nonce': str(uuid.uuid4()),
            'query': "&".join(query)
        }
        
        jwt_token = encode(payload, SECRET_KEY)
        headers = {"Authorization": f"Bearer {jwt_token}"}
        
        params = {
            'currency': currency,
            'state': state,
            'limit': limit,
            'page': page,
            'order_by': order_by
        }
        
        if uuids:
            params['uuids[]'] = uuids
        if txids:
            params['txids[]'] = txids
            
        response = requests.get(
            f"{UPBIT_API_URL}/withdraws",
            params=params,
            headers=headers
        )
        response.raise_for_status()
        
        return response.json()
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/withdraw")
async def get_withdraw(
    uuid_or_txid: str,
    currency: str = None,
    is_txid: bool = False
):
    """
    개별 출금 조회
    
    Args:
        uuid_or_txid: 출금 UUID 또는 TXID
        currency: Currency 코드
        is_txid: 입력값이 TXID인지 여부 (True: TXID, False: UUID)
        
    Returns:
        - type: 입출금 종류
        - uuid: 출금의 고유 아이디
        - currency: 화폐를 의미하는 영문 대문자 코드
        - net_type: 출금 네트워크
        - txid: 출금의 트랜잭션 아이디
        - state: 출금 상태
            - WAITING: 대기중
            - PROCESSING: 진행중
            - DONE: 완료
            - FAILED: 실패
            - CANCELLED: 취소됨
            - REJECTED: 거절됨
        - created_at: 출금 생성 시간
        - done_at: 출금 완료 시간
        - amount: 출금 금액/수량
        - fee: 출금 수수료
        - transaction_type: 출금 유형
            - default: 일반출금
            - internal: 바로출금
    """
    try:
        query = []
        if is_txid:
            query.append(f"txid={uuid_or_txid}")
        else:
            query.append(f"uuid={uuid_or_txid}")
        if currency:
            query.append(f"currency={currency}")
            
        payload = {
            'access_key': ACCESS_KEY,
            'nonce': str(uuid.uuid4()),
            'query': "&".join(query)
        }
        
        jwt_token = encode(payload, SECRET_KEY)
        headers = {"Authorization": f"Bearer {jwt_token}"}
        
        params = {}
        if is_txid:
            params['txid'] = uuid_or_txid
        else:
            params['uuid'] = uuid_or_txid
        if currency:
            params['currency'] = currency
            
        response = requests.get(
            f"{UPBIT_API_URL}/withdraw",
            params=params,
            headers=headers
        )
        response.raise_for_status()
        
        return response.json()
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/withdraws/chance")
async def get_withdraw_chance(currency: str):
    """
    출금 가능 정보 조회
    
    Args:
        currency: Currency 코드
        
    Returns:
        - member_level: 사용자의 보안등급
        - currency: 화폐 정보
        - account: 사용자의 계좌 정보
        - withdraw_limit: 출금 제한 정보
    """
    try:
        query = f"currency={currency}"
        payload = {
            'access_key': ACCESS_KEY,
            'nonce': str(uuid.uuid4()),
            'query': query
        }
        
        jwt_token = encode(payload, SECRET_KEY)
        headers = {"Authorization": f"Bearer {jwt_token}"}
        
        response = requests.get(
            f"{UPBIT_API_URL}/withdraws/chance",
            params={'currency': currency},
            headers=headers
        )
        response.raise_for_status()
        
        return response.json()
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/withdraws/withdraw_addresses")
async def get_withdraw_addresses(currency: str = None):
    """
    출금 허용 주소 리스트 조회
    
    Args:
        currency: Currency 코드
        
    Returns:
        - currency: 화폐
        - net_type: 출금 네트워크
        - address: 출금 주소
        - secondary_address: 2차 출금 주소
    """
    try:
        query = []
        if currency:
            query.append(f"currency={currency}")
            
        payload = {
            'access_key': ACCESS_KEY,
            'nonce': str(uuid.uuid4()),
            'query': "&".join(query)
        }
        
        jwt_token = encode(payload, SECRET_KEY)
        headers = {"Authorization": f"Bearer {jwt_token}"}
        
        response = requests.get(
            f"{UPBIT_API_URL}/withdraws/withdraw_addresses",
            params={'currency': currency} if currency else None,
            headers=headers
        )
        response.raise_for_status()
        
        return response.json()
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/withdraws/coin")
async def withdraw_coin(withdraw: WithdrawRequest):
    """
    디지털 자산 출금하기
    
    Args:
        amount: 출금 코인 수량
        currency: Currency 코드
        net_type: 출금 네트워크
        secondary_address: 2차 출금 주소 (필요한 경우)
        transaction_type: 출금 유형 (default: 일반출금, internal: 바로출금)
    """
    try:
        data = {
            'amount': withdraw.amount,
            'currency': withdraw.currency,
            'net_type': withdraw.net_type,
            'transaction_type': withdraw.transaction_type
        }
        
        if withdraw.secondary_address:
            data['secondary_address'] = withdraw.secondary_address
            
        payload = {
            'access_key': ACCESS_KEY,
            'nonce': str(uuid.uuid4()),
        }
        
        jwt_token = encode(payload, SECRET_KEY)
        headers = {
            "Authorization": f"Bearer {jwt_token}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(
            f"{UPBIT_API_URL}/withdraws/coin",
            json=data,
            headers=headers
        )
        response.raise_for_status()
        
        return response.json()
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/withdraws/krw")
async def withdraw_krw(withdraw: KRWWithdrawRequest):
    """
    원화 출금하기
    
    Args:
        amount: 출금 원화 금액
        two_factor_type: 2차 인증 수단 (none, kakao_pay)
        two_factor_code: 2차 인증 코드
    """
    try:
        data = {
            'amount': withdraw.amount,
            'two_factor_type': withdraw.two_factor_type
        }
        
        if withdraw.two_factor_code:
            data['two_factor_code'] = withdraw.two_factor_code
            
        payload = {
            'access_key': ACCESS_KEY,
            'nonce': str(uuid.uuid4()),
        }
        
        jwt_token = encode(payload, SECRET_KEY)
        headers = {
            "Authorization": f"Bearer {jwt_token}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(
            f"{UPBIT_API_URL}/withdraws/krw",
            json=data,
            headers=headers
        )
        response.raise_for_status()
        
        return response.json()
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 