# WhatDateTime 项目检查与修复 — 2026-11-05

## 范围与基线

从 `66b3513` 开始，在 `fix/project-review-20261105` 分支检查并修复。实际项目为 Astro 5.18.2 + React 18 + Tailwind 3，不是旧需求中的 Next.js。已读取全部项目运营文件；遵循 2026-09-26 后的索引资格策略，不恢复此前全量 index 的旧方案。

检查范围：路由与数据来源、计算引擎、12 个计算器的初始化、日期/时区边界、SSR 与 hydration、元数据与 JSON-LD、sitemap/robots/内链、Worker 路由、依赖安全、CI 和发布流程。没有批量重写正文，没有新增或删除页面，没有改变 URL、索引资格、布局或现有 Tailwind 类。错误提示及重复时刻的双结果属于必要的功能修正。

## 已修复问题

| 等级 | 文件 | 问题与修复 |
|---|---|---|
| 高 | `components/timezone-calculator.tsx` | 首屏结果曾固定为 2026 年 1 月的示例值，未按初始时间计算。现在首屏和交互共同使用 `resolveWallTime`；设备时区不在下拉列表时，输入值也会转换到实际选中的回退时区。 |
| 高 | `components/timezone-calculator.tsx` | DST 跳时曾被静默归一化，重复时刻只显示一个结果。现在不存在的本地时间显示错误，重复时刻显示两个可能瞬间及源 UTC 偏移。结果保留上一次已提交的目标时区，编辑草稿不再篡改旧结果标签。 |
| 高 | `components/CalculatorBox.tsx` | 清空日期输入时，渲染函数对 Invalid Date 调用 format，可能使计算器崩溃。改为保留已提交起始日期，并在计算前验证输入及结果。 |
| 高 | `components/date-utility-calculators.tsx`、`lib/date-input.ts` | 部分日期工具将同一初始时间按宿主时区解释，服务端与浏览器可产生不同日期。首屏统一从 UTC 快照提取日历日期；挂载后继续使用访问者本地时间。 |
| 高 | `components/difference-calculator.tsx`、`lib/calculator.ts` | 初始七天区间跨 DST 时，服务端和客户端产生不同 duration。初始预览采用确定性 elapsed duration，提交后保留本地 calendar duration；“Total days”改为完整 24 小时日，与现有说明一致。 |
| 中 | `lib/date-input.ts`、`lib/dateCalculator.ts`、日期工具 | JS 多参数 Date 构造器把 1–99 年映射到 1901–1999 年。使用 setFullYear 和严格回验，拒绝空值、年 0 和不存在的日期；表单增加 required、整数及年份边界。 |
| 中 | `components/date-calculator.tsx` | 大数计算可产生无效日期并崩溃；修改草稿后旧结果解释立即变化。现在验证结果范围并保留已提交参数，失败时给出可读提示。 |
| 中 | `lib/timezoneFacts.ts` | 历史秒级 UTC 偏移导致解析异常；早期年份未补齐四位。现在支持秒级偏移、四位年份，并拒绝年 0。 |
| 中 | `workers/on-demand.tsx` | alias 普通对象查找会读取 `constructor` / `__proto__` 等继承属性。改为自有属性判断，未知路径保持真实 404。 |
| 中 | `lib/timezoneFacts.ts` | 工作时间重叠 FAQ 曾声称排除公共假日，但没有假日数据。修正文案及对应 schema，明确只按周一至周五 9–17 点计算，不计假日和个人可用时间。 |
| 高，部分解决 | `package.json`、`package-lock.json` | npm audit 从 18 项降至 4 项。更新兼容依赖，固定 sharp 0.35.5，修复 Astro 依赖的 esbuild 漏洞版本；Vite 保持其兼容的 0.25.12。未使用 `npm audit fix --force`。 |

## 回归覆盖

- 新增 `scripts/project-regression-tests.mjs`，并纳入 `npm test`。
- 12 个计算器，4 个宿主时区（UTC、洛杉矶、东京、Kiritimati），3 个快照日期（年初、春季和秋季 DST 切换前），共 144 份初始 HTML，逐组件比较一致性。
- 严格日期、早期年份、闰日、历史偏移、23 小时的完整日口径，以及实际 Worker 的 alias/404 回归。
- `scripts/ssr-smoke-tests.mjs` 扩充为 7 个未知路径测试，包含原型属性名称；继续覆盖 28 个公共页面、真实导航请求、查询参数 canonical、HEAD 和已有别名。

## 验证结果

执行了干净的 `npm ci`，依赖树无 invalid 项；随后重新运行 typecheck、lint、test、build 和 SEO gate。Cloudflare 本地 HTTP 测试及 Worker dry-run 打包另行验证，不是生产部署。

| 项目 | 结果 |
|---|---:|
| 现有可访问内容 URL | 10,262，未减少 |
| 可索引静态 HTML / sitemap URL | 2,236 |
| 已有 noindex 按需渲染 URL | 8,026，策略未改变 |
| sitemap 分片 | 13，每片不超过 1,000 URL |
| 静态 HTML 检查 | 2,236 |
| 额外按需 HTML 样本 | 20 |
| 元数据记录检查 | 10,262 |
| canonical、重复元数据、JSON-LD、内链门禁 | 通过 |
| 可索引页面最大抓取深度 | 6 |

浏览器使用 agent-browser 在本地 Cloudflare 运行时验证：纽约 2026-03-08 02:30 无效；2026-11-01 01:30 对应伦敦 05:30 和 06:30；2024-01-31 加一个月得到 2024-02-29；0004 年 2 月有 29 天；0099 年没有变成 1999 年；清空日期和超大输入不导致崩溃。检查页面的运行时错误列表为空。

查看了 1440px 桌面及 390px 手机截图：首页无横向溢出，时钟使用访问者当前时间。截图位于忽略提交的 `dogfood-output/project-review-*.png`。本次没有进行像素级旧版对比，不能据此声称所有页面完全无视觉差异；代码未调整现有样式或布局。

## 尚未解决 / 不应隐瞒的风险

1. **P1：框架安全升级。** npm audit 仍有 1 critical、2 high、1 low，涉及 Astro、Zod 及依赖它们的包。清零需要单独验证 Astro 主版本升级、React 集成和 Tailwind 集成。生产采用静态资产和自定义 React Worker，没有部署 Astro Server Islands 或动态图片优化端点；这降低相关攻击面的暴露，但不代表告警已经消失。审计为构建依赖检查，不是渗透测试。
2. **P1：静态日期快照的时效取舍。** `lib/build-time.ts` 默认仍为 `2026-09-26T04:00:00.000Z`。页面 JS 会校准本地实时答案，但不执行 JS 的访问者看到的是标注的快照，不是实时答案。按运营规则，本次未触发全量日期重写，也未恢复每日部署。需要实时无 JS 答案时，应另行选择受控快照刷新或带缓存的服务端方案，并评估 Worker 成本。
3. **P2：真实搜索与体验证据不足。** 仓库没有完整可验证的 GSC query/page 导出，也没有此次发布的 CrUX/Lighthouse 数据。门禁通过不代表 Google 一定收录或排名提高；没有新增低价值数字页或伪造内容唯一率。
4. **P2：前端拆包。** 核心工具页仍以整页 React island 为主。本地构建 React 客户端约 43 KiB gzip，工具页主块约 16 KiB gzip，另有共享块。没有新增大型依赖；进一步拆分可以作为单独性能工作，不在此次修复中盲目改造 UI。

安全修复依据：[sharp 官方公告](https://github.com/lovell/sharp/security/advisories/GHSA-wq5f-xc86-pv6w)、[esbuild 官方公告](https://github.com/evanw/esbuild/security/advisories/GHSA-g7r4-m6w7-qqqr)、[Astro AVIF 公告](https://github.com/withastro/astro/security/advisories/GHSA-26w7-cxv4-gfx2)。依赖 overrides 已通过干净安装和完整构建；框架升级时应重新评估并移除不再需要的 override。

## 发布边界

本次为源代码修复与验证，不执行生产部署，不刷新静态日期，不改变 Cloudflare 计费路径。修复分支按项目工作流提交并同步；上线应作为明确的发布步骤进行。
