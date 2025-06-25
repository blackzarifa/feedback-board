import {
  Controller,
  Post,
  Delete,
  Body,
  Param,
  Req,
  ParseUUIDPipe,
  Get,
  Query,
} from '@nestjs/common';
import { Request } from 'express';
import { VoteService } from './vote.service';
import { CreateVoteDto } from './dto/create-vote.dto';

@Controller('votes')
export class VoteController {
  constructor(private readonly voteService: VoteService) {}

  @Post()
  create(@Body() createVoteDto: CreateVoteDto, @Req() req: Request) {
    return this.voteService.create(createVoteDto, req);
  }

  @Delete(':feedbackId')
  remove(
    @Param('feedbackId', ParseUUIDPipe) feedbackId: string,
    @Req() req: Request,
  ) {
    return this.voteService.remove(feedbackId, req);
  }

  @Get('user-votes')
  getUserVotes(@Query('feedbackIds') feedbackIds: string, @Req() req: Request) {
    const ids = feedbackIds ? feedbackIds.split(',') : [];
    return this.voteService.findUserVotes(ids, req);
  }
}
