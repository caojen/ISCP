import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminRequired, LoginRequired } from 'src/user/user.guard';
import { UserService } from 'src/user/user.service';
import { shouldBeInteger, shouldNotNull } from 'src/util/nonull.function';
import { Contest } from './contest.entity';
import { ContestService } from './contest.service';

@Controller('contest')
export class ContestController {
  constructor (
    private readonly userService: UserService,
    private readonly contestService: ContestService
  ) {}

  @Get('')
  @UseGuards(LoginRequired)
  async getContestByCode (@Query() query: { code: string }) {
    const { code } = query;
    shouldNotNull([code]);
    return await this.contestService.getContestByCode (code);
  }

  @Get('all')
  @UseGuards(AdminRequired)
  async getAllContests () {
    return await this.contestService.getContestsList()
  }

  @Post('')
  @UseGuards(AdminRequired)
  async createOneContest (@Body() contest: Contest) {
    return await this.contestService.createOneContest(contest);
  }

  @Delete(':cid')
  @UseGuards(AdminRequired)
  async deleteOneContest (@Param() param: { cid: number }) {
    const { cid } = param;
    shouldBeInteger([cid]);
    return await this.contestService.deleteOneContest(cid);
  }

  @Get(':cid/summary')
  @UseGuards(AdminRequired)
  async getOneContestSummary (@Param() param: { cid: number }) {
    const { cid } = param;
    shouldBeInteger([cid]);
    return await this.contestService.getOneContestSummary(cid);
  }

  @Post('student')
  @UseGuards(LoginRequired)
  async addOneStudentToOneContest (
    @Req() request: any,
    @Query() query: { code: string },
    @Body() body: any   // 注意body需要根据code指定的contest.config来设定
  ) {
    const uid = request.user.uid;
    const { code } = query;
    shouldNotNull([code]);
    return await this.contestService.addOneStudentToOneContest(uid, code, body);
  }

  @Post('students')
  @UseGuards(LoginRequired)
  async addManyStudentsToOneContest (
    @Req() request: any,
    @Query() query: { code: string },
    @Body() body: any
  ) {
    const uid = request.user.uid;
    const { code } = query;
    shouldNotNull([code]);
    return await this.contestService.addManyStudentsToOneContest(uid, code, body);
  }

  @Post('students/file')
  @UseGuards(LoginRequired)
  @UseInterceptors(FileInterceptor('file', {
    limits: {fileSize: 50 * 1024 * 1024},
    fileFilter: (req, file, cb) => {
      cb(null, true);
    }
  }))
  async addManyStudentsToOneContestWithFile (
    @Req() request: any,
    @Query() query: { code: string },
    @UploadedFile() file: { buffer: Buffer }
  ) {
    const uid = request.user.uid;
    const { code } = query;
    shouldNotNull([code]);
    return await this.contestService.addManyStudentsToOneContestWithFile(uid, code, file.buffer);
  }

  @Get('students')
  @UseGuards(LoginRequired)
  async getMyStudents (
    @Req() request: any,
    @Query() query: { code: string },
  ) {
    const uid = request.user.uid;
    const { code } = query;
    shouldNotNull([code]);
    return await this.contestService.getMyStudents(uid, code);
  }

  @Put('student/:eid')
  @UseGuards(LoginRequired)
  async updateOneStudentInfoInOneContest (
    @Req() request: any,
    @Query() query: { code: string },
    @Param() param: { eid: number },
    @Body() body: any
  ) {
    const uid = request.user.uid;
    const { code } = query;
    const { eid } = param;
    shouldNotNull([code]);
    shouldBeInteger([eid]);
    return await this.contestService.updateOneStudentInfoInOneContest(uid, code, eid, body);
  }

  @Delete('student/:eid')
  @UseGuards(LoginRequired)
  async deleteOneStudentInOneContest (
    @Req() request: any,
    @Query() query: { code: string },
    @Param() param: { eid: number }
  ) {
    const uid = request.user.uid;
    const { code } = query;
    const { eid } = param;
    shouldNotNull([code]);
    shouldBeInteger([eid]);
    return await this.contestService.deleteOneStudentInOneContest(uid, code, eid);
  }

  @Get(':cid')
  @UseGuards(AdminRequired)
  async getContestByCid (@Param() param: { cid: number }) {
    const { cid } = param;
    shouldBeInteger([cid]);
    return await this.contestService.getContestByCid (cid);
  }

  @Put(':cid')
  @UseGuards(AdminRequired)
  async updateContestInfo (@Param() param: { cid: number }, @Body() body: Contest) {
    const { cid } = param;
    shouldBeInteger([cid]);
    return await this.contestService.updateContestInfo(cid, body);
  }
}
