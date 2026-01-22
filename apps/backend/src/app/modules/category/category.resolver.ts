import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CategoryService } from './category.service';
import { Category } from './category.model';
import { CreateCategoryInput } from './dto/create-category.input';
import { UpdateCategoryInput } from './dto/update-category.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private categoryService: CategoryService) {}

  @Query(() => [Category])
  async getAllCategories(): Promise<Category[]> {
    return this.categoryService.getAllCategories();
  }

  @Mutation(() => Category)
  @UseGuards(GqlAuthGuard)
  async createCategory(
    @Args('input') input: CreateCategoryInput,
    @CurrentUser() user: any,
  ): Promise<Category> {
    return this.categoryService.createCategory(input, user.id);
  }

  @Mutation(() => Category)
  @UseGuards(GqlAuthGuard)
  async updateCategory(
    @Args('id') id: string,
    @Args('input') input: UpdateCategoryInput,
    @CurrentUser() user: any,
  ): Promise<Category> {
    return this.categoryService.updateCategory(id, input, user.id);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteCategory(
    @Args('id') id: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    return this.categoryService.deleteCategory(id, user.id);
  }
}
