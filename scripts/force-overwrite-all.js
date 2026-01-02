// FORCE OVERWRITE - Remove old ratings/reviews and set fresh defaults
// This will UNSET old fields and SET new defaults
// Run with: node scripts/force-overwrite-all.js

const mongoose = require('mongoose');
const path = require('path');

// Load environment
try {
  const dotenv = require('dotenv');
  const envPaths = [
    path.join(__dirname, '..', '.env.local'),
    path.join(__dirname, '..', '.env'),
    path.join(process.cwd(), '.env.local'),
    path.join(process.cwd(), '.env')
  ];
  
  let loaded = false;
  for (const envPath of envPaths) {
    try {
      const result = dotenv.config({ path: envPath });
      if (!result.error) {
        loaded = true;
        break;
      }
    } catch (e) {}
  }
  if (loaded) console.log('Environment loaded');
} catch (e) {
  console.log('Using system environment variables');
}

async function dbConnect() {
  try {
    if (mongoose.connections && mongoose.connections[0].readyState) return;
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error('MONGODB_URI not set');
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to database\n');
  } catch (error) {
    console.error('✗ Connection error:', error.message);
    process.exit(1);
  }
}

async function forceOverwrite() {
  try {
    await dbConnect();
    const db = mongoose.connection.db;

    // Exact default structure
    const defaults = {
      ratings: {
        overall: 0,
        totalRatings: 0,
        breakdown: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
        whatsGood: [],
        whatsBad: []
      },
      reviews: []
    };

    let resUpdated = 0;
    let comUpdated = 0;

    // Residential
    console.log('=== RESIDENTIAL PROPERTIES ===');
    const resColl = db.collection('residentialproperties');
    const resCount = await resColl.countDocuments();
    console.log(`Total: ${resCount}`);
    
    if (resCount > 0) {
      // Step 1: Unset old fields completely
      const unsetResult = await resColl.updateMany(
        {},
        { $unset: { ratings: "", reviews: "" } }
      );
      console.log(`  Unset old fields: ${unsetResult.modifiedCount}`);
      
      // Step 2: Set new defaults
      const setResult = await resColl.updateMany(
        {},
        { $set: defaults }
      );
      resUpdated = setResult.modifiedCount;
      console.log(`  ✓ Set defaults: ${resUpdated} properties`);
    }

    // Commercial
    console.log('\n=== COMMERCIAL PROPERTIES ===');
    const comColl = db.collection('commercialProperties');
    const comCount = await comColl.countDocuments();
    console.log(`Total: ${comCount}`);
    
    if (comCount > 0) {
      // Step 1: Unset old fields completely
      const unsetResult = await comColl.updateMany(
        {},
        { $unset: { ratings: "", reviews: "" } }
      );
      console.log(`  Unset old fields: ${unsetResult.modifiedCount}`);
      
      // Step 2: Set new defaults
      const setResult = await comColl.updateMany(
        {},
        { $set: defaults }
      );
      comUpdated = setResult.modifiedCount;
      console.log(`  ✓ Set defaults: ${comUpdated} properties`);
    }

    // Verify
    console.log('\n=== VERIFICATION ===');
    const sampleRes = await resColl.findOne({});
    if (sampleRes) {
      console.log('Residential sample:');
      console.log('  Ratings:', JSON.stringify(sampleRes.ratings, null, 2));
      console.log('  Reviews:', JSON.stringify(sampleRes.reviews, null, 2));
    }
    
    const sampleCom = await comColl.findOne({});
    if (sampleCom) {
      console.log('\nCommercial sample:');
      console.log('  Ratings:', JSON.stringify(sampleCom.ratings, null, 2));
      console.log('  Reviews:', JSON.stringify(sampleCom.reviews, null, 2));
    }

    console.log('\n=== SUMMARY ===');
    console.log(`✓ Residential: ${resUpdated}/${resCount}`);
    console.log(`✓ Commercial: ${comUpdated}/${comCount}`);
    console.log(`✓ Total: ${resUpdated + comUpdated}/${resCount + comCount}`);

    return { success: true, res: resUpdated, com: comUpdated };
  } catch (error) {
    console.error('\n❌ Error:', error);
    throw error;
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\n✓ Connection closed');
    }
  }
}

console.log('⚠️  FORCE OVERWRITE - All ratings/reviews will be reset!');
console.log('Starting...\n');

forceOverwrite()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Failed:', error);
    process.exit(1);
  });

