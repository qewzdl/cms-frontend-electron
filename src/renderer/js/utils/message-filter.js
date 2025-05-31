import { Config } from '../config.js';

export class MessageFilter {
  static getMatchedPatterns(text) {
    return Config.stopWords
      .map(pattern => {
        pattern.lastIndex = 0;
        return pattern.test(text) ? pattern : null;
      })
      .filter(Boolean);
  }

  static normalize(text) {
    return text
        .normalize('NFKC')
        .replace(/[\s\u200B\u200C\u00A0]+/g, '')
        .toLowerCase();
  }

  static hasStopWords(text) {
    const clean = this.normalize(text);
    return this.getMatchedPatterns(clean).length > 0;
  }
}