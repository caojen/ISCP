import { Module } from '@nestjs/common';
import { MysqlService } from 'src/mysql/mysql.service';
import { RedisService } from 'src/redis/redis.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [UserService, MysqlService, RedisService]
})
export class UserModule {}
