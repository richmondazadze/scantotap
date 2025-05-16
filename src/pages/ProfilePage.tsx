
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, Globe, MapPin, Download } from "lucide-react";
import { toast } from "sonner";
import { useProfile } from "@/contexts/ProfileContext";
import type { SocialLink } from "@/contexts/ProfileContext";

const getSocialIcon = (platform: string) => {
  switch(platform.toLowerCase()) {
    case 'twitter':
    case 'x':
      return <i className="text-blue-400">𝕏</i>;
    case 'linkedin':
      return <i className="text-blue-600">in</i>;
    case 'instagram':
      return <i className="text-pink-600">📷</i>;
    case 'github':
      return <i className="text-gray-800">🐙</i>;
    case 'facebook':
      return <i className="text-blue-600">f</i>;
    default:
      return <i className="text-gray-600">🔗</i>;
  }
};

const ProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const { profile } = useProfile();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsLoaded(true);
    }, 600);
  }, []);

  const saveContact = () => {
    toast.success("Contact saved to your device", {
      description: "You can now find this contact in your address book.",
    });
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-scan-blue border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-lg text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen bg-gradient-to-b from-white to-scan-mint/20 transition-opacity duration-500 ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="glass-card p-8 relative mb-6">
          <div className="absolute top-0 right-0 m-4">
            <Button 
              variant="outline" 
              size="sm"
              className="text-xs bg-white/50 hover:bg-white/80"
              onClick={saveContact}
            >
              <Download className="h-3 w-3 mr-1" />
              Save Contact
            </Button>
          </div>
          
          <div className="flex flex-col items-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={profile.avatar} alt={profile.name} />
              <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <h1 className="text-2xl font-bold text-center">{profile.name}</h1>
            <p className="text-gray-600 mt-1">{profile.title}</p>
            
            <div className="w-16 h-0.5 bg-gradient-to-r from-scan-blue to-scan-blue-light my-4"></div>
            
            <p className="text-gray-700 text-center mt-2">{profile.bio}</p>
            
            <div className="mt-6 w-full space-y-3">
              {profile.email && (
                <div className="flex items-center p-3 bg-white/50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-scan-blue/10 flex items-center justify-center mr-3">
                    <Mail className="h-5 w-5 text-scan-blue" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Email</p>
                    <a href={`mailto:${profile.email}`} className="text-gray-800 hover:text-scan-blue">
                      {profile.email}
                    </a>
                  </div>
                </div>
              )}
              
              {profile.phone && (
                <div className="flex items-center p-3 bg-white/50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-scan-blue/10 flex items-center justify-center mr-3">
                    <Phone className="h-5 w-5 text-scan-blue" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Phone</p>
                    <a href={`tel:${profile.phone}`} className="text-gray-800 hover:text-scan-blue">
                      {profile.phone}
                    </a>
                  </div>
                </div>
              )}
              
              {profile.website && (
                <div className="flex items-center p-3 bg-white/50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-scan-blue/10 flex items-center justify-center mr-3">
                    <Globe className="h-5 w-5 text-scan-blue" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Website</p>
                    <a 
                      href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} 
                      className="text-gray-800 hover:text-scan-blue"
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      {profile.website}
                    </a>
                  </div>
                </div>
              )}
              
              {profile.location && (
                <div className="flex items-center p-3 bg-white/50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-scan-blue/10 flex items-center justify-center mr-3">
                    <MapPin className="h-5 w-5 text-scan-blue" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="text-gray-800">{profile.location}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4">Connect with me</h2>
          <div className="grid grid-cols-2 gap-3">
            {profile.links.map((link: SocialLink, index: number) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-3 bg-white/50 rounded-lg hover:bg-scan-blue/10 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-scan-blue/10 flex items-center justify-center mr-3">
                  {getSocialIcon(link.platform)}
                </div>
                <span className="text-gray-800">{link.platform}</span>
              </a>
            ))}
          </div>
        </div>
        
        <div className="text-center mt-10">
          <p className="text-xs text-gray-500">
            Powered by <span className="text-scan-blue font-semibold">ScanToTap</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Create your own digital business card at <a href="/" className="text-scan-blue hover:underline">scantotap.com</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
