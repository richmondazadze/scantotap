
import { useState, useRef, useEffect } from 'react';
import { ProfileData } from "@/contexts/ProfileContext";
import { useProfile } from '@/contexts/ProfileContext';

interface Card3DProps {
  profileData?: ProfileData | null;
  className?: string;
}

const Card3D = ({ className = "" }: Card3DProps) => {
  const { profile } = useProfile();
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isFlipped) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const cardCenterX = rect.left + rect.width / 2;
    const cardCenterY = rect.top + rect.height / 2;

    const mouseX = e.clientX - cardCenterX;
    const mouseY = e.clientY - cardCenterY;

    // Calculate rotation (limited to subtle movement)
    const rotateY = mouseX * 0.05; // Adjust the multiplier for more/less rotation
    const rotateX = -mouseY * 0.05; // Negative to make the card tilt toward the mouse

    setRotateX(rotateX);
    setRotateY(rotateY);
  };

  const handleMouseLeave = () => {
    // Reset rotation when mouse leaves
    if (!isFlipped) {
      setRotateX(0);
      setRotateY(0);
    }
  };

  const handleClick = () => {
    setIsFlipped(!isFlipped);
  };

  useEffect(() => {
    if (isFlipped) {
      setRotateY(180);
      setRotateX(0);
    } else {
      setRotateY(0);
      setRotateX(0);
    }
  }, [isFlipped]);

  if (!profile) {
    return null;
  }

  return (
    <div className={`perspective-1000 ${className}`} onClick={handleClick}>
      <div 
        ref={cardRef}
        className="relative w-80 h-48 transition-transform duration-700 ease-out transform-3d preserve-3d cursor-pointer"
        style={{ 
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transition: 'transform 0.2s ease-out',
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Front of the card */}
        <div 
          className={`absolute w-full h-full rounded-xl p-6 backface-hidden ${
            isFlipped ? 'opacity-0' : 'opacity-100'
          }`}
          style={{
            background: 'linear-gradient(135deg, #1EAEDB 0%, #33C3F0 100%)',
            boxShadow: '0 8px 32px 0 rgba(30, 174, 219, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-white text-xl">{profile.name}</h3>
              <p className="text-white/80 text-sm mt-1">{profile.title}</p>
            </div>
            <div className="text-white bg-white/20 rounded-lg h-10 w-10 flex items-center justify-center">
              ST
            </div>
          </div>
          
          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
            <div>
              <p className="text-white/80 text-xs">{profile.email}</p>
              <p className="text-white/80 text-xs">{profile.phone}</p>
              <p className="text-white/80 text-xs">{profile.website}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 h-16 w-16">
              {/* QR placeholder */}
              <div className="bg-white h-full w-full grid grid-cols-3 grid-rows-3 gap-0.5 p-0.5 rounded">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className={`bg-scan-blue ${i % 2 === 0 ? 'opacity-80' : 'opacity-50'}`}></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Back of the card */}
        <div 
          className={`absolute w-full h-full rounded-xl p-6 backface-hidden rotate-y-180 ${
            isFlipped ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            background: 'linear-gradient(135deg, #F2FCE2 0%, #D3FCBE 100%)',
            boxShadow: '0 8px 32px 0 rgba(30, 174, 219, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-scan-blue text-4xl font-bold">ScanToTap</div>
            <p className="text-scan-dark/70 text-sm mt-2">Scan to connect</p>
            <div className="mt-4 bg-white rounded-lg p-2 w-24 h-24">
              {/* QR placeholder - larger on the back */}
              <div className="bg-white h-full w-full grid grid-cols-5 grid-rows-5 gap-0.5 rounded">
                {[...Array(25)].map((_, i) => (
                  <div key={i} className={`bg-scan-blue ${i % 3 === 0 ? 'opacity-90' : 'opacity-60'}`}></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
};

export default Card3D;
