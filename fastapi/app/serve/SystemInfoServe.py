import asyncio
import sys
import os

#自己的路径
sys.path.append(os.path.abspath("./fastapi"))

from typing import List, Dict, Any
from app.crud.SystemInfoCrud import SystemInfoCrud
from app.dataoperate.datacollect import DataCollect


datacollect = DataCollect()

class SystemInfoServe:
    def __init__(self):
        self.crud = SystemInfoCrud()
    async def get_system_info(self) -> Dict[str, Any]:
        """
        获取系统信息
        """
        # 调用数据采集方法
        data = await datacollect.collect_data()
        # 返回采集到的系统信息
        return data
    
    async def get_daily_system_info(self) -> List[Dict[str, Any]]:
        """
        获取每日系统信息
        """
        data = await self.crud.find_systeminfo()
        date = []
        for i in data:
            date.append(i["timestamp"].split(" ")[0])
        date = list(set(date))
        # 从数据库中获取每日系统信息
        system_info = []
        for i in date:
            daily_info = {
                "date": i,
                "system_info": [j for j in data if j["timestamp"].split(" ")[0] == i]
            }
            system_info.append(daily_info)
        
        return system_info
        
    async def get_daily_system_info_by_date(self,date: str) -> List[Dict[str, Any]]:
        """
        获取每日系统信息
        """
        data = await self.crud.find_systeminfo()
        # 从数据库中获取每日系统信息
        system_info = []
        daily_info = {
            "date": date,
            "system_info": [j for j in data if j["timestamp"].split(" ")[0] == date]
        }
        system_info.append(daily_info)
        
        return system_info
    async def get_nearly_system_info(self):
        """
        获取近七天系统信息
        """
        res=[]
        edate=[]
        data = await self.crud.get_nearly_system_info()
        for i in data:
            if len(i['system_info'])!=0:
                edate.append(i['date'])
                res.append(i)
        return edate,res


if __name__ == "__main__":
    system_info_serve = SystemInfoServe()
    e,result = asyncio.run(system_info_serve.get_nearly_system_info())
    print(result)
