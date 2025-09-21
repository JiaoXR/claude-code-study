// 飞书收藏插件 - 极简后台脚本（无抖动版本）
class CleanFeishuBookmarkManager {
  constructor() {
    this.init();
  }

  init() {
    console.log('[CLEAN-BG] 初始化干净版本后台服务');
    
    // 插件安装时初始化
    chrome.runtime.onInstalled.addListener(() => {
      console.log('[CLEAN-BG] 插件已安装');
      this.initializeStorage();
    });

    // 监听消息
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true;
    });
  }

  // 初始化存储
  async initializeStorage() {
    const defaultSettings = {
      appToken: '',
      tableId: '',
      accessToken: '',
      categories: ['AI编程', 'AI工具', '其他'], // 单选字段选项
      autoSync: true,
      enableNotifications: true
    };

    try {
      const result = await chrome.storage.local.get('settings');
      if (!result.settings) {
        await chrome.storage.local.set({ settings: defaultSettings });
      }
    } catch (error) {
      console.error('[CLEAN-BG] 初始化存储失败:', error);
    }
  }

  // 处理消息
  async handleMessage(request, sender, sendResponse) {
    try {
      console.log('[CLEAN-BG] 处理消息:', request.action);
      
      switch (request.action) {
        case 'saveBookmark':
          const result = await this.saveBookmark(request.data);
          sendResponse({ success: true, data: result });
          break;

        case 'getPageInfo':
          // 返回基础页面信息，不进行脚本注入
          const pageInfo = await this.getBasicPageInfo(sender.tab);
          sendResponse({ success: true, data: pageInfo });
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

        default:
          sendResponse({ success: false, error: '未知操作' });
      }
    } catch (error) {
      console.error('[CLEAN-BG] 处理消息失败:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  // 获取基础页面信息 - 不进行脚本注入，避免任何可能的抖动
  async getBasicPageInfo(tab) {
    if (!tab) {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      tab = tabs[0];
    }

    if (!tab || !tab.url) {
      throw new Error('无法获取有效的标签页信息');
    }

    console.log('[CLEAN-BG] 获取基础页面信息，不进行脚本注入');
    
    // 只返回tab本身提供的基础信息，完全避免脚本注入
    return {
      title: tab.title || '',
      url: tab.url,
      favIconUrl: tab.favIconUrl || '',
      timestamp: new Date().toISOString()
    };
  }

  // 保存收藏到本地
  async saveBookmark(bookmarkData) {
    try {
      console.log('[CLEAN-BG] 保存收藏:', bookmarkData.url);
      
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
      console.error('[CLEAN-BG] 保存收藏失败:', error);
      throw error;
    }
  }

  // 同步到飞书多维表格
  async syncToFeishu(bookmarkData) {
    try {
      console.log('[CLEAN-BG] 同步到飞书:', bookmarkData.url);
      
      const { settings } = await chrome.storage.local.get('settings');
      
      if (!settings?.appToken || !settings?.tableId) {
        throw new Error('飞书配置不完整，请在设置中配置应用令牌和表格ID');
      }

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

      console.log('[CLEAN-BG] 同步成功');
      return result.data;
    } catch (error) {
      console.error('[CLEAN-BG] 同步到飞书失败:', error);
      
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
      console.log('[CLEAN-BG] 测试飞书连接');
      
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
}

// 初始化后台管理器
console.log('[CLEAN-BG] 启动干净版本后台服务');
new CleanFeishuBookmarkManager();