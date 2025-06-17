import { useProfile } from "@/contexts/ProfileContext";
import QRCodeGenerator from "@/components/QRCodeGenerator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const QRCodePage = () => {
  const { profile } = useProfile();
  const profileUrl = `${window.location.origin}/${profile?.slug}`;

  return (
    <div className="container max-w-4xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Your QR Code</CardTitle>
          <CardDescription>
            Share your digital business card with others by scanning this QR code
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <QRCodeGenerator 
              profileUrl={profileUrl} 
              username={profile?.slug || 'profile'} 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRCodePage; 