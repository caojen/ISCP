import { Injectable } from '@nestjs/common';

export const env: "test" | "dev" 
                = "test";

export class Config {
  mysql: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };
  redis: {
    host: string;
    port: number;
    password: string;
  };
}

@Injectable()
export class ConfigService {
  static getConfig (): Config {
    const config = new Config;
    if (env === "test") {
      config.mysql = {
        host: "127.0.0.1",
        port: 3306,
        username: "root",
        password: "opentextfile+123",
        database: "iscp"
      };
      config.redis = {
        host: "127.0.0.1",
        port: 6379,
        password: "123456"
      }
    } else if (env === "dev") {
      config.mysql = {
        host: "127.0.0.1",
        port: 3306,
        username: process.env.MYSQL_USERNAME,
        password: process.env.MYSQL_PASSWORD,
        database: "iscp"
      };
      config.redis = {
        host: "127.0.0.1",
        port: 16379,
        password: process.env.REDIS_PASSWORD
      }
    }

    return config;
  }
}
