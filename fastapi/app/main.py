from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from api import SystemInfoApi
from api import CauseAnalysisApi
from api import CauseModelApi
from api import CauseReportApi
from api import SolutionApi  
from api import LLMapi
import uvicorn
import os

app = FastAPI(title="SH-13")

# 添加 CORS 中间件
# 允许所有来源的跨域请求
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 配置静态文件服务
uploads_dir = "./uploads"
if not os.path.exists(uploads_dir):
    os.makedirs(uploads_dir)
app.mount("/static", StaticFiles(directory=uploads_dir), name="static")

# 注册路由
app.include_router(SystemInfoApi.router, prefix="/systeminfo", tags=["系统指标信息接口"])
app.include_router(CauseAnalysisApi.router, prefix="/causeanalysis", tags=["根因分析接口"])
app.include_router(CauseModelApi.router, prefix="/causemodel", tags=["根因模板接口"])
app.include_router(CauseReportApi.router, prefix="/causereport", tags=["根因报告接口"])
app.include_router(SolutionApi.router, prefix="/solution", tags=["解决方案接口"])
app.include_router(LLMapi.router, prefix="/llm", tags=["LLM接口"])

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)