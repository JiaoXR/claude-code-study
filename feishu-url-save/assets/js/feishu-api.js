// 飞书API集成模块
class FeishuAPI {
  constructor() {
    this.baseURL = 'https://open.feishu.cn/open-apis';
    this.accessToken = null;
    this.appId = null;
    this.appSecret = null;
    this.tenantAccessToken = null;
  }

  // 初始化配置
  async initialize(config) {
    this.appId = config.appId;
    this.appSecret = config.appSecret;
    
    if (config.accessToken) {
      this.accessToken = config.accessToken;
    } else {
      await this.getAccessToken();
    }
  }

  // 获取应用访问令牌
  async getAccessToken() {
    try {
      const response = await fetch(`${this.baseURL}/auth/v3/app_access_token/internal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          app_id: this.appId,
          app_secret: this.appSecret
        })
      });

      const data = await response.json();
      
      if (data.code === 0) {
        this.accessToken = data.app_access_token;
        this.tenantAccessToken = data.tenant_access_token;
        return this.accessToken;
      } else {
        throw new Error(`获取访问令牌失败: ${data.msg}`);
      }
    } catch (error) {
      console.error('获取飞书访问令牌失败:', error);
      throw error;
    }
  }

  // 获取用户访问令牌（用于OAuth）
  async getUserAccessToken(code) {
    try {
      const response = await fetch(`${this.baseURL}/authen/v1/access_token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          code: code
        })
      });

      const data = await response.json();
      
      if (data.code === 0) {
        return data.data;
      } else {
        throw new Error(`获取用户访问令牌失败: ${data.msg}`);
      }
    } catch (error) {
      console.error('获取用户访问令牌失败:', error);
      throw error;
    }
  }

  // 刷新用户访问令牌
  async refreshUserAccessToken(refreshToken) {
    try {
      const response = await fetch(`${this.baseURL}/authen/v1/refresh_access_token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        })
      });

      const data = await response.json();
      
      if (data.code === 0) {
        return data.data;
      } else {
        throw new Error(`刷新访问令牌失败: ${data.msg}`);
      }
    } catch (error) {
      console.error('刷新访问令牌失败:', error);
      throw error;
    }
  }

  // 创建多维表格应用
  async createBitableApp(name, folderToken = null) {
    try {
      const body = { name };
      if (folderToken) {
        body.folder_token = folderToken;
      }

      const response = await fetch(`${this.baseURL}/bitable/v1/apps`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      
      if (data.code === 0) {
        return data.data;
      } else {
        throw new Error(`创建多维表格失败: ${data.msg}`);
      }
    } catch (error) {
      console.error('创建多维表格失败:', error);
      throw error;
    }
  }

  // 获取多维表格信息
  async getBitableApp(appToken) {
    try {
      const response = await fetch(`${this.baseURL}/bitable/v1/apps/${appToken}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      const data = await response.json();
      
      if (data.code === 0) {
        return data.data;
      } else {
        throw new Error(`获取多维表格信息失败: ${data.msg}`);
      }
    } catch (error) {
      console.error('获取多维表格信息失败:', error);
      throw error;
    }
  }

  // 获取数据表列表
  async getTables(appToken) {
    try {
      const response = await fetch(`${this.baseURL}/bitable/v1/apps/${appToken}/tables`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      const data = await response.json();
      
      if (data.code === 0) {
        return data.data;
      } else {
        throw new Error(`获取数据表列表失败: ${data.msg}`);
      }
    } catch (error) {
      console.error('获取数据表列表失败:', error);
      throw error;
    }
  }

  // 创建数据表
  async createTable(appToken, tableName) {
    try {
      const response = await fetch(`${this.baseURL}/bitable/v1/apps/${appToken}/tables`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          table: {
            name: tableName,
            default_view_name: '网格视图',
            fields: [
              {
                field_name: '标题',
                type: 1 // 文本类型
              },
              {
                field_name: 'URL',
                type: 15 // 链接类型
              },
              {
                field_name: '备注',
                type: 1 // 文本类型
              },
              {
                field_name: '标签',
                type: 3 // 多选类型
              },
              {
                field_name: '收藏时间',
                type: 5 // 日期时间类型
              },
              {
                field_name: '网站图标',
                type: 17 // 附件类型
              }
            ]
          }
        })
      });

      const data = await response.json();
      
      if (data.code === 0) {
        return data.data;
      } else {
        throw new Error(`创建数据表失败: ${data.msg}`);
      }
    } catch (error) {
      console.error('创建数据表失败:', error);
      throw error;
    }
  }

  // 获取字段列表
  async getFields(appToken, tableIdOrName) {
    try {
      const response = await fetch(`${this.baseURL}/bitable/v1/apps/${appToken}/tables/${tableIdOrName}/fields`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      const data = await response.json();
      
      if (data.code === 0) {
        return data.data;
      } else {
        throw new Error(`获取字段列表失败: ${data.msg}`);
      }
    } catch (error) {
      console.error('获取字段列表失败:', error);
      throw error;
    }
  }

  // 添加记录到数据表
  async addRecord(appToken, tableIdOrName, fields) {
    try {
      const response = await fetch(`${this.baseURL}/bitable/v1/apps/${appToken}/tables/${tableIdOrName}/records`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: fields
        })
      });

      const data = await response.json();
      
      if (data.code === 0) {
        return data.data;
      } else {
        throw new Error(`添加记录失败: ${data.msg}`);
      }
    } catch (error) {
      console.error('添加记录到飞书失败:', error);
      throw error;
    }
  }

  // 批量添加记录
  async batchAddRecords(appToken, tableIdOrName, records) {
    try {
      const response = await fetch(`${this.baseURL}/bitable/v1/apps/${appToken}/tables/${tableIdOrName}/records/batch_create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          records: records.map(fields => ({ fields }))
        })
      });

      const data = await response.json();
      
      if (data.code === 0) {
        return data.data;
      } else {
        throw new Error(`批量添加记录失败: ${data.msg}`);
      }
    } catch (error) {
      console.error('批量添加记录失败:', error);
      throw error;
    }
  }

  // 更新记录
  async updateRecord(appToken, tableIdOrName, recordId, fields) {
    try {
      const response = await fetch(`${this.baseURL}/bitable/v1/apps/${appToken}/tables/${tableIdOrName}/records/${recordId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: fields
        })
      });

      const data = await response.json();
      
      if (data.code === 0) {
        return data.data;
      } else {
        throw new Error(`更新记录失败: ${data.msg}`);
      }
    } catch (error) {
      console.error('更新记录失败:', error);
      throw error;
    }
  }

  // 删除记录
  async deleteRecord(appToken, tableIdOrName, recordId) {
    try {
      const response = await fetch(`${this.baseURL}/bitable/v1/apps/${appToken}/tables/${tableIdOrName}/records/${recordId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      const data = await response.json();
      
      if (data.code === 0) {
        return data.data;
      } else {
        throw new Error(`删除记录失败: ${data.msg}`);
      }
    } catch (error) {
      console.error('删除记录失败:', error);
      throw error;
    }
  }

  // 查询记录
  async getRecords(appToken, tableIdOrName, options = {}) {
    try {
      const params = new URLSearchParams();
      
      if (options.view_id) params.append('view_id', options.view_id);
      if (options.filter) params.append('filter', options.filter);
      if (options.sort) params.append('sort', JSON.stringify(options.sort));
      if (options.field_names) params.append('field_names', JSON.stringify(options.field_names));
      if (options.page_token) params.append('page_token', options.page_token);
      if (options.page_size) params.append('page_size', options.page_size);

      const url = `${this.baseURL}/bitable/v1/apps/${appToken}/tables/${tableIdOrName}/records${params.toString() ? '?' + params.toString() : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      const data = await response.json();
      
      if (data.code === 0) {
        return data.data;
      } else {
        throw new Error(`查询记录失败: ${data.msg}`);
      }
    } catch (error) {
      console.error('查询记录失败:', error);
      throw error;
    }
  }

  // 格式化收藏数据为飞书记录格式
  formatBookmarkForFeishu(bookmark) {
    const record = {
      '标题': { text: bookmark.title || '' },
      'URL': { 
        link: bookmark.url || '',
        text: bookmark.title || bookmark.url || ''
      },
      '备注': { text: bookmark.note || '' },
      '收藏时间': parseInt(new Date(bookmark.createdAt || Date.now()).getTime() / 1000)
    };

    // 处理标签
    if (bookmark.tags && bookmark.tags.length > 0) {
      record['标签'] = bookmark.tags.map(tag => ({ text: tag }));
    }

    return record;
  }

  // 验证API配置
  async validateConfig(config) {
    try {
      await this.initialize(config);
      
      // 尝试获取应用信息来验证配置
      if (config.appToken) {
        await this.getBitableApp(config.appToken);
      }
      
      return { valid: true };
    } catch (error) {
      return { 
        valid: false, 
        error: error.message 
      };
    }
  }
}

// 导出API类
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FeishuAPI;
} else {
  window.FeishuAPI = FeishuAPI;
}