import {
  BookOpenCheck,
  Briefcase,
  GraduationCap,
  Landmark,
  Rocket,
  type LucideIcon,
} from 'lucide-react';
import type { CategoryId } from '../domain/types';

/**
 * Functional identity per opportunity category (UX_UI_DESIGN_SYSTEM.md §2.2).
 * The visible label always accompanies the icon/color — color is never the only cue.
 */
export const CATEGORY_META: Record<CategoryId, { icon: LucideIcon; className: string }> = {
  education: { icon: GraduationCap, className: 'cat-education' },
  employment: { icon: Briefcase, className: 'cat-employment' },
  training: { icon: BookOpenCheck, className: 'cat-training' },
  entrepreneurship: { icon: Rocket, className: 'cat-entrepreneurship' },
  civic: { icon: Landmark, className: 'cat-civic' },
};

/** Own monogram (no third-party logos fetched): up to two initials from the provider name. */
export function monogramFor(name: string): string {
  const words = name
    .replace(/[()·–—-]/g, ' ')
    .split(/\s+/)
    .filter((w) => /^[\p{L}\p{N}]/u.test(w));
  if (words.length === 0) return '·';
  const first = Array.from(words[0]!)[0] ?? '';
  const second = words.length > 1 ? (Array.from(words[1]!)[0] ?? '') : '';
  return (first + second).toUpperCase();
}
