# seo-api

Leonid's Jewelry SEO 内容策略 API — 关键词发现 → 竞品分析 → AI 简报 → AI 长文，部署于 Vercel Serverless Functions。

## 架构

```
/api/gsc ──▶ Google Search Console ──▶ 非品牌关键词列表
                    │
                    ▼
/api/serpAPI ──▶ SerpAPI ──▶ SERP 搜索结果（标题、链接、摘要）
/api/extract ──▶ cheerio ──▶ 竞品页面内容（标题结构、正文摘要）
                    │
                    ▼
/api/analyze ──▶ GPT-4o-mini ──▶ SEO 简报 (JSON) + 分析摘要
                    │
                    ▼
/api/write ────▶ GPT-4o-mini ──▶ 完整 SEO 长文 (HTML)
```

## 端点

| 端点 | 方法 | 职责 |
|------|------|------|
| `/api/gsc` | GET | GSC 搜索分析，自动过滤品牌词（域名匹配）、平台噪音、positions 5-40 |
| `/api/auth` | GET | Google OAuth2 授权入口 |
| `/api/callback` | GET | OAuth2 回调，获取 refresh_token |
| `/api/serpAPI` | GET | SerpAPI 搜索，返回 top 10 自然结果 |
| `/api/semrush` | GET | SEMrush 短语关联词 / 相关词查询 |
| `/api/semrush-url` | GET | SEMrush 子目录自然搜索关键词 |
| `/api/semrush-url-keywords` | GET | SEMrush URL 级别关键词详情（含 KD 难度） |
| `/api/extract` | GET | cheerio 抓取目标页面 h1-h3 标题 + 前 20 段正文（2000 字截断） |
| `/api/analyze` | POST | GPT-4o-mini 分析 SERP + 竞品内容，输出 SEO Brief + Summary |
| `/api/write` | POST | GPT-4o-mini 撰写 SEO 长文，含多层 prompt（意图分析、EEAT、视觉 SEO、内链） |
| `/api/env-check` | GET | 检查 8 个环境变量配置状态 |

## analyze 工作流

`analyze.js` 接收 `{ keyword, serp, contents }`，构造 prompt 让 GPT-4o-mini 输出两部分：

1. **Part 1: SEO Brief (JSON)** — wordCount, contentStrategy, structure, keyTopics, openingPattern, authorCredentials, differentiation, requiredTopics, h1Title, searchIntent, decisionPoints, comparisonTargets
2. **Part 2: Analysis Summary** — Search Intent、SERP Type Distribution、Content Length Range、Top 5 Structure、Competitor Coverage、Missing Points/Gaps、Differentiation、Brand Voice

解析逻辑：正则匹配 `{"wordCount"...}` 提取 JSON brief，其余文本作为 summary。

## write 工作流

`write.js` 接收 `{ keyword, brief, audience, wordCount, maxAttempts }`，最多重试 3 次：

1. `parseBrief(brief)` — 从 brief 文本/JSON 中提取 wordCount、keyTopics、structure、contentStrategy 等字段
2. 构造 566 行 SYSTEM_PROMPT（Author DNA / 反 AI 规则 / 搜索意图 / 视觉 SEO / 内链 / EEAT / 反幻觉）
3. `callOpenAI()` — 带 AbortController timeout，按 wordCount×8 计算 max_tokens
4. `validateArticle(content)` — 检查字数、H1、FAQ、品牌提及、英语占比、requiredTopics
5. 不通过则重试（最多 maxAttempts 次），最终返回 bestContent（最长的那版）

## GSC 品牌词过滤

`gsc.js` 中的 `isBrandQuery()` 自动识别品牌词：
- 包含域名（如 leonids.com）
- 包含去点域名
- 包含域名第一段（品牌短名）

同时过滤 impressions ≤ 50、positions 不在 5-40、平台噪音词（amazon/ebay/youtube 等）。

## 环境变量

| 变量 | 使用者 |
|------|--------|
| `CLIENT_ID` / `CLIENT_SECRET` / `REDIRECT_URI` | auth, callback, gsc |
| `REFRESH_TOKEN` / `ACCESS_TOKEN` | gsc |
| `SERP_API_KEY` | serpAPI |
| `SEMRUSH_API_KEY` | semrush, semrush-url, semrush-url-keywords |
| `OPENAI_API_KEY` | analyze, write |

## 本地运行

```bash
npm install
npx vercel dev    # 或 npm i -g vercel && vercel dev
```

## 部署

```bash
vercel --prod
```

所有密钥通过 Vercel 环境变量注入，源码中不包含任何硬编码凭证。
