import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { ActivityService } from '../activity/activity.service';
import { ActivityAction, TargetType } from '../activity/activity.model';
import { InjectModel } from '@nestjs/sequelize';
import { Category } from './category.model';
import { CreateCategoryInput } from './dto/create-category.input';
import { UpdateCategoryInput } from './dto/update-category.input';
import { Project } from '../project/project.model';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category)
    private categoryModel: typeof Category,
    private activityService: ActivityService,
  ) {}

  async getAllCategories(): Promise<Category[]> {
    return this.categoryModel.findAll({
      include: [Project],
      order: [['name', 'ASC']],
    });
  }

  async getCategoryById(id: string): Promise<Category> {
    const category = await this.categoryModel.findByPk(id, {
      include: [Project],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async createCategory(input: CreateCategoryInput, userId: string): Promise<Category> {
    try {
      const category = await this.categoryModel.create({
        name: input.name,
        description: input.description,
      } as any);
      await this.activityService.logActivity({
        userId,
        action: ActivityAction.CATEGORY_CREATED,
        targetType: TargetType.CATEGORY,
        targetId: category.id,
        details: JSON.stringify({ name: category.name })
      });
      return this.getCategoryById(category.id);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new ConflictException('A category with this name already exists');
      }
      throw error;
    }
  }

  async updateCategory(id: string, input: UpdateCategoryInput, userId: string): Promise<Category> {
    const category = await this.getCategoryById(id);

    try {
      await category.update(input);
      await this.activityService.logActivity({
        userId,
        action: ActivityAction.CATEGORY_UPDATED,
        targetType: TargetType.CATEGORY,
        targetId: category.id,
        details: JSON.stringify({ name: category.name })
      });
      return this.getCategoryById(id);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new ConflictException('A category with this name already exists');
      }
      throw error;
    }
  }

  async deleteCategory(id: string, userId: string): Promise<boolean> {
    const category = await this.getCategoryById(id);

    // Check if category has projects
    const projectCount = await Project.count({ where: { categoryId: id } });
    if (projectCount > 0) {
      throw new ConflictException(
        `Cannot delete category with ${projectCount} associated projects`,
      );
    }

    await category.destroy();
    await this.activityService.logActivity({
      userId,
      action: ActivityAction.CATEGORY_DELETED,
      targetType: TargetType.CATEGORY,
      targetId: category.id,
      details: JSON.stringify({ name: category.name })
    });
    return true;
  }
}
