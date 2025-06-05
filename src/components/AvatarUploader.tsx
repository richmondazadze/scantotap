import React, { useRef, useEffect } from "react";
import { IKUpload } from "imagekitio-react";

const urlEndpoint = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT;
const publicKey = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY;
const authenticationEndpoint = import.meta.env.VITE_IMAGEKIT_AUTH_ENDPOINT;

export default function AvatarUploader({ onUpload, triggerRef }: { onUpload: (url: string) => void, triggerRef?: React.RefObject<HTMLElement> }) {
  const ikUploadRef = useRef<any>(null);

  // Authenticator function for ImageKit
  const authenticator = async () => {
    const response = await fetch(authenticationEndpoint);
    if (!response.ok) throw new Error("Failed to get ImageKit auth");
    return response.json();
  };

  // If triggerRef is provided, clicking it will trigger the file input
  useEffect(() => {
    if (!triggerRef?.current) return;
    const handleClick = () => {
      if (ikUploadRef.current) ikUploadRef.current.click();
    };
    const el = triggerRef.current;
    el.addEventListener('click', handleClick);
    return () => el.removeEventListener('click', handleClick);
  }, [triggerRef]);

  return (
    <IKUpload
      ref={ikUploadRef}
      fileName="avatar.jpg"
      useUniqueFileName={true}
      folder="/avatars/"
      onError={err => alert("Upload error: " + err.message)}
      onSuccess={res => {
        // res.url is the uploaded image URL
        onUpload(res.url);
      }}
      publicKey={publicKey}
      urlEndpoint={urlEndpoint}
      authenticator={authenticator}
      style={{ display: 'none' }}
    />
  );
} 