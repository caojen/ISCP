import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptService {

  static genPadding (length: number = 16) {
    const charset = "abcdefghijklmn";
    const charsetLen = charset.length;
    let res = "";

    for (let _ = 0; _ < length; _++) {
      res += charset[Math.floor((Math.random() * charsetLen))];
    }

    return res
  }
  /**
   * 
   * @param plain 明文
   * @param padding （可选）需要padding到明文的内容，如果不给定，那么将会生成一个padding
   */
  static encode (plain: string, padding?: string) {
    if (!padding) {
      padding = this.genPadding();
    }
    let res = crypto.createHash('md5')
      .update(plain).digest('hex');
    res = `${padding}\$${res}`;
    return [padding, res];
  }

  /**
   * 
   * @param str 经过encode函数加密的字符串
   * @param target 需要验证的字符串
   */
  static verify (str: string, target: string) {
    const [padding, _] = str.split('$');
    return str === EncryptService.encode(target, padding)[1];
  }
}
