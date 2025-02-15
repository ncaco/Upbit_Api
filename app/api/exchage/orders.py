from fastapi import APIRouter, HTTPException
import requests
from jwt import encode
import uuid
import os
from dotenv import load_dotenv
from typing import Optional
from pydantic import BaseModel

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

class OrderRequest(BaseModel):
    market: str
    side: str  # bid(매수) / ask(매도)
    volume: Optional[str] = None  # 주문량 (지정가, 시장가 매도 시 필수)
    price: Optional[str] = None   # 주문 가격 (지정가, 시장가 매수 시 필수)
    ord_type: str  # limit(지정가), price(시장가 매수), market(시장가 매도), best(최유리)
    identifier: Optional[str] = None  # 조회용 사용자 지정값
    time_in_force: Optional[str] = None  # ioc, fok (ord_type이 best 혹은 limit 일때만 지원)

class CancelAndNewOrderRequest(BaseModel):
    prev_order_uuid: Optional[str] = None
    prev_order_identifier: Optional[str] = None
    new_ord_type: str
    new_volume: Optional[str] = None  # 'remain_only' 또는 수량
    new_price: Optional[str] = None
    new_identifier: Optional[str] = None
    new_time_in_force: Optional[str] = None

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

@router.delete("/order")
async def cancel_order(uuid: str = None, identifier: str = None):
    """
    주문 취소 접수
    
    Args:
        uuid: 취소할 주문의 UUID
        identifier: 조회용 사용자 지정값
        
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
        raise HTTPException(
            status_code=400, 
            detail="uuid 혹은 identifier 중 하나는 필수입니다"
        )
        
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
        
        response = requests.delete(
            f"{UPBIT_API_URL}/order",
            params={'uuid': uuid} if uuid else {'identifier': identifier},
            headers=headers
        )
        response.raise_for_status()
        
        return response.json()
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/orders/open")
async def cancel_orders(
    cancel_side: str = "all",
    pairs: str = None,
    excluded_pairs: str = None,
    quote_currencies: str = None,
    count: int = 20,
    order_by: str = "desc"
):
    """
    다수의 주문에 대해 일괄 취소 요청
    
    Args:
        cancel_side: 주문 종류 (all: 매수/매도 전체, ask: 매도, bid: 매수)
        pairs: 취소할 종목 리스트 (ex. KRW-BTC,KRW-ETH) - 최대 20개
        excluded_pairs: 취소에서 제외할 종목 리스트 (ex. KRW-BTC,KRW-ETH) - 최대 20개
        quote_currencies: 취소할 거래 화폐 리스트 (ex. KRW,BTC,USDT)
        count: 취소할 주문 최대 개수 (default: 20, max: 300)
        order_by: 정렬 방식 (asc/desc, default: desc)
        
    Note:
        - pairs와 quote_currencies는 동시 사용 불가
        - 2초당 1회 요청 가능
        - 예약주문(WATCH)은 취소 불가
        - excluded_pairs에 포함된 종목은 pairs나 quote_currencies에 포함되어도 취소되지 않음
    """
    if pairs and quote_currencies:
        raise HTTPException(
            status_code=400, 
            detail="pairs와 quote_currencies는 동시에 사용할 수 없습니다"
        )
            
    try:
        query = []
        if cancel_side:
            query.append(f"cancel_side={cancel_side}")
        if pairs:
            query.append(f"pairs={pairs}")
        if excluded_pairs:
            query.append(f"excluded_pairs={excluded_pairs}")
        if quote_currencies:
            query.append(f"quote_currencies={quote_currencies}")
        if count:
            query.append(f"count={count}")
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
            'cancel_side': cancel_side,
            'count': count,
            'order_by': order_by
        }
        
        if pairs:
            params['pairs'] = pairs
        if excluded_pairs:
            params['excluded_pairs'] = excluded_pairs
        if quote_currencies:
            params['quote_currencies'] = quote_currencies
            
        response = requests.delete(
            f"{UPBIT_API_URL}/orders/open",
            params=params,
            headers=headers
        )
        response.raise_for_status()
        
        return response.json()
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/orders/uuids")
async def cancel_orders_by_id(
    uuids: list[str] = None,
    identifiers: list[str] = None
):
    """
    uuid 또는 identifiers로 다수의 주문을 취소
    
    Args:
        uuids: 취소할 주문 UUID의 목록 (최대 20개)
        identifiers: 취소할 주문 identifier의 목록 (최대 20개)
        
    Note:
        - uuids 또는 identifiers 중 한 가지 필드는 필수
        - 두 가지 필드를 함께 사용할 수 없음
        
    Returns:
        success:
            - count: 취소 요청 성공한 주문의 개수
            - orders: 취소 요청 성공한 주문 정보 (uuid, market, identifier)
        failed:
            - count: 취소 요청 실패한 주문의 개수
            - orders: 취소 요청 실패한 주문 정보 (uuid, market, identifier)
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
        if uuids:
            for uuid in uuids:
                query.append(f"uuids[]={uuid}")
        if identifiers:
            for identifier in identifiers:
                query.append(f"identifiers[]={identifier}")
            
        payload = {
            'access_key': ACCESS_KEY,
            'nonce': str(uuid.uuid4()),
            'query': "&".join(query)
        }
        
        jwt_token = encode(payload, SECRET_KEY)
        headers = {"Authorization": f"Bearer {jwt_token}"}
        
        params = {}
        if uuids:
            params['uuids[]'] = uuids
        if identifiers:
            params['identifiers[]'] = identifiers
            
        response = requests.delete(
            f"{UPBIT_API_URL}/orders/uuids",
            params=params,
            headers=headers
        )
        response.raise_for_status()
        
        return response.json()
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/orders")
async def create_order(order: OrderRequest):
    """
    주문 요청
    
    Args:
        market: 마켓 ID (필수)
        side: 주문 종류 (필수)
            - bid: 매수
            - ask: 매도
        volume: 주문량 (지정가, 시장가 매도 시 필수)
        price: 주문 가격 (지정가, 시장가 매수 시 필수)
        ord_type: 주문 타입 (필수)
            - limit: 지정가 주문
            - price: 시장가 주문(매수)
            - market: 시장가 주문(매도)
            - best: 최유리 주문 (time_in_force 설정 필수)
        identifier: 조회용 사용자 지정값 (선택)
        time_in_force: IOC, FOK 주문 설정 (선택)
            - ioc: Immediate or Cancel
            - fok: Fill or Kill
            * ord_type이 best 혹은 limit 일때만 지원
            
    Note:
        - 시장가 매수 시: ord_type=price, volume 생략, price 필수
        - 시장가 매도 시: ord_type=market, volume 필수, price 생략
        - 시장가 주문은 IOC, FOK를 지원하지 않음
    """
    try:
        query = [
            f"market={order.market}",
            f"side={order.side}",
            f"ord_type={order.ord_type}"
        ]
        
        if order.volume:
            query.append(f"volume={order.volume}")
        if order.price:
            query.append(f"price={order.price}")
        if order.identifier:
            query.append(f"identifier={order.identifier}")
        if order.time_in_force:
            query.append(f"time_in_force={order.time_in_force}")
            
        payload = {
            'access_key': ACCESS_KEY,
            'nonce': str(uuid.uuid4()),
            'query': "&".join(query)
        }
        
        jwt_token = encode(payload, SECRET_KEY)
        headers = {"Authorization": f"Bearer {jwt_token}"}
        
        params = {
            'market': order.market,
            'side': order.side,
            'ord_type': order.ord_type
        }
        
        if order.volume:
            params['volume'] = order.volume
        if order.price:
            params['price'] = order.price
        if order.identifier:
            params['identifier'] = order.identifier
        if order.time_in_force:
            params['time_in_force'] = order.time_in_force
            
        response = requests.post(
            f"{UPBIT_API_URL}/orders",
            params=params,
            headers=headers
        )
        response.raise_for_status()
        
        return response.json()
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/orders/cancel_and_new")
async def cancel_and_new_order(order: CancelAndNewOrderRequest):
    """
    취소 후 재주문 요청
    
    Args:
        prev_order_uuid: 취소할 주문의 UUID
        prev_order_identifier: 취소할 주문의 사용자 지정값
        new_ord_type: 신규 주문의 주문 타입 (필수)
            - limit: 지정가 주문
            - price: 시장가 주문(매수)
            - market: 시장가 주문(매도)
            - best: 최유리 주문 (time_in_force 설정 필수)
        new_volume: 신규 주문량 (지정가, 시장가 매도 시 필수)
            - remain_only: 이전 주문의 잔여 수량 사용
        new_price: 신규 주문 가격 (지정가, 시장가 매수 시 필수)
        new_identifier: 신규 주문의 조회용 사용자 지정값 (선택)
        new_time_in_force: 신규 주문의 IOC, FOK 설정 (선택)
            - ioc: Immediate or Cancel
            - fok: Fill or Kill
            * new_ord_type이 best 혹은 limit 일때만 지원
            
    Note:
        - prev_order_uuid 또는 prev_order_identifier 중 하나는 필수
        - remain_only는 지정가 주문, 지정가 IOC/FOK 주문, 시장가 매도, 최유리 매도 주문만 지원
        - new_identifier는 prev_order_identifier와 달라야 함
    """
    if not order.prev_order_uuid and not order.prev_order_identifier:
        raise HTTPException(
            status_code=400, 
            detail="prev_order_uuid 또는 prev_order_identifier 중 하나는 필수입니다"
        )
            
    try:
        data = {
            'new_ord_type': order.new_ord_type
        }
        
        if order.prev_order_uuid:
            data['prev_order_uuid'] = order.prev_order_uuid
        if order.prev_order_identifier:
            data['prev_order_identifier'] = order.prev_order_identifier
        if order.new_volume:
            data['new_volume'] = order.new_volume
        if order.new_price:
            data['new_price'] = order.new_price
        if order.new_identifier:
            data['new_identifier'] = order.new_identifier
        if order.new_time_in_force:
            data['new_time_in_force'] = order.new_time_in_force
            
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
            f"{UPBIT_API_URL}/orders/cancel_and_new",
            json=data,
            headers=headers
        )
        response.raise_for_status()
        
        return response.json()
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 