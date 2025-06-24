import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { FeedbackCategory } from '../../../entities/feedback.entity';

export class CreateFeedbackDto {
  @IsUUID()
  @IsNotEmpty()
  companyId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(FeedbackCategory)
  @IsNotEmpty()
  category: FeedbackCategory;

  @IsEmail()
  @IsOptional()
  submitterEmail?: string;
}
