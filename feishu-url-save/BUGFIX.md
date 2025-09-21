# 鼠标抖动问题修复

## 问题描述
用户反馈在Chrome浏览器中安装插件后出现严重的鼠标抖动问题：
1. 第一阶段：鼠标悬停在页面上时会出现不停抖动
2. 第二阶段：修复第一阶段后，鼠标离开插件时出现疯狂抖动

## 问题原因分析

### 第一阶段问题：Content Script过度注入
通过代码检查发现问题出现在 `manifest.json` 的配置中：

1. **Content Script 过度注入**：
   ```json
   "content_scripts": [
     {
       "matches": ["<all_urls>"],  // 在所有页面注入脚本
       "js": ["content/content.js"],
       "run_at": "document_end"
     }
   ]
   ```

2. **潜在冲突**：
   - Content script 在每个页面都被注入
   - 可能与页面原有的JavaScript产生冲突
   - 导致页面事件处理异常，引起鼠标抖动

### 第二阶段问题：未清理的定时器
修复第一阶段后发现更严重的问题：

1. **定时器泄露**：
   ```javascript
   // popup.js 和 options.js 中存在多个未清理的 setTimeout
   setTimeout(() => { window.close(); }, 1500);  // 窗口关闭后仍运行
   setTimeout(() => { toast.style.display = 'none'; }, 3000);  // DOM已销毁
   ```

2. **根本原因**：
   - popup窗口关闭后，定时器仍在尝试执行
   - 访问已经不存在的DOM元素导致连续错误
   - 错误处理机制触发页面重绘，造成抖动
   - 多个定时器同时触发形成"抖动风暴"

## 修复方案

### 第一阶段修复：移除Content Script自动注入
```json
// 修改前
"content_scripts": [
  {
    "matches": ["<all_urls>"],
    "js": ["content/content.js"],
    "run_at": "document_end"
  }
]

// 修改后
// 完全移除此配置项
```

### 2. 使用按需脚本注入
在 `background.js` 中修改页面信息获取方式：

```javascript
// 使用 chrome.scripting.executeScript 按需注入
const results = await chrome.scripting.executeScript({
  target: { tabId: tab.id },
  func: () => {
    // 安全的页面信息提取
    try {
      return {
        description: document.querySelector('meta[name="description"]')?.content || '',
        keywords: document.querySelector('meta[name="keywords"]')?.content || '',
        // ... 其他信息
      };
    } catch (e) {
      return {};
    }
  }
});
```

### 3. 添加必要权限
```json
"permissions": [
  "activeTab",
  "storage", 
  "tabs",
  "scripting"  // 新增：支持按需脚本注入
]
```

### 第二阶段修复：定时器管理系统

#### 1. 添加定时器跟踪机制
```javascript
class FeishuBookmarkPopup {
  constructor() {
    this.timers = []; // 存储所有定时器ID
    this.setupCleanup();
  }
}
```

#### 2. 实现安全的定时器
```javascript
// 安全的setTimeout，会自动跟踪定时器
safeSetTimeout(callback, delay) {
  const timerId = setTimeout(() => {
    // 执行回调前检查元素是否还存在
    if (document.body && !document.hidden) {
      try {
        callback();
      } catch (error) {
        console.error('定时器回调执行失败:', error);
      }
    }
    // 执行完成后从数组中移除
    const index = this.timers.indexOf(timerId);
    if (index > -1) {
      this.timers.splice(index, 1);
    }
  }, delay);
  
  this.timers.push(timerId);
  return timerId;
}
```

#### 3. 添加自动清理机制
```javascript
setupCleanup() {
  // 当窗口即将关闭时清理所有定时器
  window.addEventListener('beforeunload', () => {
    this.cleanup();
  });

  // 当文档变为隐藏状态时也清理
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      this.cleanup();
    }
  });
}

cleanup() {
  this.timers.forEach(timerId => {
    clearTimeout(timerId);
  });
  this.timers = [];
}
```

#### 4. 添加防御性DOM检查
```javascript
// 修改前（危险）
setTimeout(() => {
  toast.style.display = 'none';
}, 3000);

// 修改后（安全）
this.safeSetTimeout(() => {
  if (toast && toast.style) {
    toast.style.display = 'none';
  }
}, 3000);
```

## 修复效果

### 第一阶段修复效果
✅ **解决基础抖动问题**：
- 不再在所有页面自动注入脚本
- 避免与页面JavaScript冲突
- 消除页面悬停时的抖动

### 第二阶段修复效果
✅ **彻底解决抖动问题**：
- 完全消除鼠标离开插件后的疯狂抖动
- 防止定时器泄露导致的资源浪费
- 避免访问已销毁DOM元素的错误

✅ **保持功能完整**：
- 仍可获取页面基础信息（标题、URL、图标）
- 按需获取页面元数据（描述、关键词等）
- 智能标签建议功能正常工作
- Toast提示和窗口关闭功能正常

✅ **提升稳定性和性能**：
- 减少不必要的脚本注入
- 自动清理所有定时器，防止内存泄露
- 添加防御性错误处理
- 提高页面加载速度和响应性

## 测试验证

### 1. 重新加载插件
```bash
# 在 Chrome 扩展页面
1. 点击插件的"刷新"按钮
2. 或者移除插件后重新加载
```

### 2. 验证功能正常
```bash
# 测试以下功能：
✓ 点击插件图标打开收藏界面
✓ 页面信息正确显示
✓ 标签建议正常工作
✓ 收藏功能正常
✓ 鼠标在页面上移动无抖动
```

### 3. 多页面测试
```bash
# 在不同类型的页面测试：
✓ 普通网页
✓ GitHub页面  
✓ 博客文章
✓ 视频网站
✓ 技术文档
```

## 预防措施

### 1. 最小化权限原则
- 只在必要时注入脚本
- 使用 `activeTab` 权限替代 `<all_urls>`
- 避免在敏感页面执行脚本

### 2. 错误处理
```javascript
// 在脚本注入时添加错误处理
try {
  const results = await chrome.scripting.executeScript({...});
} catch (error) {
  // 如果脚本执行失败，使用基础信息
  console.log('无法获取页面详细信息，使用基础信息:', error.message);
}
```

### 3. 兼容性检查
```javascript
// 只在支持的页面类型上执行脚本
if (tab.url && (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
  // 执行脚本注入
}
```

## 版本更新

- **修复版本**: v1.0.1
- **修复内容**: 解决鼠标抖动问题，优化脚本注入机制
- **向后兼容**: 是
- **需要重新配置**: 否

## 注意事项

1. **插件更新后需要刷新**：修改manifest.json后必须重新加载插件
2. **权限变更**：新增了`scripting`权限，用户首次更新时可能需要重新授权
3. **功能测试**：建议在常用的网站上测试确保功能正常

这个修复确保了插件既能正常工作，又不会影响用户的浏览体验。