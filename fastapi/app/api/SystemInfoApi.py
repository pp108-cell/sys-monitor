import sys
import os

#自己的路径
sys.path.append(os.path.abspath("./fastapi"))


from fastapi import APIRouter
from app.serve.SystemInfoServe import SystemInfoServe

router = APIRouter()
system_info_serve = SystemInfoServe()

@router.get("/getsysteminfo")
async def get_system_info():
    '''获取系统信息'''
    try:
        data = await system_info_serve.get_system_info()
        return {"errCode": 0, "message": "success", "data": data}
    except Exception as e:
        return {"errCode": 1, "message": str(e), "data": None}
    
@router.get("/getdailysysteminfo")
async def get_daily_system_info():
    '''获取每日系统信息'''
    try:
        data = await system_info_serve.get_daily_system_info()
        return {"errCode": 0, "message": "success", "data": data}
    except Exception as e:
        return {"errCode": 1, "message": str(e), "data": None}
    
@router.get("/getdailysysteminfobydate")
async def get_daily_system_info_by_date(date: str):
    '''获取每日系统信息'''
    try:
        data = await system_info_serve.get_daily_system_info_by_date(date)
        return {"errCode": 0, "message": "success", "data": data}
    except Exception as e:
        return {"errCode": 1, "message": str(e), "data": None}
