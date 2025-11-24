#!/bin/bash
APP_NAME="camera-control"
SOURCE_DIR="$(cd "$dirname "${BASH_SOURCE[0]}")/.."&& pwd)"
DEST_DIR="/var/www/$APP_NAME"
echo"🚀 开始部署 $APP_NAME..."
#创建目标目录
sudo mkdir -p"$DEST_DIR"
#复制文件
sudo cp -r"$SOURCE_DIR"/*"$DEST_DIR/"
#设置权限
sudo chown -R www-data:www-data"$DEST_DIR"
sudo chomd -R 755 "$DEST_DIR"
#重载Nginx
echo"🔄 重载Nginx 配置..."
sudo cp"$SOUNCE_DIR/nginx.conf" "/etc/nginx/sites-available/$APP_NAME"
sudo ln -sf"/etc/nginx/sites-available/$APP_NAME""/etc/nginx/sites-enabled/"
sudo nginx -t && sudo systemctl reload nginx
echo "✅ 部署完成！ 访问 http://localhost"