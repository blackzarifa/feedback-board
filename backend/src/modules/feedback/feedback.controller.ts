import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  create(@Body() createFeedbackDto: CreateFeedbackDto) {
    return this.feedbackService.create(createFeedbackDto);
  }

  @Get()
  findAll(
    @Query('companyId') companyId?: string,
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.feedbackService.findAll({
      companyId,
      status,
      category,
      search,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.feedbackService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFeedbackDto: UpdateFeedbackDto,
  ) {
    return this.feedbackService.update(id, updateFeedbackDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.feedbackService.remove(id);
  }
}
