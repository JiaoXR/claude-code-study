#!/bin/bash

echo "🎮 开始部署高考单词战士到 Vercel..."

# 检查是否安装了vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI 未安装，正在安装..."
    npm install -g vercel
fi

# 构建项目
echo "🔨 构建项目..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ 构建成功！"
else
    echo "❌ 构建失败，请检查错误信息"
    exit 1
fi

# 询问部署类型
echo "选择部署类型："
echo "1) 预览部署 (Preview)"
echo "2) 生产部署 (Production)"
read -p "请输入选择 (1 或 2): " choice

case $choice in
    1)
        echo "🚀 部署到预览环境..."
        vercel
        ;;
    2)
        echo "🚀 部署到生产环境..."
        vercel --prod
        ;;
    *)
        echo "❌ 无效选择，默认部署到预览环境..."
        vercel
        ;;
esac

echo "🎉 部署完成！"
echo "📱 你的应用现在可以在线访问了！"