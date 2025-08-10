
'''
import pymongo

client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["SH13"]
collection = db["system_info"]

a="2025-07-10 15:47:13"

b=list(collection.find())

date = []
for i in b:
    date.append(i["timestamp"].split(" ")[0])
date_info = list(set(date))

data= []
for i in date_info:
    data.append({"date": i, "system_info": [j for j in b if j["timestamp"].split(" ")[0] == i]})
'''
'''
import subprocess

# 指定输出文件路径
output_path = r"D:\ZMXY\mygithub\Tiaozhanbei-SH-13\requiremnets.txt"

# 使用pip freeze命令生成requirements.txt
result = subprocess.run(['pip', 'freeze'], stdout=subprocess.PIPE, text=True)

# 将结果写入文件
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(result.stdout)

print(f"所有包已成功写入到 {output_path}")'''
from fastapi import requests
import pymongo
