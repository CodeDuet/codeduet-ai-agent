#!/usr/bin/env node

/**
 * Package Verification and Auto-Fix Script
 * 
 * This script verifies that all required local packages are present and properly built.
 * If packages are missing, it attempts to restore them automatically.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REQUIRED_PACKAGES = [
  {
    name: '@codeduet-sh/supabase-management-js',
    path: 'packages/@codeduet-sh/supabase-management-js',
    npmUrl: 'https://www.npmjs.com/package/@codeduet-sh/supabase-management-js',
    fallbackCommand: 'npm install @codeduet-sh/supabase-management-js --save',
    buildCommand: 'npm run build',
    requiredFiles: ['package.json', 'src/index.ts', 'dist/index.js', 'dist/index.d.ts']
  }
];

class PackageVerifier {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.issues = [];
    this.fixes = [];
  }

  log(message, level = 'info') {
    const prefix = {
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      success: '✅',
      fix: '🔧'
    }[level];
    console.log(`${prefix} ${message}`);
  }

  checkPackageExists(pkg) {
    const fullPath = path.join(this.projectRoot, pkg.path);
    const exists = fs.existsSync(fullPath);
    
    if (!exists) {
      this.issues.push({
        type: 'missing_directory',
        package: pkg.name,
        path: fullPath,
        message: `Package directory missing: ${pkg.path}`
      });
      return false;
    }
    
    return true;
  }

  checkRequiredFiles(pkg) {
    const packagePath = path.join(this.projectRoot, pkg.path);
    const missingFiles = [];
    
    for (const file of pkg.requiredFiles) {
      const filePath = path.join(packagePath, file);
      if (!fs.existsSync(filePath)) {
        missingFiles.push(file);
      }
    }
    
    if (missingFiles.length > 0) {
      this.issues.push({
        type: 'missing_files',
        package: pkg.name,
        files: missingFiles,
        message: `Missing files in ${pkg.name}: ${missingFiles.join(', ')}`
      });
      return false;
    }
    
    return true;
  }

  checkPackageJson(pkg) {
    try {
      const packagePath = path.join(this.projectRoot, pkg.path, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      if (packageJson.name !== pkg.name) {
        this.issues.push({
          type: 'wrong_package_name',
          package: pkg.name,
          expected: pkg.name,
          actual: packageJson.name,
          message: `Package name mismatch in ${pkg.path}/package.json`
        });
        return false;
      }
      
      return true;
    } catch (error) {
      this.issues.push({
        type: 'invalid_package_json',
        package: pkg.name,
        error: error.message,
        message: `Invalid or missing package.json in ${pkg.path}`
      });
      return false;
    }
  }

  async fixMissingPackage(pkg) {
    this.log(`Attempting to fix missing package: ${pkg.name}`, 'fix');
    
    try {
      // Try to install from npm first
      this.log(`Installing ${pkg.name} from npm...`, 'info');
      execSync(pkg.fallbackCommand, { 
        cwd: this.projectRoot,
        stdio: 'inherit'
      });
      
      this.fixes.push(`Installed ${pkg.name} from npm`);
      return true;
    } catch (error) {
      this.log(`Failed to install from npm: ${error.message}`, 'error');
      
      // If npm install fails, create a minimal package structure
      this.log(`Creating minimal package structure for ${pkg.name}...`, 'fix');
      return this.createMinimalPackage(pkg);
    }
  }

  createMinimalPackage(pkg) {
    try {
      const packagePath = path.join(this.projectRoot, pkg.path);
      
      // Create directory structure
      fs.mkdirSync(packagePath, { recursive: true });
      fs.mkdirSync(path.join(packagePath, 'src'), { recursive: true });
      fs.mkdirSync(path.join(packagePath, 'dist'), { recursive: true });
      
      // Create package.json
      const packageJson = {
        name: pkg.name,
        version: "1.0.1",
        description: "Convenience wrapper for the Supabase Management API",
        main: "./dist/index.js",
        types: "./dist/index.d.ts",
        module: "./dist/index.mjs",
        exports: {
          ".": {
            import: {
              types: "./dist/index.d.ts",
              default: "./dist/index.mjs"
            },
            require: {
              types: "./dist/index.d.ts",
              default: "./dist/index.js"
            }
          }
        },
        scripts: {
          build: "tsc && cp dist/index.js dist/index.mjs",
          dev: "tsc --watch",
          clean: "rm -rf dist"
        },
        dependencies: {
          "openapi-fetch": "^0.6.1"
        },
        devDependencies: {
          "@types/node": "^20.0.0",
          "typescript": "^5.0.0"
        },
        keywords: ["supabase", "management", "api"],
        author: "CodeDuet",
        license: "Apache-2.0"
      };
      
      fs.writeFileSync(
        path.join(packagePath, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );
      
      // Create basic TypeScript source
      const indexTs = `// Auto-generated fallback for @codeduet-sh/supabase-management-js
export * from './types';
export { createSupabaseManagementClient } from './client';
`;
      
      fs.writeFileSync(path.join(packagePath, 'src/index.ts'), indexTs);
      
      // Create basic TypeScript config
      const tsConfig = {
        compilerOptions: {
          target: "ES2020",
          module: "commonjs",
          declaration: true,
          outDir: "./dist",
          rootDir: "./src",
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true
        },
        include: ["src/**/*"],
        exclude: ["node_modules", "dist"]
      };
      
      fs.writeFileSync(
        path.join(packagePath, 'tsconfig.json'),
        JSON.stringify(tsConfig, null, 2)
      );
      
      // Build the package
      execSync('npm install', { cwd: packagePath, stdio: 'inherit' });
      execSync('npm run build', { cwd: packagePath, stdio: 'inherit' });
      
      this.fixes.push(`Created minimal package structure for ${pkg.name}`);
      return true;
    } catch (error) {
      this.log(`Failed to create minimal package: ${error.message}`, 'error');
      return false;
    }
  }

  async verifyAndFix() {
    this.log('🔍 Verifying required packages...', 'info');
    
    for (const pkg of REQUIRED_PACKAGES) {
      this.log(`Checking ${pkg.name}...`, 'info');
      
      const dirExists = this.checkPackageExists(pkg);
      if (!dirExists) {
        await this.fixMissingPackage(pkg);
        continue;
      }
      
      const filesExist = this.checkRequiredFiles(pkg);
      const packageJsonValid = this.checkPackageJson(pkg);
      
      if (!filesExist || !packageJsonValid) {
        this.log(`Package ${pkg.name} is corrupted, attempting to fix...`, 'warn');
        await this.fixMissingPackage(pkg);
      } else {
        this.log(`Package ${pkg.name} is OK`, 'success');
      }
    }
    
    // Run workspace build to ensure everything is compiled
    if (this.fixes.length > 0) {
      this.log('Running workspace build...', 'fix');
      try {
        execSync('npm run build:packages', { 
          cwd: this.projectRoot,
          stdio: 'inherit'
        });
        this.log('Workspace build completed successfully', 'success');
      } catch (error) {
        this.log(`Workspace build failed: ${error.message}`, 'error');
      }
    }
    
    this.printSummary();
  }

  printSummary() {
    console.log('\n📊 Verification Summary:');
    
    if (this.issues.length === 0 && this.fixes.length === 0) {
      this.log('All packages are properly configured!', 'success');
      return;
    }
    
    if (this.issues.length > 0) {
      console.log('\n❌ Issues found:');
      this.issues.forEach(issue => {
        console.log(`  • ${issue.message}`);
      });
    }
    
    if (this.fixes.length > 0) {
      console.log('\n🔧 Fixes applied:');
      this.fixes.forEach(fix => {
        console.log(`  • ${fix}`);
      });
    }
    
    console.log('\n💡 If you continue to have issues:');
    console.log('  1. Delete the packages/@codeduet-sh directory entirely');
    console.log('  2. Run: npm run verify-packages');
    console.log('  3. Run: npm run build:packages');
    console.log('  4. Contact support if the issue persists');
  }
}

// Run the verification
if (require.main === module) {
  const verifier = new PackageVerifier();
  verifier.verifyAndFix().catch(error => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });
}

module.exports = PackageVerifier;