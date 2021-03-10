import { HttpException, Injectable } from '@nestjs/common';
import { MysqlService } from 'src/mysql/mysql.service';
import { RedisService } from 'src/redis/redis.service';
import { Contest } from './contest.entity';

@Injectable()
export class ContestService {
  constructor (
    private readonly mysqlService: MysqlService
  ) {}

  async getContestByCode (code: string) {
    const sql = `
      select cid, title, due, config
      from contest
      where code=?;
    `;

    const res = await this.mysqlService.query(sql, [code]);
    if (res.length === 0) {
      throw new HttpException({
        msg: '不存在此比赛'
      }, 406);
    }

    const contest = res[0];
    const r = new Contest();
    r.cid = contest.cid;
    r.title = contest.title;
    r.due = new Date(contest.due);
    r.config = JSON.parse(contest.config);
    r.code = contest.code;

    return r;
  }

  async getContestByCid (cid: number) {
    const contestSql = `
      select cid, title, due, config, code
      from contest
      where cid=?;
    `;

    const contestResult = await this.mysqlService.query(contestSql, [cid]);
    if (contestResult.length === 0) {
      throw new HttpException({
        msg: '不存在此比赛'
      }, 406);
    }

    const contest = contestResult[0];
    const r = new Contest();
    r.cid = contest.cid;
    r.title = contest.title;
    r.due = new Date(contest.due);
    r.config = JSON.parse(contest.config);
    r.code = contest.code;

    // 汇总统计信息:
    const countSql = `
      select count(*) as total, count(distinct uid) as teacher
      from enroll
      where cid=?;
    `;

    const countResult = await this.mysqlService.query(countSql, [cid]);
    if (countResult.length === 0) {
      throw new HttpException({
        msg: '查询统计数据时数据库出错'
      }, 500);
    }

    return {
      ...r,
      summary: {
        studentCount: countResult[0].total,
        userCount: countResult[0].teacher
      }
    }
  }

  async getContestsList () {
    const sql = `
      select cid, title, due, code, config,
        count(*) as total, count(distinct uid) as teacher
      from contest
        natural join enroll
      group by cid;
    `;

    const result = await this.mysqlService.query(sql);
    console.log(result);

    throw new HttpException({
      msg: 'unimplemented!'
    }, 500);
  }

  async createOneContest (contest: Contest) {
    const sql = `
      insert into contest(title, due, code, config)
      values(?, ?, ?, ?);
    `;

    const insertRes = await this.mysqlService.query(sql, [
      contest.title,
      new Date(contest.due),
      contest.code,
      JSON.stringify(contest.config)
    ]);

    const cid = insertRes.insertId;
    contest.cid = cid;
    return contest;
  }

  async deleteOneContest (cid: number) {
    const sql = `
      delete from contest
      where cid=?;
    `;

    await this.mysqlService.query(sql, [cid]);

    return {
      msg: '删除成功'
    };
  }

  async getOneContestSummary (cid: number) {
    const sql = `
      select enroll.detail,
        user.uid as uid, user.username as username,
        user.usertype as usertype, user.name as name,
        school.sid as sid, school.name as school_name
      from enroll
        left join user on enroll.uid = user.uid
        left join school on user.sid = school.sid
      where enroll.cid = ?;
    `;

    const result = await this.mysqlService.query(sql, [cid]);
    const uid_map_index = {};
    const response = [];
    for (const item of result) {
      if (uid_map_index[item.uid] === undefined) {
        response.push({
          user: {
            uid: item.uid,
            name: item.name,
            username: item.username,
            school: {
              sid: item.sid,
              name: item.school_name
            }
          },
          students: []
        })
        uid_map_index[item.uid] = response.length - 1;
      }

      const index = uid_map_index[item.uid];
      response[index].students.push(JSON.parse(item.detail));
    }

    return response;
  }

  async addOneStudentToOneContest (uid: number, code: string, info: any) {
    // 选出code对应的contest
    const contest = await this.getContestByCode(code);
    const config = contest.config;
    const keys = Object.keys(info);
    const r = {};
    // 判断是否config的所有元素都存在于info的键值中
    for (const key of config) {
      if (keys.indexOf(key) === -1) {
        throw new HttpException({
          msg: `某个必要的字段不满足：${key}`
        }, 406);
      } else {
        r[key] = info[key];
      }
    }
    // ok，新建这个enroll
    const sql = `
      insert into enroll(uid, cid, detail)
      values(?, ?, ?);
    `;

    await this.mysqlService.query(sql, [uid, contest.cid, JSON.stringify(r)]);

    return {
      msg: '创建成功'
    };
  }

  async addManyStudentsToOneContest (uid: number, code: string, infos: any[]) {
    // 选出code对应的contest:
    const contest = await this.getContestByCode(code);
    const config = contest.config;

    const failed = [];
    const sql = `
      insert into enroll(uid, cid, detail)
      values(?, ?, ?);
    `;
    
    for (const info of infos) {
      // 对于每个info，都需要判断是否符合所有keys:
      const keys = Object.keys(info);
      const r = {};
      let isFailed = false;
      for (const key of config) {
        if (keys.indexOf(key) === -1) {
          failed.push(info)
          isFailed = true;
          break;
        } else {
          r[key] = info[key];
        }
      }

      if (!isFailed) {
        await this.mysqlService.query(sql, [uid, contest.cid, JSON.stringify(r)]);
      }
    }

    if (failed.length === 0) {
      return {
        msg: '所有学生上传成功'
      };
    } else {
      throw new HttpException({
        msg: '部分学生上传成功',
        failed
      }, 207);
    }
  }

  async getMyStudents (uid: number, code: string) {
    const contest = await this.getContestByCode(code);
    const cid = contest.cid;
    const res = [];
    const sql = `
      select eid, detail
      from enroll
      where uid=? and cid=?;
    `;

    const r = await this.mysqlService.query(sql, [uid, cid]);
    for (const item of r) {
      res.push({
        eid: item.eid,
        ...JSON.parse(item.detail)
      });
    }
  }

  async updateOneStudentInfoInOneContest (uid: number, code: string, eid: number, body: any) {
    // 得到cid
    const contest = await this.getContestByCode(code);
    const cid = contest.cid;
    const config = contest.config;
    // 判断是否成立：
    const sql = `
      select detail
      from enroll
      where uid=? and cid=? and eid=?;
    `;

    const r = await this.mysqlService.query(sql, [uid, cid, eid]);
    if (r.length === 0) {
      throw new HttpException({
        msg: '不存在此信息'
      }, 406);
    }

    // 判断信息是否全部满足：
    const keys = Object.keys(body);
    const t = {};
    for (const key of config) {
      if (keys.indexOf(key) === -1) {
        throw new HttpException({
          msg: '信息不满足要求'
        }, 406);
      } else {
        t[key] = body[key];
      }
    }

    const update = `
      update enroll
      set detail=?
      where eid=?;
    `;

    await this.mysqlService.query(update, [JSON.stringify(t), eid]);
    return {
      msg: '更新成功'
    };
  }

  async deleteOneStudentInOneContest (uid: number, code: string, eid: number) {
    // 得到cid
    const contest = await this.getContestByCode(code);
    const cid = contest.cid;

    // 判断是否成立：
    const sql = `
      select detail
      from enroll
      where uid=? and cid=? and eid=?;
    `;

    const r = await this.mysqlService.query(sql, [uid, cid, eid]);
    if (r.length === 0) {
      throw new HttpException({
        msg: '不存在此信息'
      }, 406);
    }

    const del = `
      delete from enroll
      where eid=?;
    `;

    await this.mysqlService.query(del, [eid]);
    return {
      msg: '删除学生成功'
    }
  }
}
