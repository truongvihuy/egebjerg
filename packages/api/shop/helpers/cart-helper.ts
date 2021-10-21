import { updateFirebase } from './firebase-helper';
import { getDb } from '../../helper/db.helper';
export const resetCart = async (customerId: number, sessionId: any = null) => {
  let db = await getDb();
  await db.collection('customer').updateOne(
    {
      '_id': customerId,
    },
    {
      '$set': {
        cart: {}
      }
    }
  );
  await updateFirebase(`/cart/${customerId}`, [sessionId, 0]);
}