# 后端启动脚本
Write-Host "========================================" -ForegroundColor Green
Write-Host "  智能运镜系统后端服务启动脚本" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 启动服务中..." -ForegroundColor Cyan
Write-Host "📡 服务地址: http://127.0.0.1:8000" -ForegroundColor White
Write-Host "📊 API文档: http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "⏹️  停止服务: Ctrl + C" -ForegroundColor Red
Write-Host ""

# 启动后端服务
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000 --log-level info