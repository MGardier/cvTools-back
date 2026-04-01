export abstract class UtilDate {
  static __convertExpiresToDate(expiresIn: number): Date {
    return new Date(new Date().getTime() + expiresIn * 1000);
  }
}
