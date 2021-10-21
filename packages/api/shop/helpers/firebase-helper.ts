import config from '../../config/config';
const adminFirebase = require("firebase-admin");
adminFirebase.initializeApp({
  credential: adminFirebase.credential.cert(config.firebaseServiceAccount),
  databaseURL: config.firebaseDatabaseURL,
});

export const updateFirebase = async (route: string, data: any) => {
  const ref = adminFirebase.database().ref(route);
  ref.set(data);
}