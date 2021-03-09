import { Injectable, Logger } from '@nestjs/common';
import { Config, ConfigService } from 'src/config/config.service';
import * as redis from 'redis';

@Injectable()
export class RedisService {
  private static config: Config = ConfigService.getConfig();
  private logger: Logger = new Logger("RedisService");

  private static redisClient: redis.RedisClient = redis.createClient(
    RedisService.config.redis.port,
    RedisService.config.redis.host,
    { password: RedisService.config.redis.password }
  );

  set (key: string, value: string, expire: number = 72000) {
    return new Promise(resolve => {
      RedisService.redisClient.set(key, value);
      RedisService.redisClient.expire(key, expire, (err, res) => {
        resolve(res);
      })
    });
  }

  get (key: string): Promise<string> {
    return new Promise(resolve => {
      RedisService.redisClient.get(key, (err, res) => {
        resolve(res);
      });
    });
  }

  del (key: string) {
    return new Promise(resolve => {
      RedisService.redisClient.del(key, (err, res) => {
        resolve(res);
      })
    })
  }
}
