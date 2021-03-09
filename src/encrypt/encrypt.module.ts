import { Module } from '@nestjs/common';
import { EncryptService } from './encrypt.service';

@Module({
  providers: [EncryptService]
})
export class EncryptModule {}
