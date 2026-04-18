import { useCallback, useEffect, useState } from "react";

export function useFileObjectUrl(file: File | null) {
  const [imageSrc, setImageSrc] = useState("");

  useEffect(() => {
    if (!file) {
      return;
    }

    const url = URL.createObjectURL(file);
    setImageSrc(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleClearImageSrc = useCallback(() => {
    setImageSrc("");
  }, []);

  return {
    imageSrc,
    handleClearImageSrc,
  }
}