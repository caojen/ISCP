import { Body, Controller, Delete, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { removeKeys } from 'src/util/global.functions';
import { shouldNotNull } from 'src/util/nonull.function';
import { RegisterBody, User } from './user.entity';
import { LoginRequired, NotLogin } from './user.guard';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor (
    private readonly userService: UserService
  ) {}

  @Post('login')
  @UseGuards(NotLogin)
  async userLogin (@Body() user: User, @Res() response: Response) {
    const { username, password } = user;
    shouldNotNull([username, password]);
    
    const loginResult = await this.userService.userLogin(username, password);
    const sessionId = loginResult.sessionId;

    response.cookie("iscp-session-id", sessionId, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true
    });

    removeKeys(loginResult, ['sessionId'])
    response.json(loginResult);
  }

  @Get('status')
  @UseGuards(LoginRequired)
  async getUserStatus (@Req() request) {
    const user = request.user;
    removeKeys(user, ['sessionId']);
    return user;
  }

  @Post('register')
  async userRegister (@Body() body: RegisterBody) {
    return await this.userService.userRegister(body)
  }

  @Delete('logout')
  @UseGuards(LoginRequired)
  async userLogout (@Req() request, @Res() response: Response) {
    const sessionId = request.user.sessionId;
    const res = await this.userService.userLogout(sessionId);
    response.clearCookie('iscp-session-id');
    response.json(res);
  }
}
