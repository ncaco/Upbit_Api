from fastapi import APIRouter, HTTPException, Query
import requests
from typing import List, Optional, Dict
from datetime import datetime
import httpx

router = APIRouter(
    prefix="/api/upbit",
    tags=["6. Market"]
)

# Upbit API 설정
UPBIT_API_URL = "https://api.upbit.com/v1"

@router.get("/market/all")
async def get_market_all(is_details: bool = False):
    """
    마켓 코드 조회
    
    Args:
        is_details: 유의종목 필드과 같은 상세 정보 노출 여부
    """
    try:
        response = requests.get(
            f"{UPBIT_API_URL}/market/all",
            params={'isDetails': is_details}
        )
        response.raise_for_status()
        
        # 응답 데이터 로깅
        print("Upbit API response:", response.json())
        
        return response.json()
    except Exception as e:
        print("Error:", str(e))  # 에러 로깅
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/candles/minutes/{unit}")
async def get_candles_minutes(
    unit: int,
    market: str,
    to: Optional[str] = None,
    count: Optional[int] = None
):
    """
    분(Minute) 캔들 조회
    
    Args:
        unit: 분 단위 (1, 3, 5, 15, 10, 30, 60, 240)
        market: 마켓 코드 (ex. KRW-BTC)
        to: 마지막 캔들 시각 (ISO 8601)
        count: 캔들 개수 (최대 200개)
    """
    try:
        params = {'market': market}
        if to:
            params['to'] = to
        if count:
            params['count'] = count
            
        response = requests.get(
            f"{UPBIT_API_URL}/candles/minutes/{unit}",
            params=params
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/candles/days")
async def get_candles_days(
    market: str,
    to: Optional[str] = None,
    count: Optional[int] = None,
    converting_price_unit: Optional[str] = None
):
    """
    일(Day) 캔들 조회
    
    Args:
        market: 마켓 코드 (ex. KRW-BTC)
        to: 마지막 캔들 시각 (ISO 8601)
        count: 캔들 개수 (최대 200개)
        converting_price_unit: 종가 환산 화폐 단위 (생략 가능)
    """
    try:
        params = {'market': market}
        if to:
            params['to'] = to
        if count:
            params['count'] = count
        if converting_price_unit:
            params['convertingPriceUnit'] = converting_price_unit
            
        response = requests.get(
            f"{UPBIT_API_URL}/candles/days",
            params=params
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/candles/weeks")
async def get_candles_weeks(
    market: str,
    to: Optional[str] = None,
    count: Optional[int] = None
):
    """
    주(Week) 캔들 조회
    
    Args:
        market: 마켓 코드 (ex. KRW-BTC)
        to: 마지막 캔들 시각 (ISO 8601)
        count: 캔들 개수 (최대 200개)
    """
    try:
        params = {'market': market}
        if to:
            params['to'] = to
        if count:
            params['count'] = count
            
        response = requests.get(
            f"{UPBIT_API_URL}/candles/weeks",
            params=params
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/candles/months")
async def get_candles_months(
    market: str,
    to: Optional[str] = None,
    count: Optional[int] = None
):
    """
    월(Month) 캔들 조회
    
    Args:
        market: 마켓 코드 (ex. KRW-BTC)
        to: 마지막 캔들 시각 (ISO 8601)
        count: 캔들 개수 (최대 200개)
    """
    try:
        params = {'market': market}
        if to:
            params['to'] = to
        if count:
            params['count'] = count
            
        response = requests.get(
            f"{UPBIT_API_URL}/candles/months",
            params=params
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/trades/ticks")
async def get_trades_ticks(
    market: str,
    to: Optional[str] = None,
    count: Optional[int] = None,
    cursor: Optional[str] = None,
    days_ago: Optional[int] = None
):
    """
    최근 체결 내역
    
    Args:
        market: 마켓 코드 (ex. KRW-BTC)
        to: 마지막 체결 시각 (Unix timestamp)
        count: 체결 개수 (최대 500개)
        cursor: 페이지네이션 커서
        days_ago: n일 전 데이터 조회 (최대 7일)
    """
    try:
        params = {'market': market}
        if to:
            params['to'] = to
        if count:
            params['count'] = count
        if cursor:
            params['cursor'] = cursor
        if days_ago:
            params['daysAgo'] = days_ago
            
        response = requests.get(
            f"{UPBIT_API_URL}/trades/ticks",
            params=params
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/ticker")
async def get_ticker(markets: str):
    """
    현재가 정보
    
    Args:
        markets: 마켓 코드 (ex. KRW-BTC, KRW-ETH)
    """
    try:
        response = requests.get(
            f"{UPBIT_API_URL}/ticker",
            params={'markets': markets}
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/orderbook")
async def get_orderbook(markets: str):
    """
    호가 정보 조회
    
    Args:
        markets: 마켓 코드 (ex. KRW-BTC, KRW-ETH)
    """
    try:
        response = requests.get(
            f"{UPBIT_API_URL}/orderbook",
            params={'markets': markets}
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

async def get_candles(market: str, to: str, count: int = 200) -> List[Dict]:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://api.upbit.com/v1/candles/minutes/1",
            params={
                "market": market,
                "to": to,
                "count": count
            }
        )
        if response.status_code != 200:
            return []
        return response.json() 