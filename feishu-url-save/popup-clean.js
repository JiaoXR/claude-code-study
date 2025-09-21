// 飞书收藏插件 - 极简干净版本（无抖动）
class CleanFeishuBookmarkPopup {
  constructor() {
    this.currentPageInfo = null;
    this.isDestroyed = false;
    this.init();
  }

  async init() {
    console.log('[CLEAN] 初始化干净版本popup');
    
    // 只在初始化时获取页面信息，不使用定时器
    await this.loadPageInfoOnce();
    this.setupBasicEventListeners();
    this.setupImmediateCleanup();
  }

  // 设置立即清理 - 任何可能的退出都立即清理
  setupImmediateCleanup() {
    const cleanup = () => {
      if (!this.isDestroyed) {
        console.log('[CLEAN] 立即清理');
        this.isDestroyed = true;
      }
    };

    // 监听所有可能的退出事件
    window.addEventListener('beforeunload', cleanup);
    window.addEventListener('pagehide', cleanup);
    window.addEventListener('blur', cleanup);
    window.addEventListener('unload', cleanup);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cleanup();
    });
  }

  // 只获取一次页面信息，不使用缓存和定时器
  async loadPageInfoOnce() {
    try {
      console.log('[CLEAN] 获取页面信息（一次性）');
      
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // 基础信息，不进行脚本注入
      this.currentPageInfo = {
        title: tab.title || '',
        url: tab.url,
        favIconUrl: tab.favIconUrl || '',
        timestamp: new Date().toISOString()
      };

      this.displayPageInfo();
    } catch (error) {
      console.error('[CLEAN] 获取页面信息失败:', error);
      this.showError('获取页面信息失败');
    }
  }

  // 显示页面信息
  displayPageInfo() {
    const titleElement = document.getElementById('pageTitle');
    const urlElement = document.getElementById('pageUrl');

    if (this.currentPageInfo && titleElement && urlElement) {
      titleElement.textContent = this.currentPageInfo.title || '无标题';
      urlElement.textContent = this.currentPageInfo.url || '';
      urlElement.title = this.currentPageInfo.url || '';
    }
  }

  // 设置基础事件监听器 - 不使用自定义包装
  setupBasicEventListeners() {
    // 保存按钮
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.saveBookmark();
      });
    }

    // 快速保存按钮
    const quickSaveBtn = document.getElementById('quickSaveBtn');
    if (quickSaveBtn) {
      quickSaveBtn.addEventListener('click', () => {
        this.quickSave();
      });
    }

    // 设置按钮
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        this.openSettings();
      });
    }

    // 表单提交
    const bookmarkForm = document.getElementById('bookmarkForm');
    if (bookmarkForm) {
      bookmarkForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveBookmark();
      });
    }

    // 字符计数 - 简单版本
    const noteInput = document.getElementById('noteInput');
    const charCount = document.getElementById('charCount');
    if (noteInput && charCount) {
      noteInput.addEventListener('input', () => {
        const count = noteInput.value.length;
        charCount.textContent = count;
        charCount.style.color = count > 450 ? '#dc2626' : '#64748b';
      });
    }

    console.log('[CLEAN] 基础事件监听器设置完成');
  }

  // 保存收藏 - 不使用定时器自动关闭
  async saveBookmark() {
    if (this.isDestroyed) return;
    
    try {
      if (!this.currentPageInfo) {
        this.showError('页面信息获取失败');
        return;
      }

      this.showLoading(true);

      const description = document.getElementById('descriptionInput')?.value?.trim() || '';
      const note = document.getElementById('noteInput')?.value?.trim() || '';
      const category = document.getElementById('categorySelect')?.value || '';

      if (!description) {
        this.showError('请填写网站说明');
        return;
      }

      const bookmarkData = {
        url: this.currentPageInfo.url,
        title: this.currentPageInfo.title,
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
        // 不自动关闭，让用户手动关闭
      } else {
        this.showError(response.error || '保存失败');
      }
    } catch (error) {
      console.error('[CLEAN] 保存收藏失败:', error);
      this.showError('保存失败');
    } finally {
      this.showLoading(false);
    }
  }

  // 快速保存
  async quickSave() {
    if (this.isDestroyed) return;
    
    try {
      if (!this.currentPageInfo) {
        this.showError('页面信息获取失败');
        return;
      }

      this.showLoading(true);

      const bookmarkData = {
        url: this.currentPageInfo.url,
        title: this.currentPageInfo.title,
        description: this.currentPageInfo.title || '网站内容',
        note: '',
        category: '其他',
        favicon: this.currentPageInfo.favIconUrl
      };

      const response = await chrome.runtime.sendMessage({
        action: 'saveBookmark',
        data: bookmarkData
      });

      if (response.success) {
        this.showSuccess('快速收藏成功！');
      } else {
        this.showError(response.error || '快速保存失败');
      }
    } catch (error) {
      console.error('[CLEAN] 快速保存失败:', error);
      this.showError('快速保存失败');
    } finally {
      this.showLoading(false);
    }
  }

  // 打开设置页面
  openSettings() {
    if (this.isDestroyed) return;
    chrome.runtime.openOptionsPage();
  }

  // 显示加载状态
  showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.style.display = show ? 'flex' : 'none';
    }
  }

  // 显示成功消息 - 不使用定时器自动隐藏
  showSuccess(message) {
    const toast = document.getElementById('successToast');
    if (!toast) return;
    
    const textElement = toast.querySelector('.toast-text');
    if (textElement) {
      textElement.textContent = message;
    }
    toast.style.display = 'flex';
    
    // 用户手动点击关闭，不自动隐藏
  }

  // 显示错误消息 - 不使用定时器自动隐藏
  showError(message) {
    const toast = document.getElementById('errorToast');
    if (!toast) return;
    
    const textElement = toast.querySelector('.toast-text');
    if (textElement) {
      textElement.textContent = message;
    }
    toast.style.display = 'flex';
    
    // 用户手动点击关闭，不自动隐藏
  }
}

// 当DOM加载完成时初始化
document.addEventListener('DOMContentLoaded', () => {
  console.log('[CLEAN] DOM加载完成，初始化干净版本');
  new CleanFeishuBookmarkPopup();
});