# 飞书收藏插件部署指南

## 快速开始

### 1. 本地开发测试

1. **加载插件到Chrome**：
   ```bash
   # 1. 打开 Chrome 浏览器
   # 2. 访问 chrome://extensions/
   # 3. 开启右上角的"开发者模式"
   # 4. 点击"加载已解压的扩展程序"
   # 5. 选择项目根目录 feishu-url-save/
   ```

2. **验证插件安装**：
   - 浏览器工具栏应出现插件图标（📚）
   - 点击图标打开收藏弹窗
   - 右键图标选择"选项"打开设置页面

### 2. 配置飞书集成

#### 创建飞书应用
1. 访问 [飞书开放平台](https://open.feishu.cn/)
2. 登录并创建企业自建应用
3. 记录 App ID 和 App Secret

#### 配置应用权限
在飞书开放平台应用管理中，添加以下权限：
```
bitable:app      # 多维表格应用权限
bitable:table    # 数据表权限
bitable:record   # 记录权限
```

#### 获取访问令牌
```bash
# 使用 App ID 和 App Secret 获取应用访问令牌
curl -X POST https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal \
  -H "Content-Type: application/json" \
  -d '{
    "app_id": "你的APP_ID",
    "app_secret": "你的APP_SECRET"
  }'
```

#### 创建多维表格
1. 在飞书中创建新的多维表格
2. 添加以下字段：
   ```
   标题      - 文本类型
   URL       - 链接类型  
   备注      - 文本类型
   标签      - 多选类型 或 文本类型
   收藏时间  - 日期时间类型
   ```
3. 获取应用令牌：表格设置 → 高级 → 开放平台
4. 获取表格ID：右键数据表标签 → 复制表格ID

### 3. 插件配置

1. **打开设置页面**：
   - 点击插件图标旁的设置按钮（⚙️）
   - 或右键插件图标选择"选项"

2. **填写配置信息**：
   ```
   应用令牌 (App Token): 从飞书多维表格获取
   数据表ID: 目标数据表的ID  
   访问令牌 (Access Token): 从飞书开放平台获取
   ```

3. **测试连接**：
   - 填写完成后点击"测试连接"
   - 确保显示"连接测试成功"

### 4. 功能测试

#### 使用测试页面
```bash
# 在浏览器中打开测试页面
file:///path/to/feishu-url-save/test.html
```

#### 测试步骤
1. **基础收藏测试**：
   - 在测试页面点击插件图标
   - 验证页面信息是否正确抓取
   - 添加备注和标签
   - 点击"收藏到飞书"

2. **快速收藏测试**：
   - 点击"快速收藏"按钮
   - 验证是否立即收藏成功

3. **同步验证**：
   - 检查飞书多维表格中是否出现新记录
   - 验证数据字段是否正确

4. **设置功能测试**：
   - 修改默认标签
   - 测试自动同步开关
   - 验证同步状态统计

## 部署到生产环境

### 1. 打包插件

```bash
# 创建发布版本
mkdir feishu-bookmark-extension-v1.0.0
cp -r feishu-url-save/* feishu-bookmark-extension-v1.0.0/

# 移除开发文件
cd feishu-bookmark-extension-v1.0.0
rm -rf test.html DEPLOYMENT.md .git/

# 创建ZIP包
zip -r feishu-bookmark-extension-v1.0.0.zip .
```

### 2. Chrome Web Store 发布

1. **准备发布资源**：
   - 创建高质量的应用图标 (16x16, 32x32, 48x48, 128x128)
   - 准备应用截图 (1280x800 或 640x400)
   - 编写详细的应用描述

2. **提交到商店**：
   - 访问 [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
   - 上传ZIP包
   - 填写应用信息
   - 设置定价和发布地区
   - 提交审核

### 3. 企业内部部署

#### 通过Google Admin Console
```bash
# 企业管理员可以：
# 1. 登录 Google Admin Console
# 2. 导航到 设备 → Chrome → 应用和扩展程序
# 3. 添加扩展程序
# 4. 上传 .crx 文件或输入扩展程序ID
# 5. 配置部署策略（强制安装/允许安装）
```

#### 打包为CRX文件
```bash
# 使用Chrome打包
# 1. 访问 chrome://extensions/
# 2. 开启开发者模式
# 3. 点击"打包扩展程序"
# 4. 选择扩展程序根目录
# 5. 生成 .crx 文件和 .pem 私钥文件
```

## 配置文件模板

### 企业部署配置
创建 `enterprise-config.json`：
```json
{
  "settings": {
    "defaultTags": ["工作", "资源", "文档"],
    "autoSync": true,
    "enableNotifications": true,
    "syncInterval": 5,
    "maxRetries": 3,
    "dataRetention": 90
  },
  "feishu": {
    "baseURL": "https://open.feishu.cn/open-apis",
    "defaultAppToken": "企业默认应用令牌",
    "defaultTableId": "企业默认表格ID"
  }
}
```

### 用户配置向导
创建配置向导页面：
```html
<!-- config-wizard.html -->
<!DOCTYPE html>
<html>
<head>
    <title>飞书收藏插件 - 配置向导</title>
</head>
<body>
    <div class="wizard">
        <h1>欢迎使用飞书收藏插件</h1>
        <div class="steps">
            <div class="step">
                <h2>步骤1: 创建飞书应用</h2>
                <p>请访问飞书开放平台创建应用...</p>
            </div>
            <div class="step">
                <h2>步骤2: 创建多维表格</h2>
                <p>在飞书中创建收藏表格...</p>
            </div>
            <div class="step">
                <h2>步骤3: 配置插件</h2>
                <p>填写应用令牌和表格信息...</p>
            </div>
        </div>
    </div>
</body>
</html>
```

## 故障排除

### 常见问题

1. **插件无法加载**
   ```bash
   # 检查 manifest.json 语法
   # 检查文件路径是否正确
   # 查看 Chrome 扩展页面的错误信息
   ```

2. **飞书连接失败**
   ```bash
   # 验证网络连接
   # 检查API令牌是否有效
   # 确认应用权限配置
   # 验证表格ID格式
   ```

3. **同步异常**
   ```bash
   # 查看浏览器控制台错误
   # 检查飞书API响应
   # 验证数据格式
   ```

### 调试模式

1. **启用调试**：
   - 在设置页面开启"调试模式"
   - 查看浏览器控制台输出

2. **日志收集**：
   ```javascript
   // 在浏览器控制台运行
   chrome.storage.local.get(['bookmarks', 'settings'], console.log);
   ```

3. **网络监控**：
   - F12 → Network 标签页
   - 筛选飞书API请求
   - 检查请求和响应内容

## 维护和更新

### 版本更新流程
1. 修改 `manifest.json` 中的版本号
2. 更新 `README.md` 中的更新日志
3. 测试新功能
4. 打包并发布

### 监控和统计
```javascript
// 添加使用统计
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'trackUsage') {
    // 记录使用统计
    console.log('功能使用:', request.feature);
  }
});
```

### 用户反馈收集
- 在设置页面添加反馈链接
- 收集错误日志和使用数据
- 定期分析用户需求

## 安全考虑

1. **权限最小化原则**
   - 仅请求必要的浏览器权限
   - 限制API访问范围

2. **数据安全**
   - 不在本地明文存储敏感信息
   - 使用HTTPS传输数据
   - 定期清理过期数据

3. **用户隐私**
   - 明确数据收集说明
   - 提供数据导出功能
   - 允许用户删除所有数据

## 技术支持

- 文档: README.md
- 问题报告: GitHub Issues
- 使用指南: 插件内置帮助页面