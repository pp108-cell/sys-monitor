import sys
import os
import re
# 自己的路径
sys.path.append(os.path.abspath("./fastapi"))

from typing import Dict, Any, List, Union
from app.core.config import MONGODB_URI, DATABASE_NAME, get_database

class CauseReportCrud:
    def __init__(self):
        self.db = get_database()

    async def save_cause_report(self, data: Dict[str, Any]) -> None:
        """
        保存单个异常报告到 MongoDB
        :param data: 异常报告数据
        """
        self.db["cause_report"].insert_one(data)

    async def find_cause_reports(self) -> List[Dict[str, Any]]:
        """
        从 MongoDB 中获取所有异常报告
        :return: 异常报告列表
        """
        result = list(self.db["cause_report"].find())
        for item in result:
            item["_id"] = str(item["_id"])
        return result
    
    async def find_cause_reports_by_timestamp(self, timestamp: str) -> List[Dict[str, Any]]:
        """
        根据时间戳查找异常报告
        :param timestamp: 时间戳（如2025-07-15）
        :return: 异常报告列表
        """
        # 用re.compile生成正则对象
        regex = re.compile(f"^{timestamp}")
        # 优先使用original_timestamp字段查询，如果没有则使用timestamp字段
        result = list(self.db["cause_report"].find({
            "$or": [
                {"original_timestamp": regex},
                {"timestamp": regex}
            ]
        }))
        for item in result:
            item["_id"] = str(item["_id"])
        return result

    async def get_report_by_id(self, report_id: int) -> Union[Dict[str, Any], None]:
        """
        根据报告ID获取异常报告
        :param report_id: 报告ID
        :return: 异常报告，如果不存在则返回None
        """
        result = self.db["cause_report_by_timestamp"].find_one({"id": report_id})
        if result:
            result["_id"] = str(result["_id"])
        return result
    
    async def get_id(self, timestamp: str):
        """
        根据时间戳获取报告ID
        :param timestamp: 时间戳
        :return: 报告ID，如果不存在则返回-1
        """
        result = self.db["cause_report_by_timestamp"].find_one(
            {"date": timestamp},
            sort=[("id", -1)],  # 按id字段降序排序
            projection={"id": 1}  # 只返回id字段
        )
        if result:
            return result['id']
        else:
            return -1

if __name__ == "__main__":
    print(MONGODB_URI)