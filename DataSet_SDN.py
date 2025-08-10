from pymongo import MongoClient
import time
import sys
import random
sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf-8', buffering=1)


error=[
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

# MongoDB 连接配置
uri = "mongodb://localhost:27017/"
client = MongoClient(uri)
db = client.testdb  # 数据库名，可自定义
collection = db.stamp_normal  # 集合名，可自定义

data=list(collection.find())  # 限制读取前 10000 条数据

print(f"数据集长度: {len(data)}")


def data_transform(data):
    num=1
    edata = []
    for i in data:
        if(num==1):
            num+=1
            k=time.time()
        else:
            k+=1
        j = {
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(k)),
            "cpu_perccent": i["cpu_info"]["cpu_percent"],
            "ctx_switches": i["cpu_info"]["cpu_stats"]["ctx_switches"],
            "interrupts": i["cpu_info"]["cpu_stats"]["interrupts"],
            "soft_interrupts": i["cpu_info"]["cpu_stats"]["soft_interrupts"],
            "total_memory": i["memory_info"]["total_memory_gb"],
            "available_memory": i["memory_info"]["available_memory_gb"],
            "used_memory": i["memory_info"]["used_memory_gb"],
            "memory_percent": i["memory_info"]["memory_percent"],
            "total_swap": i["memory_info"]["swap_memory_info"]["total_smemory_gb"],
            "used_swap": i["memory_info"]["swap_memory_info"]["used_smemory_gb"],
            "swap_percent": i["memory_info"]["swap_memory_info"]["smemory_percent"],
            # 处理最多5个磁盘
            "total_disk0": i["disk_info"][0]["total_disk_gb"] if len(i["disk_info"]) > 0 else 0,
            "used_disk0": i["disk_info"][0]["used_disk_gb"] if len(i["disk_info"]) > 0 else 0,
            "disk0_percent": i["disk_info"][0]["disk_percent"] if len(i["disk_info"]) > 0 else 0,
            "total_disk1": i["disk_info"][1]["total_disk_gb"] if len(i["disk_info"]) > 1 else 0,
            "used_disk1": i["disk_info"][1]["used_disk_gb"] if len(i["disk_info"]) > 1 else 0,
            "disk1_percent": i["disk_info"][1]["disk_percent"] if len(i["disk_info"]) > 1 else 0,
            "total_disk2": i["disk_info"][2]["total_disk_gb"] if len(i["disk_info"]) > 2 else 0,
            "used_disk2": i["disk_info"][2]["used_disk_gb"] if len(i["disk_info"]) > 2 else 0,
            "disk2_percent": i["disk_info"][2]["disk_percent"] if len(i["disk_info"]) > 2 else 0,
            "total_disk3": i["disk_info"][3]["total_disk_gb"] if len(i["disk_info"]) > 3 else 0,
            "used_disk3": i["disk_info"][3]["used_disk_gb"] if len(i["disk_info"]) > 3 else 0,
            "disk3_percent": i["disk_info"][3]["disk_percent"] if len(i["disk_info"]) > 3 else 0,
            "total_disk4": i["disk_info"][4]["total_disk_gb"] if len(i["disk_info"]) > 4 else 0,
            "used_disk4": i["disk_info"][4]["used_disk_gb"] if len(i["disk_info"]) > 4 else 0,
            "disk4_percent": i["disk_info"][4]["disk_percent"] if len(i["disk_info"]) > 4 else 0,
            "bytes_sent": i["network_info"]["bytes_sent_kb"],
            "bytes_recv": i["network_info"]["bytes_recv_kb"],
            "packets_sent": i["network_info"]["packets_sent"],
            "packets_recv": i["network_info"]["packets_recv"],
            # 处理最多10个进程
            "process0_memory_percent": i["process_info"][0]["memory_percent"] if len(i["process_info"]) > 0 else 0,
            "process1_memory_percent": i["process_info"][1]["memory_percent"] if len(i["process_info"]) > 1 else 0,
            "process2_memory_percent": i["process_info"][2]["memory_percent"] if len(i["process_info"]) > 2 else 0,
            "process3_memory_percent": i["process_info"][3]["memory_percent"] if len(i["process_info"]) > 3 else 0,
            "process4_memory_percent": i["process_info"][4]["memory_percent"] if len(i["process_info"]) > 4 else 0,
            "process5_memory_percent": i["process_info"][5]["memory_percent"] if len(i["process_info"]) > 5 else 0,
            "process6_memory_percent": i["process_info"][6]["memory_percent"] if len(i["process_info"]) > 6 else 0,
            "process7_memory_percent": i["process_info"][7]["memory_percent"] if len(i["process_info"]) > 7 else 0,
            "process8_memory_percent": i["process_info"][8]["memory_percent"] if len(i["process_info"]) > 8 else 0,
            "process9_memory_percent": i["process_info"][9]["memory_percent"] if len(i["process_info"]) > 9 else 0,
        }
        edata.append(j)
    return edata

def error_t0(data:list):
    """注入负载-进程矛盾异常"""
    for i in range(len(data)):
        data[i]["cpu_info"]["cpu_percent"] = random.uniform(80,100).__round__(2)
    
        total_process_cpu = 0.0

        num_processes = len(data[i]["process_info"])
        num_anomalous_processes = max(1, int(num_processes * 0.1))

        anomalous_indices = random.sample(range(num_processes), num_anomalous_processes)

        for j in range(len(data[i]["process_info"])):
            if j in anomalous_indices:
                data[i]["process_info"][j]["cpu_percent"] = random.uniform(0,2)
                total_process_cpu += data[i]["process_info"][j]["cpu_percent"]
            else:
                data[i]["process_info"][j]["cpu_percent"] = 0

        if total_process_cpu >= 20.0:
        # 如果总和超过20%，按比例缩减
            reduction_factor = 20.0/total_process_cpu
            total_process_cpu=0
            for j in anomalous_indices:
                data[i]["process_info"][j]["cpu_percent"] *= reduction_factor
                total_process_cpu += data[i]["process_info"][j]["cpu_percent"]
    return data
def error_t1(data:list):
    """注入CPU中断风暴消耗内存异常"""
    for i in range(len(data)):
        data[i]["cpu_info"]["cpu_percent"]=random.uniform(85,100)
        data[i]["memory_info"]["memory_percent"]=random.uniform(90,100)
    return data
def error_t2(data:list):
    """注入流量激增异常bytes_recv_kb和bytes_sent_kb激增"""
    for i in range(len(data)):
        bandwidth_limit = random.randint(50000,100000)
        # 确保突破带宽上限
        data[i]["network_info"]["bytes_recv_kb"] += random.randint(50000,bandwidth_limit)
        data[i]["network_info"]["bytes_sent_kb"] += random.randint(50000,bandwidth_limit)
        # 保留两位小数
        data[i]["network_info"]["bytes_recv_kb"] = round(data[i]["network_info"]["bytes_recv_kb"], 2)
        data[i]["network_info"]["bytes_sent_kb"] = round(data[i]["network_info"]["bytes_sent_kb"], 2)
    return data

def error_t3(data:list):
    """注入网络断开异常：bytes_recv_kb和bytes_sent_kb长时间无变化"""
    # 保存原始值
    original_recv = data[0]["network_info"]["bytes_recv_kb"]
    original_sent = data[0]["network_info"]["bytes_sent_kb"]
    for i in range(len(data)):
        # 将流量值固定为原始值，模拟无变化
        data[i]["network_info"]["bytes_recv_kb"] = original_recv
        data[i]["network_info"]["bytes_sent_kb"] = original_sent
        
        # 为了明显区分，可小幅波动但整体保持不变
        if random.random() > 0.8:  # 20%概率小幅波动
            data[i]["network_info"]["bytes_recv_kb"] = round(original_recv + random.uniform(-1, 1), 2)
            data[i]["network_info"]["bytes_sent_kb"] = round(original_sent + random.uniform(-1, 1), 2)
    return data

def error_t4(data:list):
    for i in range(len(data)):
        process_list = data[i]["process_info"]
        num_processes = len(process_list)
        
        if num_processes == 0:
            continue
            
        # 随机选择一个进程作为CPU杀手
        killer_process_idx = random.randint(0, num_processes - 1)
        killer_process = process_list[killer_process_idx]
        
        # 设置CPU使用率 > 50%
        killer_process["cpu_percent"] = random.uniform(50, 100).__round__(2)
        
        # 其他进程保持低CPU使用率
        for j in range(num_processes):
            if j != killer_process_idx:
                process_list[j]["cpu_percent"] = random.uniform(0, 10).__round__(2)
    return data

def error_t5(data:list):
    """注入进程内存占用异常：进程memory_percent突然翻倍或出现高内存占用进程"""
    for i in range(len(data)):
        process_list = data[i]["process_info"]
        num_processes = len(process_list)
        
        if num_processes == 0:
            continue
            
        # 随机选择10%的进程制造异常
        num_anomalous_processes = max(1, int(num_processes * 0.1))
        anomalous_indices = random.sample(range(num_processes), num_anomalous_processes)
        
        for j in anomalous_indices:
            process = process_list[j]
            original_mem = process["memory_percent"]
            
            # 情况1：内存占用翻倍（如果原始值较低）
            if original_mem < 10:
                new_mem = min(original_mem * 2, 30)  # 限制上限为30%
            # 情况2：直接设置为高内存占用（如果原始值较高）
            else:
                new_mem = random.uniform(20, 50).__round__(2)  # 20%-50%之间
                
            process["memory_percent"] = new_mem
            
        # 确保至少有一个进程内存占用 > 20%
        has_high_mem = any(p["memory_percent"] > 20 for p in process_list)
        if not has_high_mem and num_processes > 0:
            # 强制设置一个进程为高内存占用
            high_mem_idx = random.randint(0, num_processes - 1)
            process_list[high_mem_idx]["memory_percent"] = random.uniform(20, 50).__round__(2)
    return data

def error_t6(data:list):
    """注入内存泄漏异常：used_memory_gb持续增长，available_memory_gb降至0.2以下，memory_percent超过95%"""
    for i in range(len(data)):
        mem_info = data[i]["memory_info"]
        
        # 计算原始可用内存
        original_used = mem_info["used_memory_gb"]
        original_total = mem_info["total_memory_gb"]
        
        # 设置可用内存 < 0.2GB
        mem_info["available_memory_gb"] = random.uniform(0, 0.2).__round__(2)
        
        # 设置内存使用率 > 95%
        mem_info["memory_percent"] = random.uniform(95, 100).__round__(2)
        
        # 计算并设置已用内存
        mem_info["used_memory_gb"] = (original_total * mem_info["memory_percent"] / 100).__round__(2)
        
        # 确保已用内存增长
        if mem_info["used_memory_gb"] <= original_used:
            mem_info["used_memory_gb"] = (original_used * random.uniform(1.5, 2)).__round__(2)
            mem_info["memory_percent"] = (mem_info["used_memory_gb"] / original_total * 100).__round__(2)
            mem_info["available_memory_gb"] = (original_total - mem_info["used_memory_gb"]).__round__(2)
    return data

def error_t7(data:list):
    """注入swap过度使用异常：swap_memory_gb显著增加"""
    for i in range(len(data)):
        mem_info = data[i]["memory_info"]
        
        swap_info = mem_info["swap_memory_info"]
        total_swap = swap_info["total_smemory_gb"]
        
        # 原始swap使用情况
        original_used = swap_info["used_smemory_gb"]
        
        # 计算显著增加的swap使用量
        increase = max(random.uniform(0.4,0.6) * total_swap, random.uniform(total_swap/4, total_swap).__round__(2))
        new_used = min(original_used + increase, total_swap)  # 确保不超过总swap大小
        
        # 更新swap使用量
        swap_info["used_smemory_gb"] = round(new_used, 2)
        swap_info["free_smemory_gb"] = round(total_swap - new_used, 2)
        swap_info["smemory_percent"] = round((new_used / total_swap * 100), 2)
        
        # 更新内存总使用率（包含swap）
        original_used_memory = mem_info["used_memory_gb"]
        mem_info["used_memory_gb"] = round(original_used_memory + (new_used - original_used), 2)
        mem_info["memory_percent"] = round(
            (mem_info["used_memory_gb"] / mem_info["total_memory_gb"] * 100), 2
        )
    return data

def error_t8(data:list):
    """注入磁盘空间不足异常：disk_percent > 90%"""
    for i in range(len(data)):
        disk_info_list = data[i]["disk_info"]
        
        for disk_info in disk_info_list:
            # 只处理可挂载的磁盘分区
            if "mountpoint" in disk_info and disk_info["mountpoint"] != "/dev/sr0":
                # 设置磁盘使用率 > 90%
                disk_info["disk_percent"] = random.uniform(90, 100)
                # 计算并更新已用空间
                disk_info["used_disk_gb"] = (disk_info["total_disk_gb"] * disk_info["disk_percent"] / 100).__round__(2)
    return data

def error_t9(data:list):
    """注入磁盘IO故障异常：disk_io.read_bytes和disk_io.write_bytes一段时间内无变化"""
    for i in range(len(data)):
        if i == 0: continue
        disk_info_list = data[i]["disk_info"]
        last_disk_info = data[i-1]["disk_info"]
        for j in range(len(disk_info_list)):
            disk_io = disk_info_list[j]["disk_io"]

            # 保存原始值，模拟无变化
            disk_io["read_count"] = last_disk_info[j]["disk_io"]["read_count"]
            disk_io["write_count"] = last_disk_info[j]["disk_io"]["write_count"]
            disk_io["read_bytes"] = last_disk_info[j]["disk_io"]["read_bytes"]
            disk_io["write_bytes"] = last_disk_info[j]["disk_io"]["write_bytes"]
                
            # 为了明显区分，添加小幅波动但整体保持不变
            if random.random() > 0.8:  # 20%概率小幅波动
                disk_io["write_bytes"] = disk_io["write_bytes"] + random.randint(0, 100)
                disk_io["read_count"] = disk_io["read_count"] + random.randint(0, 10)
                disk_io["write_count"] = disk_io["write_count"] + random.randint(0, 10)
    return data

def train_dataset_builder(data:list):
    for i in range(0, 10):
        mdata=[]
        for j in range(0, 512):
            b=random.randint(0,9987)
            edata=data[b:b+12]
            e=random.randint(0,11)
            if i == 0:
                E=error_t0([edata[e]])
            elif i == 1:
                E=error_t1([edata[e]])
            elif i == 2:
                E=error_t2([edata[e]])
            elif i == 3:
                E=error_t3([edata[e]])
            elif i == 4:
                E=error_t4([edata[e]])
            elif i == 5:
                E=error_t5([edata[e]])
            elif i == 6:
                E=error_t6([edata[e]])
            elif i == 7:
                E=error_t7([edata[e]])
            elif i == 8:
                E=error_t8([edata[e]])
            elif i == 9:
                E=error_t9([edata[e]])
            edata[e]=E[0]
            edata=data_transform(edata)
            edata.append([e])
            it={f"{j}":edata}
            mdata.append(it)
        db[error[i]].insert_many(mdata)
        print(f"已生成{i}类异常数据，共{len(mdata)}条")
        

def train_ndataset_builder(data:list):
    mdata=[]
    for i in range(0, 512):
        b=random.randint(0,9987)
        edata=data_transform(data[b:b+12])
        edata.append([])
        it={f"{i}":edata}
        mdata.append(it)
    db["stamp_abnormal"].insert_many(mdata)
    print(f"已生成数据，共{len(mdata)}条")

if __name__ == '__main__':
    train_ndataset_builder(data)