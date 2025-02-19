import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { market, Market as MarketType, Ticker } from '@/lib/api/market';

interface Market extends MarketType {
  acc_trade_volume_24h?: number;
  acc_trade_price_24h?: number;
  signed_change_rate?: number;
  signed_change_price?: number;
  volume_change_rate?: number;
  prev_acc_trade_volume_24h?: number;
  surge_score?: number;
  trade_price?: number;
  bb_upper?: number;
  bb_middle?: number;
  bb_lower?: number;
  is_bb_break?: boolean;
  bb_break_score?: number;
  bb_position?: number;  // 현재가가 밴드 내에서 위치한 상대적 위치 (0~100%)
  volatility?: number;   // 현재 변동성
}

type SortType = 'VOLUME' | 'SURGE' | 'CHANGE_RATE' | 'NAME' | 'BB_BREAK';

const AutoTrading = () => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortType>('VOLUME');
  const [isAscending, setIsAscending] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const prevMarketsRef = useRef<Market[]>([]);

  const formatVolume = (volume: number): string => {
    if (volume >= 1000000000000) {
      return `${(volume / 1000000000000).toFixed(1)}조`;
    }
    if (volume >= 100000000000) {
      return `${(volume / 100000000000).toFixed(1)}천억`;
    }
    if (volume >= 10000000000) {
      return `${(volume / 10000000000).toFixed(1)}백억`;
    }
    if (volume >= 1000000000) {
      return `${(volume / 1000000000).toFixed(1)}십억`;
    }
    if (volume >= 100000000) {
      return `${(volume / 100000000).toFixed(1)}억`;
    }
    if (volume >= 10000000) {
      return `${(volume / 10000000).toFixed(1)}천만`;
    }
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}백만`;
    }
    if (volume >= 100000) {
      return `${(volume / 100000).toFixed(1)}십만`;
    }
    if (volume >= 10000) {
      return `${(volume / 10000).toFixed(1)}만`;
    }
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}천`;
    }
    if (volume >= 100) {
      return `${(volume / 100).toFixed(1)}백`;
    }
    if (volume >= 10) {
      return `${(volume / 10).toFixed(1)}십`;
    }
    return volume.toFixed(1);
  };

  const calculateSurgeScore = (
    volumeChange: number,
    priceChange: number,
    baseVolume: number
  ): number => {
    // 거래량이 너무 적은 종목은 제외 (100K 미만)
    if (baseVolume < 100000) return 0;

    // 거래량 가중치 (거래량이 클수록 신뢰도 상승)
    const volumeWeight = baseVolume >= 1000000 ? 1 :
                        baseVolume >= 500000 ? 0.8 :
                        baseVolume >= 200000 ? 0.6 : 0.4;
    
    // 가격 변화 점수 (상승폭이 클수록 높은 점수)
    const priceScore = priceChange <= 0 ? 0 :
                      priceChange >= 5 ? 100 :
                      priceChange * 20;  // 1% 상승당 20점
    
    // 거래량 변화 점수 (증가폭이 클수록 높은 점수)
    const volumeScore = volumeChange <= 0 ? 0 :
                       volumeChange >= 100 ? 100 :
                       volumeChange;  // 1% 증가당 1점
    
    // 종합 점수 계산
    const score = (
      (priceScore * 0.7) +             // 가격 변화 (70%)
      (volumeScore * 0.3 * volumeWeight)  // 거래량 변화 (30%)
    );
    
    return score;
  };

  const calculateBollingerBands = (
    price: number, 
    prevPrice: number | undefined,
    volume: number,
    prevVolume: number | undefined
  ): { 
    upper: number; 
    middle: number; 
    lower: number;
    break_score: number;
    position: number;
    volatility: number;
  } => {
    // 기본 설정
    const multiplier = 2;        // 표준편차 승수
    const baseDeviation = 0.02;  // 기본 변동성 (2%)
    
    // 이전 가격이 있는 경우 실제 변동성 계산
    const priceChange = prevPrice ? Math.abs(price - prevPrice) / prevPrice : 0;
    const volatility = Math.max(priceChange, baseDeviation);
    
    // 볼린저 밴드 계산
    const middle = price;
    const deviation = price * volatility;
    const upper = middle + (deviation * multiplier);
    const lower = middle - (deviation * multiplier);
    
    // 밴드 내 가격 위치 계산 (0~100%)
    const bandWidth = upper - lower;
    const position = bandWidth === 0 ? 0 : ((price - lower) / bandWidth) * 100;
    
    // 돌파 점수 계산
    let break_score = 0;
    
    // 1. 기본 돌파 점수 (상단밴드 돌파 정도)
    if (price > upper) {
      break_score += ((price - upper) / upper) * 100;
    } else {
      return { 
        upper, middle, lower, 
        break_score: 0,
        position,
        volatility: volatility * 100
      };
    }
    
    // 2. 거래량 급증 점수
    const volumeChange = prevVolume 
      ? ((volume - prevVolume) / prevVolume) * 100 
      : 0;
    
    // 거래량이 전보다 50% 이상 증가했을 때만 의미있는 돌파로 간주
    if (volumeChange < 50) {
      return { 
        upper, middle, lower, 
        break_score: 0,
        position,
        volatility: volatility * 100
      };
    }

    // 거래량 가중치 (거래량이 클수록 신뢰도 상승)
    const volumeWeight = volume >= 1000000 ? 1 :
                        volume >= 500000 ? 0.8 :
                        volume >= 200000 ? 0.6 : 0.4;
    
    // 거래량 증가 점수 (50% 이상부터 시작)
    const volumeScore = volumeChange <= 50 ? 0 :
                       volumeChange >= 200 ? 100 :
                       (volumeChange - 50) * 2;  // 50%~200% 사이 스케일링
    
    // 3. 변동성 가중치 (변동성이 낮을 때의 돌파가 더 의미있음)
    const volatilityWeight = volatility <= 0.02 ? 1 :
                            volatility <= 0.05 ? 0.8 :
                            volatility <= 0.08 ? 0.6 : 0.4;
    
    // 4. 가격 상승 모멘텀 (이전 가격 대비 상승률)
    const priceUpMomentum = prevPrice && price > prevPrice
      ? ((price - prevPrice) / prevPrice) * 100
      : 0;
    
    const momentumScore = priceUpMomentum <= 0 ? 0 :
                         priceUpMomentum >= 5 ? 100 :
                         priceUpMomentum * 20;  // 1% 상승당 20점
    
    // 최종 돌파 점수 계산
    break_score = (
      (break_score * 0.3) +      // 밴드 돌파 정도 (30%)
      (volumeScore * 0.4) +      // 거래량 급증 (40%)
      (momentumScore * 0.3)      // 가격 상승 모멘텀 (30%)
    ) * volumeWeight * volatilityWeight;
    
    // 추가 보너스 점수
    // 1. 거래량 폭증 보너스
    if (volumeChange > 200) {
      break_score *= 1.3;
    }
    // 2. 강력한 상승 모멘텀 보너스
    if (priceUpMomentum > 3) {
      break_score *= 1.2;
    }
    
    return { 
      upper, 
      middle, 
      lower, 
      break_score,
      position,
      volatility: volatility * 100
    };
  };

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const response = await market.getMarkets();
        const krwMarkets = response.data.filter((m: MarketType) => m.market.startsWith('KRW-'));
        
        const tickerResponse = await market.getTicker(krwMarkets.map((m: MarketType) => m.market).join(','));
        const marketsWithData = krwMarkets.map((m: MarketType) => {
          const currentData = tickerResponse.data.find((t: Ticker) => t.market === m.market);
          const prevData = prevMarketsRef.current.find(pm => pm.market === m.market);
          
          const volume_change_rate = prevData 
            ? ((currentData?.acc_trade_volume_24h || 0) - (prevData.acc_trade_volume_24h || 0)) / (prevData.acc_trade_volume_24h || 1) * 100
            : 0;

          const surge_score = calculateSurgeScore(
            volume_change_rate,
            (currentData?.signed_change_rate || 0) * 100,
            currentData?.acc_trade_volume_24h || 0
          );

          // 볼린저밴드 계산
          const price = currentData?.trade_price || 0;
          const volume = currentData?.acc_trade_volume_24h || 0;
          const { 
            upper, 
            middle, 
            lower, 
            break_score,
            position,
            volatility
          } = calculateBollingerBands(
            price,
            prevData?.trade_price,
            volume,
            prevData?.acc_trade_volume_24h
          );

          // 돌파 조건 변경 (더 엄격한 기준 적용)
          const is_bb_break = (
            break_score >= 30 &&           // 최소 점수 상향
            price > upper &&               // 밴드 상단 돌파
            volume_change_rate >= 50 &&    // 거래량 50% 이상 증가
            (currentData?.signed_change_rate || 0) > 0  // 상승 중일 것
          );

          return {
            ...m,
            ...currentData,
            volume_change_rate,
            prev_acc_trade_volume_24h: prevData?.acc_trade_volume_24h,
            surge_score,
            bb_upper: upper,
            bb_middle: middle,
            bb_lower: lower,
            bb_break_score: break_score,
            bb_position: position,
            volatility,
            is_bb_break
          };
        });
        
        prevMarketsRef.current = marketsWithData;
        setMarkets(marketsWithData);
      } catch (error) {
        console.error('마켓 정보 로딩 실패:', error);
      }
    };
    fetchMarkets();

    const interval = setInterval(fetchMarkets, 5000);
    return () => clearInterval(interval);
  }, []);

  const sortedMarkets = [...markets].sort((a, b) => {
    const multiplier = isAscending ? 1 : -1;
    switch (sortBy) {
      case 'VOLUME':
        return multiplier * ((b.acc_trade_volume_24h || 0) - (a.acc_trade_volume_24h || 0));
      case 'SURGE':
        return multiplier * ((b.surge_score || 0) - (a.surge_score || 0));
      case 'CHANGE_RATE':
        return multiplier * ((b.signed_change_rate || 0) - (a.signed_change_rate || 0));
      case 'BB_BREAK':
        if (a.is_bb_break === b.is_bb_break) {
          return multiplier * ((b.signed_change_rate || 0) - (a.signed_change_rate || 0));
        }
        return multiplier * (a.is_bb_break ? -1 : 1);
      case 'NAME':
        return multiplier * a.korean_name.localeCompare(b.korean_name);
      default:
        return 0;
    }
  });

  const getDefaultSortDirection = (type: SortType): boolean => {
    switch (type) {
      case 'VOLUME':
      case 'SURGE':
        return false;
      case 'CHANGE_RATE':
      case 'NAME':
        return true;
      default:
        return false;
    }
  };

  const handleSort = (type: SortType) => {
    if (sortBy === type) {
      setIsAscending(!isAscending);
    } else {
      setSortBy(type);
      setIsAscending(getDefaultSortDirection(type));
    }
  };

  const handleMarketSelect = (market: string) => {
    setSelectedMarket(market);
    chartRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-bold mb-4">종목 선택</h2>
        <div className="space-y-4">
          <div className="flex gap-4 mb-4">
            <button 
              className={`btn ${sortBy === 'VOLUME' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => handleSort('VOLUME')}
            >
              거래량 {sortBy === 'VOLUME' && (isAscending ? '↑' : '↓')}
            </button>
            <button 
              className={`btn ${sortBy === 'SURGE' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => handleSort('SURGE')}
            >
              급등종목 {sortBy === 'SURGE' && (isAscending ? '↑' : '↓')}
            </button>
            <button 
              className={`btn ${sortBy === 'BB_BREAK' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => handleSort('BB_BREAK')}
            >
              돌파 {sortBy === 'BB_BREAK' && (isAscending ? '↑' : '↓')}
            </button>
            <button 
              className={`btn ${sortBy === 'CHANGE_RATE' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => handleSort('CHANGE_RATE')}
            >
              변동성 {sortBy === 'CHANGE_RATE' && (isAscending ? '↑' : '↓')}
            </button>
            <button 
              className={`btn ${sortBy === 'NAME' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => handleSort('NAME')}
            >
              이름 {sortBy === 'NAME' && (isAscending ? '↑' : '↓')}
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {sortedMarkets.slice(0, 50).map((m) => (
              <div 
                key={m.market}
                className={`py-1 px-3 border rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-all ${
                  selectedMarket === m.market 
                    ? 'border-2 border-primary bg-primary/20 shadow-lg scale-105 z-10' 
                    : m.is_bb_break
                    ? 'border-purple-500 bg-purple-50'
                    : m.surge_score && m.surge_score > 30
                      ? 'border-red-500 bg-red-50'
                      : m.surge_score && m.surge_score > 15
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200'
                }`}
                onClick={() => handleMarketSelect(m.market)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className={`font-medium text-sm ${
                      selectedMarket === m.market 
                        ? 'text-primary font-bold'
                        : m.is_bb_break
                        ? 'text-purple-500 font-bold'
                        : m.surge_score && m.surge_score > 30
                        ? 'text-red-500 font-bold'
                        : m.surge_score && m.surge_score > 15
                        ? 'text-orange-500'
                        : ''
                    }`}>{m.korean_name}</h3>
                    <p className={`text-xs ${
                      selectedMarket === m.market 
                        ? 'text-primary/70' 
                        : 'text-gray-500'
                    }`}>
                      {m.market}
                      {m.bb_break_score && m.bb_break_score > 0 && (
                        <span className="ml-1 text-xs">
                          ({m.bb_break_score.toFixed(1)})
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      (m.signed_change_rate || 0) > 0 
                        ? 'text-red-500' 
                        : 'text-blue-500'
                    } ${selectedMarket === m.market ? 'font-bold' : ''}`}>
                      {((m.signed_change_rate || 0) * 100).toFixed(2)}%
                    </p>
                    <p className={`text-xs ${
                      selectedMarket === m.market 
                        ? 'text-primary/70' 
                        : 'text-gray-500'
                    }`}>
                      {formatVolume(m.acc_trade_volume_24h || 0)}
                      {m.is_bb_break && (
                        <span className="ml-1 text-purple-500 font-bold">
                          ⚡
                        </span>
                      )}
                      {!m.is_bb_break && m.surge_score && m.surge_score > 15 && (
                        <span className={`ml-1 ${m.surge_score > 30 ? 'text-red-500 font-bold' : 'text-orange-500'}`}>
                          🔥
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2" ref={chartRef}>
            <h2 className="text-lg font-bold mb-4">캔들 차트</h2>
            {selectedMarket ? (
              <div className="h-[600px] border rounded-lg">
                <iframe
                  src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=UPBIT:${selectedMarket.replace('KRW-', '')}KRW&interval=1&hidesidetoolbar=0&symboledit=0&saveimage=1&toolbarbg=f1f3f6&studies=[{"id":"BB@tv-basicstudies"},{"id":"WMA@tv-basicstudies","inputs":{"length":120}},{"id":"WMA@tv-basicstudies","inputs":{"length":240}},{"id":"WMA@tv-basicstudies","inputs":{"length":480}}]&theme=light`}
                  style={{width: '100%', height: '100%'}}
                  className="rounded-lg"
                  allowTransparency
                  frameBorder="0"
                />
              </div>
            ) : (
              <div className="h-[600px] border rounded-lg flex items-center justify-center text-gray-500">
                코인을 선택해주세요
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default AutoTrading;
