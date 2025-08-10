import sys
import os
from fastapi import APIRouter, File, UploadFile

# 添加项目路径
sys.path.append(os.path.abspath("./fastapi"))

from app.serve.CauseModelServe import CauseModelServe

router = APIRouter()
cause_model_serve = CauseModelServe()

@router.post("/upload_cause_template")
async def upload_cause_template(file: UploadFile = File(...)):
    '''上传根因分析模板'''
    return await cause_model_serve.process_cause_template(file)