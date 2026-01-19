import { IsEnum, IsUUID, IsOptional, IsDateString } from 'class-validator';
import { ActivityAction, TargetType } from '../activity.model';

export class DateRangeInput {
  @IsDateString()
  start: Date;

  @IsDateString()
  end: Date;
}

export class ActivityFilter {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsEnum(ActivityAction)
  action?: ActivityAction;

  @IsOptional()
  @IsEnum(TargetType)
  targetType?: TargetType;

  @IsOptional()
  dateRange?: DateRangeInput;
}
