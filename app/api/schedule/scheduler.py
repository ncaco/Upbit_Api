from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime
from app.api.exchage.market import get_market_all, get_ticker

scheduler = AsyncIOScheduler()

def print_separator(length=80):
    print("=" * length)

def format_price(price):
    return f"₩{price:,.2f}" if price >= 100 else f"₩{price:.8f}"

async def market_monitor():
    """1분마다 마켓 정보 모니터링"""
    try:
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print_separator()
        print(f"마켓 모니터링 - {now}")
        print_separator()
        
        # 전체 마켓 조회
        markets = await get_market_all(is_details=True)
        krw_markets = [market['market'] for market in markets if market['market'].startswith('KRW-')]
        
        # 현재가 조회
        market_prices = await get_ticker(','.join(krw_markets))
        
        # 헤더 출력
        print(f"{'코인':^8} | {'현재가':^15} | {'전일대비':^8} | {'거래량(24H)':^12} | {'거래금액(24H)':^15}")
        print("-" * 80)
        
        # 데이터 출력
        for price in market_prices:
            market = price['market']
            trade_price = format_price(price['trade_price'])
            change_rate = f"{price['signed_change_rate']*100:+.2f}%"
            trade_volume = f"{price['acc_trade_volume_24h']:,.1f}"
            trade_price_24h = f"₩{price['acc_trade_price_24h']:,.0f}"
            
            print(f"{market[4:]:^8} | {trade_price:>15} | {change_rate:>8} | {trade_volume:>12} | {trade_price_24h:>15}")
        
        print_separator()
        print(f"총 {len(market_prices)}개 마켓 조회 완료")
        print()
    except Exception as e:
        print(f"Error in market_monitor: {str(e)}")

def init_scheduler():
    """스케줄러 초기화 및 작업 등록"""
    scheduler.add_job(
        market_monitor,
        CronTrigger(minute="*"),  # 매 분마다 실행
        id="market_monitor",
        name="마켓 모니터링",
        replace_existing=True,
    )
    
    # 스케줄러 시작
    scheduler.start() 