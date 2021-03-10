import { Module } from '@nestjs/common';
import { MysqlService } from 'src/mysql/mysql.service';
import { RedisService } from 'src/redis/redis.service';
import { UserService } from 'src/user/user.service';
import { ContestController } from './contest.controller';
import { ContestService } from './contest.service';

@Module({
  controllers: [ContestController],
  providers: [ContestService, UserService, MysqlService, RedisService]
})
export class ContestModule {}
