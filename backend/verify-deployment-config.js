#!/usr/bin/env node

/**
 * Deployment Configuration Verification Script
 * Run this before deploying to catch common issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Deployment Configuration...\n');

let hasErrors = false;
let hasWarnings = false;

// Check 1: package.json exists and has required scripts
console.log('✓ Checking package.json...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const requiredScripts = ['build', 'start:prod'];
  requiredScripts.forEach(script => {
    if (!packageJson.scripts[script]) {
      console.error(`  ❌ Missing script: ${script}`);
      hasErrors = true;
    }
  });
  
  if (!hasErrors) {
    console.log('  ✅ All required scripts present');
  }
} catch (error) {
  console.error('  ❌ Cannot read package.json');
  hasErrors = true;
}

// Check 2: .env is in .gitignore
console.log('\n✓ Checking .gitignore...');
try {
  const gitignore = fs.readFileSync('.gitignore', 'utf8');
  if (gitignore.includes('.env')) {
    console.log('  ✅ .env is in .gitignore');
  } else {
    console.error('  ❌ .env is NOT in .gitignore - sensitive data may be exposed!');
    hasErrors = true;
  }
} catch (error) {
  console.warn('  ⚠️  .gitignore not found');
  hasWarnings = true;
}

// Check 3: .env.example exists
console.log('\n✓ Checking .env.example...');
if (fs.existsSync('.env.example')) {
  console.log('  ✅ .env.example exists');
} else {
  console.warn('  ⚠️  .env.example not found (recommended for documentation)');
  hasWarnings = true;
}

// Check 4: TypeScript compiles
console.log('\n✓ Checking TypeScript configuration...');
if (fs.existsSync('tsconfig.json')) {
  console.log('  ✅ tsconfig.json exists');
} else {
  console.error('  ❌ tsconfig.json not found');
  hasErrors = true;
}

// Check 5: Main entry point exists
console.log('\n✓ Checking main entry point...');
if (fs.existsSync('src/main.ts')) {
  console.log('  ✅ src/main.ts exists');
  
  // Check if PORT is configurable
  const mainContent = fs.readFileSync('src/main.ts', 'utf8');
  if (mainContent.includes('process.env.PORT')) {
    console.log('  ✅ PORT is configurable via environment variable');
  } else {
    console.warn('  ⚠️  PORT is hardcoded - should use process.env.PORT');
    hasWarnings = true;
  }
} else {
  console.error('  ❌ src/main.ts not found');
  hasErrors = true;
}

// Check 6: Dependencies
console.log('\n✓ Checking dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const criticalDeps = ['@nestjs/core', '@nestjs/common', 'mongoose', 'bcrypt'];
  
  criticalDeps.forEach(dep => {
    if (!packageJson.dependencies[dep]) {
      console.error(`  ❌ Missing critical dependency: ${dep}`);
      hasErrors = true;
    }
  });
  
  if (!hasErrors) {
    console.log('  ✅ All critical dependencies present');
  }
} catch (error) {
  console.error('  ❌ Cannot verify dependencies');
  hasErrors = true;
}

// Check 7: render.yaml exists
console.log('\n✓ Checking Render configuration...');
if (fs.existsSync('render.yaml')) {
  console.log('  ✅ render.yaml exists');
} else {
  console.warn('  ⚠️  render.yaml not found (optional but recommended)');
  hasWarnings = true;
}

// Check 8: Health endpoint
console.log('\n✓ Checking health endpoint...');
if (fs.existsSync('src/health/health.controller.ts')) {
  console.log('  ✅ Health endpoint exists');
} else {
  console.warn('  ⚠️  Health endpoint not found (recommended for monitoring)');
  hasWarnings = true;
}

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.error('\n❌ DEPLOYMENT VERIFICATION FAILED');
  console.error('Please fix the errors above before deploying.\n');
  process.exit(1);
} else if (hasWarnings) {
  console.warn('\n⚠️  DEPLOYMENT VERIFICATION PASSED WITH WARNINGS');
  console.warn('Consider addressing the warnings above.\n');
  process.exit(0);
} else {
  console.log('\n✅ DEPLOYMENT VERIFICATION PASSED');
  console.log('Your configuration looks good for deployment!\n');
  process.exit(0);
}
