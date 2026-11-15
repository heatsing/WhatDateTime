# WhatDateTime：本次优化与 WordPress 备选方案

建议继续使用现有 Astro + React + Cloudflare。这个站的核心是日期和时区计算，现有代码已经有计算引擎、共享输入状态、路由、站点地图和测试。迁移 WordPress 的主要收益是后台编辑便利；它不能代替收录诊断，也不能承诺恢复排名。

## 本次改动

本分支基于 `e8e37a3`，沿用其小数小时、输入联动、倒计时和时区修复。仓库的生产记录显示，上次部署为 `fff0345`，后续 `e8e37a3` 明确记录为未部署；公开页面抽查也与较早版本相符。不要直接部署旧 `main`，否则会遗漏修复。本分支尚未发布。

1. 为下面 18 个已可索引网址添加或保留保护条目；没有将既有 noindex 页面批量放开，也没有新增页面。保护用于防止后续收缩范围时误删重点页，本身不是排名提升承诺。
2. 相对日期 FAQ 直接回答如何计算，说明小时、周、工作日和月末规则；继续明确工作日不排除公共假日。
3. 固定的补充示例和对应事实表使用稳定的 `data-nosnippet` 容器，减少过期示例日期进入 Google 摘要的机会。主要答案和解释内容不加这一限制。该属性控制摘要选择，不负责收录或排名。
4. 保留现有网址、canonical、静态优先架构、计算状态及索引集合。只有真正修改的内容系列更新修订日期。

| 页面组 | 本次保护的网址 |
| --- | --- |
| 小时 | `/8-hours-from-now`、`/48-hours-from-now`、`/72-hours-from-now`、`/18-hours-from-now`、`/17-hours-from-now`、`/15-hours-ago`、`/10-hours-ago`、`/6-hours-ago` |
| 工作日 | `/1-business-day-from-today`、`/2-business-days-from-today`、`/8-business-days-from-today`、`/15-business-days-from-today`、`/35-business-days-from-today`、`/90-business-days-from-today` |
| 时区 | `/los-angeles-to-new-york-time`、`/new-york-to-sydney-time`、`/london-to-toronto-time`、`/toronto-to-new-york-time` |

选择依据是已审阅的站主报表。公开仓库不附原始报表、私有点击量或查询词数据。两个核心工具 `/calculators/date-calculator` 和 `/calculators/countdown` 继续作为固定可索引页面监测。

## 下一步 SEO 工作

本轮验证：类型检查通过；完整 `npm test` 通过，包括构建后的 Worker 处理器回归；构建与 SEO 检查覆盖 2,238 个静态 HTML、20 个动态样本和 10,263 条元数据；保护前后的索引集合完全一致；Worker 发布包 dry-run 通过。抽查生成 HTML 确认摘要限制只包住固定补充示例，主要答案未受限制。独立代码审阅未发现新增计算缺陷，审阅指出的保护说明中的历史指标已移除。

本地 `wrangler dev` 启动遇到 `uv_interface_addresses` 运行环境错误，随后 `npm run test:ssr` 因无法连接本地端口而失败，HTTP 冒烟测试未完成。本次没有重跑浏览器交互测试，也没有发布。标准构建的时区生成器会读取 Node 的 IANA 数据；本环境自动生成的时区资料变化未纳入本次修改，最终以保留仓库资料的构建再次通过 SEO 检查。合并发布前仍应在正常 Cloudflare 开发/CI 环境跑通 HTTP 检查，并核对标准构建产生的时区数据变化。

发布本次验证版本后，用 GSC 检查 10 个代表网址：2 个核心工具、4 个重点可索引页、4 个旧 noindex 页。分别记录抓取时间、Google 选择的 canonical、渲染结果与排除原因，同时查看人工处置、安全问题和移除记录。现有证据不足以把流量下跌全部归因于某一次代码改动。

Bing 目前只有逐日报表，需要 Web 来源的页面和关键词导出，才能判断哪些页必须保护、哪些标题值得试验。没有这些明细时，不追加整批 noindex、不批量删除数字页、不把旧页一律跳转首页。

当前初始 HTML 仍使用明确标注的固定 UTC 示例，加载后才转成设备本地时间。这项限制没有在本次被解决。若 GSC 的实际渲染证据显示主要答案读取不可靠，下一项应是**在现有 Cloudflare 架构内，为上述少量重点页提供请求时 UTC 答案，再由浏览器转成本地时间**。先记录现有基线，保持网址与正文完整，给所有访客相同的服务端内容，验证缓存有效期、夏令时和跨日后，再比较 28 天结果。不要为此一次重写全站或只给爬虫另一套内容。

发布后第 7 天核对抓取与错误，第 28 天按页面组比较 Google/Bing 点击和曝光。优先看非品牌、同来源、等长窗口；不把低曝光下的平均排名上升当成恢复，也不承诺固定流量增幅。

## 如果确定迁移 WordPress

适用条件：日常维护确实需要 WordPress 后台，或主要增长方向将转为人工维护的指南、教程和文章。仅因为 Google 当前表现差，不足以决定迁移。

建议用轻量区块主题，加独立 `whatdatetime-tools` 插件。主题负责展示，插件负责计算、网址解析、数据与 SEO；不要把计算逻辑散落在页面 HTML 或主题函数里。

| 现有部分 | WordPress 实现 |
| --- | --- |
| 首页、About、方法、来源、联系页 | 原生 Page 与可复用区块，路径原样保留 |
| 核心计算工具 | 插件服务端输出 + React 交互；后台用区块或带前缀的短代码插入 |
| 数字、城市和城市对页面 | 保留完整允许路由清单，由插件 rewrite/template 生成；不批量创建一万篇文章 |
| 计算引擎 | 尽量复用现有 TypeScript 客户端逻辑；服务端实现以同一组字面量验收用例校验，尤其夏令时、月末、闰年和零值 |
| 索引策略 | 迁移原有 index/noindex、canonical 和保护名单，不按 WordPress 默认文章策略重建 |
| Sitemap | 只包含原有可索引集合；若更换 sitemap 路径，旧入口保留有效指引，并更新 robots 与搜索平台 |
| 文章与教程 | 使用原生文章和少量清晰分类；只创建有独立用途的内容 |

实施顺序：

1. 在受访问保护的测试环境建立主题和插件，先迁移 20 个代表页；保留线上站。
2. 导出全部既有路由的状态、canonical、robots、标题和描述，逐项对照。相同网址保持 200；只有确实改址且内容等价的页面才做一对一 301。未知网址必须真实 404。
3. 验证 HTML 中就有可用答案和规则，客户端输入与服务端结果一致。小时页的 UTC 答案缓存不能跨越承诺的刷新间隔；日期页按 UTC 日期失效，并明确当地日期可能不同。不要用长时间整页缓存把旧答案当成现在。
4. 完成全量路由检查、手机交互、倒计时分享链接兼容和性能对比后，再安排一次域名路由切换。保留原 Worker 版本及配置用于回退；切换后先查状态码、canonical、索引限制和错误率。

同域名同路径迁移不需要整站 301，也不应提交域名 Change of Address。上线时解除测试环境限制、保留验证标记，并继续比较同一批网址。不要同时更换域名、网址结构、内容和平台。

这是一份可执行的迁移设计，尚未创建 WordPress 主题或插件，也没有修改托管、DNS 或生产配置。

## 参考

- [Google：data-nosnippet 规则](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#data-nosnippet-attr)
- [Google：JavaScript 搜索问题排查](https://developers.google.com/search/docs/crawling-indexing/javascript/fix-search-javascript)
- [Google：更换托管但保持网址](https://developers.google.com/search/docs/crawling-indexing/site-move-no-url-changes)
- [Google：迁移与网址变更](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)
- [WordPress：短代码](https://developer.wordpress.org/reference/functions/add_shortcode/)
- [WordPress：Rewrite API](https://developer.wordpress.org/apis/rewrite/)
