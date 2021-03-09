import { Injectable } from '@nestjs/common';

export const env = "test"

export class Config {
  mysql: {
    host: string;
    port: number;
    username: string;
    password: string;
  };
  redis: {
    host: string;
    port: number;
    password: string;
  }
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
        password: "OPENtextfile+123"
      };
      config.redis = {
        host: "127.0.0.1",
        port: 6379,
        password: "OPENtextfile+123"
      }
    } else if (env === "dev") {
      config.mysql = {
        host: "127.0.0.1",
        port: 3306,
        username: process.env.MYSQL_USERNAME,
        password: process.env.MYSQL_PASSWORD
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
