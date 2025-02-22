from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime
from app.api.exchage.market import get_market_all, get_ticker

scheduler = AsyncIOScheduler()

def print_separator(length=150):
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
        
        # 거래량 기준 내림차순 정렬
        market_prices.sort(key=lambda x: x['acc_trade_price_24h'], reverse=True)
        
        # 헤더 크기
        header_size = {
            'coin': 10,
            'trade_price': 15,
            'change_rate': 10,
            'trade_volume': 15,
            'trade_price_24h': 20,
            'warning': 10,
            'caution': 30
        }

        # 헤더 출력
        headers = [
            ('코인', header_size['coin']),
            ('현재가', header_size['trade_price']),
            ('전일대비', header_size['change_rate']),
            ('거래량', header_size['trade_volume']),
            ('거래금액(24H)', header_size['trade_price_24h']),
            ('유의종목', header_size['warning']),
            ('주의종목', header_size['caution'])
        ]
        
        print(' | '.join(f"{h[0]:^{h[1]}}" for h in headers))
        print("-" * (sum(h[1] for h in headers) + len(headers) * 3))
        
        # 데이터 출력
        filterCnt = 0
        for price in market_prices:
            market = price['market']
            change = price['change']
            trade_price = format_price(price['trade_price'])
            change_rate = f"{price['signed_change_rate']*100:+.2f}%"
            trade_volume = f"{price['acc_trade_volume_24h']:,.1f}"
            trade_price_24h = f"₩{price['acc_trade_price_24h']:,.0f}"
            
            # 마켓 이벤트 경고 정보 추가
            market_info = next((m for m in markets if m['market'] == market), {})
            market_event = market_info.get('market_event', {})
            
            warning = "⚠️ 유의" if market_event.get('warning') else ""
            
            # 주의 종목 상세 정보
            caution_types = {}
            caution_types["가격급등락"] = False
            caution_types["거래량급등"] = False
            caution_types["입금량급등"] = False
            caution_types["가격차이"] = False
            caution_types["소수계정"] = False   

            if market_event.get('caution'):
                if market_event.get('caution', {}).get('PRICE_FLUCTUATIONS'):
                    caution_types["가격급등락"] = True
                if market_event.get('caution', {}).get('TRADING_VOLUME_SOARING'):
                    caution_types["거래량급등"] = True
                if market_event.get('caution', {}).get('DEPOSIT_AMOUNT_SOARING'):
                    caution_types["입금량급등"] = True  
                if market_event.get('caution', {}).get('GLOBAL_PRICE_DIFFERENCES'):
                    caution_types["가격차이"] = True
                if market_event.get('caution', {}).get('CONCENTRATION_OF_SMALL_ACCOUNTS'):
                    caution_types["소수계정"] = True
            
            caution = []
            if caution_types["가격급등락"]:
                caution.append("⚠️ 가격급등락")
            if caution_types["거래량급등"]:
                caution.append("⚠️ 거래량급등")
            if caution_types["입금량급등"]:
                caution.append("⚠️ 입금량급등")
            if caution_types["가격차이"]:
                caution.append("⚠️ 가격차이")
            if caution_types["소수계정"]:
                caution.append("⚠️ 소수계정")
            
            if caution:
                caution = ", ".join(caution)
            else:
                caution = ""

            values = [
                (market[4:], header_size['coin']),
                (trade_price, header_size['trade_price']),
                (change_rate, header_size['change_rate']),
                (trade_volume, header_size['trade_volume']),
                (trade_price_24h, header_size['trade_price_24h']),
                (warning, header_size['warning']),
                (caution, header_size['caution'])
            ]
            
            # 주의 마켓 출력 + 전일대비 플러스 출력
            if caution != "" and change == 'RISE':
                filterCnt += 1
                print(' | '.join(f"{v[0]:^{v[1]}}" for v in values))
        
        print_separator(sum(h[1] for h in headers) + len(headers) * 3)
        print(f"총 {len(market_prices)}개 마켓 조회 완료")
        print(f"주의 마켓 {filterCnt}개 조회 완료")
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