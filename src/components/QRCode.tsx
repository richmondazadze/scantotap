
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Copy } from "lucide-react";

interface QRCodeProps {
  profileId: string;
  size?: number;
  className?: string;
}

const QRCode = ({ profileId, size = 200, className = "" }: QRCodeProps) => {
  const [qrUrl, setQrUrl] = useState<string>("");
  
  useEffect(() => {
    // Generate QR code using Google Charts API
    const baseUrl = window.location.origin;
    const profileUrl = `${baseUrl}/profile/${profileId}`;
    const encodedUrl = encodeURIComponent(profileUrl);
    const qrCodeApi = `https://chart.googleapis.com/chart?cht=qr&chl=${encodedUrl}&chs=${size}x${size}&chco=1EAEDB`;
    
    setQrUrl(qrCodeApi);
  }, [profileId, size]);

  const copyProfileUrl = () => {
    const baseUrl = window.location.origin;
    const profileUrl = `${baseUrl}/profile/${profileId}`;
    
    navigator.clipboard.writeText(profileUrl)
      .then(() => {
        toast.success("Profile URL copied to clipboard");
      })
      .catch((err) => {
        toast.error("Failed to copy URL");
        console.error("Copy failed: ", err);
      });
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="glass-card p-4 animate-float">
        <img 
          src={qrUrl} 
          alt="QR Code for your profile" 
          width={size} 
          height={size} 
          className="rounded-lg" 
        />
      </div>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4 flex items-center gap-2"
              onClick={copyProfileUrl}
            >
              <Copy size={14} />
              <span>Copy Profile URL</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Copy your profile link to share</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default QRCode;
