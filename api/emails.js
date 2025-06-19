import { Resend } from 'resend';

const resend = new Resend(process.env.VITE_RESEND_API_KEY);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, to, data } = req.body;

    if (!type || !to || !data) {
      return res.status(400).json({ error: 'Missing required fields: type, to, data' });
    }

    let subject, html;

    switch (type) {
      case 'welcome':
        subject = 'Welcome to SCAN2TAP!';
        html = generateWelcomeEmail(data);
        break;
      case 'onboarding-complete':
        subject = 'Welcome to SCAN2TAP - Your Profile is Ready!';
        html = generateOnboardingCompleteEmail(data);
        break;
      case 'username-claimed':
        subject = 'Username Claimed - SCAN2TAP';
        html = generateUsernameClaimedEmail(data);
        break;
      default:
        return res.status(400).json({ error: 'Invalid email type' });
    }

    const result = await resend.emails.send({
      from: 'SCAN2TAP <scan2tap@richverseecotech.com>',
      to: [to],
      subject: subject,
      html: html,
    });

    return res.status(200).json({ success: true, id: result.id });
  } catch (error) {
    console.error('Email sending error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}

function generateWelcomeEmail(data) {
  const { userName, profileUrl } = data;
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to SCAN2TAP</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
          <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
            SCAN<span style="color: #60a5fa; background: linear-gradient(45deg, #3b82f6, #60a5fa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 2px 4px rgba(59,130,246,0.5);">2</span>TAP
          </h1>
          <p style="margin: 10px 0 0 0; color: #e2e8f0; font-size: 16px;">Your Digital Identity, One Tap Away</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #1e293b; font-size: 24px; margin-bottom: 20px;">Welcome to SCAN2TAP, ${userName}!</h2>
          
          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Thank you for joining SCAN2TAP! We're excited to help you create your digital presence and connect with others effortlessly.
          </p>
          
          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            Get started by completing your profile setup and customizing your digital business card.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${profileUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
              Complete Your Profile
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; color: #64748b; font-size: 14px;">
            © 2024 SCAN2TAP. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateOnboardingCompleteEmail(data) {
  const { userName, profileUrl } = data;
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Profile Ready - SCAN2TAP</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
          <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
            SCAN<span style="color: #60a5fa; background: linear-gradient(45deg, #3b82f6, #60a5fa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 2px 4px rgba(59,130,246,0.5);">2</span>TAP
          </h1>
          <p style="margin: 10px 0 0 0; color: #e2e8f0; font-size: 16px;">Your Digital Identity, One Tap Away</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #1e293b; font-size: 24px; margin-bottom: 20px;">🎉 Congratulations, ${userName}!</h2>
          
          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Your SCAN2TAP profile is now complete and ready to share! You've successfully set up your digital business card.
          </p>
          
          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            Start networking and sharing your professional information with just one tap. Your digital identity is now at your fingertips!
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${profileUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
              View Your Profile
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; color: #64748b; font-size: 14px;">
            © 2024 SCAN2TAP. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateUsernameClaimedEmail(data) {
  const { userName, profileUrl } = data;
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Username Claimed - SCAN2TAP</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
          <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
            SCAN<span style="color: #60a5fa; background: linear-gradient(45deg, #3b82f6, #60a5fa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 2px 4px rgba(59,130,246,0.5);">2</span>TAP
          </h1>
          <p style="margin: 10px 0 0 0; color: #e2e8f0; font-size: 16px;">Your Digital Identity, One Tap Away</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #1e293b; font-size: 24px; margin-bottom: 20px;">✅ Username Successfully Claimed!</h2>
          
          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Great news, ${userName}! Your username has been successfully claimed and your profile is now live.
          </p>
          
          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            You can now share your unique SCAN2TAP profile with others and start building your digital network.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${profileUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
              View Your Profile
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; color: #64748b; font-size: 14px;">
            © 2024 SCAN2TAP. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
} 