# 测试运行脚本
param(
    [string]$TestType = "all"
)

function Write-Header {
    param($Message)
    Write-Host "`n" + "="*60 -ForegroundColor Cyan
    Write-Host " $Message" -ForegroundColor Cyan  
    Write-Host "="*60 -ForegroundColor Cyan
}

function Test-Frontend {
    Write-Header "运行前端单元测试"
    
    Set-Location "frontend"
    
    # 检查 package.json 是否存在
    if (-not (Test-Path "package.json")) {
        Write-Host "❌ package.json 不存在" -ForegroundColor Red
        return
    }
    
    # 显示可用的脚本
    Write-Host "可用脚本:" -ForegroundColor Yellow
    npm run
    
    # 检查 node_modules
    if (-not (Test-Path "node_modules")) {
        Write-Host "安装依赖..." -ForegroundColor Yellow
        npm install
    }
    
    Write-Host "执行基础测试..." -ForegroundColor Green
    npm run test
    
    Set-Location ".."
}

function Test-Backend {
    Write-Header "运行后端API测试"
    
    Set-Location "backend"
    
    # 检查 test_api.py 是否存在
    if (-not (Test-Path "test_api.py")) {
        Write-Host "❌ test_api.py 不存在" -ForegroundColor Red
        return
    }
    
    Write-Host "执行API测试..." -ForegroundColor Green
    python test_api.py
    
    Set-Location ".."
}

# 主执行逻辑
Write-Host "🚀 开始测试执行" -ForegroundColor Green
Write-Host "时间: $(Get-Date)" -ForegroundColor Yellow

switch ($TestType) {
    "frontend" { Test-Frontend }
    "backend" { Test-Backend }
    "all" { 
        Test-Backend
        Test-Frontend
    }
    default {
        Write-Host "未知测试类型: $TestType" -ForegroundColor Red
        Write-Host "可用选项: frontend, backend, all" -ForegroundColor Yellow
    }
}

Write-Host "`n🏁 测试执行完成" -ForegroundColor Green
Write-Host "时间: $(Get-Date)" -ForegroundColor Yellow