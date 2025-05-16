
import React, { createContext, useState, useContext } from "react";

export type SocialLink = {
  platform: string;
  url: string;
  icon: string;
};

export type ProfileData = {
  id: string;
  name: string;
  title: string;
  bio: string;
  avatar: string;
  links: SocialLink[];
  email: string;
  phone: string;
  website: string;
  location: string;
};

type ProfileContextType = {
  profile: ProfileData | null;
  updateProfile: (data: Partial<ProfileData>) => void;
  updateLink: (index: number, link: SocialLink) => void;
  addLink: (link: SocialLink) => void;
  removeLink: (index: number) => void;
};

const defaultProfile: ProfileData = {
  id: "user1",
  name: "Alex Johnson",
  title: "Product Designer & Developer",
  bio: "Creating digital experiences that blend innovation with usability. Passionate about UI/UX and emerging technologies.",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
  links: [
    { platform: "linkedin", url: "https://linkedin.com/in/alexjohnson", icon: "linkedin" },
    { platform: "twitter", url: "https://twitter.com/alexjohnson", icon: "twitter" },
    { platform: "github", url: "https://github.com/alexjohnson", icon: "github" },
    { platform: "dribbble", url: "https://dribbble.com/alexjohnson", icon: "dribbble" }
  ],
  email: "alex@example.com",
  phone: "+1 (555) 123-4567",
  website: "https://alexjohnson.design",
  location: "San Francisco, CA"
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<ProfileData | null>(defaultProfile);

  const updateProfile = (data: Partial<ProfileData>) => {
    setProfile(prev => prev ? { ...prev, ...data } : null);
  };

  const updateLink = (index: number, link: SocialLink) => {
    setProfile(prev => {
      if (!prev) return prev;
      const newLinks = [...prev.links];
      newLinks[index] = link;
      return { ...prev, links: newLinks };
    });
  };

  const addLink = (link: SocialLink) => {
    setProfile(prev => {
      if (!prev) return prev;
      return { ...prev, links: [...prev.links, link] };
    });
  };

  const removeLink = (index: number) => {
    setProfile(prev => {
      if (!prev) return prev;
      const newLinks = prev.links.filter((_, i) => i !== index);
      return { ...prev, links: newLinks };
    });
  };

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, updateLink, addLink, removeLink }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
