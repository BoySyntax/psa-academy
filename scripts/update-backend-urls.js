// Script to update backend URLs when changing domain
const fs = require('fs');
const path = require('path');

// Configuration
const OLD_DOMAIN = 'https://your-old-domain.com';
const NEW_DOMAIN = 'https://psa-academy.com';

// Files to update
const files = [
  'c:/xampp/htdocs/charming_api/teacher/upload-chunk.php',
  'c:/xampp/htdocs/charming_api/login.php',
  'c:/xampp/htdocs/charming_api/register.php',
];

// Update URLs in files
files.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace localhost URLs with new domain
    content = content.replace(
      /http:\/\/localhost(\/charming_api)?/g,
      `${NEW_DOMAIN}/api`
    );
    
    // Replace old domain with new domain
    content = content.replace(OLD_DOMAIN, NEW_DOMAIN);
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${filePath}`);
  } else {
    console.log(`Not found: ${filePath}`);
  }
});

console.log('Domain update complete!');
console.log(`New domain: ${NEW_DOMAIN}`);
console.log('\nRemember to:');
console.log('1. Update VITE_API_BASE_URL in .env');
console.log('2. Restart XAMPP/Apache');
console.log('3. Test all API endpoints');
