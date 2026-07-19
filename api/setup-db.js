#!/usr/bin/env node

/**
 * Database Setup Script
 * 
 * Usage:
 *   node setup-db.js sqlite    → Switch to SQLite (no Docker needed)
 *   node setup-db.js postgres  → Switch to PostgreSQL (Docker required)
 * 
 * This script:
 * 1. Copies the appropriate schema file to schema.prisma
 * 2. Generates the Prisma client
 * 3. Runs migrations
 * 4. Seeds the database (optional)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const mode = process.argv[2];
const shouldSeed = process.argv.includes('--seed');

if (!mode || !['sqlite', 'postgres'].includes(mode)) {
  console.log('Usage: node setup-db.js <sqlite|postgres> [--seed]');
  console.log('');
  console.log('  sqlite    → Use SQLite (no Docker needed)');
  console.log('  postgres  → Use PostgreSQL (Docker required)');
  console.log('  --seed    → Run seed after migration');
  process.exit(1);
}

const prismaDir = path.join(__dirname, 'prisma');
const schemaPath = path.join(prismaDir, 'schema.prisma');
const sqliteSchemaPath = path.join(prismaDir, 'schema.sqlite.prisma');
const postgresSchemaPath = path.join(prismaDir, 'schema.postgres.prisma');
const envPath = path.join(__dirname, '.env');

// Backup original schema if it's the postgres one and we haven't backed it up yet
if (fs.existsSync(schemaPath) && !fs.existsSync(postgresSchemaPath)) {
  fs.copyFileSync(schemaPath, postgresSchemaPath);
  console.log('✓ Backed up PostgreSQL schema');
}

if (mode === 'sqlite') {
  console.log('\n🐘 → 🪶 Switching to SQLite...\n');
  
  // Copy SQLite schema
  fs.copyFileSync(sqliteSchemaPath, schemaPath);
  console.log('✓ Copied SQLite schema');
  
  // Update .env if it exists
  if (fs.existsSync(envPath)) {
    let env = fs.readFileSync(envPath, 'utf-8');
    env = env.replace(
      /DATABASE_URL=.*/,
      'DATABASE_URL="file:./dev.db"'
    );
    // Remove or comment out PostgreSQL-specific env vars
    env = env.replace(
      /^#?\s*DB_PROVIDER=.*/m,
      'DB_PROVIDER=sqlite'
    );
    fs.writeFileSync(envPath, env);
    console.log('✓ Updated .env for SQLite');
  } else {
    console.log('⚠ No .env file found. Create one with:');
    console.log('  DATABASE_URL="file:./dev.db"');
  }
  
} else {
  console.log('\n🪶 → 🐘 Switching to PostgreSQL...\n');
  
  // Copy PostgreSQL schema
  if (fs.existsSync(postgresSchemaPath)) {
    fs.copyFileSync(postgresSchemaPath, schemaPath);
    console.log('✓ Restored PostgreSQL schema');
  } else {
    console.log('⚠ No PostgreSQL schema backup found. Using original schema.prisma');
  }
  
  // Update .env
  if (fs.existsSync(envPath)) {
    let env = fs.readFileSync(envPath, 'utf-8');
    env = env.replace(
      /DATABASE_URL=.*/,
      'DATABASE_URL="postgresql://postgres:postgres@localhost:5433/bolivia_experience"'
    );
    env = env.replace(
      /^#?\s*DB_PROVIDER=.*/m,
      'DB_PROVIDER=postgresql'
    );
    fs.writeFileSync(envPath, env);
    console.log('✓ Updated .env for PostgreSQL');
  }
}

// Generate Prisma client
console.log('\n📦 Generating Prisma client...');
try {
  execSync('npx prisma generate', { cwd: __dirname, stdio: 'inherit' });
  console.log('✓ Prisma client generated');
} catch (e) {
  console.error('✗ Failed to generate Prisma client');
  process.exit(1);
}

// Run migrations
console.log('\n🔄 Running migrations...');
try {
  if (mode === 'sqlite') {
    execSync('npx prisma db push --force-reset', { cwd: __dirname, stdio: 'inherit' });
  } else {
    execSync('npx prisma migrate dev --name init', { cwd: __dirname, stdio: 'inherit' });
  }
  console.log('✓ Migrations applied');
} catch (e) {
  console.error('✗ Failed to apply migrations');
  process.exit(1);
}

// Seed if requested
if (shouldSeed) {
  console.log('\n🌱 Seeding database...');
  try {
    execSync('npx ts-node prisma/seed.ts', { cwd: __dirname, stdio: 'inherit' });
    console.log('✓ Database seeded');
  } catch (e) {
    console.error('✗ Failed to seed database');
    console.error('  You can seed manually with: npx ts-node prisma/seed.ts');
  }
}

console.log(`\n✅ Setup complete! Database: ${mode === 'sqlite' ? 'SQLite' : 'PostgreSQL'}`);
console.log(`\n🚀 Start the API with: npm run start:dev`);
