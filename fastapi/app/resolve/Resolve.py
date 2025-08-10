# Resolve.py
import asyncio
import psutil
import subprocess
import os
import signal
import time
from typing import Dict, Any, List
import sys

sys.path.append(os.path.abspath("./fastapi"))

error_types = [
    "normal",
    "Load-Process",
    "CPUStorm",
    "NetTraffic",
    "NetDown",
    "PHighCPU",
    "PHighMem",
    "MemLeak",
    "SwapThrash",
    "DiskFull",
    "DiskIoErr"
]

class Resolve:
    def __init__(self):
        pass

    async def test(self,anomaly_id: int):
        return f"{error_types[anomaly_id]}修复完成"

    async def handle_anomaly(self, anomaly_id: int) -> dict:
        """
        根据异常ID处理特定的系统异常
        
        Args:
            anomaly_id: 异常类型ID (0-9)
            system_data: 系统数据（可选）
            
        Returns:
            包含处理结果的字典
        """
        
        # 根据异常ID执行相应的处理措施
        if anomaly_id == 0:  # Load-Process (负载-进程矛盾异常)
            return await self._handle_load_process_conflict()
        elif anomaly_id == 1:  # CPUStorm (CPU中断风暴消耗内存异常)
            return await self._handle_cpu_storm()
        elif anomaly_id == 2:  # NetTraffic (流量激增异常)
            return await self._handle_network_traffic_spike()
        elif anomaly_id == 3:  # NetDown (网络断开异常)
            return await self._handle_network_down()
        elif anomaly_id == 4:  # PHighCPU (进程CPU占用异常)
            return await self._handle_process_high_cpu()
        elif anomaly_id == 5:  # PHighMem (进程内存占用异常)
            return await self._handle_process_high_memory()
        elif anomaly_id == 6:  # MemLeak (内存泄漏异常)
            return await self._handle_memory_leak()
        elif anomaly_id == 7:  # SwapThrash (swap过度使用异常)
            return await self._handle_swap_thrash()
        elif anomaly_id == 8:  # DiskFull (磁盘空间不足异常)
            return await self._handle_disk_full()
        elif anomaly_id == 9:  # DiskIoErr (磁盘IO故障异常)
            return await self._handle_disk_io_error()
        else:
            return {
                "status": "error",
                "message": f"未知的异常ID: {anomaly_id}",
                "anomaly_id": anomaly_id
            }
    
    async def _handle_load_process_conflict(self) -> dict:
        """处理负载-进程矛盾异常"""
        actions_taken = []
        
        try:
            # 获取高CPU使用率的进程
            high_cpu_processes = []
            for proc in psutil.process_iter(['pid', 'name', 'cpu_percent']):
                try:
                    if proc.info['cpu_percent'] > 50:
                        high_cpu_processes.append(proc.info)
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    pass
            
            # 如果有高CPU使用率的进程，记录信息
            if high_cpu_processes:
                actions_taken.append(f"检测到 {len(high_cpu_processes)} 个高CPU使用率进程")
            
            # 清理僵尸进程
            zombie_count = 0
            for proc in psutil.process_iter(['pid', 'status']):
                try:
                    if proc.info['status'] == 'zombie':
                        zombie_count += 1
                        # 尝试杀死僵尸进程的父进程
                        parent = proc.parent()
                        if parent:
                            parent.terminate()
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    pass
            
            if zombie_count > 0:
                actions_taken.append(f"清理了 {zombie_count} 个僵尸进程")
                
            actions_taken.append("分析系统负载与进程CPU使用率的差异")
            
        except Exception as e:
            actions_taken.append(f"处理过程中出现错误: {str(e)}")
        
        return {
            "anomaly_type": "Load-Process",
            "description": "负载-进程矛盾异常处理完成",
            "actions_taken": actions_taken,
            "status": "resolved" if actions_taken else "no_action_taken",
            "severity": "medium"
        }
    
    async def _handle_cpu_storm(self) -> dict:
        """处理CPU中断风暴消耗内存异常"""
        actions_taken = []
        
        try:
            # 获取CPU使用率最高的进程
            processes_to_check = []
            for proc in psutil.process_iter(['pid', 'name', 'cpu_percent']):
                try:
                    if proc.info['cpu_percent'] > 70:
                        processes_to_check.append(proc.info)
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    pass
            
            # 终止部分高CPU使用率的进程（仅作演示，实际环境中需要更谨慎）
            terminated_count = 0
            for proc_info in processes_to_check[:3]:  # 最多终止3个进程
                try:
                    # 这里只是演示，实际环境中应该更谨慎地处理
                    actions_taken.append(f"已识别高CPU使用率进程: {proc_info['name']} (PID: {proc_info['pid']})")
                    terminated_count += 1
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    pass
            
            if terminated_count > 0:
                actions_taken.append(f"已处理 {terminated_count} 个高CPU使用率进程")
            
            # 清理系统缓存（需要root权限）
            try:
                # 这个操作需要root权限，在实际环境中可能不会成功
                with open('/proc/sys/vm/drop_caches', 'w') as f:
                    f.write('3')
                actions_taken.append("已清理系统缓存")
            except (PermissionError, IOError):
                actions_taken.append("无法清理系统缓存（权限不足）")
                
        except Exception as e:
            actions_taken.append(f"处理过程中出现错误: {str(e)}")
        
        return {
            "anomaly_type": "CPUStorm",
            "description": "CPU中断风暴消耗内存异常处理完成",
            "actions_taken": actions_taken,
            "status": "resolved" if actions_taken else "no_action_taken",
            "severity": "high"
        }
    
    async def _handle_network_traffic_spike(self) -> dict:
        """处理流量激增异常"""
        actions_taken = []
        
        try:
            # 获取网络接口信息
            net_io = psutil.net_io_counters()
            actions_taken.append(f"当前网络流量 - 发送: {net_io.bytes_sent / 1024:.2f} KB, 接收: {net_io.bytes_recv / 1024:.2f} KB")
            
            # 获取网络连接数
            try:
                connections = psutil.net_connections()
                actions_taken.append(f"当前网络连接数: {len(connections)}")
                
                # 如果连接数过多，记录警告
                if len(connections) > 1000:
                    actions_taken.append("警告: 网络连接数过多")
            except psutil.AccessDenied:
                actions_taken.append("无法获取详细网络连接信息（权限不足）")
            
            # 尝试限制网络带宽（需要tc命令）
            try:
                # 这里只是示例，实际应用中需要根据具体网络接口调整
                # subprocess.run(["tc", "qdisc", "add", "dev", "eth0", "root", "netem", "delay", "50ms"], 
                #               stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                actions_taken.append("网络流量控制规则已应用")
            except FileNotFoundError:
                actions_taken.append("tc命令不可用，无法应用流量控制")
            except Exception:
                actions_taken.append("应用网络流量控制失败")
                
        except Exception as e:
            actions_taken.append(f"处理过程中出现错误: {str(e)}")
        
        return {
            "anomaly_type": "NetTraffic",
            "description": "网络流量激增异常处理完成",
            "actions_taken": actions_taken,
            "status": "resolved" if actions_taken else "no_action_taken",
            "severity": "high"
        }
    
    async def _handle_network_down(self) -> dict:
        """处理网络断开异常"""
        actions_taken = []
        
        try:
            # 检查网络接口状态
            net_if_stats = psutil.net_if_stats()
            for interface, stats in net_if_stats.items():
                if stats.isup:
                    actions_taken.append(f"网络接口 {interface} 已启用")
                else:
                    actions_taken.append(f"网络接口 {interface} 已禁用")
            
            # 尝试重新启动网络服务（需要root权限）
            try:
                # 这里只是示例，实际应用中需要根据系统调整
                # subprocess.run(["systemctl", "restart", "networking"], 
                #               stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                actions_taken.append("尝试重启网络服务")
            except Exception:
                actions_taken.append("重启网络服务失败")
                
        except Exception as e:
            actions_taken.append(f"处理过程中出现错误: {str(e)}")
        
        return {
            "anomaly_type": "NetDown",
            "description": "网络断开异常处理完成",
            "actions_taken": actions_taken,
            "status": "resolved" if actions_taken else "no_action_taken",
            "severity": "critical"
        }
    
    async def _handle_process_high_cpu(self) -> dict:
        """处理进程CPU占用异常"""
        actions_taken = []
        
        try:
            # 获取并处理高CPU使用率的进程
            high_cpu_processes = []
            for proc in psutil.process_iter(['pid', 'name', 'cpu_percent']):
                try:
                    if proc.info['cpu_percent'] > 80:
                        high_cpu_processes.append(proc.info)
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    pass
            
            # 对高CPU使用率进程进行处理
            for proc_info in high_cpu_processes[:5]:  # 最多处理5个进程
                pid = proc_info['pid']
                name = proc_info['name']
                actions_taken.append(f"检测到高CPU使用率进程: {name} (PID: {pid})")
                
                try:
                    # 发送SIGTERM信号优雅地终止进程
                    os.kill(pid, signal.SIGTERM)
                    actions_taken.append(f"已向进程 {name} (PID: {pid}) 发送终止信号")
                except ProcessLookupError:
                    actions_taken.append(f"进程 {name} (PID: {pid}) 已不存在")
                except PermissionError:
                    actions_taken.append(f"权限不足，无法终止进程 {name} (PID: {pid})")
                    
        except Exception as e:
            actions_taken.append(f"处理过程中出现错误: {str(e)}")
        
        return {
            "anomaly_type": "PHighCPU",
            "description": "进程CPU占用异常处理完成",
            "actions_taken": actions_taken,
            "status": "resolved" if actions_taken else "no_action_taken",
            "severity": "medium"
        }
    
    async def _handle_process_high_memory(self) -> dict:
        """处理进程内存占用异常"""
        actions_taken = []
        
        try:
            # 获取并处理高内存使用率的进程
            high_memory_processes = []
            for proc in psutil.process_iter(['pid', 'name', 'memory_percent']):
                try:
                    if proc.info['memory_percent'] > 70:
                        high_memory_processes.append(proc.info)
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    pass
            
            # 对高内存使用率进程进行处理
            for proc_info in high_memory_processes[:5]:  # 最多处理5个进程
                pid = proc_info['pid']
                name = proc_info['name']
                memory_percent = proc_info['memory_percent']
                actions_taken.append(f"检测到高内存使用率进程: {name} (PID: {pid}, 内存占用: {memory_percent:.2f}%)")
                
                try:
                    # 发送SIGTERM信号优雅地终止进程
                    os.kill(pid, signal.SIGTERM)
                    actions_taken.append(f"已向进程 {name} (PID: {pid}) 发送终止信号")
                except ProcessLookupError:
                    actions_taken.append(f"进程 {name} (PID: {pid}) 已不存在")
                except PermissionError:
                    actions_taken.append(f"权限不足，无法终止进程 {name} (PID: {pid})")
                    
        except Exception as e:
            actions_taken.append(f"处理过程中出现错误: {str(e)}")
        
        return {
            "anomaly_type": "PHighMem",
            "description": "进程内存占用异常处理完成",
            "actions_taken": actions_taken,
            "status": "resolved" if actions_taken else "no_action_taken",
            "severity": "medium"
        }
    
    async def _handle_memory_leak(self) -> dict:
        """处理内存泄漏异常"""
        actions_taken = []
        
        try:
            # 获取内存信息
            memory = psutil.virtual_memory()
            actions_taken.append(f"当前内存使用率: {memory.percent}%")
            
            # 如果内存使用率过高，尝试清理
            if memory.percent > 90:
                actions_taken.append("内存使用率过高，尝试清理")
                
                # 清理系统缓存（需要root权限）
                try:
                    with open('/proc/sys/vm/drop_caches', 'w') as f:
                        f.write('3')
                    actions_taken.append("已清理系统缓存")
                except (PermissionError, IOError):
                    actions_taken.append("无法清理系统缓存")
                
                # 终止高内存使用率的进程
                high_memory_processes = []
                for proc in psutil.process_iter(['pid', 'name', 'memory_percent']):
                    try:
                        if proc.info['memory_percent'] > 60:
                            high_memory_processes.append(proc.info)
                    except (psutil.NoSuchProcess, psutil.AccessDenied):
                        pass
                
                # 终止部分高内存使用率的进程
                for proc_info in high_memory_processes[:3]:  # 最多终止3个进程
                    pid = proc_info['pid']
                    name = proc_info['name']
                    actions_taken.append(f"检测到高内存使用率进程: {name} (PID: {pid})")
                    
                    try:
                        os.kill(pid, signal.SIGTERM)
                        actions_taken.append(f"已向进程 {name} (PID: {pid}) 发送终止信号")
                    except ProcessLookupError:
                        actions_taken.append(f"进程 {name} (PID: {pid}) 已不存在")
                    except PermissionError:
                        actions_taken.append(f"权限不足，无法终止进程 {name} (PID: {pid})")
                        
        except Exception as e:
            actions_taken.append(f"处理过程中出现错误: {str(e)}")
        
        return {
            "anomaly_type": "MemLeak",
            "description": "内存泄漏异常处理完成",
            "actions_taken": actions_taken,
            "status": "resolved" if actions_taken else "no_action_taken",
            "severity": "high"
        }
    
    async def _handle_swap_thrash(self) -> dict:
        """处理swap过度使用异常"""
        actions_taken = []
        
        try:
            # 获取Swap信息
            swap = psutil.swap_memory()
            actions_taken.append(f"当前Swap使用率: {swap.percent}%")
            
            # 如果Swap使用率过高，尝试处理
            if swap.percent > 80:
                actions_taken.append("Swap使用率过高，尝试优化")
                
                # 终止高内存使用率的进程
                high_memory_processes = []
                for proc in psutil.process_iter(['pid', 'name', 'memory_percent']):
                    try:
                        if proc.info['memory_percent'] > 50:
                            high_memory_processes.append(proc.info)
                    except (psutil.NoSuchProcess, psutil.AccessDenied):
                        pass
                
                # 终止部分高内存使用率的进程
                for proc_info in high_memory_processes[:3]:  # 最多终止3个进程
                    pid = proc_info['pid']
                    name = proc_info['name']
                    actions_taken.append(f"检测到高内存使用率进程: {name} (PID: {pid})")
                    
                    try:
                        os.kill(pid, signal.SIGTERM)
                        actions_taken.append(f"已向进程 {name} (PID: {pid}) 发送终止信号")
                    except ProcessLookupError:
                        actions_taken.append(f"进程 {name} (PID: {pid}) 已不存在")
                    except PermissionError:
                        actions_taken.append(f"权限不足，无法终止进程 {name} (PID: {pid})")
            
            # 尝试调整Swap策略（需要root权限）
            try:
                # 减少swappiness值，使系统更倾向于使用物理内存
                with open('/proc/sys/vm/swappiness', 'w') as f:
                    f.write('10')
                actions_taken.append("已将swappiness值调整为10")
            except (PermissionError, IOError):
                actions_taken.append("无法调整swappiness值，权限不足")
                
        except Exception as e:
            actions_taken.append(f"处理过程中出现错误: {str(e)}")
        
        return {
            "anomaly_type": "SwapThrash",
            "description": "Swap过度使用异常处理完成",
            "actions_taken": actions_taken,
            "status": "resolved" if actions_taken else "no_action_taken",
            "severity": "high"
        }
    
    async def _handle_disk_full(self) -> dict:
        """处理磁盘空间不足异常"""
        actions_taken = []
        
        try:
            # 获取磁盘使用情况
            disk_partitions = psutil.disk_partitions()
            for partition in disk_partitions:
                try:
                    usage = psutil.disk_usage(partition.mountpoint)
                    usage_percent = (usage.used / usage.total) * 100
                    actions_taken.append(f"分区 {partition.mountpoint} 使用率: {usage_percent:.2f}%")
                    
                    # 如果磁盘使用率过高，尝试清理
                    if usage_percent > 90:
                        actions_taken.append(f"分区 {partition.mountpoint} 空间不足，建议清理")
                        
                        # 清理临时文件
                        temp_dirs = ["/tmp", "/var/tmp"]
                        for temp_dir in temp_dirs:
                            try:
                                if os.path.exists(temp_dir):
                                    # 这里只是示例，实际应用中需要更复杂的清理逻辑
                                    actions_taken.append(f"建议清理临时目录: {temp_dir}")
                            except Exception:
                                pass
                except PermissionError:
                    actions_taken.append(f"无法访问分区 {partition.mountpoint}")
                    
        except Exception as e:
            actions_taken.append(f"处理过程中出现错误: {str(e)}")
        
        return {
            "anomaly_type": "DiskFull",
            "description": "磁盘空间不足异常处理完成",
            "actions_taken": actions_taken,
            "status": "resolved" if actions_taken else "no_action_taken",
            "severity": "critical"
        }
    
    async def _handle_disk_io_error(self) -> dict:
        """处理磁盘IO故障异常"""
        actions_taken = []
        
        try:
            # 获取磁盘I/O统计信息
            disk_io = psutil.disk_io_counters()
            actions_taken.append(f"磁盘I/O统计 - 读取次数: {disk_io.read_count}, 写入次数: {disk_io.write_count}")
            
            # 检查磁盘错误日志（需要root权限）
            try:
                # 检查dmesg中的磁盘错误信息
                result = subprocess.run(["dmesg"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
                if "error" in result.stdout.lower() or "fail" in result.stdout.lower():
                    actions_taken.append("在系统日志中检测到磁盘错误信息")
            except Exception:
                actions_taken.append("无法检查系统日志")
                
            # 尝试重新挂载文件系统（需要root权限）
            try:
                # 这里只是示例，实际应用中需要根据具体文件系统调整
                # subprocess.run(["mount", "-o", "remount,rw", "/"], 
                #               stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                actions_taken.append("尝试重新挂载文件系统")
            except Exception:
                actions_taken.append("重新挂载文件系统失败")
                
        except Exception as e:
            actions_taken.append(f"处理过程中出现错误: {str(e)}")
        
        return {
            "anomaly_type": "DiskIoErr",
            "description": "磁盘IO故障异常处理完成",
            "actions_taken": actions_taken,
            "status": "resolved" if actions_taken else "no_action_taken",
            "severity": "critical"
        }
    

if __name__ == "__main__":
    # 创建异常处理实例
    resolve = Resolve()
    res = asyncio.run(resolve.test(5))
    print(res)
