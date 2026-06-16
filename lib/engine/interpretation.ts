import { HexagramData, YaoValue, LiuQinType, LiuShenType } from '@/types/hexagram';
import { CategoryType, Bazi } from '@/types/divination';
import { calculateNajia } from '@/lib/hexagram/najia';
import { calculateAllLiuqin } from '@/lib/hexagram/liuqin';
import { calculateLiushen, LIUSHEN_MEANINGS } from '@/lib/hexagram/liushen';
import { palaces } from '@/lib/hexagram/palaces';
import { findFeifu } from '@/lib/hexagram/feifu';
import { calculateKongwang, isKongwang, getKongwangText } from '@/lib/hexagram/kongwang';
import { calculateHugua } from '@/lib/hexagram/huyao';
import { analyzeDongYao, checkFanyinFuyin } from '@/lib/hexagram/dongyao';
import { tianganToWuxing, getWuxingStrength } from '@/lib/engine/wuxing';

/**
 * 解读文案生成引擎
 * 输出结构化的命运故事，而非技术分析报告
 */

interface InterpretationContext {
  hexagram: HexagramData;
  bianGua: HexagramData | null;
  lines: YaoValue[];
  changingLines: number[];
  category: CategoryType;
  gender: 'male' | 'female';
  bazi: Bazi;
  dayTiangan: string;
  question?: string;
}

export interface StructuredInterpretation {
  archetype: string;
  verdict: string;
  personality: string[];
  narrative: string[];
  advice: string[];
  closing: string;
  technicalSummary: string;
}

// ===== 五行人格描述 =====

const WUXING_PERSONALITY: Record<string, string[]> = {
  '金': [
    '你内心有一把尺，对是非对错有清晰的判断',
    '你做事讲求效率，不喜欢拖泥带水',
    '你外表冷静，内心其实重情重义',
  ],
  '木': [
    '你天生有一种向上的力量，遇到困难不会轻易认输',
    '你对新事物充满好奇，喜欢探索未知的领域',
    '你内心柔软，但关键时刻比谁都坚韧',
  ],
  '水': [
    '你的直觉很强，常常能感知到别人注意不到的细节',
    '你适应力极强，无论什么环境都能找到自己的节奏',
    '你看似随和，内心其实有自己的坚持',
  ],
  '火': [
    '你天生有一种感染力，走到哪里都能带动气氛',
    '你做事风风火火，想到就做，行动力很强',
    '你外表热情，但夜深人静时也会有很多思考',
  ],
  '土': [
    '你是那种让人觉得踏实可靠的人，朋友有事第一个想到你',
    '你做事稳扎稳打，不喜欢冒险，但每一步都走得很扎实',
    '你看似慢热，一旦认定就会全力以赴',
  ],
};

const PALACE_ARCHETYPES: Record<string, string[]> = {
  '乾': ['天行健者', '潜龙在渊', '飞龙在天'],
  '坤': ['厚德载物', '含章可贞', '地势坤者'],
  '坎': ['临渊而行', '水滴石穿', '习坎之智'],
  '离': ['光明磊落', '日月丽天', '文明以止'],
  '震': ['雷动风行', '震来虩虩', '奋发之人'],
  '巽': ['随风而入', '申命行事', '柔顺之道'],
  '艮': ['知止而止', '兼山之德', '笃实之人'],
  '兑': ['和悦之道', '丽泽之益', '说言乎兑'],
};

// ===== 类别化建议 =====

const CATEGORY_ADVICE: Record<CategoryType, string[][]> = {
  'caiyun': [
    ['近期留意身边出现的新机会，特别是与人合作的项目', '东方位对你有利，可多关注', '本月下旬有一波小财运，注意把握'],
    ['稳中求进是当前最佳策略，不宜做大额投资', '身边可能有贵人暗中相助', '保持目前的节奏，财源自会水到渠成'],
    ['最近可能有一笔意外收入，但也要注意守财', '与属木之人合作对你有利', '秋冬之交是财运上升期，可提前布局'],
  ],
  'zhengyuan': [
    ['你内心渴望一段真诚的感情，而缘分正在靠近', '近期社交场合中可能遇到让你心动的人', '保持真实的样子，对的人会被你吸引'],
    ['感情中你一直在等待一个确定的信号，这个信号即将出现', '不要害怕主动，你的真诚会打动对方', '今年的桃花运比你想象的要旺'],
    ['你过去的感情经历让你变得更加成熟，这正是吸引良缘的特质', '留意身边那个一直在默默关注你的人', '缘分到了，挡都挡不住'],
  ],
  'shiye': [
    ['你的能力已经到位，现在只差一个合适的时机', '近期可能面临一个重要的选择，深思熟虑后果断出手', '贵人运旺，多与有经验的前辈交流'],
    ['目前的困境只是暂时的，坚持下去会有转机', '你的直觉告诉你该怎么做，相信它', '年底前会有一个让你满意的机会出现'],
    ['你正处于上升期，保持目前的努力方向', '团队合作比单打独斗更适合你当前的阶段', '适当展示自己的能力，让更多人看到你的价值'],
  ],
  'jiankang': [
    ['身体方面需要注意劳逸结合，不要透支自己', '保持规律作息比任何补品都有效', '近期精力充沛，适合开展新的锻炼计划'],
    ['注意饮食调理，保持心态平和有助于健康', '如果有不适，建议及时就医，预防胜于治疗', '你的身体底子不错，只需要更细心的照顾'],
    ['心理健康和身体健康同样重要，给自己一些放松的时间', '亲近自然对你有特别的好处', '保持乐观的心态，这本身就是最好的养生'],
  ],
  'zonghe': [
    ['整体运势正在上升，你感觉到了吗', '保持当前的节奏，不要急于求成', '身边的人和事都在向好的方向发展'],
    ['你正处于一个转折期，旧的在退去，新的在到来', '相信自己的直觉，它比你想象的更准确', '近期会有一个让你感到惊喜的消息'],
    ['你的努力正在积累，量变即将引发质变', '保持内心的平静，外界的变化不会影响到你', '好事正在路上，耐心等待'],
  ],
};

const CATEGORY_NAMES: Record<CategoryType, string> = {
  'caiyun': '财运', 'zhengyuan': '感情', 'shiye': '事业', 'jiankang': '健康', 'zonghe': '运势',
};

// ===== 核心函数 =====

function determineYongShen(category: CategoryType, gender: 'male' | 'female' = 'male'): LiuQinType {
  switch (category) {
    case 'caiyun': return '妻财';
    case 'zhengyuan': return gender === 'female' ? '官鬼' : '妻财';
    case 'shiye': return '官鬼';
    case 'jiankang': return '子孙';
    case 'zonghe': return '父母';
  }
}

function generateArchetype(hexagram: HexagramData, dayTiangan: string): string {
  const palace = palaces[hexagram.palaceId];
  const palaceName = palace.name.charAt(0); // 乾、坤、坎...
  const archetypes = PALACE_ARCHETYPES[palaceName] || PALACE_ARCHETYPES['乾'];
  // 用卦ID选择一个，让同一卦的人看到相同的称号
  return archetypes[hexagram.id % archetypes.length];
}

function generateVerdict(hexagram: HexagramData, category: CategoryType, changingLines: number[]): string {
  const catName = CATEGORY_NAMES[category];
  const hasChange = changingLines.length > 0;
  const palace = palaces[hexagram.palaceId];

  if (hasChange) {
    return `${hexagram.name}动变，${catName}运势正在酝酿转变`;
  }
  return `${hexagram.name}静守，${catName}之事需以稳为主`;
}

function generatePersonality(dayTiangan: string, hexagram: HexagramData): string[] {
  const userWuxing = tianganToWuxing(dayTiangan);
  const palace = palaces[hexagram.palaceId];
  const palaceWuxing = palace.wuxing;

  const traits = [...(WUXING_PERSONALITY[userWuxing] || WUXING_PERSONALITY['土'])];

  // 如果宫五行和日元五行不同，添加一条对比特质
  if (palaceWuxing !== userWuxing) {
    const palaceTraits = WUXING_PERSONALITY[palaceWuxing] || [];
    if (palaceTraits.length > 0) {
      traits.push(`但在某些情境下，你也会展现出${palaceWuxing}的一面——${palaceTraits[0]}`);
    }
  }

  return traits;
}

function generateNarrative(ctx: InterpretationContext): string[] {
  const { hexagram, bianGua, changingLines, category, question } = ctx;
  const palace = palaces[hexagram.palaceId];
  const najia = calculateNajia(hexagram);
  const liuqin = calculateAllLiuqin(palace.wuxing, najia);
  const yongshen = determineYongShen(category, ctx.gender);
  const yongshenIndex = liuqin.indexOf(yongshen);
  const catName = CATEGORY_NAMES[category];

  const paragraphs: string[] = [];

  // 第一段：卦象意象（如果有具体问题，先呼应一下）
  if (question) {
    paragraphs.push(`你问的是"${question}"。此卦为${hexagram.name}，${hexagram.xiang}`);
  } else {
    paragraphs.push(`此卦为${hexagram.name}，${hexagram.xiang}`);
  }

  // 第二段：用神分析（用通俗语言）
  if (yongshenIndex >= 0) {
    const yn = najia[yongshenIndex];
    const isChanging = changingLines.includes(yongshenIndex);

    if (isChanging) {
      paragraphs.push(`你所问的${catName}之事，关键点正处于变动之中。这意味着近期会有明显的转折，需要你保持警觉，把握时机。`);
    } else {
      paragraphs.push(`你所问的${catName}之事，关键因素目前处于稳定状态。不需要过于焦虑，顺其自然反而会有好的结果。`);
    }
  } else {
    // 用神不现，查飞伏
    const feifu = findFeifu(hexagram, yongshen);
    if (feifu) {
      paragraphs.push(`你所问的${catName}之事，关键因素目前隐藏在表面之下（伏于第${feifu.fuYaoIndex + 1}爻）。${feifu.relation}，说明此事需要等待时机，不宜操之过急。`);
    } else {
      paragraphs.push(`你所问的${catName}之事，关键因素尚未显现，需要耐心等待时机成熟。`);
    }
  }

  // 第三段：变卦暗示
  if (bianGua) {
    paragraphs.push(`卦象暗示此事的走向是${bianGua.name}——${bianGua.guaCi}`);
  }

  return paragraphs;
}

function generateAdvice(ctx: InterpretationContext): string[] {
  const { hexagram, category } = ctx;
  const advicePool = CATEGORY_ADVICE[category];
  const adviceIndex = hexagram.id % advicePool.length;
  return advicePool[adviceIndex];
}

function generateClosing(changingLines: number[], hexagramId: number): string {
  const closings = [
    '卦象所示，命运的线索已经展开。记住，最好的预言是自己创造的未来。',
    '天行健，君子以自强不息。卦象只是参考，真正的力量一直在你手中。',
    '命由己造，相由心生。保持正念，好事自然来。',
    '卦象已经为你指明了方向，接下来的路，靠你自己走出来。',
    '一切皆有定数，但定数之中又有变数。你的每一个选择都在改写命运。',
  ];
  const index = (hexagramId + changingLines.length) % closings.length;
  return closings[index];
}

/**
 * 生成结构化解读（新）
 */
export function generateStructuredInterpretation(ctx: InterpretationContext): StructuredInterpretation {
  const archetype = generateArchetype(ctx.hexagram, ctx.dayTiangan);
  const verdict = generateVerdict(ctx.hexagram, ctx.category, ctx.changingLines);
  const personality = generatePersonality(ctx.dayTiangan, ctx.hexagram);
  const narrative = generateNarrative(ctx);
  const advice = generateAdvice(ctx);
  const closing = generateClosing(ctx.changingLines, ctx.hexagram.id);

  // 保留技术摘要（折叠展示）
  const technicalSummary = generateLegacyInterpretation(ctx);

  return {
    archetype,
    verdict,
    personality,
    narrative,
    advice,
    closing,
    technicalSummary,
  };
}

/**
 * 获取卦象名称和简述
 */
export function getHexagramSummary(hexagram: HexagramData): string {
  return `${hexagram.name}（${hexagram.symbol}）`;
}

// ===== 旧版解读（保留兼容） =====

function generateGuaOverview(hexagram: HexagramData): string {
  const palaceName = palaces[hexagram.palaceId]?.name || '';
  let text = `【卦象总述】\n`;
  text += `此卦为${hexagram.name}，属${palaceName}。`;
  text += `${hexagram.guaCi}\n\n`;
  text += `${hexagram.xiang}\n`;
  return text;
}

function analyzeShiYao(ctx: InterpretationContext): string {
  const najia = calculateNajia(ctx.hexagram);
  const liuqin = calculateAllLiuqin(palaces[ctx.hexagram.palaceId].wuxing, najia);
  const liushen = calculateLiushen(ctx.dayTiangan);
  const shiIndex = ctx.hexagram.shiYao - 1;
  const shiLiuqin = liuqin[shiIndex];
  const shiLiushen = liushen[shiIndex];
  const shiNajia = najia[shiIndex];
  const shiChanging = ctx.changingLines.includes(shiIndex);

  let text = `【自身分析】\n`;
  text += `世爻在第${ctx.hexagram.shiYao}爻，持${shiLiuqin}，临${shiLiushen}。`;
  text += `纳甲为${shiNajia.tiangan}${shiNajia.dizhi}（${shiNajia.wuxing}）。`;
  if (shiChanging) text += `世爻发动，主自身近期有较大变化。`;
  text += `\n${shiLiushen}：${LIUSHEN_MEANINGS[shiLiushen]}。`;
  return text;
}

function analyzeYongShen(ctx: InterpretationContext): string {
  const yongshen = determineYongShen(ctx.category, ctx.gender);
  const najia = calculateNajia(ctx.hexagram);
  const liuqin = calculateAllLiuqin(palaces[ctx.hexagram.palaceId].wuxing, najia);
  const yongshenIndex = liuqin.indexOf(yongshen);

  const categoryNames: Record<CategoryType, string> = {
    'caiyun': '财运', 'zhengyuan': '感情', 'shiye': '事业', 'jiankang': '健康', 'zonghe': '综合',
  };

  let text = `【用神分析】\n`;
  text += `针对${categoryNames[ctx.category]}，取${yongshen}为用神。`;

  if (yongshenIndex >= 0) {
    const yn = najia[yongshenIndex];
    const isChanging = ctx.changingLines.includes(yongshenIndex);
    text += `用神在第${yongshenIndex + 1}爻，纳甲${yn.tiangan}${yn.dizhi}（${yn.wuxing}）。`;
    if (isChanging) text += `用神发动，主所问之事近期会有明显变化。`;
  } else {
    // 用神不现，查飞伏
    const feifu = findFeifu(ctx.hexagram, yongshen);
    if (feifu) {
      text += `卦中未见用神，伏于第${feifu.fuYaoIndex + 1}爻。`;
      text += `飞神为${feifu.feiLiuqin}（${feifu.feiNajia.tiangan}${feifu.feiNajia.dizhi}），`;
      text += `伏神为${feifu.fuLiuqin}（${feifu.fuNajia.tiangan}${feifu.fuNajia.dizhi}）。`;
      text += feifu.relation + '。';
    } else {
      text += `卦中未见用神，飞伏亦无。`;
    }
  }
  return text;
}

function analyzeChangingLines(ctx: InterpretationContext): string {
  if (ctx.changingLines.length === 0) return '';
  const najia = calculateNajia(ctx.hexagram);
  const liuqin = calculateAllLiuqin(palaces[ctx.hexagram.palaceId].wuxing, najia);

  let text = `【动爻分析】\n`;
  text += `本卦有${ctx.changingLines.length}个动爻：`;
  text += ctx.changingLines.map(i => `第${i + 1}爻`).join('、');
  text += `。\n`;

  for (const idx of ctx.changingLines) {
    const lq = liuqin[idx];
    const yaoDesc = ctx.hexagram.yaoCi[idx];
    text += `第${idx + 1}爻（${lq}）：${yaoDesc}\n`;
  }

  // 动爻化进化退分析
  const dongYaoResults = analyzeDongYao(ctx.hexagram, ctx.bianGua, ctx.changingLines);
  for (const dy of dongYaoResults) {
    if (dy.description) {
      text += `第${dy.yaoIndex + 1}爻${dy.benNajia}→${dy.bianNajia}：${dy.description}\n`;
    }
  }

  if (ctx.bianGua) {
    text += `\n变卦为${ctx.bianGua.name}，${ctx.bianGua.guaCi}`;

    // 反吟伏吟
    const fanyin = checkFanyinFuyin(ctx.hexagram, ctx.bianGua);
    if (fanyin.type) {
      text += `\n${fanyin.description}`;
    }
  }
  return text;
}

function analyzeKongwang(ctx: InterpretationContext): string {
  const kongwang = calculateKongwang(ctx.bazi.day.tiangan, ctx.bazi.day.dizhi);
  const najia = calculateNajia(ctx.hexagram);
  const palace = palaces[ctx.hexagram.palaceId];
  const liuqin = calculateAllLiuqin(palace.wuxing, najia);

  let text = `【空亡】\n`;
  text += `日柱${ctx.bazi.day.tiangan}${ctx.bazi.day.dizhi}，${getKongwangText(kongwang)}。\n`;

  // 检查世爻、用神是否空亡
  const shiIndex = ctx.hexagram.shiYao - 1;
  const shiDizhi = najia[shiIndex].dizhi;
  if (isKongwang(shiDizhi, kongwang)) {
    text += `世爻（第${ctx.hexagram.shiYao}爻）空亡，主自身无力，所谋难遂。\n`;
  }

  const yongshen = determineYongShen(ctx.category, ctx.gender);
  const yongshenIndex = liuqin.indexOf(yongshen);
  if (yongshenIndex >= 0) {
    const ysDizhi = najia[yongshenIndex].dizhi;
    if (isKongwang(ysDizhi, kongwang)) {
      text += `用神空亡，主所问之事暂时难以落实，需待出空。\n`;
    }
  }

  return text;
}

function analyzeHugua(ctx: InterpretationContext): string {
  const hugua = calculateHugua(ctx.hexagram);
  if (!hugua) return '';

  let text = `【互卦】\n`;
  text += `互卦为${hugua.name}（${hugua.symbol}），${hugua.guaCi}`;
  return text;
}

function generateConclusion(ctx: InterpretationContext): string {
  const categoryAdvice: Record<CategoryType, string[]> = {
    'caiyun': ['近期财运有转机之象，宜把握身边出现的机会。', '目前的财务状况虽有波动，但整体趋势向好。', '建议稳中求进，不宜冒进，循序渐进方为上策。'],
    'zhengyuan': ['感情之事急不得，缘分到了自然水到渠成。', '近期桃花运势渐旺，多参与社交活动有助姻缘。', '感情中需要更多的耐心和理解，真诚是最好的策略。'],
    'shiye': ['事业上正处于上升期，保持目前的努力方向。', '近期可能面临一些选择，深思熟虑后再做决定。', '贵人运旺，多与前辈或有经验的人交流。'],
    'jiankang': ['身体方面需要注意劳逸结合，保持规律作息。', '近期精力充沛，适合开展新的锻炼计划。', '注意饮食调理，保持心态平和有助于健康。'],
    'zonghe': ['整体运势平稳，适合规划长远目标。', '近期运势有上升趋势，可适当把握机遇。', '保持平和心态，顺其自然，好事自来。'],
  };

  let text = `【综合建议】\n`;
  if (ctx.changingLines.length === 0) text += `此卦为静卦，主事情相对稳定，变化不大。\n`;
  else if (ctx.changingLines.length >= 3) text += `此卦动爻较多，主近期变化频繁，需灵活应对。\n`;

  const advices = categoryAdvice[ctx.category];
  const adviceIndex = (ctx.hexagram.id + ctx.changingLines.length) % advices.length;
  text += advices[adviceIndex];
  text += `\n\n卦象所示，仅供参考。命由己造，福自我求。保持积极心态，顺势而为，方为智者之举。`;
  return text;
}

/** 旧版解读（兼容） */
export function generateInterpretation(ctx: InterpretationContext): string {
  const sections: string[] = [];
  sections.push(generateGuaOverview(ctx.hexagram));
  sections.push(analyzeShiYao(ctx));
  sections.push(analyzeYongShen(ctx));
  sections.push(analyzeKongwang(ctx));
  sections.push(analyzeHugua(ctx));
  if (ctx.changingLines.length > 0) sections.push(analyzeChangingLines(ctx));
  sections.push(generateConclusion(ctx));
  return sections.join('\n\n');
}

/** 生成旧版兼容解读（用于 technicalSummary） */
function generateLegacyInterpretation(ctx: InterpretationContext): string {
  return generateInterpretation(ctx);
}
