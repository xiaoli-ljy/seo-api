# SEO API

> 面向 Leonid's Jewelry 的 SEO 内容分析与生成 API，部署于 Vercel Serverless Functions。

## 项目简介

SEO API 是一套 SEO 自动化工具链，专为 Leonid's Jewelry（高级珠宝与培育钻石品牌）打造。它将 Google Search Console 数据、SERP 分析、SEMrush 关键词研究以及 OpenAI 驱动的 AI 分析整合为无服务器 API 端点，助力 SEO 内容策略与创作。

## 功能特性

- **Google Search Console 数据获取** — OAuth2 授权接入 GSC，提取非品牌关键词的搜索分析数据，自动过滤品牌词与平台噪音
- **SERP 竞争分析** — 通过 SerpAPI 获取 Google 搜索结果，分析排名靠前页面的标题、链接与摘要
- **SEMrush 关键词研究** — 支持短语关联词、子目录自然流量、URL 关键词等多维度数据
- **竞品内容萃取** — 抓取目标页面，提取标题结构与正文摘要
- **AI 搜索意图分析** — 结合 SERP 与竞品内容，由 GPT-4o-mini 生成结构化 SEO 简报与分析摘要
- **AI 长文创作** — 具备搜索意图适配、EEAT 增强、视觉 SEO 策略、内链规划等多层输出能力，自动校验字数与品牌提及

## API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/gsc` | GET | 获取 GSC 搜索分析数据（自动过滤品牌词与噪音词） |
| `/api/auth` | GET | 生成 Google OAuth2 授权链接 |
| `/api/callback` | GET | OAuth2 回调处理，获取 Refresh Token |
| `/api/serpAPI` | GET | 通过 SerpAPI 搜索关键词并返回自然搜索结果 |
| `/api/semrush` | GET | SEMrush 关键词关联查询（短语匹配/相关词） |
| `/api/semrush-url` | GET | 查询指定子目录的自然搜索关键词 |
| `/api/semrush-url-keywords` | GET | 查询指定 URL 的自然搜索关键词详情 |
| `/api/extract` | GET | 抓取目标 URL 的页面内容（标题 + 正文摘要） |
| `/api/analyze` | POST | 结合 SERP 与竞品内容，由 AI 生成 SEO 简报与摘要 |
| `/api/write` | POST | 通过 AI 撰写完整的 SEO 长文（HTML 格式） |
| `/api/env-check` | GET | 检查环境变量配置状态 |

## 技术栈

- **运行时**：Node.js（ES Modules）
- **部署平台**：Vercel Serverless Functions
- **Google API**：[googleapis](https://github.com/googleapis/google-api-nodejs-client) — Search Console API
- **网页解析**：[cheerio](https://cheerio.js.org/) — HTML 解析与内容提取
- **AI 引擎**：OpenAI GPT-4o-mini
- **外部 API 集成**：SerpAPI、SEMrush API

## 环境变量

在 Vercel 项目设置中配置以下环境变量：

| 变量 | 用途 | 对应端点 |
|------|------|----------|
| `CLIENT_ID` | Google Cloud OAuth2 客户端 ID | auth, callback, gsc |
| `CLIENT_SECRET` | Google Cloud OAuth2 客户端密钥 | auth, callback, gsc |
| `REDIRECT_URI` | OAuth2 回调地址 | auth, callback |
| `REFRESH_TOKEN` | OAuth2 长期刷新令牌 | gsc |
| `ACCESS_TOKEN` | OAuth2 访问令牌 | gsc |
| `SERP_API_KEY` | SerpAPI API 密钥 | serpAPI |
| `SEMRUSH_API_KEY` | SEMrush API 密钥 | semrush, semrush-url, semrush-url-keywords |
| `OPENAI_API_KEY` | OpenAI API 密钥 | analyze, write |

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

参考上方环境变量表格，在 Vercel 项目面板中配置。

### 3. 获取 Google OAuth Refresh Token

访问 `/api/auth` 完成 OAuth2 授权流程，在 `/api/callback` 获取 `refresh_token`，回填至环境变量 `REFRESH_TOKEN`。

### 4. 本地开发

推荐使用 [Vercel CLI](https://vercel.com/docs/cli)：

```bash
npm i -g vercel
vercel dev
```

### 5. 生产部署

```bash
vercel --prod
```

## 典型工作流

```
GSC 关键词发现          竞品分析                   AI 内容创作
┌─────────────┐      ┌──────────────┐        ┌────────────────┐
│ /api/gsc    │─────▶│ /api/serpAPI │───────▶│ /api/analyze   │
│ 获取非品牌   │      │ 获取SERP结果  │        │ AI生成SEO简报   │
│ 关键词列表   │      │ /api/extract │        │ /api/write     │
└─────────────┘      │ 萃取竞品内容  │        │ AI撰写长文     │
                     └──────────────┘        └────────────────┘
```

## 项目结构

```
seo-api/
├── api/
│   ├── analyze.js              # AI SEO 分析与简报生成
│   ├── auth.js                 # Google OAuth2 授权入口
│   ├── callback.js             # OAuth2 回调处理
│   ├── env-check.js             # 环境变量状态检查
│   ├── extract.js              # 竞品页面内容抓取
│   ├── gsc.js                  # Google Search Console 数据
│   ├── semrush.js               # SEMrush 关键词关联查询
│   ├── semrush-url.js           # SEMrush 子目录关键词
│   ├── semrush-url-keywords.js  # SEMrush URL 关键词详情
│   ├── serpAPI.js               # SerpAPI 搜索结果
│   └── write.js                 # AI 长文生成
├── package.json
└── README.md
```

## 许可证

ISC

---

# SEO API

> SEO content analysis and generation API for Leonid's Jewelry, deployed on Vercel Serverless Functions.

## Overview

SEO API is an automated SEO toolchain built for Leonid's Jewelry (fine jewelry and lab-grown diamond brand). It integrates Google Search Console data, SERP analysis, SEMrush keyword research, and OpenAI-powered AI analysis into serverless API endpoints to support SEO content strategy and creation.

## Features

- **Google Search Console Data** — OAuth2-authenticated GSC integration, extracts non-brand keyword analytics with automatic brand and noise filtering
- **SERP Competitive Analysis** — Fetches Google search results via SerpAPI, returning titles, links, and snippets of top-ranking pages
- **SEMrush Keyword Research** — Supports phrase-related keywords, subfolder organic traffic, and URL-level keyword data
- **Competitor Content Extraction** — Scrapes target pages, extracting heading structures and body summaries
- **AI Search Intent Analysis** — Combines SERP and competitor content, producing structured SEO briefs and analysis summaries via GPT-4o-mini
- **AI Long-Form Content Writing** — Multi-layered output with search intent adaptation, EEAT enhancement, visual SEO strategy, and internal linking planning; validates word count and brand mentions automatically

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/gsc` | GET | Fetch GSC search analytics (auto-filters brand/noise queries) |
| `/api/auth` | GET | Generate Google OAuth2 authorization URL |
| `/api/callback` | GET | OAuth2 callback handler, returns Refresh Token |
| `/api/serpAPI` | GET | Search keywords via SerpAPI and return organic results |
| `/api/semrush` | GET | SEMrush keyword lookup (phrase match / related terms) |
| `/api/semrush-url` | GET | Query organic keywords for a specific subfolder |
| `/api/semrush-url-keywords` | GET | Query detailed organic keyword data for a specific URL |
| `/api/extract` | GET | Scrape page content from a target URL (headings + body summary) |
| `/api/analyze` | POST | AI-generated SEO brief and analysis from SERP + competitor content |
| `/api/write` | POST | AI-powered long-form SEO article generation (HTML output) |
| `/api/env-check` | GET | Check environment variable configuration status |

## Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Deployment**: Vercel Serverless Functions
- **Google API**: [googleapis](https://github.com/googleapis/google-api-nodejs-client) — Search Console API
- **HTML Parsing**: [cheerio](https://cheerio.js.org/) — HTML parsing and content extraction
- **AI Engine**: OpenAI GPT-4o-mini
- **External APIs**: SerpAPI, SEMrush API

## Environment Variables

Configure the following environment variables in your Vercel project settings:

| Variable | Purpose | Used By |
|----------|---------|---------|
| `CLIENT_ID` | Google Cloud OAuth2 client ID | auth, callback, gsc |
| `CLIENT_SECRET` | Google Cloud OAuth2 client secret | auth, callback, gsc |
| `REDIRECT_URI` | OAuth2 redirect URI | auth, callback |
| `REFRESH_TOKEN` | OAuth2 long-lived refresh token | gsc |
| `ACCESS_TOKEN` | OAuth2 access token | gsc |
| `SERP_API_KEY` | SerpAPI API key | serpAPI |
| `SEMRUSH_API_KEY` | SEMrush API key | semrush, semrush-url, semrush-url-keywords |
| `OPENAI_API_KEY` | OpenAI API key | analyze, write |

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Reference the environment variables table above and configure them in your Vercel project dashboard.

### 3. Obtain Google OAuth Refresh Token

Visit `/api/auth` to complete the OAuth2 authorization flow, then retrieve the `refresh_token` from `/api/callback` and set it as the `REFRESH_TOKEN` environment variable.

### 4. Local Development

Use [Vercel CLI](https://vercel.com/docs/cli):

```bash
npm i -g vercel
vercel dev
```

### 5. Production Deployment

```bash
vercel --prod
```

## Typical Workflow

```
GSC Keyword Discovery    Competitive Analysis        AI Content Creation
┌─────────────┐        ┌──────────────┐           ┌────────────────┐
│ /api/gsc    │───────▶│ /api/serpAPI │──────────▶│ /api/analyze   │
│ Discover     │        │ Get SERP     │           │ AI SEO Brief   │
│ non-brand   │        │ results      │           │ /api/write     │
│ keywords    │        │ /api/extract │           │ AI Long-Form   │
└─────────────┘        │ Scrape pages │           │ Article        │
                       └──────────────┘           └────────────────┘
```

## Project Structure

```
seo-api/
├── api/
│   ├── analyze.js              # AI SEO analysis & brief generation
│   ├── auth.js                 # Google OAuth2 authorization entry
│   ├── callback.js             # OAuth2 callback handler
│   ├── env-check.js             # Environment variable status check
│   ├── extract.js              # Competitor page content scraper
│   ├── gsc.js                  # Google Search Console data
│   ├── semrush.js               # SEMrush keyword related queries
│   ├── semrush-url.js           # SEMrush subfolder keyword data
│   ├── semrush-url-keywords.js  # SEMrush URL-level keyword details
│   ├── serpAPI.js               # SerpAPI search results
│   └── write.js                 # AI long-form article generation
├── package.json
└── README.md
```

## License

ISC
