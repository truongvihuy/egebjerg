import { Resolver, Query, Mutation, Arg, Int } from 'type-graphql';
import { getNow } from '../../../../share/time.helper';
import { getDb } from '../../../helper/db.helper';
import Newspaper from './newspaper.type';

@Resolver()
export class NewspaperResolver {
  @Query(() => [Newspaper], { description: 'Get all the Newspapers' })
  async newspapers(
    @Arg('_id', (type) => Int, { nullable: true }) _id?: number,
  ): Promise<Newspaper[]> {
    let db = await getDb();
    const now = getNow();
    if (_id) {
      const newspaperList = await db.collection('newspaper').find({
        _id: _id,
        active: true,
        from: { '$lte': now },
        to: { '$gte': now }
      }).toArray();
      if (newspaperList) {
        return newspaperList;
      }
    }
    let newspaperList = await db.collection('newspaper').find({
      active: true,
      from: { '$lte': now },
      to: { '$gte': now }
    }, { sort: { _id: -1 } }).toArray();

    return newspaperList;
  }
}
