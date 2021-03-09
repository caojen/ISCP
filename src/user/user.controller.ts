import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { User } from './user.entity';
import { LoginRequired } from './user.guard';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor (
    private readonly userService: UserService
  ) {}

  @Post('login')
  async userLogin (@Body() user: User, @Res() response: Response) {
    const { username, password } = user;
    const loginResult = await this.userService.userLogin(username, password);
    const sessionId = loginResult.sessionId;

    response.cookie("iscp-session-id", sessionId, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true
    });

    response.json(loginResult);
  }

  @Get('status')
  @UseGuards(LoginRequired)
  async getUserStatus (@Req() request) {
    return request.user;
  }
}
