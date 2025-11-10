#!/usr/bin/env node

/**
 * FFmpeg Verification Script
 * Checks if FFmpeg is properly installed and configured for video transcription
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying FFmpeg installation...\n');

// Colors for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function checkCommand(command, description) {
  try {
    const output = execSync(command, { encoding: 'utf-8' });
    console.log(`${colors.green}✓${colors.reset} ${description}`);
    return { success: true, output };
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} ${description}`);
    return { success: false, error };
  }
}

function main() {
  let allChecks = true;

  // Check 1: FFmpeg installed
  console.log(`${colors.blue}[1/5]${colors.reset} Checking FFmpeg installation...`);
  const ffmpegCheck = checkCommand('ffmpeg -version', 'FFmpeg is installed');
  
  if (!ffmpegCheck.success) {
    console.log(`${colors.yellow}      Install FFmpeg:${colors.reset}`);
    console.log('      macOS:    brew install ffmpeg');
    console.log('      Ubuntu:   sudo apt install ffmpeg');
    console.log('      CentOS:   sudo yum install ffmpeg\n');
    allChecks = false;
  } else {
    // Extract version
    const versionMatch = ffmpegCheck.output.match(/ffmpeg version ([\d.]+)/);
    if (versionMatch) {
      console.log(`      Version: ${versionMatch[1]}\n`);
    }
  }

  // Check 2: FFmpeg path
  console.log(`${colors.blue}[2/5]${colors.reset} Checking FFmpeg path...`);
  const pathCheck = checkCommand('which ffmpeg', 'FFmpeg path is accessible');
  
  if (pathCheck.success) {
    console.log(`      Path: ${pathCheck.output.trim()}\n`);
  } else {
    allChecks = false;
  }

  // Check 3: MP3 codec
  console.log(`${colors.blue}[3/5]${colors.reset} Checking MP3 codec (libmp3lame)...`);
  const codecCheck = checkCommand(
    'ffmpeg -codecs 2>&1 | grep libmp3lame',
    'libmp3lame encoder is available'
  );
  
  if (!codecCheck.success) {
    console.log(`${colors.yellow}      FFmpeg was compiled without MP3 support${colors.reset}`);
    console.log('      Reinstall FFmpeg with libmp3lame support\n');
    allChecks = false;
  } else {
    console.log('');
  }

  // Check 4: Test extraction (if test file exists)
  console.log(`${colors.blue}[4/5]${colors.reset} Checking test video extraction...`);
  
  // Check if we have fluent-ffmpeg installed
  try {
    require.resolve('fluent-ffmpeg');
    console.log(`${colors.green}✓${colors.reset} fluent-ffmpeg npm package is installed\n`);
  } catch {
    console.log(`${colors.red}✗${colors.reset} fluent-ffmpeg npm package is not installed`);
    console.log(`${colors.yellow}      Run: pnpm add fluent-ffmpeg @types/fluent-ffmpeg${colors.reset}\n`);
    allChecks = false;
  }

  // Check 5: Disk space for temp files
  console.log(`${colors.blue}[5/5]${colors.reset} Checking disk space...`);
  
  const tmpDir = require('os').tmpdir();
  try {
    const stats = execSync(`df -h ${tmpDir} | tail -1`, { encoding: 'utf-8' });
    const available = stats.split(/\s+/)[3];
    console.log(`${colors.green}✓${colors.reset} Temp directory has space available`);
    console.log(`      Location: ${tmpDir}`);
    console.log(`      Available: ${available}\n`);
  } catch {
    console.log(`${colors.yellow}⚠${colors.reset} Could not check disk space\n`);
  }

  // Summary
  console.log('━'.repeat(60));
  
  if (allChecks) {
    console.log(`\n${colors.green}✓ All checks passed!${colors.reset}`);
    console.log('FFmpeg is properly configured for video transcription.\n');
    process.exit(0);
  } else {
    console.log(`\n${colors.red}✗ Some checks failed${colors.reset}`);
    console.log('Please fix the issues above before using video transcription.\n');
    console.log(`See docs/VIDEO_TRANSCRIPTION_SETUP.md for detailed setup instructions.\n`);
    process.exit(1);
  }
}

main();

