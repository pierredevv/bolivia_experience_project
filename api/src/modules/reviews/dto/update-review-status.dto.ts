import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReviewStatus } from '../../../common/constants/review-status';

export class UpdateReviewStatusDto {
  @ApiProperty({ enum: ReviewStatus, example: ReviewStatus.PUBLISHED })
  @IsEnum(ReviewStatus)
  status: ReviewStatus;
}
