import requests

try:
    response = requests.get("http://127.0.0.1:8000/api/v1/status", timeout=5)
    print(f"✅ 后端服务正常！状态码: {response.status_code}")
    print(f"响应内容: {response.json()}")
except requests.exceptions.ConnectionError:
    print("❌ 无法连接到后端服务，请检查服务是否启动")
except Exception as e:
    print(f"❌ 连接错误: {e}")