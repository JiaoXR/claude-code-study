# 🎮 高考单词战士 - 魂斗罗像素风背单词应用

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9-blue.svg)](https://www.typescriptlang.org/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000.svg)](https://vercel.com/)

> **让背单词变得像打游戏一样有趣！** 🎮✨

专为高考学生设计的趣味化英语单词学习应用，采用经典魂斗罗像素风格，通过游戏化机制让枯燥的背单词变得充满挑战性和成就感。

**🚀 [在线体验](https://word-game-gaokao.vercel.app)**（部署后链接）

## 🌟 特色功能

### 📚 学习模式
- **单词卡片翻转**：点击卡片查看中文释义
- **多章节学习**：按主题分类的高考核心词汇
- **收藏系统**：标记易错单词便于复习
- **随机模式**：打乱顺序避免机械记忆
- **语音朗读**：点击喇叭图标听取标准发音

### 🎯 挑战模式
- **选择题测试**：4选1中文释义选择
- **三种难度**：简单/中等/困难模式
- **连击系统**：连续答对获得COMBO奖励
- **血量机制**：答错扣血，增加紧张感
- **爆炸特效**：答对触发像素风爆炸动画
- **计时挑战**：每题30秒限时答题

### 📊 进度追踪
- **等级系统**：通过学习获得经验值升级
- **学习统计**：追踪已学单词数、测试次数等
- **今日战绩**：显示当日学习和测试进度
- **本地存储**：所有数据保存在浏览器本地

### 🎨 视觉设计
- **魂斗罗像素风**：复古8位游戏美术风格
- **像素字体**：Press Start 2P经典像素字体
- **特效动画**：翻转、爆炸、连击等动画效果
- **响应式设计**：适配PC和移动设备

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm start
```

应用将在 http://localhost:3000 打开

### 构建生产版本
```bash
npm run build
```

### 运行测试
```bash
npm test
```

### 部署到Vercel
```bash
# 一键部署脚本（推荐）
./deploy.sh

# 部署预览版本
npm run deploy-preview

# 部署到生产环境
npm run deploy
```

> 📖 详细部署指南请参考 [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📖 使用指南

### 学习模式使用
1. 在主菜单选择"📚 学习模式"
2. 选择要学习的章节（或选择全部单词）
3. 点击单词卡片查看释义
4. 使用收藏按钮标记重要单词
5. 点击语音按钮听取发音

### 挑战模式使用
1. 在主菜单选择"🎯 挑战模式"
2. 选择合适的难度等级
3. 在30秒内选择正确的中文释义
4. 连续答对可获得COMBO奖励
5. 答错会扣除血量，小心挑战！

### 数据管理
- 所有学习进度自动保存到本地
- 单词收藏状态会被记住
- 测试成绩和统计数据持久化存储
- 不需要注册账号，隐私安全

## 📚 词汇内容

精选高考核心词汇30个，科学分类便于学习：

| 章节 | 内容 | 数量 | 难度 |
|-----|-----|-----|------|
| **基础核心词汇** | 高频常用单词 | 10个 | ⭐⭐ |
| **学习与教育** | 教育相关词汇 | 5个 | ⭐⭐ |
| **科技与现代生活** | 现代科技词汇 | 5个 | ⭐⭐⭐ |
| **环境与自然** | 环保和自然词汇 | 5个 | ⭐⭐⭐ |
| **社会与文化** | 社会文化词汇 | 5个 | ⭐⭐⭐ |

**单词信息完整度**：
- ✅ 英文单词 + 国际音标
- ✅ 准确中文释义
- ✅ 实用例句
- ✅ 科学难度分级 (1-5星)
- ✅ 主题标签分类

## 🎮 游戏化元素

### 等级系统
- 通过学习和测试获得经验值
- 每100经验值升一级
- 等级显示在主界面

### 分数机制
- 基础分数 × 单词难度 × 连击奖励
- 不同难度模式有不同分数倍率
- 最高分和平均分统计

### 连击系统
- 连续答对可获得COMBO
- 每5连击额外加分
- 答错清零连击数

## 🛠️ 技术架构

### 🎨 前端技术栈
| 技术 | 版本 | 用途 |
|-----|-----|-----|
| **React** | 18.x | 核心框架 |
| **TypeScript** | 4.9 | 类型安全 |
| **Framer Motion** | 12.x | 动画特效 |
| **Lucide React** | 0.5.x | 图标组件 |
| **CSS Variables** | - | 主题管理 |

### 💾 数据存储策略
- **LocalStorage** - 用户进度和设置持久化
- **JSON格式** - 轻量级单词数据结构
- **自动保存** - 学习进度实时同步
- **错误处理** - 优雅的存储失败容错

### 📱 响应式设计
- **移动端优先** - Mobile-First设计理念
- **Flexbox/Grid** - 现代布局技术
- **像素风适配** - 保持复古美学的同时适配各种屏幕

## 🎯 核心特性

### 学习体验优化
- 单词卡片3D翻转效果
- 平滑的页面切换动画
- 直观的进度显示
- 即时的学习反馈

### 测试体验优化
- 30秒倒计时压力
- 实时连击显示
- 答题结果特效
- 鼓励性反馈文案

### 数据可靠性
- 自动保存学习进度
- 错误处理和容错机制
- 存储使用情况监控

## 📱 浏览器兼容性

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📈 项目状态

- **开发状态**: ✅ MVP功能完整
- **部署状态**: 🚀 支持Vercel一键部署
- **维护状态**: 🛠️ 积极维护中
- **文档完整度**: 📚 完整的开发和部署文档

## 🤝 参与贡献

我们欢迎各种形式的贡献！

### 🎯 贡献方向
- 🐛 **Bug修复** - 发现并修复功能缺陷
- ✨ **新功能** - 添加有趣的学习功能
- 📚 **词汇扩充** - 增加更多高考词汇
- 🎨 **视觉改进** - 优化像素风界面效果
- 📖 **文档完善** - 改进使用和开发文档
- 🔧 **性能优化** - 提升应用性能表现

### 💡 开发指南
1. Fork 本项目
2. 创建特性分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m '添加某某功能'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 提交 Pull Request

详细开发指南请参考 [CLAUDE.md](./CLAUDE.md)

## 📄 开源协议

本项目基于 [MIT License](LICENSE) 开源协议。

## 🙏 致谢

- 🎮 **视觉灵感** - 经典魂斗罗游戏
- 🔤 **字体** - [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) by CodeMan38
- ⚛️ **框架** - [Create React App](https://github.com/facebook/create-react-app)
- 🎭 **图标** - [Lucide Icons](https://lucide.dev/)
- ✨ **动画** - [Framer Motion](https://www.framer.com/motion/)

---

<div align="center">

**🎮 让背单词变得像打游戏一样有趣！** ✨

[⭐ 给个Star](https://github.com/your-username/word-game-gaokao) • [🐛 报告Bug](https://github.com/your-username/word-game-gaokao/issues) • [💡 功能建议](https://github.com/your-username/word-game-gaokao/discussions)

</div>

---

**多语言**: **简体中文** | [English](README.en.md) | [部署指南](DEPLOYMENT.md)
