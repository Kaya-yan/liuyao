# 天机六爻

> 西汉京房创立纳甲体系的时候，大概没想到两千年后有人把它写成了 Web 应用。

这是一个六爻占卜平台——不是那种随机生成几句模棱两可的话就完事的玩具。它跑的是完整的卜筮正宗体系：纳甲、六亲、六神、世应、飞伏，一套不落。

输入你的生辰，它排八字。授权定位，它修正真太阳时。摇六次铜钱，它给你一段读完想截图发朋友的解读。

**[在线体验](https://liuyao.vercel.app)**

---

## 为什么要做这个

市面上的六爻应用普遍存在两个问题：

一是**算得糙**。要么只有卦辞没有六亲六神，要么干脆用 `Math.random()` 生成爻象再拼一段固定文案。二是**读不懂**。满屏"官鬼持世""妻财发动"，非专业用户看了跟没看一样。

这个项目试图解决这两件事：

- 把六爻体系算全、算对
- 把结果写成人话，让不懂术语的人也能看明白，并且觉得"这说的就是我"

---

## 它怎么算的

起卦用的不是伪随机数。六次摇铜钱的熵值来自多个源：

- 毫秒级时间戳
- 你的经纬度坐标
- 触摸/鼠标交互的轨迹数据
- 设备硬件信息
- 你生辰的哈希值

这些数据通过 FNV-1a 哈希混合，再经 Mulberry32 PRNG 输出，概率分布遵循老阴 1/8、少阳 3/8、少阴 3/8、老阳 1/8。

八字排盘用节气划分月份（不是农历初一），真太阳时的计算用 Spencer 时差方程做经度修正。1 月 1 日到 1 月 5 日的年柱跨年问题也处理了——这种边界很少有人管。

解读部分是确定性规则引擎，不是大模型生成。相同的输入永远得到相同的输出。话术模板经过心理学框架设计，读起来自然，但底层是规则。

---

## 截图

<table>
<tr>
<td><img src="./docs/screenshot-landing.png" alt="落地页" width="260"></td>
<td><img src="./docs/screenshot-cast.png" alt="起卦" width="260"></td>
<td><img src="./docs/screenshot-result.png" alt="结果" width="260"></td>
</tr>
<tr>
<td align="center">落地页</td>
<td align="center">摇铜钱</td>
<td align="center">结果解读</td>
</tr>
</table>

> 截图需要你自己补充——`npm run dev` 跑起来截三张放到 `docs/` 目录下就行。

---

## 跑起来

```bash
git clone https://github.com/user/liuyao.git
cd liuyao
npm install
npm run dev
```

打开 `http://localhost:3000`。

部署到 Vercel 的话直接导入仓库，零配置：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/user/liuyao)

---

## 技术栈

Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4，状态管理用 Zustand，动画用 Canvas 2D 和 framer-motion。农历干支节气靠 lunar-javascript，太阳位置靠 suncalc。

纯前端，没有后端，没有数据库。你的生辰八字只存在浏览器的内存里，页面关了就没了。

---

## 项目结构

```
app/
├── page.tsx              # 落地页
├── input/page.tsx        # 生辰、性别、类别输入
├── location/page.tsx     # 定位 + 真太阳时
├── cast/page.tsx         # 起卦（摇铜钱 / 转太极）
└── result/page.tsx       # 结果展示 + 分享卡片

lib/
├── hexagram/             # 六爻知识库（八卦、八宫、64卦数据、纳甲、六亲、六神、飞伏）
├── engine/               # 计算引擎（八字、真太阳时、五行、熵值、解读）
└── templates/            # 话术模板

stores/divination.ts      # 全局状态
components/               # UI 组件
types/                    # 类型定义
```

核心逻辑全在 `lib/` 里，`app/` 只负责渲染和交互。想改解读话术去看 `lib/engine/interpretation.ts`，想改六爻计算去看 `lib/hexagram/`。

---

## 一些你可能想问的

**为什么不直接用大模型生成解读？**

因为大模型每次生成的都不一样。用户第二次算同一卦，得到完全不同的文本，信任感直接归零。确定性引擎的好处是：你今天算的和明天算的，结果一样。

**为什么要定位？**

八字排盘用的是真太阳时，不是北京时间。经度差 1 度，时间差 4 分钟。东经 120° 和你实际所在地的差值，可能会让时辰偏移一格。差一个时辰，八字就全变了。

**结果页那些专业数据在哪？**

折叠在页面底部了。普通用户看故事和建议就够了，想看纳甲六亲六神表的可以展开。

**移动端体验怎么样？**

专门为手机设计的。摇铜钱用 DeviceMotion API，不支持的浏览器会自动降级成按钮点击。桌面端可以玩太极图旋转。

---

## 想帮忙

欢迎。几个方向：

- 你懂六爻 → 帮忙改进解读模板，现在覆盖的场景还不够多
- 你写前端 → UI、动画、响应式、性能优化
- 你找 Bug → 计算逻辑的边界情况、浏览器兼容性
- 你有想法 → 新功能、新交互、新玩法

```bash
git checkout -b your-branch
# 改完提 PR
```

---

## 依赖

[lunar-javascript](https://github.com/6tail/lunar-javascript) · [suncalc](https://github.com/mourner/suncalc) · [zustand](https://github.com/pmndrs/zustand) · [framer-motion](https://github.com/motiondivision/motion)

理论基础：[卜筮正宗](https://zh.wikipedia.org/wiki/卜筮正宗)（[王洪绪](https://zh.wikipedia.org/wiki/王洪绪)），纳甲法源自[京房](https://zh.wikipedia.org/wiki/京房)（西汉）。

---

## License

MIT

---

*卦象所示，仅供参考。命由己造，福自我求。*
