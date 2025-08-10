import asyncio
import datetime
import sys
import os

#自己的路径
sys.path.append(os.path.abspath("./fastapi"))

from typing import List, Optional, Dict, Any
from app.core.config import MONGODB_URI, DATABASE_NAME, get_database



class SystemInfoCrud:
    def __init__(self):
        self.db = get_database()

    async def find_systeminfo(self)-> List[Dict[str, Any]]:
        """
        从 MongoDB 中获取系统信息
        :return: 系统信息列表
        """
        result = list(self.db["system_info"].find())
        for item in result:
            item["_id"] = str(item["_id"])
        return result

    async def save_system_info(self, data: Dict[str, Any]) -> None:
        """
        保存系统信息到 MongoDB
        :param data: 系统信息数据
        """
        self.db["system_info"].insert_one(data)

    async def get_nearly_system_info(self):
        """
        获取近七天系统信息
        """
        res=[]
        date=[]
        today = datetime.date.today()
        for i in range(7):
            date.append((today - datetime.timedelta(days=i)).strftime("%Y-%m-%d"))

        start_date = (today - datetime.timedelta(days=6)).strftime("%Y-%m-%d 00:00:00")
        end_date = (today + datetime.timedelta(days=1)).strftime("%Y-%m-%d 00:00:00")
        
        # 查询MongoDB中近7天的数据
        query = {
            "timestamp": {
                "$gte": start_date,
                "$lt": end_date
            }
        }
        
        system_info_list = list(self.db["cause_report"].find(query))
        
        # 将ObjectId转换为字符串
        for item in system_info_list:
            item["_id"] = str(item["_id"])
        
        # 按日期分组数据
        for date in date:
            date_system_info = []
            for info in system_info_list:
                # 从timestamp提取日期部分进行比较
                info_date = info["timestamp"].split(" ")[0]
                if info_date == date:
                    date_system_info.append({
                        "error_type": info['data']['anomalies'][0]['anomaly_type'],
                        "error_level":info['data']['anomalies'][0]['risk_level'],
                        "error_time":info['timestamp']
                    })
            
            res.append({
                "date": date,
                "system_info": date_system_info
            })
        return res
    
if __name__ == "__main__":
    systeminfo_crud = SystemInfoCrud()
    print(asyncio.run(systeminfo_crud.get_nearly_system_info()))
    
