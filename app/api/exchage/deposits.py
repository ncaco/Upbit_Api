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
    tags=["4. Deposits"]
)

# Upbit API 설정
UPBIT_API_URL = "https://api.upbit.com/v1"
ACCESS_KEY = os.getenv('UPBIT_OPEN_API_ACCESS_KEY')
SECRET_KEY = os.getenv('UPBIT_OPEN_API_SECRET_KEY')

class KRWDepositRequest(BaseModel):
    amount: str
    two_factor_type: str = "none"
    two_factor_code: str = None

@router.get("/deposits")
async def get_deposits(
    currency: str = None,
    state: str = None,
    uuids: List[str] = None,
    txids: List[str] = None,
    limit: int = 100,
    page: int = 1,
    order_by: str = "desc",
    transaction_type: str = None
):
    """
    입금 리스트 조회
    
    Args:
        currency: Currency 코드
        state: 입금 상태
            - WAITING: 대기중
            - PROCESSING: 진행중
            - DONE: 완료
            - CANCELLED: 취소됨
            - REJECTED: 거절됨
        uuids: 입금 UUID의 목록
        txids: 입금 TXID의 목록
        limit: 개수 제한 (default: 100, max: 100)
        page: 페이지 수 (default: 1)
        order_by: 정렬 방식 (asc/desc)
        transaction_type: 입금 유형 (default: 일반입금, internal: 바로입금)
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
        if transaction_type:
            query.append(f"transaction_type={transaction_type}")
            
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
            'order_by': order_by,
            'transaction_type': transaction_type
        }
        
        if uuids:
            params['uuids[]'] = uuids
        if txids:
            params['txids[]'] = txids
            
        response = requests.get(
            f"{UPBIT_API_URL}/deposits",
            params=params,
            headers=headers
        )
        response.raise_for_status()
        
        return response.json()
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/deposit")
async def get_deposit(
    uuid_or_txid: str,
    currency: str = None,
    is_txid: bool = False
):
    """
    개별 입금 조회
    
    Args:
        uuid_or_txid: 입금 UUID 또는 TXID
        currency: Currency 코드
        is_txid: 입력값이 TXID인지 여부
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
            f"{UPBIT_API_URL}/deposit",
            params=params,
            headers=headers
        )
        response.raise_for_status()
        
        return response.json()
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/deposits/generate_coin_address")
async def generate_coin_address(currency: str):
    """
    입금 주소 생성 요청
    
    Args:
        currency: Currency 코드
    """
    try:
        query = f"currency={currency}"
        payload = {
            'access_key': ACCESS_KEY,
            'nonce': str(uuid.uuid4()),
            'query': query
        }
        
        jwt_token = encode(payload, SECRET_KEY)
        headers = {
            "Authorization": f"Bearer {jwt_token}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(
            f"{UPBIT_API_URL}/deposits/generate_coin_address",
            params={'currency': currency},
            headers=headers
        )
        response.raise_for_status()
        
        return response.json()
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/deposits/coin_addresses")
async def get_coin_addresses():
    """전체 입금 주소 조회"""
    try:
        payload = {
            'access_key': ACCESS_KEY,
            'nonce': str(uuid.uuid4()),
        }
        
        jwt_token = encode(payload, SECRET_KEY)
        headers = {"Authorization": f"Bearer {jwt_token}"}
        
        response = requests.get(
            f"{UPBIT_API_URL}/deposits/coin_addresses",
            headers=headers
        )
        response.raise_for_status()
        
        return response.json()
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/deposits/coin_address")
async def get_coin_address(currency: str):
    """
    개별 입금 주소 조회
    
    Args:
        currency: Currency 코드
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
            f"{UPBIT_API_URL}/deposits/coin_address",
            params={'currency': currency},
            headers=headers
        )
        response.raise_for_status()
        
        return response.json()
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/deposits/krw")
async def deposit_krw(deposit: KRWDepositRequest):
    """
    원화 입금하기
    
    Args:
        amount: 입금 원화 금액
        two_factor_type: 2차 인증 수단 (none, kakao_pay)
        two_factor_code: 2차 인증 코드
    """
    try:
        data = {
            'amount': deposit.amount,
            'two_factor_type': deposit.two_factor_type
        }
        
        if deposit.two_factor_code:
            data['two_factor_code'] = deposit.two_factor_code
            
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
            f"{UPBIT_API_URL}/deposits/krw",
            json=data,
            headers=headers
        )
        response.raise_for_status()
        
        return response.json()
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/deposits/available_banks")
async def get_available_banks():
    """트레블룰 가능 거래소 조회"""
    try:
        payload = {
            'access_key': ACCESS_KEY,
            'nonce': str(uuid.uuid4()),
        }
        
        jwt_token = encode(payload, SECRET_KEY)
        headers = {"Authorization": f"Bearer {jwt_token}"}
        
        response = requests.get(
            f"{UPBIT_API_URL}/deposits/available_banks",
            headers=headers
        )
        response.raise_for_status()
        
        return response.json()
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/deposits/available_bank_uuid")
async def get_available_bank_by_uuid(uuid: str):
    """
    트레블룰 가능 거래소 UUID 조회
    
    Args:
        uuid: 거래소 UUID
    """
    try:
        query = f"uuid={uuid}"
        payload = {
            'access_key': ACCESS_KEY,
            'nonce': str(uuid.uuid4()),
            'query': query
        }
        
        jwt_token = encode(payload, SECRET_KEY)
        headers = {"Authorization": f"Bearer {jwt_token}"}
        
        response = requests.get(
            f"{UPBIT_API_URL}/deposits/available_bank_uuid",
            params={'uuid': uuid},
            headers=headers
        )
        response.raise_for_status()
        
        return response.json()
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/deposits/available_bank_txid")
async def get_available_bank_by_txid(txid: str):
    """
    트레블룰 가능 거래소 TXID 조회
    
    Args:
        txid: 거래소 TXID
    """
    try:
        query = f"txid={txid}"
        payload = {
            'access_key': ACCESS_KEY,
            'nonce': str(uuid.uuid4()),
            'query': query
        }
        
        jwt_token = encode(payload, SECRET_KEY)
        headers = {"Authorization": f"Bearer {jwt_token}"}
        
        response = requests.get(
            f"{UPBIT_API_URL}/deposits/available_bank_txid",
            params={'txid': txid},
            headers=headers
        )
        response.raise_for_status()
        
        return response.json()
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/deposits/coin_info")
async def get_coin_info(currency: str):
    """
    디지털 자산 입금 정보 조회
    
    Args:
        currency: Currency 코드
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
            f"{UPBIT_API_URL}/deposits/coin_info",
            params={'currency': currency},
            headers=headers
        )
        response.raise_for_status()
        
        return response.json()
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 