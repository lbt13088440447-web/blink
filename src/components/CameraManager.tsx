import { useEffect, useRef, useState } from "react";
import { initializeMediapipe, getFaceLandmarker } from "../lib/vision";

interface EyeState {
  isClosed: boolean;
  leftBlinkScore: number;
  rightBlinkScore: number;
}

interface CameraManagerProps {
  onBlink: () => void;
  onDrowsy: () => void;
  onAwake: () => void;
}

export function CameraManager({ onBlink, onDrowsy, onAwake }: CameraManagerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const closedStartTimeRef = useRef<number | null>(null);
  const isDrowsyRef = useRef(false);

  useEffect(() => {
    let active = true;
    let requestAnimationFrameId: number;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 320, height: 240 }
        });
        
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready - check state immediately in case it's already loaded
        await new Promise((resolve) => {
          if (!videoRef.current) return;
          if (videoRef.current.readyState >= 2) {
            videoRef.current.play();
            resolve(true);
          } else {
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play();
              resolve(true);
            };
          }
        });

        await initializeMediapipe();
        
        if (active) {
          setIsReady(true);
          processVideo();
        }

      } catch (err: any) {
        if (active) setError(err.message || "Failed to access camera");
      }
    }

    async function processVideo() {
      if (!videoRef.current || !active) return;
      
      try {
        const landmarker = getFaceLandmarker();
        if (landmarker && videoRef.current.readyState >= 2) {
          const results = landmarker.detectForVideo(videoRef.current, performance.now());
          
          if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
            const blendshapes = results.faceBlendshapes[0].categories;
            const leftBlink = blendshapes.find(b => b.categoryName === "eyeBlinkLeft")?.score || 0;
            const rightBlink = blendshapes.find(b => b.categoryName === "eyeBlinkRight")?.score || 0;
            
            const isCurrentlyClosed = leftBlink > 0.5 && rightBlink > 0.5;
            const now = performance.now();

            // Drowsiness logic
            if (isCurrentlyClosed) {
              if (!closedStartTimeRef.current) {
                closedStartTimeRef.current = now;
              } else {
                const closedDuration = now - closedStartTimeRef.current;
                if (closedDuration > 2000 && !isDrowsyRef.current) {
                  isDrowsyRef.current = true;
                  onDrowsy();
                }
              }
            } else {
              if (closedStartTimeRef.current) {
                const closedDuration = now - closedStartTimeRef.current;
                
                if (isDrowsyRef.current) {
                  isDrowsyRef.current = false;
                  onAwake();
                } else if (closedDuration > 50 && closedDuration < 800) {
                  onBlink();
                }
                
                closedStartTimeRef.current = null;
              }
            }
          }
        }
      } catch (err) {
        console.error("Video processing error:", err);
      }
      
      if (active) {
        requestAnimationFrameId = requestAnimationFrame(processVideo);
      }
    }

    start();

    return () => {
      active = false;
      cancelAnimationFrame(requestAnimationFrameId);
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onBlink, onDrowsy, onAwake]);

  return (
    <div className="w-full aspect-video bg-black rounded-sm relative overflow-hidden ring-1 ring-[#1A1A1A]/20">
      <video 
        ref={videoRef} 
        className="w-full h-full object-cover origin-center -scale-x-100 opacity-60" 
        playsInline 
        muted 
      />
      {!isReady && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1A1A1A] text-white">
          <div className="w-8 h-8 flex items-center justify-center">
             <div className="w-6 h-6 border border-white/20 rounded-full animate-pulse"></div>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1A1A1A] text-white text-[10px] uppercase tracking-widest text-center p-2">
          无摄像头
        </div>
      )}
      {isReady && (
        <div className="absolute bottom-2 left-2 flex gap-1 items-end h-4">
          <div className="w-1 h-3 bg-emerald-400"></div>
          <div className="w-1 h-4 bg-emerald-400"></div>
          <div className="w-1 h-2 bg-emerald-400 animate-pulse"></div>
        </div>
      )}
    </div>
  );
}
