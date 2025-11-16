from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Literal
import time

app = FastAPI(title="智能运镜系统API", version="1.0.0")

# CORS配置 - 允许前端访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 数据模型
class TranslateParams(BaseModel):
    x_offset: float
    y_offset: float
    z_offset: float
    duration: float = 1.0

class RotateParams(BaseModel):
    angle_deg: float
    duration: float = 1.0

# 模拟相机状态
camera_state = {
    "current_pos": [0.0, 0.0, 0.0],
    "current_angle": 0.0,
    "status": "idle",
    "error_code": 0
}

@app.post("/api/v1/translate")
async def translate_camera(params: TranslateParams):
    # 参数验证
    if abs(params.x_offset) > 10 or abs(params.y_offset) > 10 or abs(params.z_offset) > 5:
        return {
            "code": 400,
            "msg": "平移参数超出允许范围",
            "data": None
        }
    
    # 模拟处理逻辑
    camera_state["current_pos"][0] += params.x_offset
    camera_state["current_pos"][1] += params.y_offset
    camera_state["current_pos"][2] += params.z_offset
    camera_state["status"] = "running"
    
    # 模拟执行时间
    time.sleep(0.5)
    camera_state["status"] = "idle"
    
    return {
        "code": 200,
        "msg": "平移指令执行成功",
        "data": {
            "current_pos": camera_state["current_pos"].copy(),
            "status": camera_state["status"]
        }
    }

@app.post("/api/v1/rotate")
async def rotate_camera(params: RotateParams):
    # 参数验证
    if abs(params.angle_deg) > 360:
        return {
            "code": 400,
            "msg": "旋转角度超出允许范围",
            "data": None
        }
    
    camera_state["current_angle"] = (camera_state["current_angle"] + params.angle_deg) % 360
    camera_state["status"] = "running"
    
    # 模拟执行时间
    time.sleep(0.5)
    camera_state["status"] = "idle"
    
    return {
        "code": 200,
        "msg": "旋转指令执行成功",
        "data": {
            "current_angle": camera_state["current_angle"],
            "status": camera_state["status"]
        }
    }

@app.get("/api/v1/status")
async def get_camera_status():
    return {
        "code": 200,
        "msg": "状态查询成功",
        "data": {
            "current_pos": camera_state["current_pos"].copy(),
            "current_angle": camera_state["current_angle"],
            "status": camera_state["status"],
            "error_code": camera_state["error_code"]
        }
    }

@app.get("/")
async def root():
    return {"message": "智能运镜系统API服务运行中", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    import os
    
    print("🚀 启动智能运镜系统后端服务...")
    print("📡 服务地址: http://127.0.0.1:8000")
    print("📊 API文档: http://127.0.0.1:8000/docs")
    print("⏹️  按 Ctrl+C 停止服务")
    print("-" * 50)
    
    uvicorn.run(
        "main:app",  # 重要：改为字符串格式
        host="127.0.0.1",
        port=8000,
        reload=True,  # 开发时自动重载
        log_level="info",
        access_log=True
    )