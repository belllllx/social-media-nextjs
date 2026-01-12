import React, { useEffect, useRef, useState } from "react";

type Profile = {
  avatar?: string;
  name?: string;
  verified?: boolean;
};

type Props = {
  src: string;
  poster?: string;
  profile?: Profile;
  caption?: string;
  className?: string;
  preload?: "metadata" | "auto" | "none";
};

export function SocialVideoPlayer({
  src,
  poster,
  profile = {},
  caption = "",
  className = "",
  preload = "metadata",
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const [progress, setProgress] = useState(0);

  // IntersectionObserver auto play / pause when enters viewport
  useEffect(() => {
    const el = containerRef.current;
    const v = videoRef.current;
    if (!el || !v) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            setIsInView(true);
            // attempt play; keep muted policy in mind (autoplay muted usually allowed)
            v.muted = isMuted;
            v.play().catch(() => {
              /* ignore play error (autoplay policies) */
            });
            setIsPlaying(!v.paused);
          } else {
            setIsInView(false);
            v.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: [0.5] }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [isMuted]);

  // sync mute state to video element
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = isMuted;
  }, [isMuted]);

  async function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    try {
      if (v.paused) {
        await v.play();
        setIsPlaying(true);
      } else {
        v.pause();
        setIsPlaying(false);
      }
    } catch (e) {
      // play may fail due to browser policy
      console.warn("video play failed", e);
    }
  }

  function toggleMute() {
    return setIsMuted((s) => !s);
  }

  function seekByClick(e: React.MouseEvent<HTMLDivElement>) {
    const v = videoRef.current;
    if (!v || !v.duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = clickX / rect.width;

    v.currentTime = percent * v.duration;
    setProgress(percent * 100);
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full bg-black overflow-hidden rounded-2xl ${className}`}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        preload={preload}
        playsInline
        muted={isMuted}
        loop
        className="w-full h-full object-cover block"
        onClick={togglePlay}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          setProgress((v.currentTime / v.duration) * 100 || 0);
        }}
      />

      {/* Top-left controls (pause/play + mute) */}
      <div className="absolute top-4 left-4 flex gap-3 z-20">
        <button
          aria-label={isPlaying ? "Pause" : "Play"}
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center shadow-md cursor-pointer"
        >
          {isPlaying ? (
            // Pause icon
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="6" y="5" width="3" height="14" fill="white" rx="0.5" />
              <rect x="15" y="5" width="3" height="14" fill="white" rx="0.5" />
            </svg>
          ) : (
            // Play icon
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M5 3v18l15-9L5 3z" fill="white" />
            </svg>
          )}
        </button>

        <button
          aria-label={isMuted ? "Unmute" : "Mute"}
          onClick={(e) => {
            e.stopPropagation();
            toggleMute();
          }}
          className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center shadow-md cursor-pointer"
        >
          {isMuted ? (
            // Muted icon
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M5 9v6h4l5 4V5L9 9H5z" fill="white" />
              <path
                d="M16 8.5l3.5 3.5M19.5 8.5L16 12"
                stroke="white"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            // Sound icon
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M5 9v6h4l5 4V5L9 9H5z" fill="white" />
              <path
                d="M15.5 8.5a4 4 0 010 7"
                stroke="white"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Bottom gradient (for text readability) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 to-transparent z-10" />

      {/* Bottom-left profile + caption */}
      <div className="absolute left-4 bottom-4 z-20 text-white flex items-end gap-3 max-w-[85%]">
        {/* Avatar */}
        {/* <img
          src={profile.avatar || "https://via.placeholder.com/40"}
          alt={profile.name || "avatar"}
          className="w-10 h-10 rounded-full object-cover ring-2 ring-white/30"
        /> */}

        <div className="flex flex-col gap-1 text-sm">
          <div className="flex items-center gap-2 font-semibold leading-tight">
            {/* <span className="truncate max-w-[200px]">{profile.name || "Unknown"}</span> */}
            {/* {profile.verified && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2l1.9 3.9L18 7l-3 2.9L16 13l-4-2-4 2 1-3.1L6 7l4.1-.9L12 2z" fill="#3b82f6" />
                <path d="M10 11l2 2 4-4" stroke="white" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )} */}
          </div>

          {/* caption text */}
          <div className="text-xs text-white/90 leading-tight line-clamp-3">
            {caption}
          </div>
        </div>
      </div>

      {/* small accessibility helper: show play overlay when not playing */}
      {/* Status / Progress bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 z-30 cursor-pointer"
        onClick={seekByClick}
      >
        <div
          className="h-full bg-white transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="rounded-full bg-black/40 p-4">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M5 3v18l15-9L5 3z" fill="white" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
