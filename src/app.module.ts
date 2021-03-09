import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule } from './config/config.module';
import { ContestModule } from './contest/contest.module';
import { MysqlModule } from './mysql/mysql.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [UserModule, ConfigModule, ContestModule, MysqlModule, RedisModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
