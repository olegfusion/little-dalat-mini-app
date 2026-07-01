import vn from './vn.json';
import en from './en.json';
import ru from './ru.json';
import { Language } from '../types';

const locales = { vn, en, ru } as const;

export function t(key: string, lang: Language, params?: Record<string, string | number>): string {
  const locale = locales[lang] as Record<string, string>;
  let text = locale[key] || key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`%${k}%`, String(v));
    }
  }
  return text;
}

export { locales };
