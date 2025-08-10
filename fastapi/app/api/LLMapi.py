import os
import sys
from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from app.serve.LLMServe import LLMServe

# 添加项目路径
sys.path.append(os.path.abspath("./fastapi"))
router = APIRouter()

LLMserve = LLMServe()
@router.get("/LLMapi")
async def op_LLM(res: str):
    resu=await LLMserve.useLLM(res)

    return {"errCode": 0, "message": "success", "data": resu}

