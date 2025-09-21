// 调试脚本：检查飞书配置状态
console.log('=== 飞书配置调试信息 ===');

// 这个脚本可以在浏览器控制台中运行来检查配置状态
chrome.storage.local.get(['settings'], (result) => {
  console.log('存储的设置:', result);
  
  if (result.settings) {
    const settings = result.settings;
    console.log('配置详情:');
    console.log('- appToken:', settings.appToken ? '已设置' : '未设置');
    console.log('- tableId:', settings.tableId ? '已设置' : '未设置');
    console.log('- accessToken:', settings.accessToken ? '已设置' : '未设置');
    
    if (settings.appToken && settings.tableId && settings.accessToken) {
      console.log('✅ 配置完整，可以进行同步');
    } else {
      console.log('❌ 配置不完整，请在设置页面完成配置');
      console.log('缺少的配置项:');
      if (!settings.appToken) console.log('  - 应用令牌 (App Token)');
      if (!settings.tableId) console.log('  - 表格ID (Table ID)');
      if (!settings.accessToken) console.log('  - 访问令牌 (Access Token)');
    }
  } else {
    console.log('❌ 未找到任何设置，请先配置飞书API信息');
  }
});

// 检查待同步的数据
chrome.storage.local.get(['bookmarks'], (result) => {
  console.log('\n=== 收藏数据状态 ===');
  const bookmarks = result.bookmarks || [];
  console.log('总收藏数:', bookmarks.length);
  
  const unsynced = bookmarks.filter(b => !b.syncedToFeishu);
  console.log('未同步数:', unsynced.length);
  
  if (unsynced.length > 0) {
    console.log('未同步的收藏:', unsynced.map(b => ({
      id: b.id,
      title: b.title,
      url: b.url
    })));
  }
});