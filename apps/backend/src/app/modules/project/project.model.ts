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
import { ObjectType, Field, ID, Float, registerEnumType } from '@nestjs/graphql';
import { Category } from '../category/category.model';

export enum ProjectStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PENDING = 'pending',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

registerEnumType(ProjectStatus, {
  name: 'ProjectStatus',
});

@ObjectType()
@Table({
  tableName: 'projects',
  underscored: true,
})
export class Project extends Model<Project> {
  @Field(() => ID)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @Field()
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title: string;

  @Field()
  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  description: string;

  @Field()
  @Column({
    type: DataType.TEXT,
    allowNull: false,
    field: 'detailed_description',
  })
  detailedDescription: string;

  @Field(() => Float)
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    field: 'goal_amount',
  })
  goalAmount: number;

  @Field(() => Float)
  @Default(0)
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    field: 'current_amount',
  })
  currentAmount: number;

  @Field()
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'start_date',
  })
  startDate: Date;

  @Field()
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'end_date',
  })
  endDate: Date;

  @Field(() => ProjectStatus)
  @Column({
    type: DataType.ENUM(...Object.values(ProjectStatus)),
    allowNull: false,
    defaultValue: ProjectStatus.DRAFT,
  })
  status: ProjectStatus;

  @Field({ nullable: true })
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

  @Field(() => Category)
  @BelongsTo(() => Category)
  category: Category;

  @Field()
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'created_at',
  })
  createdAt: Date;

  @Field()
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'updated_at',
  })
  updatedAt: Date;
}
