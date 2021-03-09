import { HttpException } from "@nestjs/common";

export function shouldNotNull (params: any[]) {
  for (let i = 0; i < params.length; i++) {
    if (params[i] === null || params[i] === undefined) {
      throw new HttpException({
        msg: '参数错误'
      }, 406);
    }
  }
}

export function shouldBeInteger (params: any[]) {
  for (let i = 0; i < params.length; i++) {
    if (isNaN(parseInt(params[i]))) {
      throw new HttpException({
        msg: '参数错误'
      }, 406);
    }
  }
}