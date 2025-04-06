// deploy.js - Simple deployment helper script
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

console.log(`${colors.cyan}=== SPCF Voting System - Production Deployment ===${colors.reset}`);
console.log(`${colors.yellow}Starting deployment process...${colors.reset}`);

try {
  // Clean the dist directory if it exists
  console.log(`\n${colors.blue}Step 1: Cleaning distribution directory...${colors.reset}`);
  execSync('rm -rf dist', { stdio: 'inherit' });
  
  // Install dependencies
  console.log(`\n${colors.blue}Step 2: Installing dependencies...${colors.reset}`);
  execSync('npm install --production', { stdio: 'inherit' });
  
  // Build the application
  console.log(`\n${colors.blue}Step 3: Building the application...${colors.reset}`);
  execSync('npm run build', { stdio: 'inherit' });
  
  // Create a .htaccess file for the Apache server (if needed)
  console.log(`\n${colors.blue}Step 4: Creating .htaccess file...${colors.reset}`);
  const htaccessContent = `
# Handle Single Page Application routing
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Cache control for static assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access 1 year"
  ExpiresByType image/jpeg "access 1 year"
  ExpiresByType image/gif "access 1 year"
  ExpiresByType image/png "access 1 year"
  ExpiresByType image/webp "access 1 year"
  ExpiresByType text/css "access 1 month"
  ExpiresByType text/html "access 1 day"
  ExpiresByType application/pdf "access 1 month"
  ExpiresByType application/javascript "access 1 month"
  ExpiresByType application/x-javascript "access 1 month"
  ExpiresByType application/x-shockwave-flash "access 1 month"
  ExpiresByType image/x-icon "access 1 year"
  ExpiresDefault "access 1 month"
</IfModule>
  `;
  
  const fs = require('fs');
  fs.writeFileSync('dist/.htaccess', htaccessContent);
  console.log(`${colors.green}Created .htaccess file in dist directory${colors.reset}`);
  
  console.log(`\n${colors.green}=== Build completed successfully! ===${colors.reset}`);
  console.log(`\nTo deploy to your server:`);
  console.log(`1. Copy the contents of the ${colors.yellow}dist/${colors.reset} directory to your web server`);
  console.log(`2. Ensure your Laravel backend is properly configured at ${colors.yellow}http://192.168.100.10/backend${colors.reset}`);
  console.log(`3. The frontend should be accessible at ${colors.yellow}http://192.168.100.10${colors.reset}`);
  
} catch (error) {
  console.error(`\n${colors.red}Build failed:${colors.reset}`, error.message);
  process.exit(1);
} 