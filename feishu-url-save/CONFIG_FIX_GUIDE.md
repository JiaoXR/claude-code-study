# 🔧 飞书配置问题修复指南

## 🚨 问题分析

你遇到的错误：
```
Error: 飞书配置不完整，请在设置中配置应用令牌和表格ID
```

这表明插件无法读取到完整的飞书API配置信息。

## 🔍 问题排查步骤

### 1. 检查当前配置状态

在浏览器中：
1. 按 `F12` 打开开发者工具
2. 切换到 `Console` 标签页
3. 粘贴并运行以下代码：

```javascript
// 检查配置状态
chrome.storage.local.get(['settings'], (result) => {
  console.log('当前配置:', result);
  
  if (result.settings) {
    const s = result.settings;
    console.log('appToken:', s.appToken ? '✅已设置' : '❌未设置');
    console.log('tableId:', s.tableId ? '✅已设置' : '❌未设置'); 
    console.log('accessToken:', s.accessToken ? '✅已设置' : '❌未设置');
  } else {
    console.log('❌ 未找到配置');
  }
});
```

### 2. 手动配置修复

如果配置丢失或不完整，可以手动修复：

```javascript
// 手动设置配置（请替换为你的实际值）
const config = {
  appToken: 'bascxxxxx',     // 你的应用令牌
  tableId: 'tblxxxxx',       // 你的表格ID
  accessToken: 't-xxxxx',    // 你的访问令牌
  categories: ['AI编程', 'AI工具', '其他'],
  autoSync: true,
  enableNotifications: true,
  syncInterval: 5,
  maxRetries: 3,
  debugMode: false,
  dataRetention: 30
};

chrome.storage.local.set({ settings: config }, () => {
  console.log('✅ 配置已保存');
});
```

### 3. 验证配置正确性

```javascript
// 验证配置
chrome.storage.local.get(['settings'], (result) => {
  const s = result.settings;
  if (s && s.appToken && s.tableId && s.accessToken) {
    console.log('✅ 配置完整，可以进行同步');
    
    // 测试API连接
    fetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${s.appToken}/tables/${s.tableId}/records?page_size=1`, {
      headers: {
        'Authorization': `Bearer ${s.accessToken}`,
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.code === 0) {
        console.log('✅ API连接测试成功');
      } else {
        console.error('❌ API连接失败:', data);
      }
    })
    .catch(error => {
      console.error('❌ 网络错误:', error);
    });
  } else {
    console.log('❌ 配置仍不完整');
  }
});
```

## 📝 通过设置页面配置

### 1. 打开设置页面
- 右键点击插件图标
- 选择"选项"或"设置"

### 2. 填入必要信息

| 字段 | 说明 | 格式示例 |
|------|------|----------|
| 应用令牌 | App Token | `bascXXXXXXXXXXXX` |
| 表格ID | Table ID | `tblXXXXXXXXXXXX` |
| 访问令牌 | Access Token | `t-XXXXXXXXXXXX` |

### 3. 获取令牌方法

#### 应用令牌 (App Token)
1. 登录飞书开发者后台：https://open.feishu.cn/
2. 创建或选择应用
3. 在应用详情页面找到 App Token

#### 表格ID (Table ID)
1. 打开你的飞书多维表格
2. 从URL中提取表格ID
   - URL格式：`https://xxx.feishu.cn/base/bascXXXXXXXXXXXX`
   - 表格ID就是 `bascXXXXXXXXXXXX` 部分

#### 访问令牌 (Access Token)
1. 在飞书开发者后台的应用设置中
2. 生成用户访问令牌或租户访问令牌
3. 复制令牌字符串

## 🔄 重试同步失败的收藏

配置修复后，重试之前失败的同步：

```javascript
// 重试所有未同步的收藏
chrome.runtime.sendMessage({
  action: 'retryFailedSync'
}, (response) => {
  console.log('重试结果:', response);
});
```

## 🛠️ 使用优化版本

为了避免配置读取问题，建议使用优化版本：

```bash
# 备份当前版本
cp manifest.json manifest-backup.json

# 启用优化版
cp manifest-optimized.json manifest.json

# 重新加载插件
```

优化版本修复了配置读取的兼容性问题。

## 📋 完整解决流程

1. **检查配置**：运行上面的检查脚本
2. **补全配置**：通过设置页面或手动脚本配置
3. **验证连接**：测试API连接是否正常
4. **重试同步**：重新同步失败的收藏
5. **升级版本**：考虑使用优化版本

## 🆘 如果仍有问题

如果按照上述步骤仍无法解决：

1. **清除存储重新配置**：
   ```javascript
   chrome.storage.local.clear(() => {
     console.log('存储已清除，请重新配置');
   });
   ```

2. **重新安装插件**：
   - 在扩展管理页面移除插件
   - 重新加载插件文件

3. **检查网络和权限**：
   - 确保能访问飞书API
   - 检查令牌权限是否正确

## 🎯 预防措施

为避免配置丢失：

1. **备份配置**：
   ```javascript
   chrome.storage.local.get(['settings'], (result) => {
     console.log('备份此配置:', JSON.stringify(result.settings, null, 2));
   });
   ```

2. **定期验证**：在设置页面定期点击"测试连接"

3. **使用优化版本**：优化版本有更好的错误处理机制

配置修复后，你的插件应该能够正常同步收藏到飞书表格了。