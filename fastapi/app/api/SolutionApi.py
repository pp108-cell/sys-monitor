import os
import sys
from fastapi import APIRouter, HTTPException, File, UploadFile
from typing import Dict, Any, List

# 添加项目路径
sys.path.append(os.path.abspath("./fastapi"))

from app.serve.SolutionServe import SolutionServe

router = APIRouter()
solution_serve = SolutionServe()

@router.post("/generate/{report_id}", tags=["解决方案接口"])
async def generate_solution(report_id: int) -> Dict[str, Any]:
    """
    根据报告ID生成解决方案并存入数据库
    :param report_id: 根因报告ID
    :return: 解决方案数据
    """
    result = await solution_serve.generate_solution_for_report(report_id)
    if result["errCode"] != 0:
        raise HTTPException(status_code=404, detail=result["message"])
    return {"errCode": 0, "message": "success", "data": result["data"]}

@router.get("/all", tags=["解决方案接口"])
async def get_all_solutions():
    """
    获取所有解决方案
    :return: 所有解决方案列表
    """
    result = await solution_serve.get_all_solutions()
    if result["errCode"] != 0:
        raise HTTPException(status_code=404, detail=result["message"])
    return {"errCode": 0, "message": "success", "data": result["data"]}

@router.get("/getallSN")
async def get_all_SN():
    """
    获取所有SN:soultion_note
    :return: 所有SN列表
    """
    try:
        result = await solution_serve.get_all_SN()
        return {"errCode": 0, "message": "success", "data": result}
    except Exception as e:
        return {"errCode": 1, "message": str(e), "data": None}
    
@router.get("/insertSN")
async def insert_SN(title: str, content: str,tag: int):
    """
    插入SN:soultion_note
    :param title: SN标题
    :param content: SN内容
    :return: 插入结果
    :tag: 标签
    """
    await solution_serve.insert_SN(title, content, tag)

@router.get("/editSN")
async def edit_SN(sn_id: int, title: str, content: str,tag: int):
    """
    编辑SN:soultion_note
    :param sn_id: SN ID
    :param title: 新标题
    :param content: 新内容
    :tag: 标签
    :return: 编辑结果
    """
    await solution_serve.edit_SN(sn_id, title, content, tag)

@router.get("/delete_SN")
async def delete_SN(sn_id: int):
    """
    删除SN:soultion_note
    :param sn_id: SN ID
    :return: 删除结果
    """
    await solution_serve.delete_SN(sn_id)

@router.get("/set_SN_like")
async def set_SN_like(sn_id: int, like: bool):
    """
    设置SN:soultion_note的点赞状态
    :param sn_id: SN ID
    :param like: 是否点赞
    :return: 设置结果
    """
    await solution_serve.set_SN_like(sn_id, like)

@router.get("/get/{report_id}", tags=["解决方案接口"])
async def get_solution_by_report_id(report_id: int) -> Dict[str, Any]:
    """
    根据报告ID获取解决方案
    :param report_id: 根因报告ID
    :return: 解决方案数据
    """
    result = await solution_serve.get_solution_by_report_id(report_id)
    if result["errCode"] != 0:
        raise HTTPException(status_code=404, detail=result["message"])
    return {"errCode": 0, "message": "success", "data": result["data"]}

@router.post("/upload_pdf", tags=["解决方案接口"])
async def upload_pdf_report(file: UploadFile = File(...)):
    """
    上传解决方案PDF报告文件并返回预览地址
    """
    return await solution_serve.save_pdf_report(file)