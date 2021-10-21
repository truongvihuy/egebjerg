import { ObjectType, Resolver, Query, Arg, Int } from 'type-graphql';
import loadCategories from './category.sample';
import Category from './category.type';
import { getDb } from '../../../helper/db.helper';
@Resolver()
export class CategoryResolver {
  // private readonly items: Category[] = loadCategories();

  @Query(() => [Category], { description: 'Get all the categories' })
  async categories(): Promise<Category[]> {
    let db = await getDb();
    let categoryList = await db.collection('category').find({ active: true }).toArray();
    return categoryList;
  }

  @Query(() => Category)
  async category(
    @Arg('_id', type => Int) _id: number
  ): Promise<Category | undefined> {
    return;
    // return await this.items.find(item => item._id === _id);
  }
}
