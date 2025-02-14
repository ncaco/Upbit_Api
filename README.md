# Upbit_Api
업비트 자동매매 프로그램

## 프로젝트 구조

frontend
    vite 
    react
    typescript
    tailwindcss

backend
    fastapi
    uvicorn


## 업비트 api 패키지 목록
### Exchange API : exchage
자산 : accounts
주문 : orders
출금 : withdraw
입금 : deposit
서비스 정보 : info

### Quotation API : quotation
시세 종목 조회 : market
시세 캔들 조회 : candle
시세 체결 조회 : trade
시세 현재가(Ticker) 조회 : ticker
시세 호가 정보(Orderbook) 조회 : orderbook

### Websocket : websocket
기본 정보 : info
인증 : auth
테스트 및 요청 예제 : example
요청 포맷 : format
타입별 요청 및 응답 : type
구독 중인 타입 조회 : list
웹소켓 에러 : error
연결 관리 및 압축 : manage