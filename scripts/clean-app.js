#!/usr/bin/env node

/**
 * StreetStashed MVP - Comprehensive App Cleaning Script
 * 
 * This script performs a complete cleanup of the application:
 * - Removes unnecessary files and directories
 * - Optimizes code and configurations
 * - Cleans up dependencies
 * - Improves performance
 * - Fixes common issues
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class AppCleaner {
  constructor() {
    this.rootDir = process.cwd();
    this.cleanedFiles = [];
    this.cleanedDirs = [];
    this.optimizations = [];
    this.errors = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : '🔧';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async run() {
    this.log('Starting comprehensive app cleanup...', 'info');
    console.log('='.repeat(80));

    try {
      // 1. Clean build artifacts
      await this.cleanBuildArtifacts();

      // 2. Clean temporary files
      await this.cleanTempFiles();

      // 3. Clean test artifacts
      await this.cleanTestArtifacts();

      // 4. Clean documentation files
      await this.cleanDocumentation();

      // 5. Clean configuration files
      await this.cleanConfigFiles();

      // 6. Optimize package.json
      await this.optimizePackageJson();

      // 7. Clean up dependencies
      await this.cleanDependencies();

      // 8. Clean up code files
      await this.cleanCodeFiles();

      // 9. Generate cleanup report
      await this.generateReport();

    } catch (error) {
      this.log(`Cleanup failed: ${error.message}`, 'error');
      this.errors.push(error.message);
    }
  }

  async cleanBuildArtifacts() {
    this.log('Cleaning build artifacts...', 'info');

    const buildDirs = [
      '.next',
      'dist',
      'build',
      'out',
      'coverage',
      'node_modules/.cache',
    ];

    for (const dir of buildDirs) {
      const fullPath = path.join(this.rootDir, dir);
      if (fs.existsSync(fullPath)) {
        try {
          fs.rmSync(fullPath, { recursive: true, force: true });
          this.cleanedDirs.push(dir);
          this.log(`Removed build directory: ${dir}`, 'success');
        } catch (error) {
          this.log(`Failed to remove ${dir}: ${error.message}`, 'error');
        }
      }
    }
  }

  async cleanTempFiles() {
    this.log('Cleaning temporary files...', 'info');

    const tempFiles = [
      '.DS_Store',
      'Thumbs.db',
      '*.log',
      '*.tmp',
      '*.temp',
      '.env.local',
      '.env.development.local',
      '.env.test.local',
      '.env.production.local',
    ];

    for (const pattern of tempFiles) {
      try {
        if (pattern.includes('*')) {
          // Handle glob patterns
          const files = this.findFilesByPattern(pattern);
          for (const file of files) {
            fs.unlinkSync(file);
            this.cleanedFiles.push(file);
            this.log(`Removed temp file: ${file}`, 'success');
          }
        } else {
          const fullPath = path.join(this.rootDir, pattern);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            this.cleanedFiles.push(pattern);
            this.log(`Removed temp file: ${pattern}`, 'success');
          }
        }
      } catch (error) {
        this.log(`Failed to remove ${pattern}: ${error.message}`, 'error');
      }
    }
  }

  async cleanTestArtifacts() {
    this.log('Cleaning test artifacts...', 'info');

    const testDirs = [
      'test-reports',
      '__snapshots__',
      '.nyc_output',
    ];

    for (const dir of testDirs) {
      const fullPath = path.join(this.rootDir, dir);
      if (fs.existsSync(fullPath)) {
        try {
          fs.rmSync(fullPath, { recursive: true, force: true });
          this.cleanedDirs.push(dir);
          this.log(`Removed test directory: ${dir}`, 'success');
        } catch (error) {
          this.log(`Failed to remove ${dir}: ${error.message}`, 'error');
        }
      }
    }

    // Clean test files that shouldn't be in production
    const testFiles = [
      'test-github-actions.md',
      'test-suite.md',
      'test-reports',
    ];

    for (const file of testFiles) {
      const fullPath = path.join(this.rootDir, file);
      if (fs.existsSync(fullPath)) {
        try {
          if (fs.statSync(fullPath).isDirectory()) {
            fs.rmSync(fullPath, { recursive: true, force: true });
            this.cleanedDirs.push(file);
          } else {
            fs.unlinkSync(fullPath);
            this.cleanedFiles.push(file);
          }
          this.log(`Removed test file: ${file}`, 'success');
        } catch (error) {
          this.log(`Failed to remove ${file}: ${error.message}`, 'error');
        }
      }
    }
  }

  async cleanDocumentation() {
    this.log('Cleaning documentation files...', 'info');

    const docsToClean = [
      'DEPLOYMENT-STATUS.md',
      'DEPLOYMENT-COMPLETE.md',
      'FINAL_AUDIT_REPORT.md',
      'FINAL_DEPLOYMENT_CHECKLIST.md',
      'LAUNCH_READY_CHECKLIST.md',
      'TESTING_ACHIEVEMENTS.md',
      'database-audit-report.md',
      'DRIVER_SYSTEM_README.md',
      'FEE_SYSTEM_README.md',
      'ONBOARDING_SETUP_README.md',
      'maintenance-setup-guide.md',
      'test-github-actions.md',
      'test-suite.md',
      'testing-suite.md',
    ];

    for (const doc of docsToClean) {
      const fullPath = path.join(this.rootDir, doc);
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
          this.cleanedFiles.push(doc);
          this.log(`Removed documentation: ${doc}`, 'success');
        } catch (error) {
          this.log(`Failed to remove ${doc}: ${error.message}`, 'error');
        }
      }
    }
  }

  async cleanConfigFiles() {
    this.log('Cleaning configuration files...', 'info');

    const configFiles = [
      'fix_double_public.py',
      'fix_malformed_migrations.py',
      'fix_migrations.py',
      'fix-database-schema.sql',
      'MANUAL_MIGRATION.sql',
      'optimized-queries-examples.ts',
    ];

    for (const file of configFiles) {
      const fullPath = path.join(this.rootDir, file);
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
          this.cleanedFiles.push(file);
          this.log(`Removed config file: ${file}`, 'success');
        } catch (error) {
          this.log(`Failed to remove ${file}: ${error.message}`, 'error');
        }
      }
    }
  }

  async optimizePackageJson() {
    this.log('Optimizing package.json...', 'info');

    try {
      const packagePath = path.join(this.rootDir, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

      // Remove unnecessary scripts
      const scriptsToRemove = [
        'test:coverage',
        'test:watch',
        'test:debug',
        'build:analyze',
        'build:clean',
      ];

      scriptsToRemove.forEach(script => {
        if (packageJson.scripts[script]) {
          delete packageJson.scripts[script];
          this.optimizations.push(`Removed script: ${script}`);
        }
      });

      // Write optimized package.json
      fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
      this.log('Optimized package.json', 'success');

    } catch (error) {
      this.log(`Failed to optimize package.json: ${error.message}`, 'error');
    }
  }

  async cleanDependencies() {
    this.log('Cleaning dependencies...', 'info');

    try {
      // Remove node_modules and reinstall
      const nodeModulesPath = path.join(this.rootDir, 'node_modules');
      if (fs.existsSync(nodeModulesPath)) {
        fs.rmSync(nodeModulesPath, { recursive: true, force: true });
        this.cleanedDirs.push('node_modules');
        this.log('Removed node_modules', 'success');
      }

      // Clean package-lock files
      const lockFiles = ['package-lock.json', 'yarn.lock'];
      for (const lockFile of lockFiles) {
        const lockPath = path.join(this.rootDir, lockFile);
        if (fs.existsSync(lockPath)) {
          fs.unlinkSync(lockPath);
          this.cleanedFiles.push(lockFile);
          this.log(`Removed lock file: ${lockFile}`, 'success');
        }
      }

      // Reinstall dependencies
      this.log('Reinstalling dependencies...', 'info');
      execSync('pnpm install', { stdio: 'inherit' });
      this.log('Dependencies reinstalled', 'success');

    } catch (error) {
      this.log(`Failed to clean dependencies: ${error.message}`, 'error');
    }
  }

  async cleanCodeFiles() {
    this.log('Cleaning code files...', 'info');

    // Remove console.log statements from production code
    const codeDirs = ['app', 'components', 'lib', 'hooks'];
    
    for (const dir of codeDirs) {
      const fullPath = path.join(this.rootDir, dir);
      if (fs.existsSync(fullPath)) {
        await this.cleanConsoleLogs(fullPath);
      }
    }

    // Remove unused imports
    await this.removeUnusedImports();
  }

  async cleanConsoleLogs(dirPath) {
    const files = this.findFilesByPattern('*.{ts,tsx,js,jsx}', dirPath);
    
    for (const file of files) {
      try {
        let content = fs.readFileSync(file, 'utf8');
        const originalContent = content;

        // Remove console.log statements (but keep console.error and console.warn)
        content = content.replace(/console\.log\([^)]*\);?\s*/g, '');
        content = content.replace(/console\.debug\([^)]*\);?\s*/g, '');

        if (content !== originalContent) {
          fs.writeFileSync(file, content);
          this.optimizations.push(`Removed console.log from: ${file}`);
        }
      } catch (error) {
        this.log(`Failed to clean console.logs in ${file}: ${error.message}`, 'error');
      }
    }
  }

  async removeUnusedImports() {
    this.log('Removing unused imports...', 'info');

    try {
      // Use ESLint to fix unused imports
      execSync('pnpm lint --fix', { stdio: 'inherit' });
      this.optimizations.push('Fixed unused imports with ESLint');
    } catch (error) {
      this.log(`Failed to remove unused imports: ${error.message}`, 'error');
    }
  }

  findFilesByPattern(pattern, baseDir = this.rootDir) {
    const files = [];
    
    function walkDir(dir) {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          walkDir(fullPath);
        } else if (stat.isFile()) {
          // Simple pattern matching
          if (pattern.includes('*')) {
            const regex = new RegExp(pattern.replace('*', '.*'));
            if (regex.test(item)) {
              files.push(fullPath);
            }
          }
        }
      }
    }

    walkDir(baseDir);
    return files;
  }

  async generateReport() {
    this.log('Generating cleanup report...', 'info');

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        filesRemoved: this.cleanedFiles.length,
        directoriesRemoved: this.cleanedDirs.length,
        optimizations: this.optimizations.length,
        errors: this.errors.length,
      },
      details: {
        cleanedFiles: this.cleanedFiles,
        cleanedDirectories: this.cleanedDirs,
        optimizations: this.optimizations,
        errors: this.errors,
      },
    };

    const reportPath = path.join(this.rootDir, 'cleanup-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log('\n' + '='.repeat(80));
    console.log('🧹 CLEANUP COMPLETE');
    console.log('='.repeat(80));
    console.log(`📁 Files removed: ${report.summary.filesRemoved}`);
    console.log(`📂 Directories removed: ${report.summary.directoriesRemoved}`);
    console.log(`⚡ Optimizations: ${report.summary.optimizations}`);
    console.log(`❌ Errors: ${report.summary.errors}`);
    console.log(`📊 Report saved to: cleanup-report.json`);
    console.log('='.repeat(80));

    this.log('Cleanup completed successfully!', 'success');
  }
}

// Run the cleaner
if (require.main === module) {
  const cleaner = new AppCleaner();
  cleaner.run().catch(console.error);
}

module.exports = AppCleaner;
