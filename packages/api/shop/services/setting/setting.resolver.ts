import { Resolver, Query, Arg, Int, ObjectType } from 'type-graphql';
import Setting from './setting.type';
import config from '../../../config/config';
import { getDb } from '../../../helper/db.helper';
@Resolver()
export class SettingResolver {
  @Query(() => [Setting], { description: 'Get all the setting' })
  async settings(): Promise<Setting[]> {
    let db = await getDb();
    let settingList = await db.collection('setting').find().sort({ _id: -1 }).toArray();
    settingList = settingList.map((x: any) => {
      if (typeof x.value == 'object') {
        return {
          ...x,
          value: JSON.stringify(x.value)
        };
      }
      return x;
    })
    return settingList;
  }
}
