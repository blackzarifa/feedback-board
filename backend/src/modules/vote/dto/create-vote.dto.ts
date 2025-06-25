import { IsUUID, IsNotEmpty } from 'class-validator';

export class CreateVoteDto {
  @IsUUID()
  @IsNotEmpty()
  feedbackId: string;
}
