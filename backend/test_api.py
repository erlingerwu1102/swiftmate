import sys
import os
from fastapi.testclient import TestClient

# 添加当前目录到 Python 路径
sys.path.append(os.path.dirname(__file__))

from main import app

client = TestClient(app)

def test_get_camera_status_success():
    """测试获取相机状态成功"""
    response = client.get("/api/v1/status")
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["code"] == 200
    assert "状态查询成功" in data["msg"]
    assert "data" in data
    assert "current_pos" in data["data"]
    print("✅ 状态查询测试通过")

def test_translate_camera_success():
    """测试平移控制成功"""
    translate_data = {
        "x_offset": 1.0,
        "y_offset": 0.5,
        "z_offset": 0.0,
        "duration": 2.0
    }
    
    response = client.post("/api/v1/translate", json=translate_data)
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["code"] == 200
    assert "平移指令执行成功" in data["msg"]
    print("✅ 平移控制测试通过")

def test_rotate_camera_success():
    """测试旋转控制成功"""
    rotate_data = {
        "angle_deg": 90.0,
        "duration": 1.5
    }
    
    response = client.post("/api/v1/rotate", json=rotate_data)
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["code"] == 200
    assert "旋转指令执行成功" in data["msg"]
    print("✅ 旋转控制测试通过")

if __name__ == "__main__":
    print("🚀 开始后端API测试...")
    test_get_camera_status_success()
    test_translate_camera_success() 
    test_rotate_camera_success()
    print("🎉 所有后端测试通过！")