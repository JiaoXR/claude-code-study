// 飞书收藏插件 - 后台脚本
class FeishuBookmarkManager {
  constructor() {
    this.pageInfoCache = new Map(); // 页面信息缓存
    this.scriptInjectionInProgress = new Set(); // 正在进行的脚本注入
    this.timers = new Set(); // 跟踪所有定时器
    this.isShuttingDown = false; // 标记是否正在关闭
    this.init();
  }

  init() {
    // 插件安装时初始化
    chrome.runtime.onInstalled.addListener(() => {
      console.log('飞书收藏插件已安装');
      this.initializeStorage();
    });

    // 监听来自popup和content script的消息
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // 保持消息通道开放
    });

    // 监听service worker生命周期事件
    if (typeof self !== 'undefined' && self.addEventListener) {
      self.addEventListener('beforeunload', () => {
        this.cleanup();
      });
      
      // 监听扩展上下文失效
      chrome.runtime.onSuspend?.addListener(() => {
        this.cleanup();
      });
    }
  }

  // 初始化存储
  async initializeStorage() {
    const defaultSettings = {
      appToken: '',
      tableId: '',
      accessToken: '',
      categories: ['AI编程', 'AI工具', '其他'], // 单选字段选项
      autoSync: true,
      enableNotifications: true,
      syncInterval: 5,
      maxRetries: 3,
      debugMode: false,
      dataRetention: 30
    };

    try {
      const result = await chrome.storage.local.get('settings');
      if (!result.settings) {
        await chrome.storage.local.set({ settings: defaultSettings });
      }
    } catch (error) {
      console.error('初始化存储失败:', error);
    }
  }

  // 处理消息
  async handleMessage(request, sender, sendResponse) {
    try {
      switch (request.action) {
        case 'saveBookmark':
          const result = await this.saveBookmark(request.data);
          sendResponse({ success: true, data: result });
          break;

        case 'getPageInfo':
          const pageInfo = await this.getPageInfo(sender.tab);
          sendResponse({ success: true, data: pageInfo });
          break;

        case 'popupClosed':
        case 'popupHidden':
          // 当popup关闭或隐藏时，清理相关资源
          this.handlePopupClosed(sender.tab?.id);
          sendResponse({ success: true });
          break;

        case 'syncToFeishu':
          const syncResult = await this.syncToFeishu(request.data);
          sendResponse({ success: true, data: syncResult });
          break;

        case 'getSettings':
          const settings = await this.getSettings();
          sendResponse({ success: true, data: settings });
          break;

        case 'saveSettings':
          await this.saveSettings(request.data);
          sendResponse({ success: true });
          break;

        case 'testFeishuConnection':
          const testResult = await this.testFeishuConnection(request.data);
          sendResponse({ success: true, data: testResult });
          break;

        case 'retryFailedSync':
          const retryResult = await this.retryFailedSync();
          sendResponse({ success: true, data: retryResult });
          break;

        case 'getBookmarks':
          const bookmarks = await this.getBookmarks(request.filters);
          sendResponse({ success: true, data: bookmarks });
          break;

        default:
          sendResponse({ success: false, error: '未知操作' });
      }
    } catch (error) {
      console.error('处理消息失败:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  // 获取页面信息
  async getPageInfo(tab) {
    if (!tab) {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      tab = tabs[0];
    }

    if (!tab || !tab.url) {
      throw new Error('无法获取有效的标签页信息');
    }

    // 检查缓存
    const cacheKey = `${tab.url}_${tab.title}`;
    if (this.pageInfoCache.has(cacheKey)) {
      return this.pageInfoCache.get(cacheKey);
    }

    // 基础页面信息
    const pageInfo = {
      title: tab.title || '',
      url: tab.url,
      favIconUrl: tab.favIconUrl || '',
      timestamp: new Date().toISOString()
    };

    // 尝试从页面获取更多信息（受控制的脚本注入）
    try {
      // 检查是否正在进行脚本注入或已关闭
      if (this.isShuttingDown || this.scriptInjectionInProgress.has(tab.id)) {
        console.log('系统正在关闭或脚本注入正在进行中，使用基础信息');
        return pageInfo;
      }

      // 只在HTTP/HTTPS页面上执行脚本，且页面必须完全加载
      if (tab.url && 
          (tab.url.startsWith('http://') || tab.url.startsWith('https://')) &&
          tab.status === 'complete') {
        
        this.scriptInjectionInProgress.add(tab.id);

        // 使用Promise.race和超时控制
        const timeoutPromise = new Promise((_, reject) => {
          const timeoutId = this.safeSetTimeout(() => {
            reject(new Error('脚本执行超时'));
          }, 3000);
          
          // 确保在shutdown时能取消超时
          if (this.isShuttingDown && timeoutId) {
            clearTimeout(timeoutId);
            this.timers.delete(timeoutId);
          }
        });

        const results = await Promise.race([
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
              console.log('[DEBUG] 开始执行页面信息提取脚本');
              
              // 检查页面是否已经加载完成
              if (document.readyState !== 'complete') {
                console.log('[DEBUG] 页面未完全加载，返回空结果');
                return {};
              }

              // 安全的页面信息提取，避免造成持续影响
              try {
                const result = {
                  description: document.querySelector('meta[name="description"]')?.content || '',
                  keywords: document.querySelector('meta[name="keywords"]')?.content || '',
                  author: document.querySelector('meta[name="author"]')?.content || '',
                  ogTitle: document.querySelector('meta[property="og:title"]')?.content || '',
                  ogDescription: document.querySelector('meta[property="og:description"]')?.content || ''
                };
                
                console.log('[DEBUG] 页面信息提取完成，没有添加任何事件监听器或定时器');
                // 确保没有留下任何持续运行的代码，没有事件监听器，没有定时器
                return result;
              } catch (e) {
                console.error('[ERROR] 页面信息提取失败:', e);
                return {};
              }
            }
          }),
          timeoutPromise
        ]);

        this.scriptInjectionInProgress.delete(tab.id);

        if (results && results[0] && results[0].result) {
          Object.assign(pageInfo, results[0].result);
        }
      }
    } catch (error) {
      // 清理注入状态
      this.scriptInjectionInProgress.delete(tab.id);
      console.log('无法获取页面详细信息，使用基础信息:', error.message);
    }

    // 缓存结果（5分钟过期）
    this.pageInfoCache.set(cacheKey, pageInfo);
    this.safeSetTimeout(() => {
      if (!this.isShuttingDown && this.pageInfoCache.has(cacheKey)) {
        this.pageInfoCache.delete(cacheKey);
      }
    }, 5 * 60 * 1000);

    return pageInfo;
  }

  // 保存收藏到本地
  async saveBookmark(bookmarkData) {
    try {
      const { bookmarks = [] } = await chrome.storage.local.get('bookmarks');
      
      const newBookmark = {
        id: Date.now().toString(),
        ...bookmarkData,
        createdAt: new Date().toISOString(),
        synced: false
      };

      bookmarks.push(newBookmark);
      await chrome.storage.local.set({ bookmarks });

      // 如果开启自动同步，尝试同步到飞书
      const { settings } = await chrome.storage.local.get('settings');
      if (settings?.autoSync && settings.accessToken) {
        await this.syncToFeishu(newBookmark);
      }

      return newBookmark;
    } catch (error) {
      console.error('保存收藏失败:', error);
      throw error;
    }
  }

  // 同步到飞书多维表格
  async syncToFeishu(bookmarkData) {
    try {
      const { settings } = await chrome.storage.local.get('settings');
      
      if (!settings?.appToken || !settings?.tableId) {
        throw new Error('飞书配置不完整，请在设置中配置应用令牌和表格ID');
      }

      // 准备飞书记录数据（根据API错误修正单选字段格式）
      const feishuRecord = {
        '网站地址': { 
          link: bookmarkData.url || '',
          text: bookmarkData.description || bookmarkData.title || bookmarkData.url || ''
        },
        '网站说明': bookmarkData.description || '', // 字符串类型：直接传值
        '网站备注': bookmarkData.note || '', // 字符串类型：直接传值
        '标签': bookmarkData.category || '其他' // 单选字段：直接传字符串值
      };

      const response = await fetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${settings.appToken}/tables/${settings.tableId}/records`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: feishuRecord
        })
      });

      const result = await response.json();
      
      if (result.code !== 0) {
        throw new Error(`飞书API错误: ${result.msg || '未知错误'}`);
      }
      
      // 更新本地数据，标记为已同步
      const { bookmarks = [] } = await chrome.storage.local.get('bookmarks');
      const updatedBookmarks = bookmarks.map(bookmark => 
        bookmark.id === bookmarkData.id 
          ? { 
              ...bookmark, 
              synced: true, 
              feishuRecordId: result.data?.record?.record_id,
              syncedAt: new Date().toISOString()
            }
          : bookmark
      );
      await chrome.storage.local.set({ bookmarks: updatedBookmarks });

      return result.data;
    } catch (error) {
      console.error('同步到飞书失败:', error);
      
      // 记录同步失败
      const { bookmarks = [] } = await chrome.storage.local.get('bookmarks');
      const updatedBookmarks = bookmarks.map(bookmark => 
        bookmark.id === bookmarkData.id 
          ? { 
              ...bookmark, 
              synced: false, 
              syncError: error.message,
              lastSyncAttempt: new Date().toISOString()
            }
          : bookmark
      );
      await chrome.storage.local.set({ bookmarks: updatedBookmarks });
      
      throw error;
    }
  }

  // 获取设置
  async getSettings() {
    const { settings } = await chrome.storage.local.get('settings');
    return settings;
  }

  // 保存设置
  async saveSettings(newSettings) {
    const { settings = {} } = await chrome.storage.local.get('settings');
    const updatedSettings = { ...settings, ...newSettings };
    await chrome.storage.local.set({ settings: updatedSettings });
  }

  // 测试飞书连接
  async testFeishuConnection(config) {
    try {
      const response = await fetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${config.appToken}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.accessToken}`
        }
      });

      const result = await response.json();
      
      if (result.code === 0) {
        return {
          success: true,
          message: '飞书连接测试成功',
          appInfo: result.data
        };
      } else {
        return {
          success: false,
          message: `连接失败: ${result.msg || '未知错误'}`
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `连接测试失败: ${error.message}`
      };
    }
  }

  // 重试失败的同步
  async retryFailedSync() {
    try {
      const { bookmarks = [] } = await chrome.storage.local.get('bookmarks');
      const failedBookmarks = bookmarks.filter(bookmark => !bookmark.synced);
      
      if (failedBookmarks.length === 0) {
        return { success: true, message: '没有需要重试的收藏' };
      }

      let successCount = 0;
      let failCount = 0;

      for (const bookmark of failedBookmarks) {
        try {
          await this.syncToFeishu(bookmark);
          successCount++;
        } catch (error) {
          failCount++;
          console.error(`重试同步收藏 ${bookmark.id} 失败:`, error);
        }
      }

      return {
        success: true,
        message: `重试完成: ${successCount} 个成功, ${failCount} 个失败`,
        successCount,
        failCount
      };
    } catch (error) {
      console.error('重试同步失败:', error);
      throw error;
    }
  }

  // 获取收藏列表
  async getBookmarks(filters = {}) {
    try {
      const { bookmarks = [] } = await chrome.storage.local.get('bookmarks');
      
      let filteredBookmarks = [...bookmarks];

      // 按同步状态过滤
      if (filters.synced !== undefined) {
        filteredBookmarks = filteredBookmarks.filter(bookmark => 
          bookmark.synced === filters.synced
        );
      }

      // 按标签过滤
      if (filters.tags && filters.tags.length > 0) {
        filteredBookmarks = filteredBookmarks.filter(bookmark => 
          bookmark.tags && bookmark.tags.some(tag => 
            filters.tags.includes(tag)
          )
        );
      }

      // 按时间范围过滤
      if (filters.dateFrom || filters.dateTo) {
        filteredBookmarks = filteredBookmarks.filter(bookmark => {
          const bookmarkDate = new Date(bookmark.createdAt);
          const from = filters.dateFrom ? new Date(filters.dateFrom) : null;
          const to = filters.dateTo ? new Date(filters.dateTo) : null;
          
          if (from && bookmarkDate < from) return false;
          if (to && bookmarkDate > to) return false;
          return true;
        });
      }

      // 排序
      const sortBy = filters.sortBy || 'createdAt';
      const sortOrder = filters.sortOrder || 'desc';
      
      filteredBookmarks.sort((a, b) => {
        const aValue = a[sortBy] || '';
        const bValue = b[sortBy] || '';
        
        if (sortOrder === 'desc') {
          return bValue.localeCompare(aValue);
        } else {
          return aValue.localeCompare(bValue);
        }
      });

      return {
        bookmarks: filteredBookmarks,
        total: bookmarks.length,
        filtered: filteredBookmarks.length,
        syncedCount: bookmarks.filter(b => b.synced).length,
        unsyncedCount: bookmarks.filter(b => !b.synced).length
      };
    } catch (error) {
      console.error('获取收藏列表失败:', error);
      throw error;
    }
  }

  // 安全的setTimeout，会自动跟踪定时器
  safeSetTimeout(callback, delay) {
    if (this.isShuttingDown) {
      console.log('[DEBUG] 尝试创建定时器但系统正在关闭，已忽略');
      return null;
    }
    
    const timerId = setTimeout(() => {
      // 执行回调前检查是否正在关闭
      if (this.isShuttingDown) {
        console.log('[DEBUG] 定时器执行时系统正在关闭，已忽略');
        return;
      }
      
      try {
        console.log('[DEBUG] 执行background定时器回调');
        callback();
      } catch (error) {
        console.error('[ERROR] Background定时器回调执行失败:', error);
      }
      
      // 执行完成后从集合中移除
      this.timers.delete(timerId);
      console.log(`[DEBUG] 定时器${timerId}已完成并移除，剩余定时器数量:`, this.timers.size);
    }, delay);
    
    this.timers.add(timerId);
    console.log(`[DEBUG] 创建新定时器${timerId}，延迟${delay}ms，当前定时器总数:`, this.timers.size);
    return timerId;
  }

  // 清理所有资源
  cleanup() {
    if (this.isShuttingDown) {
      console.log('[DEBUG] 重复调用cleanup，已忽略');
      return;
    }
    
    console.log('[DEBUG] 开始清理Background资源...');
    this.isShuttingDown = true;
    
    // 清理所有定时器
    console.log(`[DEBUG] 清理${this.timers.size}个定时器`);
    this.timers.forEach(timerId => {
      console.log(`[DEBUG] 清理定时器${timerId}`);
      clearTimeout(timerId);
    });
    this.timers.clear();

    // 清理缓存
    console.log(`[DEBUG] 清理${this.pageInfoCache.size}个缓存项`);
    this.pageInfoCache.clear();
    
    // 清理脚本注入状态
    console.log(`[DEBUG] 清理${this.scriptInjectionInProgress.size}个脚本注入状态`);
    this.scriptInjectionInProgress.clear();

    console.log('[DEBUG] 飞书收藏插件后台服务已清理所有资源');
  }

  // 处理popup关闭事件
  handlePopupClosed(tabId) {
    if (tabId && this.scriptInjectionInProgress.has(tabId)) {
      // 清理正在进行的脚本注入
      this.scriptInjectionInProgress.delete(tabId);
    }
    
    // 清理与该tab相关的缓存
    const keysToDelete = [];
    for (const [key] of this.pageInfoCache) {
      if (key.includes('_')) {
        // 如果缓存key中包含当前tab的URL或信息，清理它
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.pageInfoCache.delete(key));
    
    console.log(`已清理tab ${tabId}相关资源`);
  }
}

// 初始化后台管理器
const backgroundManager = new FeishuBookmarkManager();

// 确保在适当时机进行清理
if (typeof self !== 'undefined' && self.addEventListener) {
  self.addEventListener('unload', () => {
    backgroundManager.cleanup();
  });
}