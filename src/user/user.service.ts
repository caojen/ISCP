import { HttpException, Injectable } from '@nestjs/common';
import { EncryptService } from 'src/encrypt/encrypt.service';
import { MysqlService } from 'src/mysql/mysql.service';
import { RedisService } from 'src/redis/redis.service';
import { School, User } from './user.entity';

@Injectable()
export class UserService {
  constructor (
    private readonly mysqlService: MysqlService,
    private readonly redisService: RedisService
  ) {}

  async genSession (uid: number, sessionLen: number = 32): Promise<string> {
    let sessionId = "";
    do {
      sessionId = "";
      const charset = "abcdefhijklmnopqrstuvwxyz";
      const charlen = charset.length;
      for(let _ = 0; _ < sessionLen; _++) {
        sessionId += charset[Math.floor(Math.random() * charlen)]
      }
    } while(this.sessionExists(sessionId));

    this.redisService.set(sessionId, `${uid}`)
    return sessionId;
  }

  async sessionExists (sessionId: string) {
    const res = await this.redisService.get(sessionId);
    return res;
  }

  async getUser (sessionId: string): Promise<User> {
    const uid = parseInt(await this.redisService.get(sessionId));
    const sql = `
      select user.uid as uid,
        user.username as username,
        user.usertype as usertype,
        school.sid as sid,
        school.name as name
      from user
        left join school on user.sid = school.sid
      where uid=?
      limit 1;
    `;

    const user = await this.mysqlService.query(sql, [uid]);
    if (!user) {
      return null;
    }
    const res = new User();
    res.uid = user[0].uid;
    res.username = user[0].username;
    res.name = user[0].name;
    res.school = new School();
    res.school.sid = user[0].sid;
    res.school.name = user[0].school_name;
    res.sessionId = await this.genSession(res.uid);
    return res;
  }

  async userLogin (username: string, password: string) {
    const sql = `
      select user.uid as uid,
        user.username as username,
        user.password as password,
        user.usertype as usertype,
        school.sid as sid,
        school.name as school_name
      from user
        left join school on user.sid = school.sid
      where username=?
      limit 1;
    `;

    const user = await this.mysqlService.query(sql, [username]);

    if (!user || EncryptService.verify(user[0].password, password)) {
      throw new HttpException({
        msg: '用户名不存在或密码错误'
      }, 403);
    } else {
      const res = new User();
      res.uid = user[0].uid;
      res.username = user[0].username;
      res.name = user[0].name;
      res.school = new School();
      res.school.sid = user[0].sid;
      res.school.name = user[0].school_name;
      res.sessionId = await this.genSession(res.uid);
      return res;
    }
  }
}
