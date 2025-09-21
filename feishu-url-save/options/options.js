// 飞书收藏插件 - 设置页面脚本
class OptionsManager {
  constructor() {
    this.currentSettings = {};
    this.timers = []; // 存储所有定时器ID
    this.init();
  }

  async init() {
    await this.loadSettings();
    this.setupEventListeners();
    this.setupTabs();
    this.loadSyncStats();
    this.setupCleanup();
  }

  // 设置清理机制
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

  // 清理所有定时器
  cleanup() {
    this.timers.forEach(timerId => {
      clearTimeout(timerId);
    });
    this.timers = [];
  }

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

  // 加载设置
  async loadSettings() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getSettings' });
      
      if (response.success) {
        this.currentSettings = response.data || {};
        this.populateForm();
      } else {
        this.showToast('加载设置失败', 'error');
      }
    } catch (error) {
      console.error('加载设置失败:', error);
      this.showToast('加载设置失败', 'error');
    }
  }

  // 填充表单
  populateForm() {
    const settings = this.currentSettings;

    // 基础设置
    document.getElementById('appToken').value = settings.appToken || '';
    document.getElementById('tableId').value = settings.tableId || '';
    document.getElementById('accessToken').value = settings.accessToken || '';
    // 分类信息是静态的，无需填充
    document.getElementById('autoSync').checked = settings.autoSync !== false;
    document.getElementById('enableNotifications').checked = settings.enableNotifications !== false;

    // 高级设置
    document.getElementById('syncInterval').value = settings.syncInterval || 5;
    document.getElementById('maxRetries').value = settings.maxRetries || 3;
    document.getElementById('debugMode').checked = settings.debugMode || false;
    document.getElementById('dataRetention').value = settings.dataRetention || 30;
  }

  // 设置事件监听器
  setupEventListeners() {
    // 基础设置表单提交
    document.getElementById('basicForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveBasicSettings();
    });

    // 测试连接
    document.getElementById('testConnectionBtn').addEventListener('click', () => {
      this.testConnection();
    });

    // 高级设置保存
    document.querySelectorAll('#advanced input').forEach(input => {
      input.addEventListener('change', () => {
        this.saveAdvancedSettings();
      });
    });

    // 数据管理按钮
    document.getElementById('clearDataBtn').addEventListener('click', () => {
      this.clearAllData();
    });

    document.getElementById('exportDataBtn').addEventListener('click', () => {
      this.exportData();
    });

    // 同步管理按钮
    document.getElementById('retryAllBtn').addEventListener('click', () => {
      this.retryAllSync();
    });

    document.getElementById('refreshStatsBtn').addEventListener('click', () => {
      this.loadSyncStats();
    });

    // 关于页面链接
    document.getElementById('helpLink').addEventListener('click', (e) => {
      e.preventDefault();
      this.openHelp();
    });

    document.getElementById('feedbackLink').addEventListener('click', (e) => {
      e.preventDefault();
      this.openFeedback();
    });

    document.getElementById('updateLink').addEventListener('click', (e) => {
      e.preventDefault();
      this.checkUpdate();
    });
  }

  // 设置标签页切换
  setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;

        // 更新按钮状态
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // 切换内容
        tabContents.forEach(content => {
          content.classList.remove('active');
          if (content.id === targetTab) {
            content.classList.add('active');
          }
        });

        // 如果切换到同步管理，刷新统计
        if (targetTab === 'sync') {
          this.loadSyncStats();
        }
      });
    });
  }

  // 保存基础设置
  async saveBasicSettings() {
    try {
      this.showLoading(true);

      const formData = new FormData(document.getElementById('basicForm'));
      const settings = {
        appToken: document.getElementById('appToken').value.trim(),
        tableId: document.getElementById('tableId').value.trim(),
        accessToken: document.getElementById('accessToken').value.trim(),
        categories: ['AI编程', 'AI工具', '其他'], // 固定分类
        autoSync: document.getElementById('autoSync').checked,
        enableNotifications: document.getElementById('enableNotifications').checked
      };

      // 验证必填字段
      if (!settings.appToken || !settings.tableId || !settings.accessToken) {
        this.showToast('请填写所有必填字段', 'error');
        return;
      }

      const response = await chrome.runtime.sendMessage({
        action: 'saveSettings',
        data: settings
      });

      if (response.success) {
        this.currentSettings = { ...this.currentSettings, ...settings };
        this.showToast('设置保存成功', 'success');
      } else {
        this.showToast('保存设置失败', 'error');
      }
    } catch (error) {
      console.error('保存设置失败:', error);
      this.showToast('保存设置失败', 'error');
    } finally {
      this.showLoading(false);
    }
  }

  // 保存高级设置
  async saveAdvancedSettings() {
    try {
      const settings = {
        syncInterval: parseInt(document.getElementById('syncInterval').value) || 5,
        maxRetries: parseInt(document.getElementById('maxRetries').value) || 3,
        debugMode: document.getElementById('debugMode').checked,
        dataRetention: parseInt(document.getElementById('dataRetention').value) || 30
      };

      const response = await chrome.runtime.sendMessage({
        action: 'saveSettings',
        data: settings
      });

      if (response.success) {
        this.currentSettings = { ...this.currentSettings, ...settings };
        this.showToast('高级设置已保存', 'success');
      }
    } catch (error) {
      console.error('保存高级设置失败:', error);
      this.showToast('保存高级设置失败', 'error');
    }
  }

  // 测试连接
  async testConnection() {
    try {
      this.showLoading(true);
      
      const config = {
        appToken: document.getElementById('appToken').value.trim(),
        tableId: document.getElementById('tableId').value.trim(),
        accessToken: document.getElementById('accessToken').value.trim()
      };

      if (!config.appToken || !config.tableId || !config.accessToken) {
        this.showToast('请先填写连接配置', 'error');
        return;
      }

      const response = await chrome.runtime.sendMessage({
        action: 'testFeishuConnection',
        data: config
      });

      if (response.success && response.data.success) {
        this.showToast('连接测试成功！', 'success');
      } else {
        this.showToast(response.data?.message || '连接测试失败', 'error');
      }
    } catch (error) {
      console.error('测试连接失败:', error);
      this.showToast('连接测试失败', 'error');
    } finally {
      this.showLoading(false);
    }
  }

  // 加载同步统计
  async loadSyncStats() {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'getBookmarks'
      });

      if (response.success) {
        const stats = response.data;
        document.getElementById('totalBookmarks').textContent = stats.total;
        document.getElementById('syncedBookmarks').textContent = stats.syncedCount;
        document.getElementById('unsyncedBookmarks').textContent = stats.unsyncedCount;
      }
    } catch (error) {
      console.error('加载同步统计失败:', error);
    }
  }

  // 重试所有同步
  async retryAllSync() {
    try {
      this.showLoading(true);
      
      const response = await chrome.runtime.sendMessage({
        action: 'retryFailedSync'
      });

      if (response.success) {
        this.showToast(response.data.message, 'success');
        this.loadSyncStats(); // 刷新统计
      } else {
        this.showToast('重试同步失败', 'error');
      }
    } catch (error) {
      console.error('重试同步失败:', error);
      this.showToast('重试同步失败', 'error');
    } finally {
      this.showLoading(false);
    }
  }

  // 清除所有数据
  async clearAllData() {
    if (!confirm('确定要清除所有本地收藏数据吗？此操作不可撤销！')) {
      return;
    }

    try {
      this.showLoading(true);
      
      await chrome.storage.local.clear();
      
      this.showToast('所有数据已清除', 'success');
      this.loadSyncStats();
      
      // 重新初始化默认设置
      this.safeSetTimeout(() => {
        if (location && location.reload) {
          location.reload();
        }
      }, 1500);
    } catch (error) {
      console.error('清除数据失败:', error);
      this.showToast('清除数据失败', 'error');
    } finally {
      this.showLoading(false);
    }
  }

  // 导出数据
  async exportData() {
    try {
      this.showLoading(true);
      
      const response = await chrome.runtime.sendMessage({
        action: 'getBookmarks'
      });

      if (response.success) {
        const data = {
          bookmarks: response.data.bookmarks,
          exported_at: new Date().toISOString(),
          version: '1.0.0'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `feishu-bookmarks-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showToast('数据导出成功', 'success');
      } else {
        this.showToast('导出数据失败', 'error');
      }
    } catch (error) {
      console.error('导出数据失败:', error);
      this.showToast('导出数据失败', 'error');
    } finally {
      this.showLoading(false);
    }
  }

  // 打开帮助
  openHelp() {
    window.open('https://example.com/help', '_blank');
  }

  // 打开反馈
  openFeedback() {
    window.open('https://example.com/feedback', '_blank');
  }

  // 检查更新
  async checkUpdate() {
    this.showToast('当前已是最新版本', 'info');
  }

  // 显示加载状态
  showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    overlay.style.display = show ? 'flex' : 'none';
  }

  // 显示提示消息
  showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return; // 防御性检查
    
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');

    this.safeSetTimeout(() => {
      if (toast && toast.classList) {
        toast.classList.remove('show');
      }
    }, 3000);
  }
}

// 当DOM加载完成时初始化
document.addEventListener('DOMContentLoaded', () => {
  new OptionsManager();
});