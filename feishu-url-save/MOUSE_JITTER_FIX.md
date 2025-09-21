# 鼠标抖动问题修复方案

## 问题分析

经过深入调查，鼠标抖动问题的可能原因包括：

1. **未跟踪的定时器**: background.js中有未被管理的setTimeout
2. **脚本注入副作用**: 动态注入的脚本可能在页面中留下持续运行的代码
3. **事件监听器泄漏**: popup关闭后事件监听器未被完全清理
4. **DOM操作冲突**: 复杂的DOM操作可能与浏览器的渲染机制冲突

## 修复策略

### 阶段1: 调试版本（当前状态）
- 在原始代码中添加了详细的调试日志
- 增强了定时器跟踪和清理机制
- 改进了事件监听器管理

### 阶段2: 极简版本（推荐测试）
创建了完全重写的极简版本，消除所有可能的问题源：

#### 核心改进：
1. **零定时器策略**: 完全移除所有自动定时器
2. **零脚本注入**: 不进行任何动态脚本注入，只使用tab API
3. **简化事件管理**: 使用原生事件监听器，立即清理
4. **无自动操作**: 移除所有自动关闭、自动隐藏功能

## 测试步骤

### 测试极简版本（推荐）

1. **准备测试环境**：
   ```bash
   # 备份当前manifest.json
   cp manifest.json manifest-original.json
   
   # 使用测试版manifest
   cp manifest-clean.json manifest.json
   
   # 备份当前popup.html
   cp popup/popup.html popup/popup-original.html
   
   # 使用测试版popup
   cp popup-clean.html popup/popup.html
   
   # 使用测试版JS文件（已经是独立文件）
   ```

2. **重新加载插件**：
   - 在Chrome扩展页面点击"刷新"按钮
   - 确认插件名称显示为"飞书收藏插件（干净测试版）"

3. **执行测试**：
   
   **测试A: 基本功能**
   - 打开任意网页
   - 点击插件图标
   - 验证页面信息正确显示
   - 填写表单并保存
   
   **测试B: 鼠标抖动检查**
   - 打开插件popup
   - 将鼠标移动到页面内容上 ✅ 确认无抖动
   - 将鼠标移出popup界面 ✅ 确认无抖动
   - 关闭popup后移动鼠标 ✅ 确认无抖动
   
   **测试C: 多次操作**
   - 重复打开关闭插件多次
   - 在不同标签页中使用插件
   - 切换标签页后测试鼠标 ✅ 确认无抖动

4. **观察调试输出**：
   - 右键插件图标 → "检查弹出内容"
   - 查看控制台输出，应该看到 `[CLEAN]` 和 `[CLEAN-BG]` 前缀的日志
   - 确认没有错误信息

### 如果极简版本解决了问题

说明问题出在复杂的定时器管理、脚本注入或事件处理上。可以逐步重新引入功能：

1. 先恢复智能填充功能
2. 再恢复自动关闭功能
3. 最后恢复脚本注入功能

每次添加后都进行抖动测试。

### 如果极简版本仍有问题

说明问题可能来自：
1. Chrome扩展权限配置
2. 浏览器本身的bug
3. 系统层面的冲突

## 文件说明

### 极简版本文件：
- `manifest-clean.json`: 测试用manifest
- `popup-clean.html`: 极简popup页面
- `popup-clean.js`: 零定时器popup脚本
- `background-clean.js`: 零脚本注入后台脚本

### 调试版本文件：
- `manifest.json`: 原始manifest（已增强）
- `popup/popup.js`: 增强调试的popup脚本
- `background/background.js`: 增强调试的后台脚本

### 调试工具：
- `debug-minimal.html`: 独立的最小调试页面
- `MOUSE_JITTER_FIX.md`: 本说明文件

## 还原步骤

测试完成后还原到原始版本：

```bash
# 还原manifest
cp manifest-original.json manifest.json

# 还原popup
cp popup/popup-original.html popup/popup.html

# 重新加载插件
```

## 预期结果

极简版本应该完全消除鼠标抖动问题。如果仍然存在，说明问题可能不在我们的代码中，需要进一步排查系统或浏览器层面的问题。

## 联系方式

如果测试结果与预期不符，请提供：
1. 测试步骤和具体表现
2. 浏览器控制台的输出日志
3. Chrome版本和操作系统信息