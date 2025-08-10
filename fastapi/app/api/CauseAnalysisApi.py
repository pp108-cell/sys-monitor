import sys
import os

# 添加项目路径
sys.path.append(os.path.abspath("./fastapi"))

from fastapi import APIRouter
from app.serve.CauseAnalysisServe import CauseAnalysisServe

router = APIRouter()
cause_analysis_serve = CauseAnalysisServe()

@router.get("/getcausereport")
async def get_cause_report():
    '''获取根因分析报告'''
    return await cause_analysis_serve.generate_cause_report()