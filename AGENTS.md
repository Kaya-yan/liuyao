# 天机六爻协作说明

## 项目目标

这是一个纯前端的六爻占卜 Web 应用，目标只有两件事：算对，说人话。

- 六爻、纳甲、六亲、六神、世应、飞伏等规则由本地确定性逻辑计算
- 相同输入应得到相同结果，不引入随机生成的解读文案
- 修改文案或算法时，优先保持可验证性与一致性

## 本地开发

```bash
npm install
npm run dev
npm run lint
```

默认开发地址：`http://localhost:3000`

## 关键目录

```text
app/                    页面与路由
├── page.tsx            落地页
├── input/page.tsx      输入信息
├── location/page.tsx   定位与真太阳时
├── cast/page.tsx       起卦交互
├── result/page.tsx     结果展示与分享
└── history/page.tsx    历史记录

lib/engine/             八字、熵值、真太阳时、解读引擎
lib/hexagram/           六爻与纳甲知识库及计算
lib/utils/              历史记录、分享图、声音等浏览器工具
stores/                 Zustand 全局状态
components/             UI 组件
types/                  类型定义
```

## 数据与存储边界

- 项目没有后端，没有数据库，也没有服务端持久化
- 占卜流程与结果计算在浏览器端完成
- 历史记录会写入浏览器本地 `localStorage`，实现位置在 `lib/utils/history.ts`
- 分享图在浏览器端生成，实现位置在 `lib/utils/share-image.ts`

## 修改约束

- 保持解读与计算的确定性，不要引入随机输出
- 文档描述必须与当前实现一致，尤其是交互方式、隐私边界、依赖与目录结构
- 修改起卦主流程时，至少同步检查 `app/input/page.tsx`、`app/location/page.tsx`、`app/cast/page.tsx`、`app/result/page.tsx`
- 修改本地存储、分享或历史记录时，同步检查 `lib/utils/history.ts` 与 `lib/utils/share-image.ts`
- 没有明确需求时，不做与当前任务无关的重构

## 维护原则

- README 面向用户，保留产品表达，但不能写超出代码事实的能力
- AGENTS.md 面向协作者与 AI 助手，只记录稳定、可验证的项目事实
- 文档、依赖声明与实现三者应保持一致
- 文档或依赖调整完成后，至少运行一次 `npm run lint`
