// 飞书收藏插件 - 内容脚本
class PageContentExtractor {
  constructor() {
    this.init();
  }

  init() {
    // 监听来自background或popup的消息
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true;
    });
  }

  handleMessage(request, sender, sendResponse) {
    switch (request.action) {
      case 'extractPageContent':
        const content = this.extractPageContent();
        sendResponse({ success: true, data: content });
        break;
      
      case 'getPageMetadata':
        const metadata = this.getPageMetadata();
        sendResponse({ success: true, data: metadata });
        break;

      default:
        sendResponse({ success: false, error: '未知操作' });
    }
  }

  // 提取页面主要内容
  extractPageContent() {
    try {
      const content = {
        title: this.getPageTitle(),
        description: this.getPageDescription(),
        keywords: this.getPageKeywords(),
        author: this.getPageAuthor(),
        publishDate: this.getPublishDate(),
        mainContent: this.getMainContent(),
        images: this.getPageImages(),
        links: this.getImportantLinks()
      };

      return content;
    } catch (error) {
      console.error('提取页面内容失败:', error);
      return null;
    }
  }

  // 获取页面标题
  getPageTitle() {
    return document.title || 
           document.querySelector('h1')?.textContent?.trim() ||
           document.querySelector('[property="og:title"]')?.content ||
           '';
  }

  // 获取页面描述
  getPageDescription() {
    return document.querySelector('meta[name="description"]')?.content ||
           document.querySelector('[property="og:description"]')?.content ||
           document.querySelector('meta[name="twitter:description"]')?.content ||
           this.getFirstParagraph() ||
           '';
  }

  // 获取页面关键词
  getPageKeywords() {
    const keywords = document.querySelector('meta[name="keywords"]')?.content;
    return keywords ? keywords.split(',').map(k => k.trim()) : [];
  }

  // 获取作者信息
  getPageAuthor() {
    return document.querySelector('meta[name="author"]')?.content ||
           document.querySelector('[rel="author"]')?.textContent?.trim() ||
           document.querySelector('.author')?.textContent?.trim() ||
           '';
  }

  // 获取发布日期
  getPublishDate() {
    const dateSelectors = [
      'meta[property="article:published_time"]',
      'meta[name="publishdate"]',
      'time[datetime]',
      '.publish-date',
      '.date',
      '[class*="date"]'
    ];

    for (const selector of dateSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        const date = element.getAttribute('datetime') || 
                    element.getAttribute('content') ||
                    element.textContent?.trim();
        if (date) return date;
      }
    }

    return '';
  }

  // 获取主要内容
  getMainContent() {
    const contentSelectors = [
      'article',
      '[role="main"]',
      '.main-content',
      '.content',
      '.post-content',
      '.entry-content',
      'main'
    ];

    for (const selector of contentSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        return this.cleanTextContent(element.textContent);
      }
    }

    // 如果没找到主要内容容器，尝试获取第一个段落
    return this.getFirstParagraph();
  }

  // 获取第一个段落
  getFirstParagraph() {
    const paragraph = document.querySelector('p');
    return paragraph ? this.cleanTextContent(paragraph.textContent) : '';
  }

  // 清理文本内容
  cleanTextContent(text) {
    if (!text) return '';
    return text.trim()
               .replace(/\s+/g, ' ')
               .substring(0, 500); // 限制长度
  }

  // 获取页面重要图片
  getPageImages() {
    const images = [];
    
    // 获取开放图谱图片
    const ogImage = document.querySelector('[property="og:image"]')?.content;
    if (ogImage) images.push(ogImage);

    // 获取页面中的重要图片
    const imgElements = document.querySelectorAll('img');
    imgElements.forEach(img => {
      if (img.width > 200 && img.height > 200 && img.src) {
        images.push(img.src);
      }
    });

    return images.slice(0, 5); // 最多返回5张图片
  }

  // 获取重要链接
  getImportantLinks() {
    const links = [];
    const linkElements = document.querySelectorAll('a[href]');
    
    linkElements.forEach(link => {
      const href = link.href;
      const text = link.textContent?.trim();
      
      if (text && href && 
          !href.startsWith('javascript:') && 
          !href.startsWith('#') &&
          text.length > 3 && 
          text.length < 100) {
        links.push({
          url: href,
          text: text
        });
      }
    });

    return links.slice(0, 10); // 最多返回10个链接
  }

  // 获取页面元数据
  getPageMetadata() {
    return {
      url: window.location.href,
      domain: window.location.hostname,
      pathname: window.location.pathname,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      language: document.documentElement.lang || navigator.language,
      charset: document.characterSet,
      viewport: document.querySelector('meta[name="viewport"]')?.content || ''
    };
  }

  // 智能标签建议
  suggestTags() {
    const suggestions = new Set();
    
    // 基于URL路径
    const pathSegments = window.location.pathname.split('/').filter(s => s.length > 2);
    pathSegments.forEach(segment => {
      suggestions.add(segment.replace(/-/g, ' '));
    });

    // 基于页面标题
    const titleWords = this.getPageTitle().toLowerCase().split(/\s+/);
    titleWords.forEach(word => {
      if (word.length > 3) suggestions.add(word);
    });

    // 基于域名
    const domain = window.location.hostname.replace('www.', '');
    suggestions.add(domain.split('.')[0]);

    return Array.from(suggestions).slice(0, 5);
  }
}

// 初始化内容提取器
new PageContentExtractor();