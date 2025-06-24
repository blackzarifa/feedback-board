import { IsEnum, IsOptional } from 'class-validator';
import { FeedbackStatus } from '../../../entities/feedback.entity';

export class UpdateFeedbackDto {
  @IsEnum(FeedbackStatus)
  @IsOptional()
  status?: FeedbackStatus;
}
