
from pymongo import MongoClient
import time
import sys
import pandas as pd
from sklearn.preprocessing import MinMaxScaler



sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf-8', buffering=1)

# MongoDB 连接配置
uri = "mongodb://localhost:27017/"
client = MongoClient(uri)
db = client.testdb  # 数据库名，可自定义
collection = db.stamp_t_normal  # 集合名，可自定义

data=list(collection.find().limit(6000))  # 限制读取前 10000 条数据

print(f"数据集长度: {len(data)}")
def transform_multiple_data(raw_data_list):
    """
    将 raw_data_list 中的多条数据转换为 test.py 中 data 的形式
    :param raw_data_list: List of dictionaries, 每个元素是一个原始数据字典
    :return: 返回转换后的 data 字典
    """
    transformed = {
        "timestamp": [],
        "cpu_perccent": [],
        "ctx_switches": [],
        "interrupts": [],
        "soft_interrupts": [],
        "total_memory": [],
        "available_memory": [],
        "used_memory": [],
        "memory_percent": [],
        "total_swap": [],
        "used_swap": [],
        "swap_percent": [],
        "total_disk0": [],
        "used_disk0": [],
        "disk0_percent": [],
        "total_disk1": [],
        "used_disk1": [],
        "disk1_percent": [],
        "total_disk2": [],
        "used_disk2": [],
        "disk2_percent": [],
        "total_disk3": [],
        "used_disk3": [],
        "disk3_percent": [],
        "total_disk4": [],
        "used_disk4": [],
        "disk4_percent": [],
        "bytes_sent": [],
        "bytes_recv": [],
        "packets_sent": [],
        "packets_recv": [],
        "process0_memory_percent": [],
        "process1_memory_percent": [],
        "process2_memory_percent": [],
        "process3_memory_percent": [],
        "process4_memory_percent": [],
        "process5_memory_percent": [],
        "process6_memory_percent": [],
        "process7_memory_percent": [],
        "process8_memory_percent": [],
        "process9_memory_percent": [],
        "Normal/Attack": []
    }
    num=0
    k=0
    for raw_data in raw_data_list:
        # 提取磁盘信息，最多支持 5 个磁盘
        num+=1
        for i in range(5):
            disk_key = f"total_disk{i}"
            used_key = f"used_disk{i}"
            percent_key = f"disk{i}_percent"
            if i < len(raw_data["disk_info"]):
                transformed[disk_key].append(raw_data["disk_info"][i]["total_disk_gb"])
                transformed[used_key].append(raw_data["disk_info"][i]["used_disk_gb"])
                transformed[percent_key].append(raw_data["disk_info"][i]["disk_percent"])
            else:
                transformed[disk_key].append(0)
                transformed[used_key].append(0)
                transformed[percent_key].append(0)

        # 提取进程内存信息，最多支持 10 个进程
        for i in range(10):
            mem_key = f"process{i}_memory_percent"
            if i < len(raw_data["process_info"]):
                transformed[mem_key].append(raw_data["process_info"][i]["memory_percent"])
            else:
                transformed[mem_key].append(0)

        # 提取 CPU、内存、交换空间、网络等基础信息
        if(num==1):# 只在第一条数据中提取时间戳
            transformed["timestamp"].append(time.strftime("%Y-%m-%d %H:%M:%S", time.localtime()))
            k=time.time()
        else:
            k+=1
            transformed["timestamp"].append(time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(k)))
        transformed["cpu_perccent"].append(raw_data["cpu_info"]["cpu_percent"])
        transformed["ctx_switches"].append(raw_data["cpu_info"]["cpu_stats"]["ctx_switches"])
        transformed["interrupts"].append(raw_data["cpu_info"]["cpu_stats"]["interrupts"])
        transformed["soft_interrupts"].append(raw_data["cpu_info"]["cpu_stats"]["soft_interrupts"])
        transformed["total_memory"].append(raw_data["memory_info"]["total_memory_gb"])
        transformed["available_memory"].append(raw_data["memory_info"]["available_memory_gb"])
        transformed["used_memory"].append(raw_data["memory_info"]["used_memory_gb"])
        transformed["memory_percent"].append(raw_data["memory_info"]["memory_percent"])
        transformed["total_swap"].append(raw_data["memory_info"]["swap_memory_info"]["total_smemory_gb"])
        transformed["used_swap"].append(raw_data["memory_info"]["swap_memory_info"]["used_smemory_gb"])
        transformed["swap_percent"].append(raw_data["memory_info"]["swap_memory_info"]["smemory_percent"])
        transformed["bytes_sent"].append(raw_data["network_info"]["bytes_sent_kb"])
        transformed["bytes_recv"].append(raw_data["network_info"]["bytes_recv_kb"])
        transformed["packets_sent"].append(raw_data["network_info"]["packets_sent"])
        transformed["packets_recv"].append(raw_data["network_info"]["packets_recv"])

        # labole 假设为固定值 1
        if(raw_data["t"]=="Normal"):
            transformed["Normal/Attack"].append("Normal")
        else:
            transformed["Normal/Attack"].append("Attack")

    return transformed
'''
trans_data=transform_multiple_data(data)

df = pd.DataFrame(trans_data)

# 指定CSV文件路径
csv_file_path = "C:\\Users\\23512\\Desktop\\DATA\\stamp_normal.csv"

# 写入CSV文件
df.to_csv(csv_file_path, index=False, encoding='utf-8-sig')
print(f"CSV文件已保存至：{csv_file_path}")'''
def transform_multiple_data_with_normalization(raw_data_list):
    """
    将 raw_data_list 中的多条数据转换为 test.py 中 data 的形式，并进行 Min-Max 归一化
    :param raw_data_list: List of dictionaries, 每个元素是一个原始数据字典
    :return: 返回归一化后的 data 字典
    """
    transformed = {
        "cpu_perccent": [],
        "ctx_switches": [],
        "interrupts": [],
        "soft_interrupts": [],
        "total_memory": [],
        "available_memory": [],
        "used_memory": [],
        "memory_percent": [],
        "total_swap": [],
        "used_swap": [],
        "swap_percent": [],
        "total_disk0": [],
        "used_disk0": [],
        "disk0_percent": [],
        "total_disk1": [],
        "used_disk1": [],
        "disk1_percent": [],
        "total_disk2": [],
        "used_disk2": [],
        "disk2_percent": [],
        "total_disk3": [],
        "used_disk3": [],
        "disk3_percent": [],
        "total_disk4": [],
        "used_disk4": [],
        "disk4_percent": [],
        "bytes_sent": [],
        "bytes_recv": [],
        "packets_sent": [],
        "packets_recv": [],
        "process0_memory_percent": [],
        "process1_memory_percent": [],
        "process2_memory_percent": [],
        "process3_memory_percent": [],
        "process4_memory_percent": [],
        "process5_memory_percent": [],
        "process6_memory_percent": [],
        "process7_memory_percent": [],
        "process8_memory_percent": [],
        "process9_memory_percent": [],
        "labole": 1
    }

    for raw_data in raw_data_list:
        # 提取磁盘信息，最多支持 5 个磁盘
        for i in range(5):
            disk_key = f"total_disk{i}"
            used_key = f"used_disk{i}"
            percent_key = f"disk{i}_percent"
            if i < len(raw_data["disk_info"]):
                transformed[disk_key].append(raw_data["disk_info"][i]["total_disk_gb"])
                transformed[used_key].append(raw_data["disk_info"][i]["used_disk_gb"])
                transformed[percent_key].append(raw_data["disk_info"][i]["disk_percent"])
            else:
                transformed[disk_key].append(0)
                transformed[used_key].append(0)
                transformed[percent_key].append(0)

        # 提取进程内存信息，最多支持 10 个进程
        for i in range(10):
            mem_key = f"process{i}_memory_percent"
            if i < len(raw_data["process_info"]):
                transformed[mem_key].append(raw_data["process_info"][i]["memory_percent"])
            else:
                transformed[mem_key].append(0)

        # 提取 CPU、内存、交换空间、网络等基础信息
        transformed["cpu_perccent"].append(raw_data["cpu_info"]["cpu_percent"])
        transformed["ctx_switches"].append(raw_data["cpu_info"]["cpu_stats"]["ctx_switches"])
        transformed["interrupts"].append(raw_data["cpu_info"]["cpu_stats"]["interrupts"])
        transformed["soft_interrupts"].append(raw_data["cpu_info"]["cpu_stats"]["soft_interrupts"])
        transformed["total_memory"].append(raw_data["memory_info"]["total_memory_gb"])
        transformed["available_memory"].append(raw_data["memory_info"]["available_memory_gb"])
        transformed["used_memory"].append(raw_data["memory_info"]["used_memory_gb"])
        transformed["memory_percent"].append(raw_data["memory_info"]["memory_percent"])
        transformed["total_swap"].append(raw_data["memory_info"]["swap_memory_info"]["total_smemory_gb"])
        transformed["used_swap"].append(raw_data["memory_info"]["swap_memory_info"]["used_smemory_gb"])
        transformed["swap_percent"].append(raw_data["memory_info"]["swap_memory_info"]["smemory_percent"])
        transformed["bytes_sent"].append(raw_data["network_info"]["bytes_sent_kb"])
        transformed["bytes_recv"].append(raw_data["network_info"]["bytes_recv_kb"])
        transformed["packets_sent"].append(raw_data["network_info"]["packets_sent"])
        transformed["packets_recv"].append(raw_data["network_info"]["packets_recv"])

        # labole 假设为固定值 
        transformed["labole"]=0

    # 转换为 DataFrame 并进行归一化
    df = pd.DataFrame(transformed)

    # 只选择数值型列进行归一化
    numeric_cols = df.columns.drop("labole")
    scaler = MinMaxScaler()
    df[numeric_cols] = scaler.fit_transform(df[numeric_cols])

    # 确保 labole 列保持原样
    return df

if __name__ == '__main__':
    data=list(collection.find())

    df = pd.DataFrame(transform_multiple_data(data))
    print(df)
    # 指定CSV文件路径
    csv_file_path = "C:\\Users\\23512\\Desktop\\DATA\\stamp_test.csv"

    # 写入CSV文件
    df.to_csv(csv_file_path, index=False, encoding='utf-8-sig')

    print(f"CSV文件已保存至：{csv_file_path}")