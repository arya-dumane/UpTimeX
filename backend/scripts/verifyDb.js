import mongoose from 'mongoose';
import { env } from '../src/config/env.js';
import { maskMongoUri, sanitizeErrorMessage } from '../src/config/db.js';
import { User, Monitor, CheckResult, Incident } from '../src/models/index.js';

async function verifyDatabase() {
  console.log('==================================================');
  console.log('       UptimeX Database Architecture Verification');
  console.log('==================================================');

  const uri = env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not configured in environment variables.');
    process.exit(1);
  }

  console.log(`[Config] Target URI: ${maskMongoUri(uri)}`);
  console.log('[Config] Loading Mongoose models...');

  try {
    // 1. Establish connection
    console.log('[Connection] Connecting to MongoDB...');
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connection Successful: Database "${conn.connection.name}" on host "${conn.connection.host}"`);

    // 2. Validate models can be loaded and registered
    const models = [
      { name: 'User', model: User },
      { name: 'Monitor', model: Monitor },
      { name: 'CheckResult', model: CheckResult },
      { name: 'Incident', model: Incident },
    ];

    console.log('\n[Models] Verifying model registration and schema structures...');
    for (const { name, model } of models) {
      if (!model || !model.schema) {
        throw new Error(`Model ${name} failed to load or has invalid schema.`);
      }
      console.log(`  ✓ ${name} model compiled successfully (Collection: "${model.collection.name}")`);
    }

    // 3. Synchronize and verify indexes on MongoDB
    console.log('\n[Indexes] Synchronizing and verifying database indexes...');
    for (const { name, model } of models) {
      await model.syncIndexes();
      const rawIndexes = await model.collection.indexes();
      const indexSummary = rawIndexes.map((idx) => {
        const keys = Object.keys(idx.key).join(', ');
        const isUnique = idx.unique ? ' [UNIQUE]' : '';
        const isPartial = idx.partialFilterExpression ? ' [PARTIAL]' : '';
        return `${idx.name} (${keys})${isUnique}${isPartial}`;
      });

      console.log(`  ✓ ${name} (${rawIndexes.length} indexes):`);
      indexSummary.forEach((info) => console.log(`      • ${info}`));
    }

    console.log('\n==================================================');
    console.log('✅ ALL DATABASE CHECKS PASSED SUCCESSFULLY');
    console.log('   Models loaded, connections verified, indexes active.');
    console.log('==================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ DATABASE VERIFICATION FAILED');
    console.error(`Error: ${sanitizeErrorMessage(err.message)}`);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

verifyDatabase();
