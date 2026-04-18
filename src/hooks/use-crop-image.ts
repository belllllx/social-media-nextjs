import { useCallback, useState } from "react";
import { Area, Point } from "react-easy-crop";

export function useCropImage() {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleClearCropImage = useCallback(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setFile(null);
  }, []);

  const handleSetFile = useCallback((selectedFile: File) => {
    setFile(selectedFile);
  }, []);

  const handleSetCroppedAreaPixels = useCallback((croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSetCrop = useCallback((crop: Point) => {
    setCrop(crop);
  }, []);
  
  const handleSetZoom = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  return {
    crop,
    zoom,
    croppedAreaPixels,
    file,
    handleClearCropImage,
    handleSetFile,
    handleSetCroppedAreaPixels,
    handleSetCrop,
    handleSetZoom,
  }
}