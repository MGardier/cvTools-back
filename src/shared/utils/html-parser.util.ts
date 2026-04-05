import * as cheerio from 'cheerio';
import { HARD_BLOCK_PATTERNS, SOFT_BLOCK_PATTERNS } from '../constants/url.constant';
export abstract class UtilHtmlParser {

  private static MAX_TEXT_LENGTH = 15_000;

  static extractJsonLd(html: string): Record<string, unknown> | null {
    const $ = cheerio.load(html);
    const scripts = $('script[type="application/ld+json"]');

    for (let i = 0; i < scripts.length; i++) {
      try {
        const content = $(scripts[i]).html();
        if (!content) continue;

        const parsed = JSON.parse(content);
        const jobPosting = this.findJobPosting(parsed);
        if (jobPosting) return jobPosting;
      } catch {
        continue;
      }
    }

    return null;
  }


  static extractVisibleText(html: string): string | null {
    const $ = cheerio.load(html);

    $(
      'script, style, nav, footer, header, iframe, noscript, svg, form, img, video, audio',
    ).remove();
    $('[role="navigation"], [role="banner"], [role="contentinfo"]').remove();
    $(
      '[class*="cookie"], [class*="popup"], [class*="modal"], [class*="sidebar"], [class*="footer"], [class*="header"], [class*="nav"]',
    ).remove();

    const text = $('body').text().replace(/\s+/g, ' ').trim();

    if (text.length < 200) return null;
    return text.slice(0, this.MAX_TEXT_LENGTH);
  }




  static isUsableContent(text: string): boolean {
    const trimmed = text.trim();
    if (trimmed.length < 100) return false;

    for (const pattern of HARD_BLOCK_PATTERNS) {
      if (pattern.test(trimmed))
        return false;

    }

    let signals = 0;
    for (const pattern of SOFT_BLOCK_PATTERNS) {
      if (pattern.test(trimmed)) signals++;
    }

    if (signals === 0) return true;

    const length = trimmed.length;
    const rejected =
      (length < 500 && signals >= 1) ||
      (length < 2000 && signals >= 2) ||
      signals >= 3;


    return !rejected;
  }

  // ═══════════════════════════════════════════════
  //                  PRIVATE
  // ═══════════════════════════════════════════════

  private static findJobPosting(parsed: unknown): Record<string, unknown> | null {
    if (this.isJobPosting(parsed)) return parsed as Record<string, unknown>;

    if (Array.isArray(parsed)) {
      for (const item of parsed) {
        if (this.isJobPosting(item)) return item as Record<string, unknown>;
      }
    }

    const record = parsed as Record<string, unknown>;
    if (record?.['@graph'] && Array.isArray(record['@graph'])) {
      for (const item of record['@graph']) {
        if (this.isJobPosting(item)) return item as Record<string, unknown>;
      }
    }

    return null;
  }

  private static isJobPosting(obj: unknown): boolean {
    if (!obj || typeof obj !== 'object') return false;

    const type = (obj as Record<string, unknown>)['@type'];
    if (typeof type === 'string') return type === 'JobPosting';
    if (Array.isArray(type)) return type.includes('JobPosting');

    return false;
  }

}
