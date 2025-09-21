// 飞书收藏插件 - 高性能后台脚本（优化版）

class OptimizedFeishuBookmarkService {
  constructor() {
    this.isInitialized = false;
    this.apiCache = new Map();
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 8000
    };
    this.init();
  }

  async init() {
    try {
      // 立即设置消息监听器
      this.setupMessageListener();
      
      // 并行初始化配置和验证
      await Promise.all([
        this.loadConfiguration(),
        this.validateStoredCredentials()
      ]);

      this.isInitialized = true;
      console.log('[OPTIMIZED] 飞书收藏服务初始化完成');
    } catch (error) {
      console.error('[OPTIMIZED] 初始化失败:', error);
    }
  }

  // 优化的消息监听器
  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      // 使用异步包装器处理消息
      this.handleMessageAsync(request, sender)
        .then(response => sendResponse(response))
        .catch(error => {
          console.error('[OPTIMIZED] 消息处理失败:', error);
          sendResponse({
            success: false,
            error: error.message || '处理失败'
          });
        });
      
      // 返回true保持消息通道开放
      return true;
    });
  }

  // 异步消息处理器
  async handleMessageAsync(request, sender) {
    const { action, data } = request;

    switch (action) {
      case 'saveBookmark':
        return await this.saveBookmarkWithRetry(data);
      
      case 'testConnection':
        return await this.testFeishuConnection();
      
      case 'saveConfiguration':
        return await this.saveConfiguration(data);
      
      case 'getConfiguration':
        return await this.getConfiguration();
      
      case 'validateCredentials':
        return await this.validateCredentials(data);
      
      default:
        throw new Error(`未知操作: ${action}`);
    }
  }

  // 带重试机制的收藏保存
  async saveBookmarkWithRetry(bookmarkData) {
    let lastError;
    
    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        // 第一次尝试不延迟
        if (attempt > 0) {
          const delay = Math.min(
            this.retryConfig.baseDelay * Math.pow(2, attempt - 1),
            this.retryConfig.maxDelay
          );
          await this.sleep(delay);
          console.log(`[OPTIMIZED] 重试保存收藏 (${attempt}/${this.retryConfig.maxRetries})`);
        }

        // 尝试保存
        const result = await this.saveBookmark(bookmarkData);
        
        if (result.success) {
          console.log('[OPTIMIZED] 收藏保存成功');
          return result;
        }

        lastError = new Error(result.error);
        
      } catch (error) {
        lastError = error;
        console.error(`[OPTIMIZED] 保存尝试 ${attempt + 1} 失败:`, error);
        
        // 如果是认证错误，不重试
        if (this.isAuthError(error)) {
          break;
        }
      }
    }

    console.error('[OPTIMIZED] 收藏保存最终失败:', lastError);
    return {
      success: false,
      error: lastError?.message || '保存失败，请检查网络连接和配置'
    };
  }

  // 优化的收藏保存核心逻辑
  async saveBookmark(bookmarkData) {
    try {
      // 验证数据
      if (!this.validateBookmarkData(bookmarkData)) {
        throw new Error('收藏数据不完整');
      }

      // 获取配置
      const config = await this.getStoredConfiguration();
      if (!config) {
        throw new Error('请先在设置中配置飞书表格信息');
      }

      // 并行执行本地存储和飞书同步
      const [localResult, feishuResult] = await Promise.allSettled([
        this.saveToLocal(bookmarkData),
        this.syncToFeishu(bookmarkData, config)
      ]);

      // 本地存储必须成功
      if (localResult.status === 'rejected') {
        throw new Error('本地保存失败');
      }

      // 飞书同步可以失败，但要记录
      if (feishuResult.status === 'rejected') {
        console.warn('[OPTIMIZED] 飞书同步失败:', feishuResult.reason);
        
        // 标记为需要稍后同步
        await this.markForLaterSync(bookmarkData);
        
        return {
          success: true,
          warning: '本地保存成功，飞书同步失败，将稍后重试'
        };
      }

      return {
        success: true,
        message: '收藏保存并同步成功'
      };

    } catch (error) {
      console.error('[OPTIMIZED] 保存收藏失败:', error);
      throw error;
    }
  }

  // 高效的飞书API同步
  async syncToFeishu(bookmarkData, config) {
    try {
      const { appToken, tableId, accessToken } = config;
      
      // 构建优化的记录数据 - 使用正确的字段格式
      const feishuRecord = {
        '网站地址': { 
          link: bookmarkData.url || '',
          text: bookmarkData.description || bookmarkData.title || bookmarkData.url || ''
        },
        '网站说明': bookmarkData.description || '', // 字符串类型：直接传值
        '网站备注': bookmarkData.note || '', // 字符串类型：直接传值
        '标签': bookmarkData.category || '其他' // 单选字段：直接传字符串值
      };

      // 使用缓存的API端点
      const apiUrl = this.getApiUrl(appToken, tableId);
      
      // 构建请求
      const requestBody = {
        records: [{
          fields: feishuRecord
        }]
      };

      console.log('[OPTIMIZED] 发送飞书API请求:', {
        url: apiUrl,
        fields: feishuRecord
      });

      // 发送请求
      const response = await this.makeFeishuRequest(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`飞书API错误 (${response.status}): ${errorData.msg || response.statusText}`);
      }

      const result = await response.json();
      console.log('[OPTIMIZED] 飞书同步成功:', result);
      
      return result;

    } catch (error) {
      console.error('[OPTIMIZED] 飞书同步失败:', error);
      throw error;
    }
  }

  // 优化的API请求方法
  async makeFeishuRequest(url, options) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15秒超时

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response;

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('请求超时，请检查网络连接');
      }
      throw error;
    }
  }

  // 高效的本地存储
  async saveToLocal(bookmarkData) {
    try {
      const storageKey = 'feishu_bookmarks';
      const timestamp = Date.now();
      
      // 获取现有数据
      const result = await chrome.storage.local.get(storageKey);
      const bookmarks = result[storageKey] || [];
      
      // 添加新收藏
      const newBookmark = {
        id: `bookmark_${timestamp}`,
        ...bookmarkData,
        timestamp,
        synced: false
      };
      
      bookmarks.unshift(newBookmark); // 添加到开头
      
      // 限制本地存储数量（最多1000条）
      if (bookmarks.length > 1000) {
        bookmarks.splice(1000);
      }
      
      // 保存
      await chrome.storage.local.set({ [storageKey]: bookmarks });
      
      console.log('[OPTIMIZED] 本地保存成功');
      return newBookmark;

    } catch (error) {
      console.error('[OPTIMIZED] 本地保存失败:', error);
      throw error;
    }
  }

  // 优化的配置管理
  async loadConfiguration() {
    try {
      const result = await chrome.storage.local.get(['settings']);
      const settings = result.settings;
      
      if (settings && settings.appToken && settings.tableId && settings.accessToken) {
        this.config = {
          appToken: settings.appToken,
          tableId: settings.tableId,
          accessToken: settings.accessToken
        };
      }
      
      console.log('[OPTIMIZED] 配置加载完成');
    } catch (error) {
      console.error('[OPTIMIZED] 配置加载失败:', error);
    }
  }

  async saveConfiguration(configData) {
    try {
      // 验证配置数据
      if (!this.validateConfiguration(configData)) {
        throw new Error('配置数据不完整或格式错误');
      }

      // 获取现有设置并合并新配置
      const { settings = {} } = await chrome.storage.local.get('settings');
      const updatedSettings = { 
        ...settings, 
        appToken: configData.appToken,
        tableId: configData.tableId,
        accessToken: configData.accessToken
      };

      // 保存配置（使用 settings 键保持兼容性）
      await chrome.storage.local.set({ settings: updatedSettings });
      this.config = configData;
      
      console.log('[OPTIMIZED] 配置保存成功');
      return { success: true };

    } catch (error) {
      console.error('[OPTIMIZED] 配置保存失败:', error);
      return { success: false, error: error.message };
    }
  }

  async getConfiguration() {
    try {
      const result = await chrome.storage.local.get(['settings']);
      const settings = result.settings;
      
      if (settings && settings.appToken && settings.tableId && settings.accessToken) {
        return { 
          success: true, 
          config: {
            appToken: settings.appToken,
            tableId: settings.tableId,
            accessToken: settings.accessToken
          }
        };
      }
      
      return { 
        success: true, 
        config: null 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  // 快速连接测试
  async testFeishuConnection() {
    try {
      const config = await this.getStoredConfiguration();
      if (!config) {
        throw new Error('未找到配置信息');
      }

      const { appToken, tableId, accessToken } = config;
      const apiUrl = `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records?page_size=1`;

      const response = await this.makeFeishuRequest(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log('[OPTIMIZED] 飞书连接测试成功');
        return { success: true, message: '连接测试成功' };
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`连接失败: ${errorData.msg || response.statusText}`);
      }

    } catch (error) {
      console.error('[OPTIMIZED] 连接测试失败:', error);
      return { success: false, error: error.message };
    }
  }

  // 工具方法
  validateBookmarkData(data) {
    return data && 
           typeof data.url === 'string' && 
           data.url.trim().length > 0;
  }

  validateConfiguration(config) {
    return config &&
           typeof config.appToken === 'string' && config.appToken.trim() &&
           typeof config.tableId === 'string' && config.tableId.trim() &&
           typeof config.accessToken === 'string' && config.accessToken.trim();
  }

  async getStoredConfiguration() {
    if (this.config) return this.config;
    
    try {
      // 统一使用 settings 键，保持与原版本兼容
      const result = await chrome.storage.local.get(['settings']);
      const settings = result.settings;
      
      if (settings && settings.appToken && settings.tableId && settings.accessToken) {
        // 转换为优化版格式
        return {
          appToken: settings.appToken,
          tableId: settings.tableId,
          accessToken: settings.accessToken
        };
      }
      
      return null;
    } catch (error) {
      console.error('[OPTIMIZED] 获取配置失败:', error);
      return null;
    }
  }

  getApiUrl(appToken, tableId) {
    const cacheKey = `${appToken}_${tableId}`;
    if (this.apiCache.has(cacheKey)) {
      return this.apiCache.get(cacheKey);
    }
    
    const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records`;
    this.apiCache.set(cacheKey, url);
    return url;
  }

  isAuthError(error) {
    const message = error.message?.toLowerCase() || '';
    return message.includes('unauthorized') || 
           message.includes('401') || 
           message.includes('invalid token') ||
           message.includes('access denied');
  }

  async markForLaterSync(bookmarkData) {
    try {
      const result = await chrome.storage.local.get(['pending_sync']);
      const pending = result.pending_sync || [];
      
      pending.push({
        ...bookmarkData,
        timestamp: Date.now(),
        retryCount: 0
      });
      
      await chrome.storage.local.set({ pending_sync: pending });
      console.log('[OPTIMIZED] 标记为稍后同步');
    } catch (error) {
      console.error('[OPTIMIZED] 标记同步失败:', error);
    }
  }

  async validateStoredCredentials() {
    // 简单验证存储的凭据格式
    try {
      const config = await this.getStoredConfiguration();
      if (config) {
        console.log('[OPTIMIZED] 发现已存储的配置');
      } else {
        console.log('[OPTIMIZED] 未发现配置，请在设置中配置飞书API信息');
      }
    } catch (error) {
      console.error('[OPTIMIZED] 凭据验证失败:', error);
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 创建全局服务实例
console.log('[OPTIMIZED] 启动飞书收藏服务...');
const feishuService = new OptimizedFeishuBookmarkService();

// 导出给其他模块使用（如果需要）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = OptimizedFeishuBookmarkService;
}