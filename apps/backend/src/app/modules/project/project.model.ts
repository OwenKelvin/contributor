import {
  Table,
  Column,
  Model,
  PrimaryKey,
  Default,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Category } from '../category/category.model';

export enum ProjectStatus {
  Draft = 'DRAFT',
  Active = 'ACTIVE',
  Pending = 'PENDING',
  Completed = 'COMPLETED',
  Archived = 'ARCHIVED',
}

@Table({
  tableName: 'projects',
  underscored: true,
})
export class Project extends Model<Project> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  description: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    field: 'detailed_description',
  })
  detailedDescription: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    field: 'goal_amount',
  })
  goalAmount: number;

  @Default(0)
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    field: 'current_amount',
  })
  currentAmount: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'start_date',
  })
  startDate: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'end_date',
  })
  endDate: Date;

  @Column({
    type: DataType.ENUM(...Object.values(ProjectStatus)),
    allowNull: false,
    defaultValue: ProjectStatus.Draft,
  })
  status: ProjectStatus;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'featured_image',
  })
  featuredImage?: string;

  @ForeignKey(() => Category)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'category_id',
  })
  categoryId: string;

  @BelongsTo(() => Category)
  category: Category;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'created_at',
  })
  createdAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'updated_at',
  })
  updatedAt: Date;
}
