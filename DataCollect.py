import psutil
from pymongo import MongoClient
import time
import platform

# MongoDB 连接配置
uri = "mongodb://localhost:27017/"
client = MongoClient(uri)
db = client.test  # 数据库名，可自定义
collection = db.data1  # 集合名，可自定义


def get_detailed_system_metrics():
    """采集系统指标，严格保留 cpu_info 结构"""
    metrics = {}

    # ========== 1. CPU 信息（严格按需求定义） ==========
    # CPU 频率处理
    try:
        cpu_freq = psutil.cpu_freq()
        cpu_freq_current = cpu_freq.current if cpu_freq else None
    except Exception as e:
        print(f"获取 CPU 频率失败: {e}")
        cpu_freq_current = None

    # CPU 型号处理
    try:
        cpu_model = platform.processor() or "Unknown"
    except Exception:
        cpu_model = "Unknown"

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
    metrics["cpu_info"] = cpu_info

    # ========== 2. 内存信息（维持原有逻辑） ==========
    mem = psutil.virtual_memory()
    swap_mem =  psutil.swap_memory()
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
    metrics["memory_info"] = memory_info

    # ========== 3. 磁盘信息（维持原有逻辑） ==========
    disk_info = []
    for part in psutil.disk_partitions():
        if not part.mountpoint.startswith(('/proc', '/sys', '/dev')):
            try:
                disk_usage = psutil.disk_usage(part.mountpoint)
                disk_io = psutil.disk_io_counters(perdisk=True)
                disk_info.append({
                    "device": part.device,
                    "mountpoint": part.mountpoint,
                    "total_disk_gb": disk_usage.total / (1024 ** 3),
                    "used_disk_gb": disk_usage.used / (1024 ** 3),
                    "disk_percent": disk_usage.percent,
                    "disk_io": {
                        "read_count": disk_io[part.device.split('/')[-1]].read_count,
                        "write_count": disk_io[part.device.split('/')[-1]].write_count,
                        "read_bytes": disk_io[part.device.split('/')[-1]].read_bytes,
                        "write_bytes": disk_io[part.device.split('/')[-1]].write_bytes
                    }
                })
            except (PermissionError, OSError) as e:
                print(f"磁盘 {part.mountpoint} 采集失败: {e}")
    metrics["disk_info"] = disk_info

    # ========== 4. 网络信息（维持极度简化逻辑） ==========
    net_io = psutil.net_io_counters()
    network_info = {
        "bytes_sent_kb": net_io.bytes_sent / 1024,
        "bytes_recv_kb": net_io.bytes_recv / 1024,
        "packets_sent": net_io.packets_sent,
        "packets_recv": net_io.packets_recv
    }
    metrics["network_info"] = network_info

    # ========== 5. 进程信息（维持原有逻辑） ==========
    process_info = []
    for proc in psutil.process_iter(['pid', 'name', 'username', 'cpu_percent', 'memory_percent']):
        try:
            proc_info = proc.info
            if proc_info['cpu_percent'] > 0 or proc_info['memory_percent'] > 0:
                process_info.append(proc_info)
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess) as e:
            continue
    metrics["process_info"] = process_info

    # ========== 6. 基础信息（维持原有逻辑） ==========
    metrics["timestamp"] = time.time()
    metrics["os_info"] = {
        "os": platform.system(),
        "os_release": platform.release(),
        "boot_time": psutil.boot_time()
    }

    return metrics


def save_metrics_to_mongodb(metrics):
    """将指标存入 MongoDB"""
    try:
        result = collection.insert_one(metrics)
        print(f"✅ 数据已存入 MongoDB，ID: {result.inserted_id}")
        return True
    except Exception as e:
        print(f"❌ 存储失败: {e}")
        return False


def main():
    """主循环：每 1 秒采集一次"""
    print("开始每 1 秒采集系统信息（按 Ctrl+C 停止）")
    try:
        while True:
            start_time = time.time()
            metrics = get_detailed_system_metrics()
            save_metrics_to_mongodb(metrics)
            elapsed = time.time() - start_time
            if elapsed < 1:
                time.sleep(1 - elapsed)
    except KeyboardInterrupt:
        print("\n已停止采集")
    finally:
        client.close()
        print("已关闭 MongoDB 连接")


if __name__ == "__main__":
    main()