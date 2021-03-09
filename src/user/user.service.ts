import { HttpException, Injectable } from '@nestjs/common';
import { EncryptService } from 'src/encrypt/encrypt.service';
import { MysqlService } from 'src/mysql/mysql.service';
import { RedisService } from 'src/redis/redis.service';
import { RegisterBody, School, User } from './user.entity';

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
    } while (await this.sessionExists(sessionId));

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
        user.name as name,
        school.sid as sid,
        school.name as school_name
      from user
        left join school on user.sid = school.sid
      where uid=?
      limit 1;
    `;

    const user = await this.mysqlService.query(sql, [uid]);
    if (user.length === 0) {
      return null;
    }
    const res = new User();
    res.uid = user[0].uid;
    res.username = user[0].username;
    res.name = user[0].name;
    res.school = new School();
    res.school.sid = user[0].sid;
    res.school.name = user[0].school_name;
    res.sessionId = sessionId;
    return res;
  }

  async userLogin (username: string, password: string) {
    const sql = `
      select user.uid as uid,
        user.username as username,
        user.password as password,
        user.usertype as usertype,
        user.name as name,
        school.sid as sid,
        school.name as school_name
      from user
        left join school on user.sid = school.sid
      where username=?
      limit 1;
    `;

    const user = await this.mysqlService.query(sql, [username]);

    if (user.length === 0 || !EncryptService.verify(user[0].password, password)) {
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

  async userRegister (user: RegisterBody) {
    const {
      username, password, name,
      school 
    } = user;

    // 判断username是否存在
    if (await this.usernameExists(username)) {
      throw new HttpException({
        msg: '用户名已存在'
      }, 406);
    }

    // 为密码进行散列
    const [padding, truePass] = EncryptService.encode(password);
    
    // 判断学校是否存在
    let sid = await this.getSidBySchoolName(school);
    // 如果学校不存在则创建
    if (sid === null) {
      sid = await this.createSchool(school);
    }

    // 创建用户
    const sql = `
      insert into user(username, password, name, sid)
      values(?, ?, ?, ?);
    `;

    await this.mysqlService.query(sql, [username, truePass, name, sid]);

    return {
      msg: '创建用户成功'
    }
  }

  async usernameExists (username: string) {
    const sql = `
      select 1 from user
      where username=?;
    `;

    const res = await this.mysqlService.query(sql, [username]);

    return res.length !== 0;
  }

  async getSidBySchoolName (name: string): Promise<number | null> {
    const sql = `
      select sid
      from school
      where name=?;
    `;

    const res = await this.mysqlService.query(sql, [name]);
    if (res.length === 0) {
      return null;
    } else {
      return res[0].sid;
    }
  }

  /**
   * 创建学校，不管学校是否已经存在，都返回学校的sid
   * @param name 
   */
  async createSchool(name: string): Promise<number> {
    const insertSql = `
      insert into school(name)
      values(?);
    `;

    try {
      const insertRes = await this.mysqlService.query(insertSql, [name]);
      const sid = insertRes.insertId;
      return sid;
    } catch {
      // 创建学校失败，尝试获得现有学校的id:
      const selectSql = `
        select sid from school
        where name=?;
      `;

      const res = await this.mysqlService.query(selectSql, [name]);
      if(res.length === 0) {
        throw new HttpException({
          msg: '创建学校时失败，请重试'
        }, 406);
      } else {
        return res[0].sid;
      }
    }
  }

  async userLogout (sessionId: string) {
    await this.redisService.del(sessionId)
    return {
      msg: '登出成功'
    }
  }
}
