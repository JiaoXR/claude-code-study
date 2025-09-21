# 鼠标抖动问题 - 系统诊断指南

## 问题确认
您的环境信息：
- **Chrome版本**: 140.0.7339.133 (arm64)
- **操作系统**: macOS 14.1.1
- **问题描述**: 鼠标抖动到无法正常使用

## 分层测试方案

### 第一层：绝对最小测试
这将帮助确定问题是否来自扩展本身。

**测试步骤**：
1. 备份当前manifest.json
2. 使用绝对最小版本：
   ```bash
   cp manifest.json manifest-backup.json
   cp manifest-minimal.json manifest.json
   ```
3. 重新加载插件
4. 测试是否仍有抖动

**如果最小版本仍抖动** → 问题不在JavaScript代码中，继续下一层测试

### 第二层：CSS样式测试
测试CSS样式是否是抖动源。

**发现的可疑CSS效果**：
- `transition: all 0.2s` (多处)
- `transform: translateY(-1px)` (hover效果)
- `animation: spin 1s linear infinite` (加载动画)
- 多个`:hover`效果

**测试步骤**：
1. 使用无CSS版本：
   ```bash
   cp manifest-no-css.json manifest.json
   ```
2. 重新加载插件
3. 测试抖动情况

**如果无CSS版本解决了问题** → CSS样式是问题源，需要移除特定效果

### 第三层：Chrome扩展权限测试
测试特定权限是否导致问题。

**当前权限**：
- `activeTab` - 访问当前标签页
- `storage` - 本地存储
- `tabs` - 标签页操作
- `scripting` - 脚本注入（可疑）

**测试步骤**：
1. 逐个移除权限测试
2. 特别关注`scripting`权限

### 第四层：macOS系统级问题
针对您的macOS环境的特殊检查。

**已知的macOS Chrome问题**：
1. **Accessibility权限冲突**
2. **鼠标加速设置冲突**
3. **Chrome硬件加速问题**

## 立即测试方案

### 测试A：绝对最小版本
```bash
# 在插件目录中执行
cp manifest-minimal.json manifest.json
# 然后在Chrome扩展页面重新加载插件
```

**预期结果**：如果这个只有20行代码的最小版本仍然抖动，说明问题不在我们的代码中。

### 测试B：无CSS版本
```bash
cp manifest-no-css.json manifest.json
```

**预期结果**：如果无CSS版本不抖动，说明问题在CSS的hover效果或动画中。

## macOS特定解决方案

### 解决方案1：禁用Chrome硬件加速
1. Chrome设置 → 高级 → 系统
2. 关闭"使用硬件加速模式"
3. 重启Chrome
4. 测试插件

### 解决方案2：检查系统Accessibility权限
1. 系统偏好设置 → 安全性与隐私 → 辅助功能
2. 检查Chrome是否在列表中
3. 如果在，尝试移除再重新添加
4. 重启Chrome测试

### 解决方案3：重置鼠标设置
1. 系统偏好设置 → 鼠标
2. 将跟踪速度调整为中间值
3. 关闭"自然滚动"测试
4. 测试插件

### 解决方案4：Chrome配置重置
```bash
# 备份Chrome配置
cp -r ~/Library/Application\ Support/Google/Chrome ~/Library/Application\ Support/Google/Chrome.backup

# 重置Chrome（会丢失所有数据，谨慎使用）
rm -rf ~/Library/Application\ Support/Google/Chrome
```

## 临时解决方案

如果问题确实来自CSS，可以立即使用这个替代方案：

### 替代manifest（无CSS样式）
```json
{
  "manifest_version": 3,
  "name": "飞书收藏插件（无样式版）",
  "version": "1.0.3",
  "permissions": ["activeTab", "storage", "tabs"],
  "action": {
    "default_popup": "popup-no-css.html"
  },
  "background": {
    "service_worker": "background-clean.js"
  }
}
```

## 需要收集的信息

请按照上述测试步骤操作，并告诉我：

1. **绝对最小版本（manifest-minimal.json）**的测试结果
2. **无CSS版本（manifest-no-css.json）**的测试结果
3. 是否尝试了Chrome硬件加速禁用
4. 控制台是否有任何错误信息

这将帮助我们精确定位问题源并提供最终解决方案。

## 快速测试命令

```bash
# 测试1：最小版本
cp manifest-minimal.json manifest.json

# 测试2：无CSS版本  
cp manifest-no-css.json manifest.json

# 恢复原版本
cp manifest-backup.json manifest.json
```

每次修改后都需要在Chrome扩展页面点击"刷新"按钮。