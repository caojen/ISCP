//! 通过logger打出请求

import { Request, Response } from "express";
import { Logger } from "@nestjs/common";
import { getIp } from './global.functions';

const logger = new Logger("Request");

export function requestListening(req: Request, res: Response, next: any) {
  logger.log(objectToLog({
    method: req.method,
    url: req.url,
    ip: getIp(req)
  }));
  next();
}

function objectToLog(object: any) {
  return `${object.ip} ${object.method} ${object.url}`;
}
