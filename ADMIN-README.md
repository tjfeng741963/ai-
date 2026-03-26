# 提示词管理后台

## 快速启动

```bash
# 1. 启动后端（自动初始化 SQLite + seed）
cd proxy && npm run dev

# 2. 启动前端
cd frontend && npm run dev

# 3. 访问管理后台
# 浏览器打开 http://localhost:5173/#/admin
```

## 功能

| Tab | 说明 |
|-----|------|
| 提示词管理 | 按工具分组查看/搜索/编辑所有提示词模板 |
| 全局配置 | 编辑默认模型、温度等全局参数 |
| 修改历史 | 查看所有修改记录，支持 diff 查看和一键回滚 |

## 数据库

- 文件位置: `proxy/data/prompts.db`（SQLite，已 gitignore）
- 首次启动自动建表 + 写入 19 条种子数据
- 删除 `prompts.db` 后重启即可重置

## API

```bash
# 列出所有提示词
curl http://localhost:3003/api/admin/prompts

# 更新某个提示词
curl -X PUT http://localhost:3003/api/admin/prompts/script-rating.structure_analysis \
  -H "Content-Type: application/json" \
  -d '{"content": "新的提示词内容..."}'

# 查看修改历史
curl http://localhost:3003/api/admin/history

# 回滚
curl -X POST http://localhost:3003/api/admin/history/1/rollback
```

## 待办

- [ ] 将实际提示词文本写入 seed（目前是占位符）
- [ ] 工具代码迁移：用 `prompt-client.ts` 替代硬编码 import
- [ ] 添加 Admin 访问密码保护
