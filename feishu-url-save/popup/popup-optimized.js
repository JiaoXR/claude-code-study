// 飞书收藏插件 - 性能优化版（高质量、无抖动）
class OptimizedFeishuBookmarkPopup {
  constructor() {
    this.currentPageInfo = null;
    this.isDestroyed = false;
    this.abortController = new AbortController();
    this.init();
  }

  async init() {
    try {
      // 立即设置清理机制
      this.setupCleanup();
      
      // 并行执行初始化任务
      await Promise.all([
        this.loadPageInfo(),
        this.setupEventListeners(),
        this.setupCharacterCount()
      ]);
      
      // 设置智能默认值
      this.setupSmartDefaults();
      
      console.log('[OPTIMIZED] 飞书收藏插件初始化完成');
    } catch (error) {
      console.error('[OPTIMIZED] 初始化失败:', error);
      this.showError('插件初始化失败');
    }
  }

  // 简化的清理机制 - 只关注核心清理
  setupCleanup() {
    const cleanup = () => {
      if (!this.isDestroyed) {
        this.isDestroyed = true;
        this.abortController.abort();
        console.log('[OPTIMIZED] 资源已清理');
      }
    };

    // 最小化事件监听器，避免复杂的管理
    window.addEventListener('beforeunload', cleanup, { once: true });
    window.addEventListener('pagehide', cleanup, { once: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cleanup();
    }, { once: true });
  }

  // 优化的页面信息获取 - 避免不必要的脚本注入
  async loadPageInfo() {
    try {
      this.showLoading(true);
      
      // 只获取tab基础信息，避免脚本注入
      const [tab] = await chrome.tabs.query({ 
        active: true, 
        currentWindow: true 
      });
      
      if (!tab) throw new Error('无法获取当前标签页');
      
      this.currentPageInfo = {
        title: tab.title || '',
        url: tab.url || '',
        favIconUrl: tab.favIconUrl || '',
        timestamp: Date.now()
      };

      this.displayPageInfo();
      console.log('[OPTIMIZED] 页面信息获取完成');
      
    } catch (error) {
      console.error('[OPTIMIZED] 获取页面信息失败:', error);
      this.showError('获取页面信息失败');
    } finally {
      this.showLoading(false);
    }
  }

  // 高效的页面信息显示
  displayPageInfo() {
    if (!this.currentPageInfo) return;
    
    const titleElement = document.getElementById('pageTitle');
    const urlElement = document.getElementById('pageUrl');

    if (titleElement) {
      titleElement.textContent = this.currentPageInfo.title || '无标题';
    }
    
    if (urlElement) {
      urlElement.textContent = this.currentPageInfo.url || '';
      urlElement.title = this.currentPageInfo.url || '';
    }
  }

  // 简化的事件监听器设置
  setupEventListeners() {
    const signal = this.abortController.signal;
    
    // 保存按钮
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.saveBookmark();
      }, { signal });
    }

    // 快速保存按钮  
    const quickSaveBtn = document.getElementById('quickSaveBtn');
    if (quickSaveBtn) {
      quickSaveBtn.addEventListener('click', () => {
        this.quickSave();
      }, { signal });
    }

    // 设置按钮
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
      }, { signal });
    }

    // 表单提交
    const form = document.getElementById('bookmarkForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveBookmark();
      }, { signal });
    }

    console.log('[OPTIMIZED] 事件监听器设置完成');
  }

  // 优化的字符计数
  setupCharacterCount() {
    const noteInput = document.getElementById('noteInput');
    const charCount = document.getElementById('charCount');
    
    if (!noteInput || !charCount) return;

    // 使用防抖优化性能
    let timeoutId;
    noteInput.addEventListener('input', () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (this.isDestroyed) return;
        
        const count = noteInput.value.length;
        charCount.textContent = count;
        charCount.style.color = count > 450 ? '#dc2626' : '#64748b';
      }, 100);
    }, { signal: this.abortController.signal });
  }

  // 智能默认值设置
  setupSmartDefaults() {
    if (!this.currentPageInfo) return;

    try {
      // 智能填充网站说明
      const descInput = document.getElementById('descriptionInput');
      if (descInput && !descInput.value.trim()) {
        const title = this.currentPageInfo.title;
        if (title && title.length > 10) {
          descInput.value = title.length > 100 ? 
            title.substring(0, 97) + '...' : title;
        }
      }

      // 智能选择分类
      const categorySelect = document.getElementById('categorySelect');
      if (categorySelect && !categorySelect.value) {
        const url = this.currentPageInfo.url.toLowerCase();
        const title = (this.currentPageInfo.title || '').toLowerCase();
        const content = url + ' ' + title;

        if (this.containsKeywords(content, [
          'github', 'code', 'programming', 'coding', 'developer', 'api',
          'chatgpt', 'openai', 'copilot', '编程', '代码', '开发'
        ])) {
          categorySelect.value = 'AI编程';
        } else if (this.containsKeywords(content, [
          'ai', 'chat', 'assistant', 'tool', '工具', '助手'
        ])) {
          categorySelect.value = 'AI工具';
        } else {
          categorySelect.value = '其他';
        }
      }

      console.log('[OPTIMIZED] 智能默认值设置完成');
    } catch (error) {
      console.error('[OPTIMIZED] 设置智能默认值失败:', error);
    }
  }

  // 关键词匹配辅助函数
  containsKeywords(text, keywords) {
    return keywords.some(keyword => text.includes(keyword));
  }

  // 优化的保存收藏功能
  async saveBookmark() {
    if (this.isDestroyed) return;

    try {
      if (!this.currentPageInfo) {
        this.showError('页面信息不可用');
        return;
      }

      // 禁用按钮防止重复点击
      const saveBtn = document.getElementById('saveBtn');
      if (saveBtn) saveBtn.disabled = true;

      this.showLoading(true);

      // 获取表单数据
      const formData = this.getFormData();
      if (!formData) return;

      // 构建收藏数据
      const bookmarkData = {
        url: this.currentPageInfo.url,
        title: this.currentPageInfo.title,
        description: formData.description,
        note: formData.note,
        category: formData.category,
        favicon: this.currentPageInfo.favIconUrl,
        timestamp: Date.now()
      };

      // 调用后台保存
      const response = await this.sendMessage('saveBookmark', bookmarkData);
      
      if (response.success) {
        this.showSuccess('收藏成功！');
        // 延迟关闭，让用户看到成功消息
        setTimeout(() => {
          if (!this.isDestroyed) window.close();
        }, 1000);
      } else {
        this.showError(response.error || '保存失败');
      }

    } catch (error) {
      console.error('[OPTIMIZED] 保存收藏失败:', error);
      this.showError('保存失败');
    } finally {
      this.showLoading(false);
      // 重新启用按钮
      const saveBtn = document.getElementById('saveBtn');
      if (saveBtn) saveBtn.disabled = false;
    }
  }

  // 快速保存功能
  async quickSave() {
    if (this.isDestroyed || !this.currentPageInfo) return;

    try {
      const quickSaveBtn = document.getElementById('quickSaveBtn');
      if (quickSaveBtn) quickSaveBtn.disabled = true;

      this.showLoading(true);

      const bookmarkData = {
        url: this.currentPageInfo.url,
        title: this.currentPageInfo.title,
        description: this.currentPageInfo.title || '网站内容',
        note: '',
        category: '其他',
        favicon: this.currentPageInfo.favIconUrl,
        timestamp: Date.now()
      };

      const response = await this.sendMessage('saveBookmark', bookmarkData);
      
      if (response.success) {
        this.showSuccess('快速收藏成功！');
        setTimeout(() => {
          if (!this.isDestroyed) window.close();
        }, 800);
      } else {
        this.showError(response.error || '快速保存失败');
      }

    } catch (error) {
      console.error('[OPTIMIZED] 快速保存失败:', error);
      this.showError('快速保存失败');
    } finally {
      this.showLoading(false);
      const quickSaveBtn = document.getElementById('quickSaveBtn');
      if (quickSaveBtn) quickSaveBtn.disabled = false;
    }
  }

  // 获取表单数据
  getFormData() {
    const description = document.getElementById('descriptionInput')?.value?.trim();
    const note = document.getElementById('noteInput')?.value?.trim() || '';
    const category = document.getElementById('categorySelect')?.value;

    if (!description) {
      this.showError('请填写网站说明');
      return null;
    }

    if (!category) {
      this.showError('请选择标签分类');
      return null;
    }

    return { description, note, category };
  }

  // 优化的消息发送
  async sendMessage(action, data) {
    try {
      return await chrome.runtime.sendMessage({
        action,
        data,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('[OPTIMIZED] 消息发送失败:', error);
      throw new Error('与后台通信失败');
    }
  }

  // 简化的UI状态管理
  showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.style.display = show ? 'flex' : 'none';
    }
  }

  showSuccess(message) {
    this.showToast('successToast', message);
  }

  showError(message) {
    this.showToast('errorToast', message);
  }

  showToast(toastId, message) {
    const toast = document.getElementById(toastId);
    if (!toast) return;

    const textElement = toast.querySelector('.toast-text');
    if (textElement) {
      textElement.textContent = message;
    }
    
    toast.style.display = 'block';
    
    // 3秒后自动隐藏
    setTimeout(() => {
      if (toast && !this.isDestroyed) {
        toast.style.display = 'none';
      }
    }, 3000);
  }
}

// DOM加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new OptimizedFeishuBookmarkPopup();
  });
} else {
  new OptimizedFeishuBookmarkPopup();
}