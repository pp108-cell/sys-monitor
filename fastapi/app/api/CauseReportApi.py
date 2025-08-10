import sys
import os

# 添加项目路径
sys.path.append(os.path.abspath("./fastapi"))

from fastapi import APIRouter, Body, File, UploadFile
from app.serve.CauseReportServe import CauseReportServe

router = APIRouter()
cause_report_serve = CauseReportServe()


@router.post("/causereport/summary_by_date_full")
async def get_summary_report_by_date_full(date_str: str = Body(..., embed=True)):
    '''先生成异常检测报告，再返回当天综合性报告'''
    await cause_report_serve.generate_report_from_systeminfo()
    return await cause_report_serve.generate_summary_report_by_date(date_str)

@router.get("/causereport/summary_by_day")
async def get_summary_reports_by_day():
    '''获取每一天最后一条综合性报告的集合'''
    return await cause_report_serve.get_latest_summary_reports_by_day()

@router.post("/causereport/upload_pdf")
async def upload_pdf_report(file: UploadFile = File(...)):
    '''上传PDF报告文件并返回预览地址'''
    return await cause_report_serve.save_pdf_report(file) 