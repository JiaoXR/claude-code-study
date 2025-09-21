#!/usr/bin/env node

// 飞书收藏插件 - Manifest验证脚本
const fs = require('fs');
const path = require('path');

function validateManifest() {
  try {
    // 读取manifest.json
    const manifestPath = path.join(__dirname, '..', 'manifest.json');
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestContent);

    console.log('🔍 验证manifest.json...');

    // 验证必需字段
    const requiredFields = ['manifest_version', 'name', 'version', 'description'];
    const missingFields = requiredFields.filter(field => !manifest[field]);
    
    if (missingFields.length > 0) {
      console.error('❌ 缺少必需字段:', missingFields.join(', '));
      return false;
    }

    // 验证manifest版本
    if (manifest.manifest_version !== 3) {
      console.error('❌ 必须使用Manifest V3');
      return false;
    }

    // 验证权限
    const permissions = manifest.permissions || [];
    const requiredPermissions = ['activeTab', 'storage', 'tabs'];
    const missingPermissions = requiredPermissions.filter(perm => !permissions.includes(perm));
    
    if (missingPermissions.length > 0) {
      console.warn('⚠️  缺少推荐权限:', missingPermissions.join(', '));
    }

    // 验证文件存在性
    const filesToCheck = [
      manifest.action?.default_popup,
      manifest.background?.service_worker,
      manifest.options_page,
      ...(manifest.content_scripts?.[0]?.js || [])
    ].filter(Boolean);

    const missingFiles = [];
    filesToCheck.forEach(file => {
      const filePath = path.join(__dirname, '..', file);
      if (!fs.existsSync(filePath)) {
        missingFiles.push(file);
      }
    });

    if (missingFiles.length > 0) {
      console.error('❌ 文件不存在:', missingFiles.join(', '));
      return false;
    }

    // 验证通过
    console.log('✅ Manifest验证通过');
    console.log(`📦 插件名称: ${manifest.name}`);
    console.log(`🔢 版本: ${manifest.version}`);
    console.log(`📝 描述: ${manifest.description}`);
    
    return true;

  } catch (error) {
    console.error('❌ 验证失败:', error.message);
    return false;
  }
}

// 验证项目文件结构
function validateProjectStructure() {
  console.log('\n🏗️  验证项目结构...');
  
  const requiredDirs = ['popup', 'background', 'content', 'options'];
  const missingDirs = requiredDirs.filter(dir => {
    const dirPath = path.join(__dirname, '..', dir);
    return !fs.existsSync(dirPath);
  });

  if (missingDirs.length > 0) {
    console.error('❌ 缺少目录:', missingDirs.join(', '));
    return false;
  }

  console.log('✅ 项目结构验证通过');
  return true;
}

// 主函数
function main() {
  console.log('🚀 飞书收藏插件验证工具\n');
  
  const manifestValid = validateManifest();
  const structureValid = validateProjectStructure();
  
  if (manifestValid && structureValid) {
    console.log('\n🎉 所有验证通过！插件已准备就绪。');
    console.log('\n📋 下一步:');
    console.log('1. 在Chrome中访问 chrome://extensions/');
    console.log('2. 开启开发者模式');
    console.log('3. 点击"加载已解压的扩展程序"');
    console.log('4. 选择项目根目录');
    process.exit(0);
  } else {
    console.log('\n❌ 验证失败，请修复错误后重试。');
    process.exit(1);
  }
}

// 运行验证
if (require.main === module) {
  main();
}

module.exports = { validateManifest, validateProjectStructure };