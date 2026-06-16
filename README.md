# 天机六爻

西汉京房发明纳甲的时候，大概没想过这东西两千年后还能跑在浏览器里。

这是一个六爻占卜 Web 应用。不是那种点一下按钮弹一句"近期有贵人相助"的玩具——它真的在算。纳甲、六亲、六神、世应、飞伏，卜筮正宗里有的，这里都有。

**[在线试试](https://liuyao.vercel.app)**

---

## 起因

我研究了一圈市面上的六爻应用，发现两个普遍问题。

一是算得太糙。很多应用只给你一个卦辞，连六亲六神都没有，爻辞是硬编码的，跟实际卦象对不上。有的更离谱，用 `Math.random()` 出爻象，然后拼一段固定文案。

二是读不懂。满屏"官鬼持世""妻财动化回头克"，没学过六爻的人看了跟看天书一样。占卜是给人看的，不是给行内人做学术报告的。

所以做了这个。目标就两件事：**算对**，**说人话**。

---

## 怎么算的

起卦的随机性来源不是伪随机数。系统当前会同时采集这些熵源：

- 当前时间戳（毫秒级）
- 你的经纬度
- 当前交互输入（例如太极图旋转角度与交互时长）
- 屏幕与设备环境信息
- 你输入的生辰哈希值

这些数据混在一起过 FNV-1a 哈希，再喂给 Mulberry32 PRNG。概率分布是老阴 1/8、少阳 3/8、少阴 3/8、老阳 1/8，跟实际铜钱的概率一致。

八字排盘按节气划分月份，不是按农历初一。真太阳时的修正用 Spencer 时差方程。1 月初跨年那几天的年柱问题也处理了——这种边界很多实现都忽略了。

解读是确定性规则引擎，不是大模型。同一卦你算十次，结果一模一样。话术做了心理学设计，但底层是死规则，不会随机生成。

---

## 跑起来

```bash
git clone https://github.com/Kaya-yan/liuyao.git
cd liuyao
npm install
npm run dev
```

浏览器打开 `http://localhost:3000`。

部署到 Vercel 零配置，导入仓库就行：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Kaya-yan/liuyao)

---

## 用到的东西

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Zustand · Canvas 2D · suncalc

纯前端。没有后端，没有数据库，求测数据不会上传到服务端持久化。页面流程状态刷新后会重置，但占卜历史会保存在浏览器本地 `localStorage`。

---

## 目录

```
app/                    页面
├── page.tsx            落地页
├── input/page.tsx      生辰、性别、类别
├── location/page.tsx   定位 + 真太阳时
├── cast/page.tsx       起卦
├── result/page.tsx     结果 + 分享
└── history/page.tsx    历史记录

lib/
├── hexagram/           六爻知识库（八卦、八宫、64卦、纳甲、六亲、六神、飞伏）
├── engine/             引擎（八字、真太阳时、五行、熵值、解读）
├── utils/              历史记录、分享图、音效等浏览器工具
└── constants.ts        类别标签等常量

stores/                 全局状态
components/             UI 组件
types/                  类型定义
```

想改解读话术：`lib/engine/interpretation.ts`
想改六爻计算：`lib/hexagram/` 下面那几个文件
想改起卦交互：`app/cast/page.tsx`

---

## 常见问题

**为什么不用大模型生成解读？**

大模型每次生成的都不一样。你今天算了一卦觉得挺准，明天再算同一卦，文字全变了，你还会信吗。确定性引擎的好处就是稳定——输入一样，输出永远一样。

**为什么要定位？**

八字用的是真太阳时，不是北京时间。经度每差 1 度，时间差 4 分钟。你在东经 130° 的地方用东经 120° 的时间排八字，时辰可能直接偏了一格。差一个时辰，八字就完全不同了。

**结果页那些专业术语在哪看？**

折叠在页面最底部了。普通人看故事和建议就够了，想看纳甲六亲六神表的自己展开。

**手机上能用吗？**

专门为手机做了交互适配。手机默认是“摇铜钱”按钮交互，桌面端可以玩太极图旋转；不同设备会走各自当前支持的起卦路径。

---

## 参与

想帮忙的话，这几个方向缺人：

- 懂六爻的：解读模板的场景覆盖还不够，很多边界情况的话术是空的
- 写前端的：动画、响应式、无障碍
- 找 Bug 的：计算逻辑的边界、浏览器兼容
- 有想法的：新功能、新玩法

```bash
git checkout -b your-branch
# 改完提 PR
```

---

## 致谢

[lunar-javascript](https://github.com/6tail/lunar-javascript) · [suncalc](https://github.com/mourner/suncalc) · [zustand](https://github.com/pmndrs/zustand) · [framer-motion](https://github.com/motiondivision/motion)

理论根基是[卜筮正宗](https://zh.wikipedia.org/wiki/卜筮正宗)，纳甲法源自[京房](https://zh.wikipedia.org/wiki/京房)（西汉）。

---

MIT License

*卦象所示，仅供参考。命由己造，福自我求。*
