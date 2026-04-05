import { BadRequestException } from "@nestjs/common";
import { ErrorCodeEnum } from "../enums/error-codes.enum";
import { ALLOWED_DOMAINS, BLOCKED_IP_PATTERNS } from "../constants/url.constant";

export abstract class UtilUrlValidator {

  private static MAX_URL_LENGTH = 2_048;
  static validateUrl(input: string): string {
    const trimmed = input.trim();

    if (trimmed.length > this.MAX_URL_LENGTH) {
      throw new BadRequestException(ErrorCodeEnum.SCRAPER_URL_TOO_LONG);
    }

    let parsed: URL;
    try {
      parsed = new URL(trimmed);
    } catch {
      throw new BadRequestException(ErrorCodeEnum.SCRAPER_URL_INVALID);
    }

    if (parsed.protocol !== 'https:') {
      throw new BadRequestException(ErrorCodeEnum.SCRAPER_URL_INVALID);
    }

    if (parsed.username || parsed.password) {
      throw new BadRequestException(ErrorCodeEnum.SCRAPER_URL_INVALID);
    }

    const hostname = parsed.hostname;

    if (BLOCKED_IP_PATTERNS.some((p) => p.test(hostname))) {
      throw new BadRequestException(ErrorCodeEnum.SCRAPER_URL_INVALID);
    }

    const parts = hostname.split('.');
    const rootDomain = parts.length >= 2 ? parts.slice(-2).join('.') : hostname;

    if (!ALLOWED_DOMAINS.has(hostname) && !ALLOWED_DOMAINS.has(rootDomain)) {
      throw new BadRequestException(ErrorCodeEnum.SCRAPER_URL_DOMAIN_NOT_SUPPORTED);
    }

    return parsed.toString();
  }


}