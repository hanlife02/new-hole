# Ethan Hole

基于Next.js的树洞应用，支持Casdoor + API Key双重鉴权。

## 功能特性

- 🔐 双重鉴权系统 (Casdoor + API Key)
- 🌓 深浅主题切换 (黑白配色)
- 📱 响应式设计
- 🔍 多种查询方式：最新树洞、热点树洞、PID查询、关键词搜索
- 💬 评论系统支持
- 📊 实时统计数据

## 环境配置

1. 复制环境变量配置文件：
```bash
cp .env.local.example .env.local
```

2. 配置环境变量：
```env
# Casdoor配置
CASDOOR_ENDPOINT=https://your-casdoor-domain.com
CASDOOR_CLIENT_ID=your-client-id
CASDOOR_CLIENT_SECRET=your-client-secret
CASDOOR_APP_NAME=your-app-name
CASDOOR_ORGANIZATION_NAME=your-organization

# API Key
API_KEY=your-api-key
NEXT_PUBLIC_API_KEY=your-api-key

# NextAuth配置
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# 服务配置
PORT=3000

# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
```

## 安装依赖

```bash
pnpm install
```

## 运行项目

```bash
pnpm dev
```

## 页面结构

- `/` - 首页，显示统计信息和导航
- `/latest` - 最新树洞列表
- `/hot` - 热点树洞筛选
- `/pidsearch` - PID查询
- `/keysearch` - 关键词搜索
- `/auth/signin` - 登录页面

## 数据库要求

需要PostgreSQL数据库，包含以下表：
- `holes` - 树洞主表
- `comments` - 评论表
- `latest_pid` - 最新PID记录表

详细表结构请参考项目文档。