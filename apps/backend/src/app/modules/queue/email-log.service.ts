import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Activity } from '../activity/activity.model';
import { CreateActivityInput } from '../activity/dto/create-activity.input';

@Injectable()
export class EmailLogService {
  constructor(
    @InjectModel(Activity)
    private activityModel: typeof Activity,
  ) {}

  async logEmailSend({ userId, action, targetId, targetType, details = '' }: CreateActivityInput) {
    return this.activityModel.create({
      userId,
      action,
      targetId,
      targetType,
      details,
    });
  }
}
