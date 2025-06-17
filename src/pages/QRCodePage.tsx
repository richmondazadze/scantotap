import { useProfile } from '@/contexts/ProfileContext';
import QRCode from '@/components/QRCode';

export default function QRCodePage() {
  const { profile } = useProfile();
  if (!profile) return null;
  const profileUrl = `${window.location.origin}/${profile.slug || profile.id}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-scan-mint/20">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-lg w-full flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-2 text-gray-900">Your QR Code</h2>
        <p className="text-gray-500 mb-8">Share this QR code to connect instantly</p>
        <div className="mb-8">
          <QRCode profileId={profile.slug || profile.id} size={200} />
        </div>
        <div className="text-center text-gray-700 text-base">
          This QR code links directly to your profile at
          <br />
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline break-all"
          >
            {profileUrl}
          </a>
        </div>
      </div>
    </div>
  );
} 