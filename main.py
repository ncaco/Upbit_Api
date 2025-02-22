from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.exchage import accounts
from app.api.exchage import orders
from app.api.exchage import withdraws
from app.api.exchage import deposits
from app.api.exchage import status
from app.api.exchage import market
from app.api.schedule.scheduler import init_scheduler


app = FastAPI(
    title="Upbit API",
    description="Upbit Exchange API Wrapper",
    version="1.0.0"
)

@app.on_event("startup")
async def startup_event():
    """앱 시작시 스케줄러 초기화"""
    init_scheduler()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(accounts.router)
app.include_router(orders.router)
app.include_router(withdraws.router)
app.include_router(deposits.router)
app.include_router(status.router)
app.include_router(market.router)


@app.get("/")
async def root():
    """API 상태 확인"""
    return {"status": "ok", "message": "Upbit API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 