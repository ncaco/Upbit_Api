import httpx
from typing import List, Dict

class UpbitClient:
    def __init__(self):
        self.base_url = "https://api.upbit.com/v1"

    async def fetch_candles(self, market: str, count: int, unit: str) -> List[Dict]:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/candles/minutes/{unit}",
                params={
                    "market": market,
                    "count": count
                }
            )
            response.raise_for_status()
            return response.json() 