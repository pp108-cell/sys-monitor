import asyncio
import sys
import os
from typing import Dict, Any, List
import time
import uuid
from fastapi import UploadFile
sys.path.append(os.path.abspath("./fastapi"))

from app.crud.CauseReportCrud import CauseReportCrud
from app.crud.SystemInfoCrud import SystemInfoCrud
from bson import ObjectId
import random

# 添加项目路径
# 异常编号与类型映射
# 0: 正常数据（不生成异常报告）
ANOMALY_TYPE_MAP = {
    1: "负载-进程矛盾",
    2: "CPU中断风暴消耗内存",
    3: "流量激增",
    4: "网络断开",
    5: "CPU杀手进程",
    6: "进程内存占用异常",
    7: "内存泄漏",
    8: "swap过度使用",
    9: "磁盘空间不足",
    10: "磁盘io故障"
}

def fix_objectid(obj):
    if isinstance(obj, dict):
        for k, v in obj.items():
            if isinstance(v, ObjectId):
                obj[k] = str(v)
            else:
                obj[k] = fix_objectid(v)
        return obj
    elif isinstance(obj, list):
        return [fix_objectid(item) for item in obj]
    else:
        return obj

class CauseReportServe:
    def __init__(self):
        self.crud = CauseReportCrud()
        self.systeminfo_crud = SystemInfoCrud()

    def judge_risk_level(self, anomaly_type: str, metrics: Dict[str, Any]) -> str:
        """
        根据异常类型和指标判断风险等级
        分为三个等级：严重异常(高危)、一般异常(中危)、轻微异常(低危)
        """
        if anomaly_type == "负载-进程矛盾":
            cpu_percent = metrics.get("cpu_info", {}).get("cpu_percent", 0)
            process_info = metrics.get("process_info", [])
            process_cpu_sum = sum([p.get("cpu_percent", 0) for p in process_info])
            cpu_diff = abs(cpu_percent - process_cpu_sum)
            
            if cpu_percent > 90 or cpu_diff > 70:
                return "高危"  # 严重异常：CPU使用率极高或差值极大
            elif cpu_percent > 70 or cpu_diff > 50:
                return "中危"  # 一般异常：CPU使用率较高或差值较大
            else:
                return "低危"  # 轻微异常：CPU使用率正常但存在差异
                
        elif anomaly_type == "CPU中断风暴消耗内存":
            cpu_percent = metrics.get("cpu_info", {}).get("cpu_percent", 0)
            memory_percent = metrics.get("memory_info", {}).get("memory_percent", 0)
            interrupts = metrics.get("cpu_info", {}).get("cpu_stats", {}).get("interrupts", 0)
            
            if cpu_percent > 85 and memory_percent > 80:
                return "高危"  # 严重异常：CPU和内存都很高
            elif cpu_percent > 70 or memory_percent > 60:
                return "中危"  # 一般异常：CPU或内存较高
            else:
                return "低危"  # 轻微异常：轻微的中断风暴
                
        elif anomaly_type == "流量激增":
            bytes_recv_kb = metrics.get("network_info", {}).get("bytes_recv_kb", 0)
            bytes_sent_kb = metrics.get("network_info", {}).get("bytes_sent_kb", 0)
            packets_recv = metrics.get("network_info", {}).get("packets_recv", 0)
            
            if bytes_recv_kb > 500000 or bytes_sent_kb > 500000:
                return "高危"  # 严重异常：流量极大
            elif bytes_recv_kb > 100000 or bytes_sent_kb > 100000:
                return "中危"  # 一般异常：流量较大
            else:
                return "低危"  # 轻微异常：流量轻微增长
                
        elif anomaly_type == "网络断开":
            bytes_recv_kb = metrics.get("network_info", {}).get("bytes_recv_kb", 0)
            bytes_sent_kb = metrics.get("network_info", {}).get("bytes_sent_kb", 0)
            packets_recv = metrics.get("network_info", {}).get("packets_recv", 0)
            
            if bytes_recv_kb == 0 and bytes_sent_kb == 0 and packets_recv == 0:
                return "高危"  # 严重异常：完全断网
            elif bytes_recv_kb < 10 and bytes_sent_kb < 10:
                return "中危"  # 一般异常：网络严重不稳定
            else:
                return "低危"  # 轻微异常：网络轻微不稳定
                
        elif anomaly_type == "CPU杀手进程":
            cpu_percent = metrics.get("cpu_info", {}).get("cpu_percent", 0)
            process_info = metrics.get("process_info", [])
            max_process_cpu = max([p.get("cpu_percent", 0) for p in process_info]) if process_info else 0
            
            if max_process_cpu > 80 or cpu_percent > 95:
                return "高危"  # 严重异常：单个进程CPU极高
            elif max_process_cpu > 50 or cpu_percent > 80:
                return "中危"  # 一般异常：单个进程CPU较高
            else:
                return "低危"  # 轻微异常：进程CPU轻微异常
                
        elif anomaly_type == "进程内存占用异常":
            memory_percent = metrics.get("memory_info", {}).get("memory_percent", 0)
            process_info = metrics.get("process_info", [])
            max_process_memory = max([p.get("memory_percent", 0) for p in process_info]) if process_info else 0
            
            if max_process_memory > 50 or memory_percent > 90:
                return "高危"  # 严重异常：单个进程内存极高
            elif max_process_memory > 30 or memory_percent > 75:
                return "中危"  # 一般异常：单个进程内存较高
            else:
                return "低危"  # 轻微异常：进程内存轻微异常
                
        elif anomaly_type == "内存泄漏":
            memory_percent = metrics.get("memory_info", {}).get("memory_percent", 0)
            available_memory_gb = metrics.get("memory_info", {}).get("available_memory_gb", 0)
            
            if memory_percent > 95 or available_memory_gb < 0.1:
                return "高危"  # 严重异常：内存几乎耗尽
            elif memory_percent > 85 or available_memory_gb < 0.5:
                return "中危"  # 一般异常：内存使用率很高
            else:
                return "低危"  # 轻微异常：内存使用率较高但未达到危险水平
                
        elif anomaly_type == "swap过度使用":
            swap_percent = metrics.get("memory_info", {}).get("swap_memory_info", {}).get("smemory_percent", 0)
            memory_percent = metrics.get("memory_info", {}).get("memory_percent", 0)
            
            if swap_percent > 80 or (swap_percent > 50 and memory_percent > 90):
                return "高危"  # 严重异常：swap使用率极高
            elif swap_percent > 50 or (swap_percent > 20 and memory_percent > 80):
                return "中危"  # 一般异常：swap使用率较高
            else:
                return "低危"  # 轻微异常：swap轻微使用
                
        elif anomaly_type == "磁盘空间不足":
            disk_info = metrics.get("disk_info", [])
            max_disk_percent = max([d.get("disk_percent", 0) for d in disk_info]) if disk_info else 0
            
            if max_disk_percent > 95:
                return "高危"  # 严重异常：磁盘几乎满了
            elif max_disk_percent > 85:
                return "中危"  # 一般异常：磁盘使用率很高
            else:
                return "低危"  # 轻微异常：磁盘使用率较高
                
        elif anomaly_type == "磁盘io故障":
            disk_info = metrics.get("disk_info", [])
            # 简化判断：基于磁盘数量和使用率
            disk_count = len(disk_info)
            avg_disk_percent = sum([d.get("disk_percent", 0) for d in disk_info]) / disk_count if disk_count > 0 else 0
            
            if disk_count == 0 or avg_disk_percent == 0:
                return "高危"  # 严重异常：磁盘完全无响应
            elif avg_disk_percent < 10:
                return "中危"  # 一般异常：磁盘IO严重异常
            else:
                return "低危"  # 轻微异常：磁盘IO轻微异常
                
        else:
            # 未知异常类型，默认中危
            return "中危"

    def get_template_by_type(self, anomaly_type: str, anomaly: Dict[str, Any], index: int = 1) -> Dict[str, Any]:
        metrics = anomaly.get("metrics", {})
        if anomaly_type == "负载-进程矛盾":
            cpu_percent = metrics.get("cpu_info", {}).get("cpu_percent", 0)
            process_info = metrics.get("process_info", [])
            process_cpu_sum = sum([p.get("cpu_percent", 0) for p in process_info])
            return {
                "index": index,
                "anomaly_type": anomaly_type,
                "risk_level": anomaly["risk_level"],
                "current_status": anomaly["status"],
                "system_cpu_percent": cpu_percent,
                "process_cpu_sum": process_cpu_sum,
                "process_detail": [
                    {"pid": p.get("pid"), "name": p.get("name"), "cpu_percent": p.get("cpu_percent")} for p in process_info
                ],
                "detail_analysis": f"System CPU usage: {cpu_percent}%, process CPU sum: {process_cpu_sum}%. Large difference may indicate kernel consumption or interrupt storm."
            }
        elif anomaly_type == "CPU杀手进程":
            cpu_percent = metrics.get("cpu_info", {}).get("cpu_percent", 0)
            process_info = metrics.get("process_info", [])
            return {
                "index": index,
                "anomaly_type": anomaly_type,
                "risk_level": anomaly["risk_level"],
                "current_status": anomaly["status"],
                "system_cpu_percent": cpu_percent,
                "process_detail": [
                    {"pid": p.get("pid"), "name": p.get("name"), "cpu_percent": p.get("cpu_percent")} for p in process_info
                ],
                "detail_analysis": f"Found {len(process_info)} processes. Please check their behavior."
            }
        elif anomaly_type == "进程内存占用异常":
            memory_percent = metrics.get("memory_info", {}).get("memory_percent", 0)
            process_info = metrics.get("process_info", [])
            return {
                "index": index,
                "anomaly_type": anomaly_type,
                "risk_level": anomaly["risk_level"],
                "current_status": anomaly["status"],
                "memory_percent": memory_percent,
                "process_detail": [
                    {"pid": p.get("pid"), "name": p.get("name"), "memory_percent": p.get("memory_percent")} for p in process_info
                ],
                "detail_analysis": f"Found {len(process_info)} processes. Check for sudden doubling or unknown high memory processes."
            }
        elif anomaly_type == "内存泄漏":
            memory_info = metrics.get("memory_info", {})
            return {
                "index": index,
                "anomaly_type": anomaly_type,
                "risk_level": anomaly["risk_level"],
                "current_status": anomaly["status"],
                "used_memory_gb": memory_info.get("used_memory_gb"),
                "available_memory_gb": memory_info.get("available_memory_gb"),
                "memory_percent": memory_info.get("memory_percent"),
                "detail_analysis": f"Memory keeps growing, available memory drops below 0.2GB, memory_percent exceeds 95%. Possible memory leak."
            }
        elif anomaly_type == "swap过度使用":
            swap_info = metrics.get("memory_info", {}).get("swap_memory_info", {})
            return {
                "index": index,
                "anomaly_type": anomaly_type,
                "risk_level": anomaly["risk_level"],
                "current_status": anomaly["status"],
                "swap_memory_gb": swap_info.get("total_smemory_gb"),
                "swap_used_gb": swap_info.get("used_smemory_gb"),
                "swap_percent": swap_info.get("smemory_percent"),
                "detail_analysis": f"Swap usage increases significantly, possible memory pressure. Optimize memory usage and reduce swap dependency."
            }
        elif anomaly_type == "磁盘空间不足":
            disk_info = metrics.get("disk_info", [])
            return {
                "index": index,
                "anomaly_type": anomaly_type,
                "risk_level": anomaly["risk_level"],
                "current_status": anomaly["status"],
                "disk_info": disk_info,
                "detail_analysis": f"Found {len(disk_info)} disk partitions. Please clean up or expand if needed."
            }
        elif anomaly_type == "磁盘io故障":
            disk_info = metrics.get("disk_info", [])
            disk_io = [d.get("disk_io", {}) for d in disk_info]
            return {
                "index": index,
                "anomaly_type": anomaly_type,
                "risk_level": anomaly["risk_level"],
                "current_status": anomaly["status"],
                "disk_info": disk_info,
                "disk_io_detail": disk_io,
                "detail_analysis": "Disk read_bits and write_bits unchanged for a period, suspected disk I/O failure. Check disk health."
            }
        else:
            return {
                "index": index,
                "anomaly_type": anomaly_type,
                "risk_level": anomaly.get("risk_level", ""),
                "current_status": anomaly.get("status", ""),
                "metrics": metrics,
                "detail_analysis": anomaly.get("details", "Unknown anomaly.")
            }

    async def generate_single_cause_template(self, anomaly_type: str, anomaly: Dict[str, Any]) -> Dict[str, Any]:
        """
        根据异常类型和异常详情生成单一异常模板
        """
        template = self.get_template_by_type(anomaly_type, anomaly)
        return template

    async def get_all_cause_reports(self) -> Dict[str, Any]:
        """
        获取所有异常报告（返回字段结构与 CauseReportServe.py 模板一致）
        """
        reports = await self.crud.find_cause_reports()
        if not reports:
            return {"errCode": 1, "message": "无异常报告数据", "data": None}
        formatted_reports = []
        for r in reports:
            anomaly_type = r.get("anomaly_type") or "未知异常"
            # 兼容历史数据
            anomaly = {
                "type": anomaly_type,
                "risk_level": r.get("risk_level"),
                "status": r.get("current_status"),
                "metrics": {
                    "cpu_info": r.get("cpu_info", {}),
                    "memory_info": r.get("memory_info", {}),
                    "network_info": r.get("network_info", {}),
                    "disk_info": r.get("disk_info", []),
                    "process_info": r.get("process_detail", []) or r.get("process_info", [])
                }
            }
            # 用 CauseReportServe 的模板格式化
            formatted = self.get_template_by_type(anomaly_type, anomaly, r.get("index", 1))
            # 保留原有的基础信息
            formatted.update({
                "timestamp": r.get("timestamp"),
                "system_info_id": r.get("system_info_id"),
                "original_timestamp": r.get("original_timestamp"),
                "index": r.get("index"),
                "_id": r.get("_id"),
            })
            formatted_reports.append(formatted)
        return {"errCode": 0, "message": "success", "data": formatted_reports}

    async def clean_old_format_reports(self) -> Dict[str, Any]:
        """
        清理旧格式的异常报告数据
        """
        try:
            # 删除包含 "异常列表" 字段的旧格式记录
            result = self.crud.db["cause_report"].delete_many({"异常列表": {"$exists": True}})
            deleted_count = result.deleted_count
            return {"errCode": 0, "message": f"成功清理 {deleted_count} 条旧格式记录", "data": {"deleted_count": deleted_count}}
        except Exception as e:
            return {"errCode": 1, "message": f"清理旧格式记录失败: {str(e)}", "data": None}

    async def generate_report_from_systeminfo(self) -> Dict[str, Any]:
        # 获取所有系统信息数据
        system_data_list = await self.systeminfo_crud.find_systeminfo()
        # 转换所有 _id 字段为字符串，避免 ObjectId 报错
        system_data_list = [fix_objectid(item) for item in system_data_list if isinstance(item, dict)]
        if not system_data_list:
            return {"errCode": 1, "message": "无系统信息数据", "data": None}
        
        # 获取已经处理过的系统信息ID列表
        processed_system_info_ids = set()
        existing_reports = list(self.crud.db["cause_report"].find({}, {"system_info_id": 1}))
        for report in existing_reports:
            processed_system_info_ids.add(report.get("system_info_id"))
        
        # 用于跟踪已处理的异常，避免重复存储
        processed_anomalies = set()
        saved_reports = []
        normal_count = 0
        anomaly_count = 0
        
        for item in system_data_list:
            if not isinstance(item, dict):
                continue
                
            # 跳过已经处理过的系统信息
            system_info_id = str(item.get("_id", ""))
            if system_info_id in processed_system_info_ids:
                continue
                
            anomaly_id_raw = item.get("anomaly_id")
            if anomaly_id_raw is None or anomaly_id_raw == "":
                continue
            try:
                anomaly_id = int(anomaly_id_raw)
            except (TypeError, ValueError):
                continue
            
            # 如果 anomaly_id 为 0，表示正常数据，跳过不生成异常报告
            if anomaly_id == 0:
                normal_count += 1
                continue
                
            if anomaly_id not in ANOMALY_TYPE_MAP:
                continue
            anomaly_type = ANOMALY_TYPE_MAP[anomaly_id]
            anomaly_count += 1
            
            # 创建唯一标识符，避免重复存储相同异常
            anomaly_key = f"{anomaly_type}_{item.get('timestamp', '')}_{item.get('_id', '')}"
            if anomaly_key in processed_anomalies:
                continue
            processed_anomalies.add(anomaly_key)
            
            # 构建metrics用于风险等级判断
            metrics_for_risk = {
                "cpu_info": item.get("cpu_info", {}),
                "memory_info": item.get("memory_info", {}),
                "network_info": item.get("network_info", {}),
                "disk_info": item.get("disk_info", []),
                "process_info": item.get("process_info", [])
            }
            
            # 调用judge_risk_level函数计算风险等级
            calculated_risk_level = self.judge_risk_level(anomaly_type, metrics_for_risk)
            
            anomaly = {
                "type": anomaly_type,
                "risk_level": calculated_risk_level,  # 使用计算出的风险等级
                "status": item.get("status", "自动检测异常"),
                "metrics": metrics_for_risk
            }
            
            # 生成单个异常报告
            template = self.get_template_by_type(anomaly_type, anomaly, len(saved_reports) + 1)
            
            # 添加时间戳和系统信息ID - 使用原始时间戳而不是当前时间
            original_timestamp = item.get("timestamp", "")
            # 如果原始时间戳为空，才使用当前时间
            current_timestamp = original_timestamp if original_timestamp else time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
            
            single_report = {
                "id": self.crud.db["cause_report"].count_documents({}) + 1,  # 简单生成 ID,
                "timestamp": current_timestamp,  # 使用原始时间戳
                "system_info_id": system_info_id,
                "original_timestamp": original_timestamp,
                "data": {
                    "anomalies": [template]
                }
            }
            
            # 保存单个异常报告到数据库前，先查重
            exists = self.crud.db["cause_report"].find_one({
                "anomaly_type": template.get("anomaly_type"),
                "original_timestamp": single_report["original_timestamp"],
                "system_info_id": single_report["system_info_id"]
            })
            if not exists:
                await self.crud.save_cause_report(single_report)
                saved_reports.append(fix_objectid(single_report))
        
        if not saved_reports:
            return {"errCode": 1, "message": "未发现新的异常数据", "data": None}
        
        # 返回汇总信息
        summary = {
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime()),
            "anomaly_count": f"{len(saved_reports)}个异常报告",
            "normal_data_count": normal_count,
            "anomaly_data_count": anomaly_count,
            "anomalies": saved_reports,
            "saved_reports": saved_reports
        }
        
        return {"errCode": 0, "message": "success", "data": summary}

    def calculate_overall_risk_level(self, anomalies: List[Dict[str, Any]]) -> str:
        """
        计算总体异常等级
        规则：低危3分，中危6分，高危9分，求和取平均值
        均值<=5为低危，5<均值<7为中危，均值>=7为高危
        """
        if not anomalies:
            return "低危"
        
        total_score = 0
        valid_count = 0
        
        for anomaly in anomalies:
            # 从异常数据中获取风险等级
            risk_level = None
            
            # 尝试从不同字段获取风险等级
            if isinstance(anomaly, dict):
                risk_level = (anomaly.get("risk_level") or 
                             anomaly.get("data", {}).get("anomalies", [{}])[0].get("risk_level") if 
                             anomaly.get("data", {}).get("anomalies") else None)
            
            # 如果还是没找到，尝试从嵌套的anomalies数组中获取
            if not risk_level and isinstance(anomaly, dict) and "data" in anomaly:
                data = anomaly["data"]
                if isinstance(data, dict) and "anomalies" in data:
                    anomalies_list = data["anomalies"]
                    if isinstance(anomalies_list, list) and len(anomalies_list) > 0:
                        risk_level = anomalies_list[0].get("risk_level")
            
            # 根据风险等级计算分数
            if risk_level:
                if risk_level in ["低危", "轻微异常"]:
                    total_score += 3
                    valid_count += 1
                elif risk_level in ["中危", "一般异常"]:
                    total_score += 6
                    valid_count += 1
                elif risk_level in ["高危", "严重异常"]:
                    total_score += 9
                    valid_count += 1
        
        # 如果没有有效的风险等级数据，默认为低危
        if valid_count == 0:
            return "低危"
        
        # 计算平均分
        average_score = total_score / valid_count
        
        # 根据平均分确定总体风险等级
        if average_score <= 5:
            return "低危"
        elif average_score < 7:
            return "中危"
        else:
            return "高危"

    async def generate_summary_report_by_date(self, date_str: str) -> Dict[str, Any]:
        """
        根据前端传来的日期字符串（如2025-07-15）生成当天的综合性报告。
        报告结构：
        - 日期
        - 异常个数
        - 总体异常等级
        - 公共字段（如时间戳、风险等级、状态等）
        - 每个异常的名称和特有字段
        """
        # 查找当天所有异常报告
        reports = await self.crud.find_cause_reports_by_timestamp(date_str)
        if not reports:
            return {"errCode": 1, "message": f"{date_str} 无异常报告数据", "data": None}
        
        # 公共字段（取第一个异常的部分字段作为公共字段）
        public_fields = {}
        if reports:
            sample = reports[0]
            public_fields = {
                "timestamp": sample.get("timestamp"),
                "risk_level": sample.get("risk_level", "未知"),
                "status": sample.get("current_status", "未知")
            }
        
        # 异常详情
        anomalies = []
        remove_fields = {"id", "index", "timestamp", "_id","process_detail","disk_io_detail"}
        for r in reports:
            anomaly = {k: v for k, v in r.items() if k not in remove_fields}
            anomalies.append(anomaly)
        
        # 计算总体异常等级
        overall_risk_level = self.calculate_overall_risk_level(reports)
        
        # 获取当前最大id
        last = self.crud.db["cause_report_by_timestamp"].find_one(sort=[("id", -1)])
        next_id = (last["id"] + 1) if last and "id" in last else 1
        summary = {
            "id": next_id,
            "date": date_str,
            "anomaly_count": len(reports),
            "overall_risk_level": overall_risk_level,  # 新增总体异常等级字段
            #"public_fields": public_fields,
            "anomalies": anomalies,
            #"advice": "建议：请关注系统运行状态，及时处理异常。"
        }
        # 存储到新的数据库集合 cause_report_by_timestamp
        self.crud.db["cause_report_by_timestamp"].insert_one(summary)
        # 移除summary中的_id（如果有）
        summary.pop("_id", None)
        return {"errCode": 0, "message": "success", "data": summary}

    async def get_latest_summary_reports_by_day(self) -> dict:
        """
        获取cause_report_by_timestamp集合中每一天最后一条综合性报告
        """
        # 聚合：按date分组，取每组最后一条
        pipeline = [
            {"$sort": {"date": 1, "_id": 1}},
            {"$group": {
                "_id": "$date",
                "last_report": {"$last": "$$ROOT"}
            }},
            {"$replaceRoot": {"newRoot": "$last_report"}},
            {"$sort": {"date": 1}}
        ]
        result = list(self.crud.db["cause_report_by_timestamp"].aggregate(pipeline))
        # 转换_id为字符串
        for item in result:
            if "_id" in item:
                item["_id"] = str(item["_id"])
            
        return {"errCode": 0, "message": "success", "data": result}

    async def get_report_id(self, timestamp: str):
        #print(await self.crud.get_id(timestamp))
        return await self.crud.get_id(timestamp)

    async def save_pdf_report(self, file: UploadFile) -> Dict[str, Any]:
        """
        保存PDF报告文件并返回预览地址
        """
        try:
            # 使用日期格式命名文件，如果重复就覆盖
            file_extension = file.filename.split(".")[-1] if file.filename and "." in file.filename else "pdf"
            current_date = time.strftime("%Y_%m_%d", time.localtime())
            file_name = f"{current_date}.{file_extension}"
            
            # 创建保存目录
            upload_dir = "./uploads/pdf_reports"
            os.makedirs(upload_dir, exist_ok=True)
            
            file_path = os.path.join(upload_dir, file_name)
            
            # 保存文件
            with open(file_path, "wb") as buffer:
                content = await file.read()
                buffer.write(content)
            
            # 构建预览地址 (假设通过静态文件服务访问)
            preview_url = f"/static/pdf_reports/{file_name}"
            
            # 简单的文件信息记录
            file_info = {
                "file_id": str(uuid.uuid4()),
                "original_name": file.filename,
                "file_name": file_name,
                "file_path": file_path,
                "preview_url": preview_url,
                "upload_time": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime()),
                "file_size": len(content)
            }
            
            # 可选：将文件信息保存到数据库 (这里简化处理)
            # await self.crud.save_pdf_file_info(file_info)
            
            return {
                "errCode": 0, 
                "message": "PDF报告上传成功", 
                "data": {
                    "file_id": file_info["file_id"],
                    "preview_url": preview_url,
                    "download_url": preview_url,  # 预览和下载可以使用同一个URL
                    "file_name": file_info["original_name"]
                }
            }
            
        except Exception as e:
            return {"errCode": 1, "message": f"PDF报告上传失败: {str(e)}", "data": None}


if __name__ == "__main__":
    # 模拟异常数据
    '''
    anomalies = [
        {
            "type": "负载-进程矛盾",
            "risk_level": "高危",
            "status": "系统CPU: 82.4% | 进程CPU总和: 18.7% | 差值: 63.7%",
            "metrics": {"cpu_percent": 82.4, "process_cpu_sum": 18.7, "diff": 63.7},
            "cpu_time_detail": "...",
            "process_cpu_detail": "...",
            "root_cause_analysis": "..."
        },
        {
            "type": "磁盘空间不足",
            "risk_level": "中危",
            "status": "disk_percent: 92%",
            "metrics": {"disk_percent": 92},
            "details": "磁盘空间占用过高"
        }
    ]'''
    a=CauseReportServe()
    asyncio.run(a.get_report_id("2025-07-26"))
