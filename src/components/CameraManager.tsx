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
        console.log("正在请求摄像头权限...");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: "user", 
            width: { ideal: 640 }, 
            height: { ideal: 480 } 
          }
        });
        
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        
        await new Promise((resolve) => {
          if (!videoRef.current) return;
          if (videoRef.current.readyState >= 2) {
            videoRef.current.play().catch(console.warn);
            resolve(true);
          } else {
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play().catch(console.warn);
              resolve(true);
            };
          }
        });

        console.log("视频流已启动，正在初始化模型...");
        await initializeMediapipe();
        
        if (active) {
          setIsReady(true);
          processVideo();
        }
      } catch (err: any) {
        console.error("摄像头访问或初始化失败:", err);
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
    <div className="hidden pointer-events-none">
      <video 
        ref={videoRef} 
        playsInline 
        muted 
      />
    </div>
  );
}
