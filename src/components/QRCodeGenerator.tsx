import React, { useImperativeHandle, forwardRef, useRef, useState, useEffect } from "react";
import { QRCodeSVG } from 'qrcode.react';
import { Button } from "@/components/ui/button";
import { Download, Settings2, Save, Undo2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

interface QRCodeGeneratorProps {
  profileUrl: string;
  username: string;
}

const DEFAULT_STYLE = {
  size: 256,
  fgColor: "#000000",
  bgColor: "#FFFFFF",
  logoSize: 40,
};

const LOCAL_STORAGE_KEY = "scan2tap_qr_style";

const QRCodeGenerator = forwardRef(function QRCodeGenerator(
  { profileUrl, username }: QRCodeGeneratorProps,
  ref
) {
  const [size, setSize] = useState(DEFAULT_STYLE.size);
  const [fgColor, setFgColor] = useState(DEFAULT_STYLE.fgColor);
  const [bgColor, setBgColor] = useState(DEFAULT_STYLE.bgColor);
  const [logoSize, setLogoSize] = useState(DEFAULT_STYLE.logoSize);
  const [showSettings, setShowSettings] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);

  // Load saved style on mount
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const style = JSON.parse(saved);
        if (style.size) setSize(style.size);
        if (style.fgColor) setFgColor(style.fgColor);
        if (style.bgColor) setBgColor(style.bgColor);
        if (style.logoSize) setLogoSize(style.logoSize);
      } catch {}
    }
  }, []);

  // Save style to localStorage
  const saveStyle = () => {
    const style = { size, fgColor, bgColor, logoSize };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(style));
    toast.success("QR code style saved!");
  };

  // Reset to default style
  const resetStyle = () => {
    setSize(DEFAULT_STYLE.size);
    setFgColor(DEFAULT_STYLE.fgColor);
    setBgColor(DEFAULT_STYLE.bgColor);
    setLogoSize(DEFAULT_STYLE.logoSize);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    toast.success("QR code style reset to default.");
  };

  const downloadQRCode = async () => {
    const svg = svgRef.current;
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
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Generate QR code to canvas
      await QRCode.toCanvas(canvas, profileUrl, {
        width: size,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: 'H',
      });

      // Calculate logo position (center)
      const logoSizeActual = logoSize;
      const logoX = (size - logoSizeActual) / 2;
      const logoY = (size - logoSizeActual) / 2;

      // Draw white background for logo (excavate effect)
      ctx.fillStyle = bgColor;
      ctx.fillRect(logoX - 4, logoY - 4, logoSizeActual + 8, logoSizeActual + 8);

      // Draw the logo
      ctx.drawImage(logoImg, logoX, logoY, logoSizeActual, logoSizeActual);

      // Clean up the object URL
      URL.revokeObjectURL(logoDataURL);

      // Download
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `scan2tap-${username}.png`;
      downloadLink.href = pngFile;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      toast.success('QR Code downloaded', {
        description: 'You can now share your digital card with others.',
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to generate QR code image.');
    }
  };

  useImperativeHandle(ref, () => ({
    downloadQRCode,
  }));

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="p-4 bg-white rounded-lg shadow-lg relative">
        <QRCodeSVG
          ref={svgRef}
          id="qr-code-svg"
          value={profileUrl}
          size={size}
          level="H"
          includeMargin={true}
          className="rounded-lg"
          bgColor={bgColor}
          fgColor={fgColor}
          title={`Scan2Tap QR Code for ${username}`}
          imageSettings={{
            src: "/fav.svg",
            height: logoSize,
            width: logoSize,
            excavate: true,
          }}
        />
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-white/80 hover:bg-white"
            >
              <Settings2 className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Customize QR Code</DialogTitle>
              <DialogDescription>
                Adjust the QR code's appearance to match your preferences.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label>Size</Label>
                <Slider
                  value={[size]}
                  onValueChange={([value]) => setSize(value)}
                  min={128}
                  max={512}
                  step={8}
                />
                <div className="text-sm text-gray-500">{size}px</div>
              </div>
              
              <div className="space-y-2">
                <Label>Foreground Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-12 h-8 p-1"
                  />
                  <Input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-12 h-8 p-1"
                  />
                  <Input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Logo Size</Label>
                <Slider
                  value={[logoSize]}
                  onValueChange={([value]) => setLogoSize(value)}
                  min={20}
                  max={80}
                  step={4}
                />
                <div className="text-sm text-gray-500">{logoSize}px</div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="secondary" onClick={saveStyle} className="flex items-center gap-2">
                  <Save className="h-4 w-4" /> Save Style
                </Button>
                <Button variant="outline" onClick={resetStyle} className="flex items-center gap-2">
                  <Undo2 className="h-4 w-4" /> Reset to Default
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
});

export default QRCodeGenerator; 