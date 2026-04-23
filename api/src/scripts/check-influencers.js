require('dotenv').config({ path: '../../.env' });
const { db } = require('../config/firebase');

async function check() {
  const snapshot = await db.collection('influencers').get();
  console.log(`Found ${snapshot.size} influencers in the database.`);
  snapshot.forEach(doc => {
    console.log(`- ${doc.data().name} (${doc.id})`);
  });
  process.exit(0);
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});
