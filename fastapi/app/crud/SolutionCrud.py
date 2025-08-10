import sys
import os
from typing import Dict, Any, List
from app.core.config import get_database
from bson.objectid import ObjectId
import time

# 添加项目路径
sys.path.append(os.path.abspath("./fastapi"))

class SolutionCrud:
    def __init__(self):
        self.db = get_database()
        # 确保解决方案集合存在
        if 'solutions' not in self.db.list_collection_names():
            self.db.create_collection('solutions')
        # 创建索引以确保报告ID的唯一性
        self.db['solutions'].create_index('report_id', unique=True)

    async def save_solution(self, report_id: int, solution_data: Dict[str, Any]) -> None:
        """
        保存解决方案到数据库
        :param report_id: 对应的根因报告ID
        :param solution_data: 解决方案数据
        """
        solution = {
            'report_id': report_id,
            'solution_id': report_id,  # 解决方案ID与报告ID保持一致
            'solutions': solution_data.get('solutions'),
            'created_at': solution_data.get('created_at')
        }
        self.db['solutions'].insert_one(solution)

    async def get_solution_by_report_id(self, report_id: int) -> Dict[str, Any]:
        """
        根据报告ID查询解决方案
        :param report_id: 根因报告ID
        :return: 解决方案数据
        """
        solution = self.db['solutions'].find_one({'report_id': report_id})
        if solution:
            # 转换ObjectId为字符串
            if '_id' in solution:
                solution['_id'] = str(solution['_id'])
            return solution
        return None

    async def update_solution(self, report_id: int, solution_data: Dict[str, Any]) -> bool:
        """
        更新解决方案
        :param report_id: 根因报告ID
        :param solution_data: 更新的解决方案数据
        :return: 是否更新成功
        """
        result = self.db['solutions'].update_one(
            {'report_id': report_id},
            {'$set': solution_data}
        )
        return result.modified_count > 0

    async def get_all_solutions(self) -> List[Dict[str, Any]]:
        """
        获取所有解决方案
        :return: 所有解决方案列表
        """
        solutions = []
        async for solution in self.db['solutions'].find():
            if '_id' in solution:
                solution['_id'] = str(solution['_id'])
            solutions.append(solution)
        return solutions
    
    async def get_all_SN(self) -> List[Dict[str, Any]]:
        """
        获取所有SN:solution_note
        :return: 所有SN列表
        """
        result = list(self.db["solution_note"].find())
        for item in result:
            item["_id"] = str(item["_id"])
        return result
    
    async def insert_SN(self, data: Dict[str, Any]):
        """
        插入SN:solution_note
        :param data: 插入的数据
        """
        self.db["solution_note"].insert_one(data)

    async def edit_SN(self, sn_id: int, title: str, content: str,tag: int):
        """
        编辑SN:solution_note
        :param sn_id: SN ID
        :param title: 新标题
        :param content: 新内容
        """
        data = {
            "title": title,
            "content": content,
            "tag": tag,
            "update_time": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
        }
        self.db["solution_note"].update_one({"id": sn_id}, {"$set": data})

    async def delete_SN(self, sn_id: int):
        """
        删除SN:solution_note
        :param sn_id: SN ID
        """
        self.db["solution_note"].delete_one({"id": sn_id})

    async def set_SN_like(self, sn_id: int, like: bool):
        """
        设置SN:solution_note的点赞状态
        :param sn_id: SN ID
        :param like: 是否点赞
        """
        self.db["solution_note"].update_one({"id": sn_id}, {"$set": {"like": like}})


if __name__ == "__main__":
    # 测试代码
    import asyncio
    async def test():
        solution_crud = SolutionCrud()
        test_solution = {
            'anomaly_type': '负载-进程矛盾',
            'solution_description': '优化进程调度策略',
            'implementation_steps': ['检查进程优先级', '调整CPU资源分配'],
            'recommended_actions': ['重启相关服务', '升级硬件配置'],
            'validity_period': '长期有效',
            'created_at': '2023-11-01'
        }
        await solution_crud.save_solution(1, test_solution)
        saved = await solution_crud.get_solution_by_report_id(1)
        print(saved)
    asyncio.run(test())