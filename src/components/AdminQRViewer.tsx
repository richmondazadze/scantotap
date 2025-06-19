import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  QrCode, 
  Download, 
  Printer, 
  User, 
  Phone, 
  Globe,
  Calendar,
  ExternalLink,
  Copy
} from 'lucide-react';
import type { Json } from '@/types/supabase';

interface Profile {
  id: string;
  name: string;
  title?: string;
  bio?: string;
  phone?: string;
  avatar_url?: string;
  slug: string;
  links?: Json;
  created_at: string;
  updated_at: string;
  social_layout_style?: string;
}

interface AdminQRViewerProps {
  profile: Profile;
}

const AdminQRViewer: React.FC<AdminQRViewerProps> = ({ profile }) => {
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [qrSize, setQrSize] = useState(256);
  const qrRef = useRef<SVGSVGElement>(null);

  // Generate profile URL
  const profileUrl = `${window.location.origin}/${profile.slug}`;

  // Parse social links
  const socialLinks = Array.isArray(profile.links) ? profile.links : [];

  const downloadQRCode = async () => {
    const svg = qrRef.current;
    if (!svg) return;

    try {
      // First, load the SVG and convert it to a data URL
      const response = await fetch('/fav.svg');
      const svgText = await response.text();
      
      // Create a blob from the SVG text and convert to data URL
      const svgBlob = new Blob([svgText], { type: 'image/svg+xml' });
      const logoDataURL = URL.createObjectURL(svgBlob);

      // Create a temporary image to ensure the SVG loads properly
      const logoImg = new Image();
      await new Promise((resolve, reject) => {
        logoImg.onload = resolve;
        logoImg.onerror = reject;
        logoImg.src = logoDataURL;
      });

      // Now generate QR code using the qrcode library with the loaded logo
      const { default: QRCode } = await import('qrcode');
      
      const canvas = document.createElement('canvas');
      canvas.width = qrSize;
      canvas.height = qrSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Generate QR code to canvas
      await QRCode.toCanvas(canvas, profileUrl, {
        width: qrSize,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'H',
      });

      // Calculate logo position (center)
      const logoSizeActual = 32;
      const logoX = (qrSize - logoSizeActual) / 2;
      const logoY = (qrSize - logoSizeActual) / 2;

      // Draw white background for logo (excavate effect)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(logoX - 4, logoY - 4, logoSizeActual + 8, logoSizeActual + 8);

      // Draw the logo
      ctx.drawImage(logoImg, logoX, logoY, logoSizeActual, logoSizeActual);

      // Clean up the object URL
      URL.revokeObjectURL(logoDataURL);

      // Download
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `qr-${profile.slug}-${Date.now()}.png`;
      downloadLink.href = pngFile;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      toast.success(`QR Code downloaded for ${profile.name}`);
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to generate QR code image');
    }
  };

  const printQRCode = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Unable to open print window');
      return;
    }

    const svg = qrRef.current;
    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${profile.name}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 40px;
              display: flex;
              flex-direction: column;
              align-items: center;
              background: white;
            }
            .qr-container {
              text-align: center;
              border: 2px solid #e5e7eb;
              border-radius: 12px;
              padding: 30px;
              background: white;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            .profile-info {
              margin-bottom: 20px;
            }
            .profile-name {
              font-size: 24px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 8px;
            }
            .profile-title {
              font-size: 16px;
              color: #6b7280;
              margin-bottom: 4px;
            }
            .profile-url {
              font-size: 14px;
              color: #3b82f6;
              word-break: break-all;
              margin-top: 15px;
            }
            .qr-code {
              margin: 20px 0;
            }
            .footer {
              margin-top: 20px;
              font-size: 12px;
              color: #9ca3af;
            }
            @media print {
              body { margin: 0; padding: 20px; }
              .qr-container { box-shadow: none; border: 1px solid #000; }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div class="profile-info">
              <div class="profile-name">${profile.name}</div>
              ${profile.title ? `<div class="profile-title">${profile.title}</div>` : ''}
            </div>
            <div class="qr-code">
              ${svgString}
            </div>
            <div class="profile-url">${profileUrl}</div>
            <div class="footer">
              Scan to view digital business card • Generated on ${new Date().toLocaleDateString()}
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);

    toast.success(`Print dialog opened for ${profile.name}'s QR code`);
  };

  const copyProfileUrl = () => {
    navigator.clipboard.writeText(profileUrl);
    toast.success('Profile URL copied to clipboard');
  };

  const openProfile = () => {
    window.open(profileUrl, '_blank');
  };

  return (
    <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <QrCode className="h-4 w-4" />
          View QR
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-serif">
            <QrCode className="h-5 w-5 text-scan-blue" />
            QR Code for {profile.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* QR Code Section */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6 flex flex-col items-center">
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <QRCodeSVG
                    ref={qrRef}
                    value={profileUrl}
                    size={qrSize}
                    level="H"
                    includeMargin={true}
                    bgColor="#FFFFFF"
                    fgColor="#000000"
                    imageSettings={{
                      src: "/fav.svg",
                      height: 32,
                      width: 32,
                      excavate: true,
                    }}
                  />
                </div>
                
                <div className="mt-4 space-y-2 w-full">
                  <div className="flex gap-2">
                    <Button onClick={downloadQRCode} className="flex-1 gap-2">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                    <Button onClick={printQRCode} variant="outline" className="flex-1 gap-2">
                      <Printer className="h-4 w-4" />
                      Print
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={copyProfileUrl} variant="outline" size="sm" className="flex-1 gap-2">
                      <Copy className="h-4 w-4" />
                      Copy URL
                    </Button>
                    <Button onClick={openProfile} variant="outline" size="sm" className="flex-1 gap-2">
                      <ExternalLink className="h-4 w-4" />
                      View Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* QR Size Control */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">QR Code Size</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <input
                    type="range"
                    min="128"
                    max="512"
                    step="32"
                    value={qrSize}
                    onChange={(e) => setQrSize(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-500 text-center">{qrSize}px</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Information Section */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-scan-blue" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="font-semibold text-lg">{profile.name}</div>
                  {profile.title && (
                    <div className="text-gray-600 dark:text-gray-400">{profile.title}</div>
                  )}
                </div>

                {profile.bio && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{profile.bio}</div>
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <span className="font-mono text-xs break-all">{profileUrl}</span>
                  </div>
                  
                  {profile.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{profile.phone}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>Created {new Date(profile.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {socialLinks.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Social Links ({socialLinks.length})
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {socialLinks.slice(0, 6).map((link: any, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {link.platform || 'Link'}
                          </Badge>
                        ))}
                        {socialLinks.length > 6 && (
                          <Badge variant="outline" className="text-xs">
                            +{socialLinks.length - 6} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminQRViewer; 