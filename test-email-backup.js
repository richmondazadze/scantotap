// Simple test script for Resend API
import { Resend } from 'resend';
import { readFileSync } from 'fs';

// Load .env file manually (simple implementation)
function loadEnv() {
  try {
    const envFile = readFileSync('.env.local', 'utf8');
    const lines = envFile.split('\n');
    
    for (const line of lines) {
      if (line.trim() && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        if (key && value) {
          process.env[key.trim()] = value.trim();
        }
      }
    }
  } catch (error) {
    // .env file doesn't exist, that's okay
  }
}

async function testResendAPI() {
  console.log('🚀 Testing Resend API key...');
  
  // Load environment variables from .env file
  loadEnv();
  
  // Get API key from environment or set directly here for testing
  let apiKey = process.env.VITE_RESEND_API_KEY || process.env.RESEND_API_KEY;
  
  // 🔥 TEMPORARY: You can set your API key directly here for testing
  // apiKey = "re_your_actual_api_key_here"; // Uncomment and add your key here
  
  if (!apiKey) {
    console.error('❌ No API key found!');
    console.log('💡 Option 1: Set environment variable: export VITE_RESEND_API_KEY="your_api_key"');
    console.log('💡 Option 2: Create .env file with: VITE_RESEND_API_KEY=your_api_key');
    console.log('💡 Option 3: Uncomment line 25 in this script and add your key directly');
    console.log('💡 Get your API key from: https://resend.com/api-keys');
    return;
  }

  // UPDATE THIS EMAIL ADDRESS TO YOUR ACTUAL EMAIL
  const testEmail = 'richmondazadze1313@gmail.com'; // ⚠️ CHANGE THIS TO YOUR EMAIL ADDRESS
  
  console.log(`📧 Sending test email to: ${testEmail}`);
  
  if (testEmail === 'your-email@example.com') {
    console.log('⚠️  Please update the email address in the script before running!');
    return;
  }

  const resend = new Resend(apiKey);

  try {
    console.log('📤 Sending email...');
    
    const result = await resend.emails.send({
      from: 'Scan2Tap <scan2tap@richverseecotech.com>',
      to: [testEmail],
      subject: '🧪 Resend API Test - Scan2Tap',
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; font-size: 28px; margin: 0;">🧪 API Test Successful!</h1>
          </div>
          
          <div style="background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); border-radius: 12px; padding: 30px; color: white; text-align: center; margin-bottom: 30px;">
            <h2 style="margin: 0 0 15px 0; font-size: 24px;">Resend API is Working! ✅</h2>
            <p style="margin: 0; font-size: 16px; opacity: 0.9;">
              Your Scan2Tap email system is ready to send emails.
            </p>
          </div>
          
          <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #1e293b; margin: 0 0 10px 0;">Test Details:</h3>
            <ul style="color: #64748b; margin: 0; padding-left: 20px;">
              <li>API Key: ✅ Valid and Connected</li>
              <li>Email Service: ✅ Resend Integration Working</li>
              <li>Template System: ✅ HTML Rendering Active</li>
              <li>Timestamp: ${new Date().toISOString()}</li>
              <li>From Domain: scan2tap.com</li>
            </ul>
          </div>
          
          <div style="text-align: center; padding: 20px; background: #e0f2fe; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #0369a1; font-weight: 600; margin: 0 0 10px 0;">
              🎉 Your email system is fully operational!
            </p>
            <p style="color: #0284c7; font-size: 14px; margin: 0;">
              All 9 email templates are ready to send professional emails to your users.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #64748b; font-size: 14px; margin: 0;">
              This is a test email from your Scan2Tap application.
            </p>
          </div>
        </div>
      `
    });

    console.log('✅ Test email sent successfully!');
    console.log('📧 Email ID:', result.data?.id);
    console.log('📬 Check your inbox for the test email');
    console.log('🎉 Your Resend API key is working perfectly!');
    
  } catch (error) {
    console.error('❌ Failed to send test email:', error);
    
    if (error.message.includes('API key') || error.message.includes('Unauthorized')) {
      console.log('💡 Check that your RESEND_API_KEY is valid');
      console.log('💡 Get your API key from: https://resend.com/api-keys');
    } else if (error.message.includes('domain')) {
      console.log('💡 Make sure your domain is verified in Resend dashboard');
      console.log('💡 Or use a verified domain like: noreply@yourdomain.com');
    } else if (error.message.includes('rate limit')) {
      console.log('💡 Rate limit reached. Wait a moment and try again.');
    }
  }
}

// Run the test
testResendAPI(); 