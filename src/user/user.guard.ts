import { CanActivate, ExecutionContext, HttpException, Injectable } from "@nestjs/common";
import { Request } from "express";
import { iif } from "rxjs";
import { UserService } from "./user.service";

function getCookies(request: Request, key: string) {
  const cookies = {};
  request.headers?.cookie?.split(';')?.forEach(cookie => {
    const parts = cookie.match(/(.*?)=(.*)$/)
    cookies[ parts[1].trim() ] = (parts[2] || '').trim();
  });
  return cookies[key];
}

@Injectable()
export class LoginRequired implements CanActivate {
  constructor (
    private readonly userService: UserService
  ) {}

  async canActivate (
    context: ExecutionContext
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const sessionId = getCookies(request, 'iscp-session-id');
    if (sessionId) {
      const user = await this.userService.getUser(sessionId);
      if (user) {
        request.user = user;
        return true;
      }
    }
    throw new HttpException({
      msg: '未登录'
    }, 403);
  }
}

@Injectable()
export class NotLogin implements CanActivate {
  constructor (
    private readonly userService: UserService
  ) {}

  async canActivate (
    context: ExecutionContext
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const sessionId = getCookies(request, 'iscp-session-id');
    if (sessionId) {
      throw new HttpException({
        msg: '当前浏览器已登录用户，请登出或删除缓存后重试'
      }, 406);
    }
    return true;
  }
}

@Injectable()
export class AdminRequired implements CanActivate {
  constructor (
    private readonly userService: UserService
  ) {}

  async canActivate (
    context: ExecutionContext
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const sessionId = getCookies(request, 'iscp-session-id');
    if (sessionId) {
      const admin = await this.userService.getUser(sessionId);
      if (admin.usertype === 'admin') {
        request.admin = admin;
        request.user = admin;
        return true;
      }
    }

    throw new HttpException({
      msg: 'Permission Denied'
    }, 403);
  }
}