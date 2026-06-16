import { CategoryType, GenderType } from '@/types/divination';

/**
 * 共享常量
 */

export const CATEGORY_LABELS: Record<CategoryType, string> = {
  caiyun: '财运',
  zhengyuan: '正缘',
  shiye: '事业',
  jiankang: '健康',
  zonghe: '综合',
};

export const GENDER_LABELS: Record<GenderType, string> = {
  male: '男',
  female: '女',
};
