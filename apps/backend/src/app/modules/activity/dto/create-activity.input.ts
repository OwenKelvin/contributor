import { IsEnum, IsUUID, IsOptional, IsString } from 'class-validator';
import { ActivityAction, TargetType } from '../activity.model';

export class CreateActivityInput {
  @IsUUID()
  userId: string;

  @IsEnum(ActivityAction)
  action: ActivityAction;

  @IsOptional()
  @IsUUID()
  targetId?: string;

  @IsOptional()
  @IsEnum(TargetType)
  targetType?: TargetType;

  @IsOptional()
  @IsString()
  details?: string;
}
