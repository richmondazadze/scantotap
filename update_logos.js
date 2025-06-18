const fs = require('fs');
const path = require('path');

console.log('🎨 Updating all email templates with glossy 3D SCAN2TAP text...');

// Files to update
const files = [
  'src/services/contactEmailService.ts',
  'src/services/emailService.ts', 
  'api/contact.js'
];

files.forEach(filePath => {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  ${filePath} not found, skipping...`);
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    // 1. Replace contact email service logo containers
    if (content.includes('logo-container')) {
      content = content.replace(
        /<div class="logo-container">[\s\S]*?<\/div>/g,
        `      <div class="logo-text-container">
        <div class="logo-text">
          <span class="logo-letter logo-letter-normal">SCAN</span><span class="logo-letter logo-letter-2">2</span><span class="logo-letter logo-letter-normal">TAP</span>
        </div>
      </div>`
      );
      updated = true;
    }
    
    // 2. Replace simple S2T logos in API contact
    if (content.includes('<div class="logo">S2T</div>')) {
      content = content.replace(
        /<div class="logo">S2T<\/div>/g,
        `<div class="logo-text">
          <span class="logo-letter logo-letter-normal">SCAN</span><span class="logo-letter logo-letter-2">2</span><span class="logo-letter logo-letter-normal">TAP</span>
        </div>`
      );
      updated = true;
    }
    
    // 3. Replace SVG logos in main email service
    if (content.includes('<svg width="32" height="32"')) {
      content = content.replace(
        /<svg width="32" height="32"[\s\S]*?<\/svg>/g,
        `<div class="logo-text" style="font-size: 24px; font-weight: 900; letter-spacing: 1px;">
          <span class="logo-letter-normal">SCAN</span><span class="logo-letter-2">2</span><span class="logo-letter-normal">TAP</span>
        </div>`
      );
      updated = true;
    }
    
    // Add CSS for glossy text
    if (updated && !content.includes('logo-text-container')) {
      const glossyCSS = `
    /* Glossy 3D SCAN2TAP Text */
    .logo-text-container, .logo-text {
      text-align: center !important;
    }
    
    .logo-text {
      font-family: 'Roboto', Arial, sans-serif !important;
      font-size: 48px !important;
      font-weight: 900 !important;
      line-height: 1 !important;
      letter-spacing: 2px !important;
      margin: 0 !important;
      padding: 16px 24px !important;
      background: rgba(255,255,255,0.15) !important;
      border-radius: 16px !important;
      border: 2px solid rgba(255,255,255,0.3) !important;
      box-shadow: 
        0 8px 32px rgba(0,0,0,0.2) !important,
        inset 0 1px 0 rgba(255,255,255,0.4) !important;
      display: inline-block !important;
    }
    
    .logo-letter-normal {
      color: #ffffff !important;
      text-shadow: 
        0 1px 0 rgba(255,255,255,0.8) !important,
        0 2px 3px rgba(0,0,0,0.3) !important;
    }
    
    .logo-letter-2 {
      color: #3b82f6 !important;
      text-shadow: 
        0 1px 0 rgba(59, 130, 246, 0.8) !important,
        0 2px 4px rgba(29, 78, 216, 0.6) !important;
    }`;
      
      // Insert CSS after first style tag
      content = content.replace(/(<style[^>]*>)/, `$1${glossyCSS}`);
    }
    
    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated ${filePath}`);
    } else {
      console.log(`ℹ️  No changes needed for ${filePath}`);
    }
    
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
});

console.log('🎉 All email templates updated with glossy 3D SCAN2TAP text!');
console.log('🔹 "SCAN" and "TAP" - White glossy 3D text');
console.log('🔹 "2" - Blue gradient glossy 3D text'); 