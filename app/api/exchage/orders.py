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
    tags=["2. Orders"]
)

# Upbit API 설정
UPBIT_API_URL = "https://api.upbit.com/v1"
ACCESS_KEY = os.getenv('UPBIT_OPEN_API_ACCESS_KEY')
SECRET_KEY = os.getenv('UPBIT_OPEN_API_SECRET_KEY')

@router.get("/orders/chance")
async def get_order_chance(market: str):
    """
    마켓별 주문 가능 정보 조회
    
    Args:
        market: 마켓 ID (예: KRW-BTC)
        
    Returns:
        - bid_fee: 매수 수수료 비율
        - ask_fee: 매도 수수료 비율
        - market: 마켓 정보
        - bid_account: 매수 시 사용하는 화폐의 계좌 상태
        - ask_account: 매도 시 사용하는 화폐의 계좌 상태
    """
    try:
        payload = {
            'access_key': ACCESS_KEY,
            'nonce': str(uuid.uuid4()),
            'query': f'market={market}'
        }
        
        jwt_token = encode(payload, SECRET_KEY)
        headers = {"Authorization": f"Bearer {jwt_token}"}
        
        response = requests.get(
            f"{UPBIT_API_URL}/orders/chance",
            params={'market': market},
            headers=headers
        )
        response.raise_for_status()
        
        return response.json()
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/order")
async def get_order(uuid: str = None, identifier: str = None):
    """
    개별 주문 조회
    
    Args:
        uuid: 주문 UUID
        identifier: 조회용 사용자 지정 값
        
    Returns:
        - uuid: 주문의 고유 아이디
        - side: 주문 종류
        - ord_type: 주문 방식
        - price: 주문 당시 화폐 가격
        - state: 주문 상태
        - market: 마켓의 유일키
        - created_at: 주문 생성 시간
        - volume: 사용자가 입력한 주문 양
        - remaining_volume: 체결 후 남은 주문 양
        - reserved_fee: 수수료로 예약된 비용
        - remaining_fee: 남은 수수료
        - paid_fee: 사용된 수수료
        - locked: 거래에 사용중인 비용
        - executed_volume: 체결된 양
        - trades_count: 해당 주문에 걸린 체결 수
    """
    if not uuid and not identifier:
        raise HTTPException(status_code=400, detail="uuid 혹은 identifier 중 하나는 필수입니다")
        
    try:
        query = []
        if uuid:
            query.append(f"uuid={uuid}")
        if identifier:
            query.append(f"identifier={identifier}")
            
        payload = {
            'access_key': ACCESS_KEY,
            'nonce': str(uuid.uuid4()),
            'query': "&".join(query)
        }
        
        jwt_token = encode(payload, SECRET_KEY)
        headers = {"Authorization": f"Bearer {jwt_token}"}
        
        response = requests.get(
            f"{UPBIT_API_URL}/order",
            params={'uuid': uuid} if uuid else {'identifier': identifier},
            headers=headers
        )
        response.raise_for_status()
        
        return response.json()
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/orders")
async def get_orders(
    market: str = None,
    state: str = None,
    states: list[str] = None,
    uuids: list[str] = None,
    identifiers: list[str] = None,
    page: int = 1,
    limit: int = 100,
    order_by: str = "desc"
):
    """
    주문 리스트 조회
    
    Args:
        market: 마켓 ID
        state: 주문 상태 (wait, watch, done, cancel)
        states: 주문 상태의 목록
        uuids: 주문 UUID의 목록
        identifiers: 주문 identifier의 목록
        page: 페이지 수 (default: 1)
        limit: 요청 개수 (default: 100)
        order_by: 정렬 방식 (asc/desc, default: desc)
    
    Note:
        - states 사용시 미체결 주문(wait, watch)과 완료 주문(done, cancel)은 혼합 조회 불가
        - state와 states는 동시 사용 불가
    """
    try:
        if state and states:
            raise HTTPException(
                status_code=400, 
                detail="state와 states는 동시에 사용할 수 없습니다"
            )
            
        query = []
        if market:
            query.append(f"market={market}")
        if state:
            query.append(f"state={state}")
        if states:
            for s in states:
                query.append(f"states[]={s}")
        if uuids:
            for uuid in uuids:
                query.append(f"uuids[]={uuid}")
        if identifiers:
            for identifier in identifiers:
                query.append(f"identifiers[]={identifier}")
        if page:
            query.append(f"page={page}")
        if limit:
            query.append(f"limit={limit}")
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
            'market': market,
            'state': state,
            'page': page,
            'limit': limit,
            'order_by': order_by
        }
        
        if states:
            params['states[]'] = states
        if uuids:
            params['uuids[]'] = uuids
        if identifiers:
            params['identifiers[]'] = identifiers
            
        response = requests.get(
            f"{UPBIT_API_URL}/orders",
            params=params,
            headers=headers
        )
        response.raise_for_status()
        
        return response.json()
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/orders/uuids")
async def get_orders_by_id(
    uuids: list[str] = None,
    identifiers: list[str] = None,
    market: str = None,
    order_by: str = "desc"
):
    """
    uuid 또는 identifier로 주문 리스트를 조회 (최대 100개)
    
    Args:
        uuids: 주문 UUID의 목록 (최대 100개)
        identifiers: 주문 identifier의 목록 (최대 100개)
        market: 마켓 ID
        order_by: 정렬 방식 (asc/desc, default: desc)
        
    Note:
        - uuids 또는 identifiers 중 한 가지 필드는 필수
        - 두 가지 필드를 함께 사용할 수 없음
    """
    if not uuids and not identifiers:
        raise HTTPException(
            status_code=400, 
            detail="uuids 또는 identifiers 중 하나는 필수입니다"
        )
    if uuids and identifiers:
        raise HTTPException(
            status_code=400, 
            detail="uuids와 identifiers는 동시에 사용할 수 없습니다"
        )
        
    try:
        query = []
        if market:
            query.append(f"market={market}")
        if uuids:
            for uuid in uuids:
                query.append(f"uuids[]={uuid}")
        if identifiers:
            for identifier in identifiers:
                query.append(f"identifiers[]={identifier}")
        if order_by:
            query.append(f"order_by={order_by}")
            
        payload = {
            'access_key': ACCESS_KEY,
            'nonce': str(uuid.uuid4()),
            'query': "&".join(query)
        }
        
        jwt_token = encode(payload, SECRET_KEY)
        headers = {"Authorization": f"Bearer {jwt_token}"}
        
        params = {'order_by': order_by}
        if market:
            params['market'] = market
        if uuids:
            params['uuids[]'] = uuids
        if identifiers:
            params['identifiers[]'] = identifiers
            
        response = requests.get(
            f"{UPBIT_API_URL}/orders/uuids",
            params=params,
            headers=headers
        )
        response.raise_for_status()
        
        return response.json()
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/orders/open")
async def get_open_orders(
    market: str = None,
    state: str = "wait",
    states: list[str] = None,
    page: int = 1,
    limit: int = 100,
    order_by: str = "desc"
):
    """
    체결 대기 주문(미체결 주문) 조회
    
    Args:
        market: 마켓 ID
        state: 주문 상태 (wait: 체결 대기, watch: 예약주문 대기)
        states: 주문 상태의 목록
        page: 페이지 수 (default: 1)
        limit: 요청 개수 (default: 100, max: 100)
        order_by: 정렬 방식 (asc/desc, default: desc)
        
    Note:
        - 기본값은 wait이며, 예약주문을 함께 조회하려면 states=[wait,watch] 사용
        - state와 states는 동시 사용 불가
    """
    try:
        if state and states:
            raise HTTPException(
                status_code=400, 
                detail="state와 states는 동시에 사용할 수 없습니다"
            )
            
        query = []
        if market:
            query.append(f"market={market}")
        if state:
            query.append(f"state={state}")
        if states:
            for s in states:
                query.append(f"states[]={s}")
        if page:
            query.append(f"page={page}")
        if limit:
            query.append(f"limit={limit}")
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
            'market': market,
            'state': state,
            'page': page,
            'limit': limit,
            'order_by': order_by
        }
        
        if states:
            params['states[]'] = states
            params.pop('state', None)
            
        response = requests.get(
            f"{UPBIT_API_URL}/orders/open",
            params=params,
            headers=headers
        )
        response.raise_for_status()
        
        return response.json()
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/orders/closed")
async def get_closed_orders(
    market: str = None,
    state: str = None,
    states: list[str] = ['done', 'cancel'],
    start_time: str = None,
    end_time: str = None,
    limit: int = 100,
    order_by: str = "desc"
):
    """
    종료된 주문 (Closed Order) 리스트 조회
    
    Args:
        market: 마켓 ID
        state: 주문 상태 (done: 전체 체결 완료, cancel: 주문 취소)
        states: 주문 상태의 목록 (default: ['done', 'cancel'])
        start_time: 조회 시작 시각 (ISO-8601 포맷 또는 timestamp)
        end_time: 조회 종료 시각 (ISO-8601 포맷 또는 timestamp)
        limit: 요청 개수 (default: 100, max: 1,000)
        order_by: 정렬 방식 (asc/desc, default: desc)
        
    Note:
        - state와 states는 동시 사용 불가
        - 최대 7일 범위까지의 주문만 조회 가능
    """
    try:
        if state and states:
            raise HTTPException(
                status_code=400, 
                detail="state와 states는 동시에 사용할 수 없습니다"
            )
            
        query = []
        if market:
            query.append(f"market={market}")
        if state:
            query.append(f"state={state}")
        if states:
            for s in states:
                query.append(f"states[]={s}")
        if start_time:
            query.append(f"start_time={start_time}")
        if end_time:
            query.append(f"end_time={end_time}")
        if limit:
            query.append(f"limit={limit}")
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
            'market': market,
            'state': state,
            'limit': limit,
            'order_by': order_by
        }
        
        if states:
            params['states[]'] = states
            params.pop('state', None)
        if start_time:
            params['start_time'] = start_time
        if end_time:
            params['end_time'] = end_time
            
        response = requests.get(
            f"{UPBIT_API_URL}/orders/closed",
            params=params,
            headers=headers
        )
        response.raise_for_status()
        
        return response.json()
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 