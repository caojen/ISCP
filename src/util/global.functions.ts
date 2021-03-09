import { Request } from 'express';

export function getIp (req: Request): string {
  try {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0];
    return ip || req.socket.remoteAddress || req.ip
  } catch {
    return 'unknown';
  }
}

export function removeKeys (obj: Object, keys: string[]) {
  for (const key of keys) {
    if (key in obj) {
      delete obj[key];
    }
  }
}