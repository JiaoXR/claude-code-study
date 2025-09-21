# 飞书API错误修正说明

## 错误信息分析

### 原始错误
```json
{
    "code": 1254062,
    "msg": "SingleSelectFieldConvFail",
    "error": {
        "message": "Invalid request parameter: 'fields.标签.fieldValue.map[text:AI编程].fieldName.标签'. Correct format : the value of 'Single Option' must be a string. Please check and modify accordingly."
    }
}
```

### 错误原因
飞书API要求单选字段（Single Select）的值必须是**纯字符串**，而不是对象格式。

## 修正前后对比

### ❌ 修正前（错误格式）
```javascript
'标签': {
  text: 'AI编程'  // 对象格式，会导致API错误
}
```

### ✅ 修正后（正确格式）
```javascript
'标签': 'AI编程'  // 纯字符串格式，符合API要求
```

## 完整的正确格式

```javascript
const feishuRecord = {
  '网站地址': {
    link: bookmarkData.url || '',
    text: bookmarkData.description || bookmarkData.title || bookmarkData.url || ''
  },
  '网站说明': bookmarkData.description || '',  // 字符串类型
  '网站备注': bookmarkData.note || '',         // 字符串类型
  '标签': bookmarkData.category || '其他'       // 单选类型：纯字符串
};
```

## 修正的关键点

1. **超链接字段**：需要 `{ link, text }` 对象格式
2. **字符串字段**：直接传字符串值
3. **单选字段**：直接传字符串值（不是 `{ text: value }` 格式）

## 飞书单选字段的要求

- 值必须是预设选项中的一个
- 值必须是纯字符串
- 不能使用对象包装格式
- 区分大小写

## 验证方法

修正后可以通过以下方式验证：

1. **API测试**：直接调用飞书API，检查是否返回成功
2. **插件测试**：使用插件保存收藏，观察是否同步成功
3. **数据检查**：在飞书表格中确认数据是否正确显示

## 相关文档更新

已同步更新以下文件：
- `background/background.js`
- `background-clean.js`
- `FEISHU_FIELDS_CONFIG.md`
- `FIELD_TYPE_CORRECTION.md`

## 测试建议

请使用修正后的版本重新测试：
1. 重新加载插件
2. 尝试保存一个收藏
3. 检查飞书表格中是否正确显示数据
4. 确认标签字段显示为选择的选项（如"AI编程"、"AI工具"、"其他"）