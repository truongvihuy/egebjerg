let ES = require('@elastic/elasticsearch');
let elasticSearch = new ES.Client({ node: 'http://localhost:9200' });

export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    uri: 'mongodb://root:123@localhost:27017/egebjerg?authSource=admin',
    name: 'egebjerg'
  },
  jwt: {
    exp: '600s',
    secret: '--123--',
  },
  refreshToken: {
    exp: 8, // hours
    secret: 'ege123',
  },
  secretCode: 'ege123-order',
  elasticSearch: elasticSearch,
  firebaseServiceAccount: {
    "type": "service_account",
    "project_id": "test-3f17e",
    "private_key_id": "f88551d72a2bb041c7335294fad35a34d0b39866",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDYmzatAXr0WtZs\nnw5/VJuIU7lMEqBKzxBGeOYgOQ38gvFz+a+cToyxIA06OTrIWzrX+O7ZFT1x+BuY\nXiys/gReIelpYhiv+/rKeGFAtnQNvdCGF5gzfULq1+HB6RpW5EGDC2JEjog1GxMd\nl5gwJGRDQ2NalP/a0ANXE6AvMAZJFm/+8BYyCcc4J56WvTz69XmA4ImLyOUHWQ8w\nEbXOXetdr2DoW1FVQnLdfa2sI/GT2OkKF2DF9ujSceGiyz6LTXZBPeEgzOfYtvAA\ntM5sOJDsB/oJ/lgNdGg/ouGpONsUdwE/c3mDqTIOAn99VWzc3eRYe209z5/MMhhx\nZ4XjGK1XAgMBAAECggEACO4tTOi4twZfvM65/Enyt6YsB5TlAvCSjTVC16VCjFyh\ns9RhhyI97reRlArz/3qzbGAZCN41UFOYX6nSUbePWoovY2bl+at75YkdCVv8YOyo\ngj7KyaSqc6A+8I25xkdW5B4+CPGPcBETsq6jWajGcXd/yyZFfjIBUT+/5PIn8C9n\nN8/Bd89kFAqPc7l3w5SQ5krXlSjhwmAEeXxFExIqnIaLxRPYqnwrtVvrKlc7i93D\nMuD/u5B897bGFt6e4HNwfhcZfKHkwK2u4I/bYeBAdxqIJrKQt0u8VdS0jWHAvVRh\n/+AyfYgW32KrdGA9Fy4OykLl63U6xAAFqVrAy6DJ4QKBgQDsCJ2NIrR3YoelsiJM\ntfc3SCgoWkPrGi06UtvBMgu7ZxDz8miz1yEp8c/qHZDBa2ckXjix38LIDYIztc81\ngN5qzOzAwyXvebuR+tviFuo29Tw1C0JIVk9AagNm++e6oqNHoPsNhixuHW+JHrdn\nUo7CvRiG5nqJQ4iL4zeogNgW+QKBgQDq7eSCqIx2u8s5StefoyNaZRXPSVngCW0f\n8u53Cqz7mUfNEUVBv50xR21JsNW1pNCZ+bsw1eL556Mk9XG7cCjYJbeuIRMJj3Mq\npeVvS61A0rLT2SXaGmUMZktPRpW12V8QMO1NUZDQHefGI+eYEhBpxawGhUT10z8W\nkArmcXNqzwKBgQDlLDhNILU4dWJfb2X+NW+jLVxQUdRAIVpolqroGj9p5diAA43F\nj8uTfkXxemNiaXXrydAiZLAqrXMN4ikeOdG6wN3fC5t5uSh1xKxaCQW/9rxOhHAG\n7EZmtIg5Jb0JaYA/u/4GU5AwGkSBTmGk4HPcgN2fnYi8XeXmbOdNpEwrgQKBgC4g\nr7GH7qyRiwGg1F2f5p0lI/cja+Y1c5vGU1REYFq2aga10WdrfC3k3GyPsCaOSfcx\ntbONC5gOB1aGauJmz15BaaNjEx3ZcL96+2Wy8j28ISi/hlMgw55/p2HVdifSmnvP\nX4jC7zAt7whUnHCbe2WJTpGpMTUjWUvQ1JMSy5q5AoGBANbOcB3n/Ef1ecol38Ze\nOxGBl72uNPW3YD+wSidtq6VGVEv+ICsD/ELdTAAHdAP/T2TdC4EmC8zLMnR6hE8x\nEbXLQteYVu6ybNaUBG4hVT072XU6/tMGOWdN4ZIfdP0ccG46yccbjyJrnspjPQxs\n9iP4ryryTWQfv54pOIfFZDv1\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-bvogv@test-3f17e.iam.gserviceaccount.com",
    "client_id": "108863719865566049591",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-bvogv%40test-3f17e.iam.gserviceaccount.com"
  },
  firebaseDatabaseURL: "https://test-3f17e-default-rtdb.firebaseio.com",
  shopDomain: 'http://egebjerg.local',
  thumborServer: 'http://img.egebjerg.local',
  thumborToken: 'eyJhbGciOiJIUzI1NiJ9.eyJfaWQiOjIsInVzZXJuYW1lIjoidF9hZG1pbiIsIm5hbWUiOiJbVGVzdGVyXSBBZG1pbiIsInVzZXJfZ3JvdXBfaWQiOjEsInBlcm1pc3Npb24iOnsicHJvZHVjdCI6IjExMTExIn19.uz5G-IqCNcgK17AkHycZS2wZbshsgHTgEaccrLwBHQk',
  thumborStoragePath: '/Users/kaito/CODE/Egebjerg/thumbor/images/storage',
  assetsPath: '/Users/kaito/CODE/Egebjerg/egebjerg_be/nest/assets',
  mail: {
    email: 'egebjerg_test@yahoo.com',
    password: 'wpvjfvvobaaayxgk',
    emailDefaultReceive: ['hknguyenvu@gmail.com'],
    smtpHost: 'smtp.mail.yahoo.com',
    smtpPort: 465,
    smtpSecure: true
  },
  sentry: {
    enable: true,
    dns: 'https://b2c69431406f42a8854ee57aecbbddd9@o982145.ingest.sentry.io/5936943'
  }
});

// mongodump --db egebjerg -u admin -p 123 -o /Users/envy/Dev/www/egebjerg_be/_doc/db/ --gzip
// mongorestore /Users/envy/Dev/www/egebjerg_be/_doc/db/ -u root -p 123 --gzip
// mongo 'mongodb://root:123@localhost:27017/egebjerg?authSource=admin' --eval "db.dropDatabase()"

// Transporter will use environment variable:
// export MONGODB_EGEBJERG_URI='mongodb://egebjerg:egebjerg%40123@localhost:27017/egebjerg?authSource=egebjerg'
// transporter run product.js