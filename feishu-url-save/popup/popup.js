// 飞书收藏插件 - 弹窗脚本
class FeishuBookmarkPopup {
  constructor() {
    this.currentPageInfo = null;
    this.timers = []; // 存储所有定时器ID
    this.eventListeners = []; // 存储所有事件监听器
    this.isDestroyed = false; // 标记是否已销毁
    this.init();
  }

  async init() {
    await this.loadPageInfo();
    this.setupEventListeners();
    this.setupCharacterCount();
    this.setupCleanup();
    this.setupSmartDefaults();
  }

  // 设置清理机制
  setupCleanup() {
    // 立即清理机制 - 当窗口失去焦点时
    const handleWindowBlur = () => {
      this.cleanup();
    };
    
    // 当窗口即将关闭时清理所有定时器
    const handleBeforeUnload = () => {
      this.cleanup();
      // 通知background也进行清理
      try {
        chrome.runtime.sendMessage({ action: 'popupClosed' });
      } catch (e) {
        // 忽略错误，可能runtime已不可用
      }
    };

    // 当文档变为隐藏状态时也清理
    const handleVisibilityChange = () => {
      if (document.hidden || document.visibilityState === 'hidden') {
        this.cleanup();
        // 通知background清理相关资源
        try {
          chrome.runtime.sendMessage({ action: 'popupHidden' });
        } catch (e) {
          // 忽略错误
        }
      }
    };

    // 当窗口失去焦点时清理
    const handlePageHide = () => {
      this.cleanup();
    };

    // 当popup窗口关闭时清理
    const handleWindowClose = () => {
      this.cleanup();
      try {
        chrome.runtime.sendMessage({ action: 'popupClosed' });
      } catch (e) {
        // 忽略错误
      }
    };

    // 注册所有事件监听器
    this.addEventListenerSafe(window, 'beforeunload', handleBeforeUnload);
    this.addEventListenerSafe(window, 'pagehide', handlePageHide);
    this.addEventListenerSafe(window, 'blur', handleWindowBlur);
    this.addEventListenerSafe(window, 'unload', handleWindowClose);
    this.addEventListenerSafe(document, 'visibilitychange', handleVisibilityChange);

    // 监听插件上下文失效
    if (chrome.runtime) {
      try {
        chrome.runtime.onConnect.addListener(() => {
          // 连接时不做什么
        });
      } catch (e) {
        // 如果runtime不可用，立即清理
        this.cleanup();
      }
    }

    // 当页面即将被浏览器回收时清理
    document.addEventListener('freeze', () => {
      this.cleanup();
    }, { once: true });
  }

  // 安全添加事件监听器
  addEventListenerSafe(element, event, handler) {
    if (!element || this.isDestroyed) return;
    
    element.addEventListener(event, handler);
    this.eventListeners.push({ element, event, handler });
  }

  // 清理所有资源
  cleanup() {
    if (this.isDestroyed) {
      console.log('[DEBUG-POPUP] 重复调用cleanup，已忽略');
      return;
    }
    
    console.log('[DEBUG-POPUP] 开始清理Popup资源...');
    this.isDestroyed = true;
    
    // 清理所有定时器
    console.log(`[DEBUG-POPUP] 清理${this.timers.length}个定时器`);
    this.timers.forEach(timerId => {
      console.log(`[DEBUG-POPUP] 清理定时器${timerId}`);
      clearTimeout(timerId);
    });
    this.timers = [];

    // 移除所有事件监听器
    console.log(`[DEBUG-POPUP] 移除${this.eventListeners.length}个事件监听器`);
    this.eventListeners.forEach(({ element, event, handler }) => {
      try {
        if (element && element.removeEventListener) {
          console.log(`[DEBUG-POPUP] 移除事件监听器: ${event}`);
          element.removeEventListener(event, handler);
        }
      } catch (e) {
        console.error('[ERROR-POPUP] 移除事件监听器失败:', e);
      }
    });
    this.eventListeners = [];

    // 清理页面信息引用
    this.currentPageInfo = null;

    console.log('[DEBUG-POPUP] 飞书收藏插件Popup资源已清理');
  }

  // 安全的setTimeout，会自动跟踪定时器
  safeSetTimeout(callback, delay) {
    if (this.isDestroyed) {
      console.log('[DEBUG-POPUP] 尝试创建定时器但popup已销毁，已忽略');
      return null;
    }
    
    const timerId = setTimeout(() => {
      // 执行回调前检查是否已销毁
      if (this.isDestroyed || document.hidden || !document.body) {
        console.log('[DEBUG-POPUP] 定时器执行时popup已销毁或页面隐藏，已忽略');
        return;
      }
      
      try {
        console.log('[DEBUG-POPUP] 执行popup定时器回调');
        callback();
      } catch (error) {
        console.error('[ERROR-POPUP] 定时器回调执行失败:', error);
      }
      
      // 执行完成后从数组中移除
      const index = this.timers.indexOf(timerId);
      if (index > -1) {
        this.timers.splice(index, 1);
      }
      console.log(`[DEBUG-POPUP] 定时器${timerId}已完成并移除，剩余定时器数量:`, this.timers.length);
    }, delay);
    
    this.timers.push(timerId);
    console.log(`[DEBUG-POPUP] 创建新定时器${timerId}，延迟${delay}ms，当前定时器总数:`, this.timers.length);
    return timerId;
  }

  // 加载页面信息
  async loadPageInfo() {
    try {
      this.showLoading(true);
      
      // 获取当前活动标签页
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // 通过background获取页面信息
      const response = await chrome.runtime.sendMessage({
        action: 'getPageInfo',
        tabId: tab.id
      });

      if (response.success) {
        this.currentPageInfo = response.data;
        this.displayPageInfo();
      } else {
        this.showError('获取页面信息失败');
      }
    } catch (error) {
      console.error('加载页面信息失败:', error);
      this.showError('获取页面信息失败');
    } finally {
      this.showLoading(false);
    }
  }

  // 显示页面信息
  displayPageInfo() {
    const titleElement = document.getElementById('pageTitle');
    const urlElement = document.getElementById('pageUrl');

    if (this.currentPageInfo) {
      titleElement.textContent = this.currentPageInfo.title || '无标题';
      urlElement.textContent = this.currentPageInfo.url || '';
      urlElement.title = this.currentPageInfo.url || '';
    }
  }

  // 设置事件监听器
  setupEventListeners() {
    // 保存按钮
    const saveBtn = document.getElementById('saveBtn');
    this.addEventListenerSafe(saveBtn, 'click', (e) => {
      e.preventDefault();
      this.saveBookmark();
    });

    // 快速保存按钮
    const quickSaveBtn = document.getElementById('quickSaveBtn');
    this.addEventListenerSafe(quickSaveBtn, 'click', () => {
      this.quickSave();
    });

    // 预览按钮
    const previewBtn = document.getElementById('previewBtn');
    this.addEventListenerSafe(previewBtn, 'click', () => {
      this.previewBookmark();
    });

    // 设置按钮
    const settingsBtn = document.getElementById('settingsBtn');
    this.addEventListenerSafe(settingsBtn, 'click', () => {
      this.openSettings();
    });

    // 查看收藏按钮
    const viewBookmarksBtn = document.getElementById('viewBookmarksBtn');
    this.addEventListenerSafe(viewBookmarksBtn, 'click', () => {
      this.viewBookmarks();
    });

    // 分类选择处理
    const categorySelect = document.getElementById('categorySelect');
    this.addEventListenerSafe(categorySelect, 'change', () => {
      // 可以在这里添加选择变化的处理逻辑
      console.log('选择的分类:', categorySelect.value);
    });

    // 表单提交
    const bookmarkForm = document.getElementById('bookmarkForm');
    this.addEventListenerSafe(bookmarkForm, 'submit', (e) => {
      e.preventDefault();
      this.saveBookmark();
    });
  }

  // 设置字符计数
  setupCharacterCount() {
    const noteInput = document.getElementById('noteInput');
    const charCount = document.getElementById('charCount');

    this.addEventListenerSafe(noteInput, 'input', () => {
      if (this.isDestroyed || !charCount) return;
      
      const count = noteInput.value.length;
      charCount.textContent = count;
      
      if (count > 450) {
        charCount.style.color = '#dc2626';
      } else {
        charCount.style.color = '#64748b';
      }
    });
  }

  // 设置智能默认值
  setupSmartDefaults() {
    try {
      if (this.currentPageInfo) {
        // 智能填充网站说明
        this.fillSmartDescription();
        
        // 智能选择分类
        this.selectSmartCategory();
      }
    } catch (error) {
      console.error('设置智能默认值失败:', error);
    }
  }

  // 智能填充网站说明
  fillSmartDescription() {
    const descriptionInput = document.getElementById('descriptionInput');
    if (!descriptionInput || descriptionInput.value.trim()) return; // 如果已有内容则不覆盖

    let description = '';

    // 优先使用页面描述
    if (this.currentPageInfo.description) {
      description = this.currentPageInfo.description.substring(0, 100);
    } 
    // 其次使用OG描述
    else if (this.currentPageInfo.ogDescription) {
      description = this.currentPageInfo.ogDescription.substring(0, 100);
    }
    // 最后基于标题生成描述
    else if (this.currentPageInfo.title) {
      description = `${this.currentPageInfo.title}相关内容`;
    }

    if (description) {
      descriptionInput.value = description;
    }
  }

  // 智能选择分类
  selectSmartCategory() {
    const categorySelect = document.getElementById('categorySelect');
    if (!categorySelect || categorySelect.value) return; // 如果已选择则不覆盖

    if (!this.currentPageInfo?.url) return;

    const url = this.currentPageInfo.url.toLowerCase();
    const title = (this.currentPageInfo.title || '').toLowerCase();
    const description = (this.currentPageInfo.description || '').toLowerCase();
    const content = url + ' ' + title + ' ' + description;

    // AI编程相关关键词
    const aiProgrammingKeywords = [
      'github', 'code', 'programming', 'coding', 'developer', 'api', 'sdk',
      'chatgpt', 'openai', 'copilot', 'ai assistant', 'claude', 'gemini',
      'machine learning', 'deep learning', 'tensorflow', 'pytorch',
      '编程', '代码', '开发', 'AI编程', '人工智能编程'
    ];

    // AI工具相关关键词  
    const aiToolsKeywords = [
      'midjourney', 'stable diffusion', 'dall-e', 'ai generator', 'ai tool',
      'chat', 'assistant', 'automation', 'ai platform', 'artificial intelligence',
      'ai写作', 'ai设计', 'ai生成', 'ai助手', '人工智能工具', 'ai应用'
    ];

    // 检查是否匹配AI编程
    if (aiProgrammingKeywords.some(keyword => content.includes(keyword))) {
      categorySelect.value = 'AI编程';
    }
    // 检查是否匹配AI工具
    else if (aiToolsKeywords.some(keyword => content.includes(keyword))) {
      categorySelect.value = 'AI工具';
    }
    // 默认选择其他
    else {
      categorySelect.value = '其他';
    }
  }


  // 保存收藏
  async saveBookmark() {
    try {
      if (!this.currentPageInfo) {
        this.showError('页面信息获取失败');
        return;
      }

      this.showLoading(true);

      const description = document.getElementById('descriptionInput').value.trim();
      const note = document.getElementById('noteInput').value.trim();
      const category = document.getElementById('categorySelect').value;

      // 验证必填字段
      if (!description) {
        this.showError('请填写网站说明');
        return;
      }

      if (!category) {
        this.showError('请选择标签分类');
        return;
      }

      const bookmarkData = {
        url: this.currentPageInfo.url,
        title: this.currentPageInfo.title, // 保留内部使用
        description: description,
        note: note,
        category: category,
        favicon: this.currentPageInfo.favIconUrl
      };

      const response = await chrome.runtime.sendMessage({
        action: 'saveBookmark',
        data: bookmarkData
      });

      if (response.success) {
        this.showSuccess('收藏成功！');
        
        // 可选：关闭弹窗
        this.safeSetTimeout(() => {
          if (window && !window.closed) {
            window.close();
          }
        }, 1500);
      } else {
        this.showError(response.error || '保存失败');
      }
    } catch (error) {
      console.error('保存收藏失败:', error);
      this.showError('保存失败');
    } finally {
      this.showLoading(false);
    }
  }

  // 快速保存（使用智能默认值）
  async quickSave() {
    try {
      if (!this.currentPageInfo) {
        this.showError('页面信息获取失败');
        return;
      }

      this.showLoading(true);

      // 使用智能默认值进行快速保存
      let description = '';
      if (this.currentPageInfo.description) {
        description = this.currentPageInfo.description.substring(0, 100);
      } else if (this.currentPageInfo.title) {
        description = `${this.currentPageInfo.title}相关内容`;
      } else {
        description = '网站内容';
      }

      // 智能选择分类
      let category = '其他';
      if (this.currentPageInfo.url) {
        const content = (this.currentPageInfo.url + ' ' + this.currentPageInfo.title).toLowerCase();
        if (content.includes('github') || content.includes('code') || content.includes('programming') || content.includes('编程')) {
          category = 'AI编程';
        } else if (content.includes('ai') || content.includes('chat') || content.includes('assistant') || content.includes('工具')) {
          category = 'AI工具';
        }
      }

      const bookmarkData = {
        url: this.currentPageInfo.url,
        title: this.currentPageInfo.title,
        description: description,
        note: '',
        category: category,
        favicon: this.currentPageInfo.favIconUrl
      };

      const response = await chrome.runtime.sendMessage({
        action: 'saveBookmark',
        data: bookmarkData
      });

      if (response.success) {
        this.showSuccess('快速收藏成功！');
        this.safeSetTimeout(() => {
          if (window && !window.closed) {
            window.close();
          }
        }, 1000);
      } else {
        this.showError(response.error || '快速保存失败');
      }
    } catch (error) {
      console.error('快速保存失败:', error);
      this.showError('快速保存失败');
    } finally {
      this.showLoading(false);
    }
  }

  // 预览收藏
  previewBookmark() {
    const description = document.getElementById('descriptionInput').value.trim();
    const note = document.getElementById('noteInput').value.trim();
    const category = document.getElementById('categorySelect').value;

    const preview = {
      网站地址: this.currentPageInfo?.url || '',
      网站说明: description || '未填写',
      网站备注: note || '无',
      标签: category || '未选择',
      收藏时间: new Date().toLocaleString('zh-CN')
    };

    const previewText = Object.entries(preview)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    alert(`预览收藏内容:\n\n${previewText}`);
  }

  // 打开设置页面
  openSettings() {
    chrome.runtime.openOptionsPage();
  }

  // 查看收藏列表
  viewBookmarks() {
    // 这里可以打开一个新页面显示收藏列表
    // 或者跳转到飞书多维表格
    this.showInfo('功能开发中...');
  }

  // 显示加载状态
  showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    overlay.style.display = show ? 'flex' : 'none';
  }

  // 显示成功消息
  showSuccess(message) {
    const toast = document.getElementById('successToast');
    if (!toast) return; // 防御性检查
    
    const textElement = toast.querySelector('.toast-text');
    if (textElement) {
      textElement.textContent = message;
    }
    toast.style.display = 'flex';
    
    this.safeSetTimeout(() => {
      if (toast && toast.style) {
        toast.style.display = 'none';
      }
    }, 3000);
  }

  // 显示错误消息
  showError(message) {
    const toast = document.getElementById('errorToast');
    if (!toast) return; // 防御性检查
    
    const textElement = toast.querySelector('.toast-text');
    if (textElement) {
      textElement.textContent = message;
    }
    toast.style.display = 'flex';
    
    this.safeSetTimeout(() => {
      if (toast && toast.style) {
        toast.style.display = 'none';
      }
    }, 5000);
  }

  // 显示信息消息
  showInfo(message) {
    const status = document.getElementById('status');
    if (!status) return; // 防御性检查
    
    status.textContent = message;
    status.className = 'status info';
    status.style.display = 'block';
    
    this.safeSetTimeout(() => {
      if (status && status.style) {
        status.style.display = 'none';
      }
    }, 3000);
  }
}

// 当DOM加载完成时初始化
document.addEventListener('DOMContentLoaded', () => {
  new FeishuBookmarkPopup();
});