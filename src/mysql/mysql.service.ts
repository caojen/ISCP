import { HttpException, Injectable, Logger } from '@nestjs/common';
import { Config, ConfigService } from 'src/config/config.service';
import * as mysql from 'mysql2/promise';

@Injectable()
export class MysqlService {
  private logger: Logger = new Logger("MysqlService");
  private config: Config = ConfigService.getConfig();

  private selectedPool: mysql.Pool = null;
  private executePool: mysql.Pool = null;

  constructor () {
    this.selectedPool = mysql.createPool({
      host: this.config.mysql.host,
      user: this.config.mysql.username,
      database: this.config.mysql.database,
      password: this.config.mysql.password,
      multipleStatements: false,
      connectionLimit: 20,
      waitForConnections: true,
      queueLimit: 0
    });
    this.executePool = mysql.createPool({
      host: this.config.mysql.host,
      user: this.config.mysql.username,
      database: this.config.mysql.database,
      password: this.config.mysql.password,
      multipleStatements: false,
      connectionLimit: 20,
      waitForConnections: true,
      queueLimit: 0
    });
  }

  async query (sql: string, params: any[] = []): Promise<any> {
    const isSelect = sql.trim().substr(0, 6).toLocaleLowerCase() === 'select';
    try {
      if (isSelect) {
        const res = await this.selectedPool.query(sql, params);
        return res[0];
      } else {
        const res = await this.executePool.query(sql, params);
        return res[0];
      }
    } catch (err) {
      this.logger.log(["数据库查询出错", sql, params]);
      throw new HttpException({
        msg: '数据库查询出错',
        err
      }, 500);
    }
  }
}
