import sys
import os
import json
from typing import Dict, Any
from fastapi import UploadFile
import time
# 添加项目路径
sys.path.append(os.path.abspath("./fastapi"))
from app.serve.SystemInfoServe import SystemInfoServe
from app.serve.CauseReportServe import CauseReportServe
from app.serve.SolutionServe import SolutionServe
from app.resolve.Resolve import Resolve

system_info_serve = SystemInfoServe()
cause_report_serve = CauseReportServe()
solution_serve = SolutionServe()
resolve_serve = Resolve()

class LLMServe:
    def __init__(self):
        pass
    async def useLLM(self,res: str):
        if res=="3":
            data=await system_info_serve.get_system_info()
            myres=f"当前时间: {data['timestamp']},CPU利用率：{data['cpu_info']['cpu_percent']}%,内存利用率：{data['memory_info']['memory_percent']}%\n"
            myres+=f"磁盘数量：{len(data['disk_info'])},进程数：{len(data['process_info'])}\n"
            tail="以上为系统状态的简要信息，详细信息请查看日志。\n"
            if(data["anomaly_id"]==0):
                myres=myres+"当前系统状态正常。\n"
            else:
                myres=myres+"当前系统状态异常，请查看日志。\n"
            myres=myres+tail
            return {"type":3,"content":myres}
        elif res=="4":
            date=time.strftime("%Y-%m-%d", time.localtime())
            await cause_report_serve.generate_report_from_systeminfo()
            data=await cause_report_serve.generate_summary_report_by_date(date)
            myres=f"{date}当天异常检测报告已生成,报告简要内容如下:\n"
            if data["errCode"]==1:
                myres=myres+f"当天系统状态正常，没有异常\n"
            else:
                data=data["data"]
                myres=myres+f"当天异常日志数目：{data['anomaly_count']},各个异常简要内容如下:\n"
                for i in range(len(data['anomalies'])):
                    myres=myres+f"第{i+1}个异常\n"
                    myres=myres+f"异常发生时间：{data['anomalies'][i]['original_timestamp']}\n"
                    myres=myres+f"异常类型：{data['anomalies'][i]['data']['anomalies'][0]['anomaly_type']}\n"
                    myres=myres+f"异常等级：{data['anomalies'][i]['data']['anomalies'][0]['risk_level']}\n"
            myres+=f"以上为{date}当天异常检测报告的简要信息，详细信息请在异常检测部分查看具体报告。\n"
            return {"type":4,"content":myres}
        elif res=="5":
            date=time.strftime("%Y-%m-%d", time.localtime())
            r_id=await cause_report_serve.get_report_id(date)
            if r_id==-1:
                return {"type":5,"content":"暂无当日异常检测报告，请先生成检测报告。"}
            else:
                data=await SolutionServe().generate_solution_for_report(r_id)
                myres=f"{date}当天异常修复报告已生成,报告简要内容如下:\n"
                if data["errCode"]==0:
                    data=data["data"]
                    myres+=f"当天异常修复建议数目：{len(data['solutions'])},各个异常修复建议简要内容如下:\n"
                    for i in range(len(data["solutions"])):
                        myres+=f"第{i+1}个异常修复建议:\n"
                        myres+=f"异常原因：{data['solutions'][i]['solution_description']}\n"
                        myres+=f"修复建议：\n"
                        for j in data["solutions"][i]['implementation_steps']:
                            myres+=f"{j}\n"
                else:
                    myres+=f"{data['message']}\n"
                myres+=f"以上为{date}当天异常修复报告的简要信息，详细信息请在异常修复部分查看具体报告。\n"
                return {"type":5,"content":myres}
        elif res=="6":
            edate,data=await system_info_serve.get_nearly_system_info()
            myres=f"近7天异常信息简要内容如下:\n"
            if len(edate)==0:
                myres+="--------------------------\n"
                myres+="近7天系统状态正常，没有异常。\n"
                myres+="--------------------------\n"
                return {"type":6,"content":myres}
            else:
                myres+="异常发生时间："
                for i in edate: myres+=i+"、"
                myres+=f'\n'
                for i in data:
                    myres+=f"{i['date']}当天的异常信息如下：\n"
                    for j in i['system_info']:
                        myres+=f"具体时间：{j['error_time']},异常类型：{j['error_type']},异常等级：{j['error_level']}\n"
            myres+="以上为近7天异常信息简要内容,详细信息请查看日志\n"
            return {"type":6,"content":myres}
        elif res=="7":
            myres="开始进行系统全面检测\n"
            data=await system_info_serve.get_system_info()
            myres+=f"当前时间: {data['timestamp']},CPU利用率：{data['cpu_info']['cpu_percent']}%,内存利用率：{data['memory_info']['memory_percent']}\n"
            myres+=f"磁盘数量：{len(data['disk_info'])},进程数：{len(data['process_info'])}\n"
            if(data["anomaly_id"]==0):
                myres+="当前系统状态正常。\n"
                myres+="系统自动检测结束。\n"
                return {"type":7,"content":myres}
            else:
                e_id=data["anomaly_id"]
                myres+="当前系统异常,开始生成当天检测报告：\n"
                date=time.strftime("%Y-%m-%d", time.localtime())
                await cause_report_serve.generate_report_from_systeminfo()
                rdata=await cause_report_serve.generate_summary_report_by_date(date)
                rdata=rdata["data"]
                r_id=rdata['id']
                myres=myres+f"当天异常日志数目：{rdata['anomaly_count']},各个异常简要内容如下:\n"
                for i in range(len(rdata['anomalies'])):
                    myres=myres+f"第{i+1}个异常\n"
                    myres=myres+f"异常发生时间：{rdata['anomalies'][i]['original_timestamp']}\n"
                    myres=myres+f"异常类型：{rdata['anomalies'][i]['data']['anomalies'][0]['anomaly_type']}\n"
                    myres=myres+f"异常等级：{rdata['anomalies'][i]['data']['anomalies'][0]['risk_level']}\n"
                myres+="检测报告生成结束,开始生成修复报告：\n"
                if r_id==-1: return {"type":7,"content":myres+"修复报告生成失败(r_id)\n"}
                sdata=await SolutionServe().generate_solution_for_report(r_id)
                if sdata["errCode"]==0:
                    sdata=sdata["data"]
                    myres+=f"当天异常修复建议数目：{len(sdata['solutions'])},各个异常修复建议简要内容如下:\n"
                    for i in range(len(sdata["solutions"])):
                        myres+=f"第{i+1}个异常修复建议:\n"
                        myres+=f"异常原因：{sdata['solutions'][i]['solution_description']}\n"
                        myres+=f"修复建议：\n"
                        for j in sdata["solutions"][i]['implementation_steps']:
                            myres+=f"{j}\n"
                else:
                    myres+=f"{sdata['message']}\n"
                myres+="修复报告结束,开始尝试修复异常\n"
                myres+=f"{await resolve_serve.test(e_id)}\n"
                myres+="系统全面检测完成\n"
                return {"type":7,"content":myres}
        else:
            return "None"
        
