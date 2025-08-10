import sys
import os
import time
import psutil
import platform
from typing import List, Optional, Dict, Any


#自己的路径
sys.path.append(os.path.abspath("./fastapi"))
from app.crud.SystemInfoCrud import SystemInfoCrud
from app.dataoperate.datatransform import DataTransform

transform = DataTransform()

class DataCollect:
    def __init__(self):
        self.crud = SystemInfoCrud()

    async def collect_data(self) -> Dict[str, Any]:
        """收集系统详细指标，包括 CPU、内存、磁盘、网络和进程信息"""
        # CPU 信息（添加错误处理）
        try:
            cpu_freq = psutil.cpu_freq()
            cpu_freq_current = cpu_freq.current if cpu_freq else None
        except Exception as e:
            print(f"获取 CPU 频率失败: {e}")
            cpu_freq_current = None

        # 尝试获取 CPU 型号，失败则设为未知
        try:
            cpu_model = platform.processor() or "Unknown"
        except Exception:
            cpu_model = "Unknown"

        # 尝试获取用户信息，失败则设为 unknown
        try:
            login_user = psutil.users()[0].name if psutil.users() else "unknown"
        except Exception:
            login_user = "unknown"

        # CPU 信息
        cpu_info = {
            "cpu_count": psutil.cpu_count(logical=False),
            "logical_cpu_count": psutil.cpu_count(logical=True),
            "cpu_percent": psutil.cpu_percent(interval=0.1),  # 缩短采样间隔
            "cpu_freq": cpu_freq_current,
            "cpu_model": cpu_model,
            "cpu_stats": {
                "ctx_switches": psutil.cpu_stats().ctx_switches,
                "interrupts": psutil.cpu_stats().interrupts,
                "soft_interrupts": psutil.cpu_stats().soft_interrupts,
                "syscalls": psutil.cpu_stats().syscalls
            }
        }
        # 内存信息
        mem = psutil.virtual_memory()
        swap_mem = psutil.swap_memory()
        memory_info = {
            "total_memory_gb": mem.total / (1024 ** 3),
            "available_memory_gb": mem.available / (1024 ** 3),
            "used_memory_gb": mem.used / (1024 ** 3),
            "memory_percent": mem.percent,
            "active_memory_gb": getattr(mem, 'active', 0) / (1024 ** 3),
            "inactive_memory_gb": getattr(mem, 'inactive', 0) / (1024 ** 3),
            "buffers_memory_gb": getattr(mem, 'buffers', 0) / (1024 ** 3),
            "cached_memory_gb": getattr(mem, 'cached', 0) / (1024 ** 3),
            "swap_memory_info":{
                "total_smemory_gb":getattr(swap_mem, 'total', 0) / (1024 ** 3),
                "used_smemory_gb":getattr(swap_mem, 'used', 0) / (1024 ** 3),
                "free_smemory_gb":getattr(swap_mem, 'free', 0) / (1024 ** 3),
                "smemory_percent": swap_mem.percent
        }
        }

        # 磁盘信息（增加错误处理）
        disk_info = []
        partitions = psutil.disk_partitions()
        for part in partitions:
            try:
                if not part.mountpoint.startswith(('/proc', '/sys', '/dev')):  # 过滤虚拟文件系统
                    disk_usage = psutil.disk_usage(part.mountpoint)
                    #disk_io = psutil.disk_io_counters(perdisk=True)
                    disk_info.append({
                        "device": part.device,
                        "mountpoint": part.mountpoint,
                        "total_disk_gb": disk_usage.total / (1024 ** 3),
                        "used_disk_gb": disk_usage.used / (1024 ** 3),
                        "disk_percent": disk_usage.percent,
                        ###
                        #disk_io
                        ###
                    })
            except (PermissionError, OSError) as e:
                print(f"获取磁盘 {part.mountpoint} 信息失败: {e}")
                continue

        # 网络信息
        net_io_counters = psutil.net_io_counters()
        network_info = {
            "bytes_sent_kb": net_io_counters.bytes_sent / 1024,
            "bytes_recv_kb": net_io_counters.bytes_recv / 1024,
            "packets_sent": net_io_counters.packets_sent,
            "packets_recv": net_io_counters.packets_recv
        }

        # 进程信息（增加错误处理）
        process_info = []
        for proc in psutil.process_iter(['pid', 'name', 'username', 'cpu_percent', 'memory_percent']):
            try:
                proc_info = proc.info
                # 只收集资源占用较高的进程，减少数据量
                if proc_info['cpu_percent'] > 0.1 or proc_info['memory_percent'] > 0.1:
                    process_info.append(proc_info)
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess) as e:
                continue
        # 整合所有数据
        metrics = {
            "id": self.crud.db["system_info"].count_documents({}) + 1,  # 简单生成 ID
            "anomaly_id": 0,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime()),
            "cpu_info": cpu_info,
            "memory_info": memory_info,
            "disk_info": disk_info,
            "network_info": network_info,
            "process_info": process_info
        }
        metrics = await transform.data_model_operate(metrics)
        await self.crud.save_system_info(metrics)  # 保存数据到数据库
        # 将 ObjectId 转换为字符串
        metrics["_id"] = str(metrics["_id"])
        # 返回收集到的指标
        return metrics
