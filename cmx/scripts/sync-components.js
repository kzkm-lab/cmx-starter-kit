#!/usr/bin/env node

/**
 * Component Sync Script
 *
 * Syncs custom component definitions from cmx/components/ to CMX SDK API.
 *
 * Usage:
 *   node cmx/scripts/sync-components.js [environment]
 *
 * Environment:
 *   - If not specified, uses current git branch to determine environment:
 *     - main -> production
 *     - develop -> staging
 *     - PR branches -> preview/pr-{number}
 *   - Can be explicitly set: production, staging, preview/pr-123
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const COMPONENTS_DIR = path.join(__dirname, '../components');
const API_URL = process.env.CMX_API_URL;
const API_KEY = process.env.CMX_API_KEY;

// Get environment from argument or git branch
function getEnvironment() {
  const arg = process.argv[2];
  if (arg) return arg;

  try {
    const branch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim();

    if (branch === 'main') return 'production';
    if (branch === 'develop') return 'staging';

    // Check if PR branch (preview/pr-123 format)
    const prMatch = branch.match(/^(?:feature|fix)\/(.+)$/);
    if (prMatch) {
      // Try to get PR number from GitHub if available
      try {
        const prNumber = execSync(
          `gh pr view --json number -q .number`,
          { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }
        ).trim();
        if (prNumber) {
          return `preview/pr-${prNumber}`;
        }
      } catch (e) {
        // GitHub CLI not available or not in a PR context
      }
    }

    // Default to preview with branch name
    return `preview/${branch.replace(/[^a-zA-Z0-9-]/g, '-')}`;
  } catch (e) {
    console.error('Failed to detect git branch, using production');
    return 'production';
  }
}

// Read all component definition files
function readComponentDefinitions(environment) {
  if (!fs.existsSync(COMPONENTS_DIR)) {
    console.log('No components directory found at cmx/components/');
    return [];
  }

  const files = fs.readdirSync(COMPONENTS_DIR).filter(f => f.endsWith('.json'));

  if (files.length === 0) {
    console.log('No component definition files found');
    return [];
  }

  const components = [];

  for (const file of files) {
    try {
      const filePath = path.join(COMPONENTS_DIR, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const component = JSON.parse(content);

      // Set environment if not specified in file
      if (!component.environment) {
        component.environment = environment;
      }

      // Validate required fields
      if (!component.name || !component.displayName) {
        console.warn(`⚠️  Skipping ${file}: missing required fields (name, displayName)`);
        continue;
      }

      // Ensure propsSchema exists
      component.propsSchema = component.propsSchema || {};
      component.examples = component.examples || [];

      components.push(component);
    } catch (error) {
      console.error(`❌ Error reading ${file}:`, error.message);
    }
  }

  return components;
}

// Sync components to CMX SDK API
async function syncComponents(components, environment) {
  if (!API_URL || !API_KEY) {
    console.error('❌ CMX_API_URL and CMX_API_KEY environment variables are required');
    process.exit(1);
  }

  console.log(`🔄 Syncing ${components.length} components to ${environment}...`);

  try {
    const response = await fetch(`${API_URL}/api/v1/sdk/manage/components/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({ components }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log(`✅ Success: ${result.message || 'Components synced'}`);
    if (result.created) console.log(`   📝 Created: ${result.created}`);
    if (result.updated) console.log(`   🔄 Updated: ${result.updated}`);
  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    process.exit(1);
  }
}

// Main
async function main() {
  const environment = getEnvironment();
  console.log(`🌍 Environment: ${environment}`);

  const components = readComponentDefinitions(environment);

  if (components.length === 0) {
    console.log('✨ No components to sync');
    return;
  }

  console.log(`📦 Found ${components.length} components:`);
  components.forEach(c => {
    console.log(`   - ${c.name} (${c.displayName})`);
  });

  await syncComponents(components, environment);
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
