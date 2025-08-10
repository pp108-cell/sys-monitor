from doctest import testsource
import sys
import os
import time
import uuid
from typing import Dict, Any, List
from fastapi import UploadFile
from app.crud.SolutionCrud import SolutionCrud
from app.crud.CauseReportCrud import CauseReportCrud
import logging

# 添加项目路径
sys.path.append(os.path.abspath("./fastapi"))

class SolutionServe:
    def __init__(self):
        self.solution_crud = SolutionCrud()
        self.report_crud = CauseReportCrud()

    def generate_solution_by_anomaly_type(self, anomaly_type: str, anomaly: Dict[str, Any]) -> Dict[str, Any]:
        """
        根据异常名称生成解决方案
        :param anomaly_type: 异常类型
        :return: 解决方案数据
        """
        # 根据不同异常名称生成相应的解决方案
        if anomaly_type == "负载-进程矛盾":
            # 获取CPU相关指标数据
            system_cpu = anomaly.get('metrics', {}).get('system_cpu_usage', '未知')
            process_cpu = anomaly.get('metrics', {}).get('process_cpu_sum', '未知')
            cpu_diff = anomaly.get('metrics', {}).get('cpu_diff_percent', '未知')
            kernel_threads = anomaly.get('related_processes', {}).get('kernel_threads', [])
            
            # 动态生成解决方案内容
            description = f"系统CPU使用率({system_cpu}%)与进程CPU总和({process_cpu}%)差异过大({cpu_diff}%)，可能存在内核消耗或中断风暴问题"
            
            return {
                "anomaly_type": anomaly_type,
                "solution_description": description,
                "implementation_steps": [
                    f"1. 实时监控CPU使用: top -d 1 查看系统CPU与进程CPU差异",
                    "2. 分析中断情况: watch -n 1 'cat /proc/interrupts | sort -nr | head -10' 识别异常中断源",
                    f"3. 检查内核线程: ps -eo pid,ppid,cmd,%cpu --sort=-%cpu | grep -E 'kworker|kswapd|ksoftirqd' | head -5",
                    "4. 配置中断亲和性: sudo vi /proc/irq/{anomaly.get('interrupt_id', '')}/smp_affinity 设置CPU掩码",
                    "5. 收集内核性能数据: perf top -g 5 记录CPU热点函数"
                ],
                "recommended_actions": [
                    f"{'紧急处理: 临时屏蔽异常中断' if cpu_diff != '未知' and float(cpu_diff.replace('%', '')) > 30 else '优化处理: 调整内核参数'}: echo {anomaly.get('interrupt_id', '')} > /proc/irq/{anomaly.get('interrupt_id', '')}/smp_affinity_list",
                    "更新内核版本: sudo apt update && sudo apt install linux-generic-hwe-20.04",
                    "检查硬件兼容性: lspci | grep -i 'network|storage' 确认驱动版本",
                    "实施CPU性能监控: 部署Prometheus+Grafana监控CPU差异趋势"
                ],
                "validity_period": "长期有效",
                "diagnostic_data": {
                    "cpu_usage_discrepancy": cpu_diff,
                    "potential_causes": [
                        "硬件中断风暴", "内核线程异常", "驱动程序缺陷", "CPU调度策略不合理"
                    ],
                    "kernel_threads": kernel_threads[:3]  # 最多显示3个内核线程
                }
            }
        elif anomaly_type == "CPU中断风暴消耗内存":
            # 获取中断和内存相关数据
            interrupt_source = anomaly.get('interrupt_info', {}).get('source', '未知')
            interrupt_count = anomaly.get('interrupt_info', {}).get('count', '未知')
            memory_impact = anomaly.get('metrics', {}).get('memory_impact', '未知')
            device_info = anomaly.get('related_device', '未知')
            
            # 根据中断频率判断严重程度
            is_severe = int(interrupt_count) > 100000 if interrupt_count != '未知' else False
            
            return {
                "anomaly_type": anomaly_type,
                "solution_description": f"{interrupt_source}中断风暴({interrupt_count}次/秒)导致内存异常消耗({memory_impact}/分钟)，源头可能为{device_info}",
                "implementation_steps": [
                    "1. 实时监控中断: watch -n 0.1 'cat /proc/interrupts | grep -v 0:'",
                    f"2. 定位中断设备: grep {anomaly.get('interrupt_id', '')} /proc/interrupts && lspci | grep -i {device_info.lower()}",
                    "3. 检查驱动版本: modinfo {anomaly.get('driver_module', 'unknown')} | grep version",
                    (
                        "4. " +
                        (
                            f"紧急措施: 临时禁用设备: echo 0 > /sys/bus/pci/devices/{anomaly.get('pci_address', '')}/enable"
                            if is_severe
                            else
                            f"常规措施: 重新加载驱动: sudo rmmod {anomaly.get('driver_module', 'unknown')} && sudo modprobe {anomaly.get('driver_module', 'unknown')}"
                        )
                    ),
                    "5. 收集诊断数据: sudo ethtool -S {anomaly.get('interface', 'eth0')} > /tmp/nic_stats.txt"
                ],
                "recommended_actions": [
                    f"更新{device_info}驱动至最新版本: sudo apt install {anomaly.get('driver_package', 'unknown')}",
                    "配置中断亲和性: sudo irqbalance --banirq={anomaly.get('interrupt_id', '')}",
                    "启用中断节流: echo {5000 if is_severe else 10000} > /proc/sys/kernel/irq_{anomaly.get('interrupt_id', '')}_thresh",
                    "部署硬件故障检测: 配置IPMI监控硬件健康状态"
                ],
                "validity_period": "长期有效",
                "mitigation_strategy": {
                    "immediate": ["中断节流", "驱动重载", "设备禁用"] if is_severe else ["驱动更新", "参数调优"],
                    "long_term": ["硬件固件升级", "设备替换", "架构优化"]
                }
            }
        elif anomaly_type == "流量激增":
            # 判断是否为攻击流量
            is_attack = anomaly.get('analysis', {}).get('is_attack', False)
            affected_service = anomaly.get('affected_service', 'unknown')
            affected_interface = anomaly.get('affected_interface', 'unknown')
            target_port = anomaly.get('target_port', 'unknown')
            traffic_increase = anomaly.get('traffic_increase', '未知')
            traffic_volume = anomaly.get('traffic_volume', '未知')
            top_source = anomaly.get('top_source', '未知')
            if is_attack:
                step4 = f"4. 攻击流量处理: sudo ufw deny from {top_source} to any port {target_port}"
                recommended_action = "紧急启用DDoS防护: sudo systemctl start ddos-protection"
            else:
                step4 = f"4. 应用问题处理: sudo systemctl restart {affected_service}"
                recommended_action = f"优化应用配置: 调整{affected_service}连接参数"
            return {
                "anomaly_type": anomaly_type,
                "solution_description": f"{affected_interface}接口流量在{anomaly.get('time_window', '未知')}内异常激增{traffic_increase}，当前流量{traffic_volume}，主要来源{top_source}:{target_port}",
                "implementation_steps": [
                    f"1. 实时监控流量: iftop -i {affected_interface} -P",
                    f"2. 分析流量特征: tcpdump -i {affected_interface} port {target_port} -w /tmp/traffic_dump.pcap",
                    f"3. 识别连接来源: netstat -an | grep :{target_port} | awk '{{print $5}}' | cut -d: -f1 | sort | uniq -c | sort -nr | head -10",
                    step4,
                    "5. 流量压制: sudo tc qdisc add dev {affected_interface} root tbf rate 100mbit burst 100k latency 70ms"
                ],
                "recommended_actions": [
                    recommended_action,
                    f"配置流量告警: 在Prometheus中设置{affected_interface}流量超过80%带宽时触发告警",
                    "实施流量清洗: 联系ISP启用上游流量过滤",
                    "考虑弹性带宽: 配置云服务商自动扩容带宽"
                ],
                "validity_period": "短期有效，需持续监控",
                "traffic_analysis": {
                    "is_potential_attack": is_attack,
                    "attack_type": anomaly.get('analysis', {}).get('attack_type', '未知') if is_attack else "N/A",
                    "recommended_protection_level": "高级" if is_attack else "常规"
                }
            }
        elif anomaly_type == "网络断开":
            # 获取网络故障相关数据
            interface = anomaly.get('network_info', {}).get('interface', '未知')
            duration = anomaly.get('metrics', {}).get('downtime', '未知')
            last_known_status = anomaly.get('network_info', {}).get('last_status', '未知')
            affected_services = anomaly.get('impact', {}).get('services', [])
            
            # 判断故障严重程度
            is_critical = len(affected_services) > 3 or '核心服务' in str(affected_services)
            
            return {
                "anomaly_type": anomaly_type,
                "solution_description": f"{interface}网络连接已断开{duration}，上一次已知状态:{last_known_status}，影响服务:{', '.join(affected_services) if affected_services else '未知'}",
                "implementation_steps": [
                    f"1. 检查物理连接: sudo ethtool {interface} | grep 'Link detected'",
                    "2. 检查IP配置: ip addr show {interface} && ip route show",
                    "3. 测试网关连通性: ping -c 3 {anomaly.get('gateway', '192.168.1.1')}",
                    "4. 检查网络服务状态: sudo systemctl status networking && sudo systemctl status NetworkManager",
                    (
                        f"5. 紧急恢复: 切换至冗余接口: sudo ip link set {anomaly.get('redundant_interface', 'eth1')} up && "
                        f"sudo ip route add default via {anomaly.get('gateway', '192.168.1.1')} dev {anomaly.get('redundant_interface', 'eth1')}"
                        if is_critical
                        else "5. 常规恢复: 重启网络服务: sudo systemctl restart networking"
                    )
                ],
                "recommended_actions": [
                    f"{'立即派遣人员检查机房物理连接' if is_critical else '检查交换机端口状态'}",
                    "查看系统日志: grep -i 'error' /var/log/syslog | grep {interface}",
                    "检查网络设备: ssh {anomaly.get('switch_ip', '未知')} 'show interfaces status'",
                    "配置网络冗余: 实施bonding或VRRP提高可用性"
                ],
                "validity_period": "即时生效",
                "recovery_priority": {
                    "critical_services": [service for service in affected_services if '核心' in service or '重要' in service],
                    "network_recovery_steps": [
                        "物理连接检查", "链路层恢复", "网络层配置", "应用层验证"
                    ]
                }
            }
        elif anomaly_type == "进程内存占用异常":
            return {
                "anomaly_type": anomaly_type,
                "solution_description": "进程内存占用异常，可能存在内存泄漏或配置问题。",
                "implementation_steps": [
                    "1. 使用ps或htop命令识别高内存进程",
                    "2. 使用valgrind或pmap分析内存使用情况",
                    "3. 检查应用程序日志，寻找内存泄漏线索",
                    "4. 重启进程或优化应用程序"
                ],
                "recommended_actions": [
                    "升级应用程序到最新版本",
                    "配置内存使用监控告警",
                    "增加系统内存容量"
                ],
                "validity_period": "短期有效，需持续监控"
            }
        elif anomaly_type == "内存泄漏":
            # 获取内存相关数据
            memory_usage = anomaly.get('metrics', {}).get('memory_usage', '未知')
            leak_rate = anomaly.get('metrics', {}).get('leak_rate', '未知')
            affected_service = anomaly.get('related_service', '未知')
            
            # 根据泄漏严重程度调整解决方案
            is_severe = float(leak_rate.replace('MB/h', '')) > 100 if leak_rate != '未知' else False
            
            return {
                "anomaly_type": anomaly_type,
                "solution_description": f"{affected_service if affected_service != '未知' else '系统服务'}存在内存泄漏，当前内存使用率{memory_usage}，泄漏速率{leak_rate}",
                "implementation_steps": [
                    "1. 确认内存使用趋势: sar -r 或 vmstat 5 10 监控内存变化",
                    f"2. 定位泄漏进程: top -o %MEM 或 ps aux --sort=-%mem | head -10",
                    "3. 收集内存快照: sudo pmap -x {anomaly.get('related_process', {}).get('pid', '')} > /tmp/pmap_before.txt",
                    "4. 10分钟后再次收集: sudo pmap -x {anomaly.get('related_process', {}).get('pid', '')} > /tmp/pmap_after.txt",
                    "5. 比较内存变化: diff /tmp/pmap_before.txt /tmp/pmap_after.txt | grep -i 'growth'"
                ] + (
                    ["6. 紧急措施: 配置服务自动重启: sudo systemctl edit {affected_service} 添加内存限制"] if is_severe else
                    ["6. 长期措施: 安排开发团队使用valgrind或jemalloc进行内存分析"]
                ),
                "recommended_actions": [
                    f"为{affected_service}配置内存限制: systemctl set-property {affected_service} MemoryMax=2G",
                    "实施内存使用监控: 设置内存使用率超过90%时触发告警",
                    "部署内存泄漏检测工具: 如valgrind、massif或py-spy",
                    "制定服务重启计划: 非高峰期自动重启以释放内存"
                ],
                "validity_period": "长期有效，需彻底修复",
                "mitigation_strategies": {
                    "immediate": ["增加临时内存", "调整服务实例数", "实施流量控制"] if is_severe else [],
                    "long_term": ["代码审查内存管理部分", "升级依赖库版本", "重构存在泄漏风险的模块"]
                }
            }
        elif anomaly_type == "swap过度使用":
            return {
                "anomaly_type": anomaly_type,
                "solution_description": "系统过度使用swap空间，导致性能下降。",
                "implementation_steps": [
                    "1. 使用swapon和free命令检查swap使用情况",
                    "2. 识别导致内存压力的进程",
                    "3. 优化内存使用或增加物理内存",
                    "4. 调整swappiness参数"
                ],
                "recommended_actions": [
                    "增加物理内存容量",
                    "优化应用程序内存使用",
                    "调整系统swappiness值为10-20"
                ],
                "validity_period": "中期有效"
            }
        elif anomaly_type == "磁盘空间不足":
            # 获取磁盘使用率数据
            disk_usage = anomaly.get('metrics', {}).get('disk_usage', '未知')
            critical_threshold = 90
            is_critical = float(disk_usage.replace('%', '')) >= critical_threshold if disk_usage != '未知' else False
            
            # 根据磁盘使用率动态生成解决方案
            description = f"磁盘空间使用率过高({disk_usage})，{'已达到严重级别，需立即处理' if is_critical else '需要及时清理或扩容'}"
            
            implementation_steps = [
                f"1. 使用df -h检查磁盘使用情况，确认高占用分区(当前使用率：{disk_usage})",
                "2. 使用du -sh /var/* | sort -rh | head -10 查找系统目录大文件",
                "3. 清理日志文件: sudo journalctl --vacuum-size=100M && sudo rm -rf /var/log/*.gz",
                "4. 清理临时文件: sudo rm -rf /tmp/* && sudo rm -rf /var/tmp/*"
            ]
            
            if is_critical:
                implementation_steps.append("5. 紧急扩容: 联系存储管理员增加磁盘空间")
            else:
                implementation_steps.append("5. 规划扩容: 评估未来3个月存储需求，制定扩容计划")
            
            return {
                "anomaly_type": anomaly_type,
                "solution_description": description,
                "implementation_steps": implementation_steps,
                "recommended_actions": [
                    "配置日志轮转策略: sudo vi /etc/logrotate.conf 设置maxsize和rotate参数",
                    f"{'立即实施监控告警: 设置磁盘使用率超过' + str(critical_threshold) + '%时触发紧急告警' if is_critical else '配置监控告警: 设置磁盘使用率超过85%时触发告警'}",
                    "考虑使用LVM进行动态扩容，提高系统灵活性"
                ],
                "validity_period": "即时生效",
                "severity_based_recommendations": {
                    "critical_actions": ["暂停非必要服务", "启动临时存储清理脚本", "联系技术支持紧急处理"] if is_critical else [],
                    "preventive_measures": ["实施定期存储审计", "配置自动清理策略", "制定数据归档计划"]
                }
            }
        elif anomaly_type == "磁盘io故障":
            return {
                "anomaly_type": anomaly_type,
                "solution_description": "磁盘I/O异常，可能存在硬件故障。",
                "implementation_steps": [
                    "1. 使用iostat检查磁盘I/O状态",
                    "2. 使用smartctl检查磁盘健康状态",
                    "3. 检查系统日志中的磁盘错误信息",
                    "4. 备份数据并更换故障磁盘"
                ],
                "recommended_actions": [
                    "部署磁盘阵列提高可靠性",
                    "定期备份重要数据",
                    "监控磁盘健康状态"
                ],
                "validity_period": "即时生效，需更换硬件"
            }
        else:
            return {
                "anomaly_type": anomaly_type,
                "solution_description": "未找到特定解决方案，建议进行全面系统检查。",
                "implementation_steps": [
                    "1. 收集系统完整日志",
                    "2. 检查系统资源使用情况",
                    "3. 分析最近系统变更",
                    "4. 根据检查结果制定解决方案"
                ],
                "recommended_actions": [
                    "联系系统管理员进行深入排查",
                    "升级系统补丁和驱动",
                    "实施全面的健康检查"
                ],
                "validity_period": "需根据实际情况评估"
            }

    async def generate_solution_for_report(self, report_id: int) -> Dict[str, Any]:
        # 1. 获取报告数据
        report = await self._get_report_by_id(report_id)
        if not report:
            return {
                "errCode": 1,
                "message": f"未找到ID为{report_id}的根因报告",
                "data": None
            }
        else:
            # 3. 提取异常类型并生成解决方案
            # 兼容前端嵌套结构，自动扁平化所有 data.anomalies
            anomaly_list = []
            outer_anomalies = report.get("anomalies", [])
            for item in outer_anomalies:
                if isinstance(item, dict) and "data" in item and "anomalies" in item["data"]:
                    anomaly_list.extend(item["data"]["anomalies"])
            if not anomaly_list:
                return {
                    "errCode": 2,
                    "message": "根因报告中未包含异常信息",
                    "data": None
                }
            # 检查每个异常是否包含有效的anomaly_type
            invalid_anomalies = [i for i, anomaly in enumerate(anomaly_list) if not anomaly.get("anomaly_type")]
            if invalid_anomalies:
                return {
                    "errCode": 4,
                    "message": f"根因报告中异常信息不完整，缺少anomaly_type字段，异常索引: {', '.join(map(str, invalid_anomalies))}",
                    "data": None
                }
            # 4. 生成报告描述
            anomaly_types = [anomaly.get("anomaly_type") for anomaly in anomaly_list if anomaly.get("anomaly_type")]
            report_description = f"系统检测到{len(anomaly_types)}种异常情况: {', '.join(anomaly_types)}。以下是针对每种异常的详细解决方案。"
            # 5. 为每个异常生成解决方案，增加异常详细描述
            solutions = []
            for anomaly in anomaly_list:
                anomaly_type = anomaly.get("anomaly_type")
                if anomaly_type:
                    solution = self.generate_solution_by_anomaly_type(anomaly_type, anomaly)
                    # 添加异常详细信息
                    solution["anomaly_details"] = {
                        "description": anomaly.get("description", "未提供详细描述"),
                        "severity": anomaly.get("severity", "中等"),
                        "detection_time": anomaly.get("detection_time", time.strftime("%Y-%m-%d %H:%M:%S", time.localtime()))
                    }
                    solutions.append(solution)
            # 6. 整合解决方案数据，增加报告级描述字段
            solution_data = {
                "report_id": report_id,
                "report_description": report_description,
                "anomaly_summary": {
                    "total_anomalies": len(solutions),
                    "critical_anomalies": sum(1 for sol in solutions if sol["anomaly_details"]["severity"] == "严重"),
                    "detection_time": report.get("created_at", time.strftime("%Y-%m-%d %H:%M:%S", time.localtime()))
                },
                "solutions": solutions,
                "created_at": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
            }
            # 6. 保存解决方案前，先查找是否已存在
            existing = await self.solution_crud.get_solution_by_report_id(report_id)
            if existing:
                return {
                    "errCode": 0,
                    "message": "解决方案已存在",
                    "data": existing
                }
            await self.solution_crud.save_solution(report_id, solution_data)
            # 7. 返回结果
            return {
                "errCode": 0,
                "message": "解决方案生成成功",
                "data": solution_data
            }

    async def _get_report_by_id(self, report_id: int) -> Dict[str, Any]:
        """
        根据ID获取根因报告（内部方法）
        :param report_id: 报告ID
        :return: 根因报告数据
        """
        return await self.report_crud.get_report_by_id(report_id)

    async def get_all_solutions(self) -> Dict[str, Any]:
        """
        获取所有解决方案
        :return: 所有解决方案列表
        """
        # 实际应用中应该实现此方法
        # 这里仅为示例，返回模拟数据
        solutions = []
        # 将异步迭代改为同步方式
        for solution in list(self.solution_crud.db['solutions'].find()):
            if '_id' in solution:
                solution['_id'] = str(solution['_id'])
            solutions.append(solution)
        return {
            "errCode": 0,
            "message": "success",
            "data": solutions
        }

    async def get_solution_by_report_id(self, report_id: int) -> Dict[str, Any]:
        """
        根据报告ID获取解决方案
        :param report_id: 报告ID
        :return: 解决方案数据
        """
        solution = await self.solution_crud.get_solution_by_report_id(report_id)
        if solution:
            return {
                "errCode": 0,
                "message": "success",
                "data": solution
            }
        return {
            "errCode": 1,
            "message": f"未找到ID为{report_id}的解决方案",
            "data": None
        }
    

    async def get_all_SN(self) -> List[Dict[str, Any]]:
        """
        获取所有SN:solution_note
        :return: 所有SN列表
        """
        return await self.solution_crud.get_all_SN()

    async def insert_SN(self, title: str, content: str,tag: int):
        """
        插入SN:solution_note
        :param title: 标题
        :param content: 内容
        :return: 插入结果
        """
        data={
            "id":self.solution_crud.db["solution_note"].count_documents({}) + 1,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime()),
            "update_time": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime()),    
            "title": title,
            "content": content,
            "tag":tag,
            "like":False
        }
        await self.solution_crud.insert_SN(data)

    async def edit_SN(self, sn_id: int, title: str, content: str,tag: int):
        """
        编辑SN:solution_note
        :param sn_id: SN ID
        :param title: 新标题
        :param content: 新内容
        :return: 编辑结果
        """
        await self.solution_crud.edit_SN(sn_id, title, content,tag)

    async def delete_SN(self, sn_id: int):
        """
        删除SN:solution_note
        :param sn_id: SN ID
        :return: 删除结果
        """
        await self.solution_crud.delete_SN(sn_id)

    async def set_SN_like(self, sn_id: int, like: bool):
        """
        设置SN:solution_note的点赞状态
        :param sn_id: SN ID
        :param like: 是否点赞
        :return: 设置结果
        """
        await self.solution_crud.set_SN_like(sn_id, like)

    async def save_pdf_report(self, file: UploadFile) -> Dict[str, Any]:
        """
        保存解决方案PDF报告文件并返回预览地址
        """
        try:
            # 使用日期格式命名文件，如果重复就覆盖
            file_extension = file.filename.split(".")[-1] if file.filename and "." in file.filename else "pdf"
            current_date = time.strftime("%Y_%m_%d", time.localtime())
            file_name = f"solution_{current_date}.{file_extension}"
            
            # 创建保存目录
            upload_dir = "./uploads/solution_reports"
            os.makedirs(upload_dir, exist_ok=True)
            
            file_path = os.path.join(upload_dir, file_name)
            
            # 保存文件
            with open(file_path, "wb") as buffer:
                content = await file.read()
                buffer.write(content)
            
            # 构建预览地址 (假设通过静态文件服务访问)
            preview_url = f"/static/solution_reports/{file_name}"
            
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
            # await self.solution_crud.save_pdf_file_info(file_info)
            
            return {
                "errCode": 0, 
                "message": "解决方案PDF报告上传成功", 
                "data": {
                    "file_id": file_info["file_id"],
                    "preview_url": preview_url,
                    "download_url": preview_url,  # 预览和下载可以使用同一个URL
                    "file_name": file_info["original_name"]
                }
            }
            
        except Exception as e:
            return {"errCode": 1, "message": f"解决方案PDF报告上传失败: {str(e)}", "data": None}


if __name__ == "__main__":
    # 测试代码
    import asyncio
    async def test():
        solution_serve = SolutionServe()
        # 测试生成解决方案
        result = await solution_serve.generate_solution_for_report(1)
        print(result)
        # 测试获取解决方案
        result = await solution_serve.get_solution_by_report_id(1)
        print(result)
    asyncio.run(test())