import sys
import os
import json
from typing import Dict, Any
from fastapi import UploadFile

# 添加项目路径
sys.path.append(os.path.abspath("./fastapi"))

class CauseModelServe:
    def __init__(self):
        # 初始化模板存储路径
        self.template_dir = os.path.join(os.path.dirname(__file__), "templates")
        os.makedirs(self.template_dir, exist_ok=True)

    async def process_cause_template(self, file: UploadFile) -> Dict[str, Any]:
        """
        处理上传的根因分析模板
        """
        # 读取文件内容
        content = await file.read()
        try:
            # 尝试解析为JSON格式
            template_data = json.loads(content)
            template_name = file.filename or "default_template"
            template_path = os.path.join(self.template_dir, f"{template_name}.json")

            # 保存模板文件
            with open(template_path, "w", encoding="utf-8") as f:
                json.dump(template_data, f, ensure_ascii=False, indent=2)

            return {
                "status": "success",
                "message": f"根因分析模板 '{template_name}' 上传成功",
                "template_id": template_name,
                "saved_path": template_path
            }
        except Exception as e:
            return {
                "status": "error",
                "message": f"模板处理失败: {str(e)}",
                "error_details": str(e)
            }

if __name__ == "__main__":
    import asyncio
    from fastapi import UploadFile
    
    class MockUploadFile:
        def __init__(self, filename, content):
            self.filename = filename
            self.content = content.encode()
        
        async def read(self):
            return self.content
    
    cause_model_serve = CauseModelServe()
    mock_file = MockUploadFile(
        "sample_template.json",
        '{"name": "系统故障根因分析模板", "version": "1.0", "sections": ["故障现象", "初步排查", "根因定位", "解决方案"]}'
    )
