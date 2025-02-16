from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime
import uuid 

router = APIRouter(
    prefix="/api/trading/logs",
    tags=["7. Logs"]
)

class TradingLog(BaseModel):
    id: str
    strategyId: str
    type: str  # INFO, SUCCESS, WARNING, ERROR
    message: str
    data: Optional[Dict[str, Any]] = None
    createdAt: datetime

# 임시 메모리 저장소
logs: List[TradingLog] = []

@router.get("", response_model=List[TradingLog])
async def get_logs(
    strategy_id: Optional[str] = None,
    log_type: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
):
    filtered_logs = logs
    
    if strategy_id:
        filtered_logs = [log for log in filtered_logs if log.strategyId == strategy_id]
    if log_type:
        filtered_logs = [log for log in filtered_logs if log.type == log_type]
    
    # 최신 로그부터 정렬
    filtered_logs.sort(key=lambda x: x.createdAt, reverse=True)
    
    return filtered_logs[offset:offset + limit]

@router.post("", response_model=TradingLog)
async def create_log(
    strategy_id: str,
    type: str,
    message: str,
    data: Optional[Dict[str, Any]] = None
):
    log = TradingLog(
        id=str(uuid.uuid4()),
        strategyId=strategy_id,
        type=type,
        message=message,
        data=data,
        createdAt=datetime.now()
    )
    
    logs.append(log)
    
    # 로그 개수 제한 (최근 1000개만 유지)
    if len(logs) > 1000:
        logs.pop(0)
    
    return log 