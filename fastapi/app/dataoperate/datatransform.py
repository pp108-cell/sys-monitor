import sys
import os
import time
import pandas as pd
from typing import List, Optional, Dict, Any

#自己的路径
sys.path.append(os.path.abspath("./fastapi"))
from app.crud.SystemInfoCrud import SystemInfoCrud

class DataTransform:
    def __init__(self):
        self.crud = SystemInfoCrud()

    async def data_transform2(self, data: Dict[str, Any]) -> pd.DataFrame:
        transformed = {
            "timestamp": data["timestamp"],
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
        }
        for i in range(5):
            disk_key = f"total_disk{i}"
            used_key = f"used_disk{i}"
            percent_key = f"disk{i}_percent"
            if i < len(data["disk_info"]):
                transformed[disk_key].append(data["disk_info"][i]["total_disk_gb"])
                transformed[used_key].append(data["disk_info"][i]["used_disk_gb"])
                transformed[percent_key].append(data["disk_info"][i]["disk_percent"])
            else:
                transformed[disk_key].append(0)
                transformed[used_key].append(0)
                transformed[percent_key].append(0)
        
        for i in range(10):
            mem_key = f"process{i}_memory_percent"
            if i < len(data["process_info"]):
                transformed[mem_key].append(data["process_info"][i]["memory_percent"])
            else:
                transformed[mem_key].append(0)

        transformed["cpu_perccent"].append(data["cpu_info"]["cpu_percent"])
        transformed["ctx_switches"].append(data["cpu_info"]["cpu_stats"]["ctx_switches"])
        transformed["interrupts"].append(data["cpu_info"]["cpu_stats"]["interrupts"])
        transformed["soft_interrupts"].append(data["cpu_info"]["cpu_stats"]["soft_interrupts"])
        transformed["total_memory"].append(data["memory_info"]["total_memory_gb"])
        transformed["available_memory"].append(data["memory_info"]["available_memory_gb"])
        transformed["used_memory"].append(data["memory_info"]["used_memory_gb"])
        transformed["memory_percent"].append(data["memory_info"]["memory_percent"])
        transformed["total_swap"].append(data["memory_info"]["swap_memory_info"]["total_smemory_gb"])
        transformed["used_swap"].append(data["memory_info"]["swap_memory_info"]["used_smemory_gb"])
        transformed["swap_percent"].append(data["memory_info"]["swap_memory_info"]["smemory_percent"])
        transformed["bytes_sent"].append(data["network_info"]["bytes_sent_kb"])
        transformed["bytes_recv"].append(data["network_info"]["bytes_recv_kb"])
        transformed["packets_sent"].append(data["network_info"]["packets_sent"])
        transformed["packets_recv"].append(data["network_info"]["packets_recv"])

        df = pd.DataFrame(transformed)

        return df
    
    async def data_transform10(self, data: Dict[str, Any]):
        pass
    async def data_model_operate(self,data:Dict[str, Any]):
        '''数据模型操作'''
        #transformdata = await self.data_transform2(data)
        #csv_file_path = "./te/test.csv"
        #transformdata.to_csv(csv_file_path, index=False, encoding='utf-8-sig')
        '''
        ......
        '''
        import random
        if random.random() <= 0.02:
            data["anomaly_id"] = random.randint(1,10)
            data["risk_score"] = 0.3+0.7*random.random()
        return data
        
if __name__ == "__main__":
    #tranform=DataTransform()
    #result = asyncio.run()
    #print(result)
    pass

    