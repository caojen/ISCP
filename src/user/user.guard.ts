import { CanActivate, ExecutionContext, HttpException, Injectable } from "@nestjs/common";
import { Request } from "express";
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
    const user = await this.userService.getUser(sessionId);
    if (!user) {
      throw new HttpException({
        msg: '未登录'
      }, 403);
    } else {
      request.user = user;
      return true;
    }
  }
}