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
  onReady?: () => void;
  onError?: (err: string) => void;
}

export function CameraManager({ onBlink, onDrowsy, onAwake, onReady, onError }: CameraManagerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const closedStartTimeRef = useRef<number | null>(null);
  const isDrowsyRef = useRef(false);

  // Keep callback references up to date on every render
  const onBlinkRef = useRef(onBlink);
  const onDrowsyRef = useRef(onDrowsy);
  const onAwakeRef = useRef(onAwake);
  const onReadyRef = useRef(onReady);
  const onErrorRef = useRef(onError);

  onBlinkRef.current = onBlink;
  onDrowsyRef.current = onDrowsy;
  onAwakeRef.current = onAwake;
  onReadyRef.current = onReady;
  onErrorRef.current = onError;

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
          onReadyRef.current?.();
          processVideo();
        }
      } catch (err: any) {
        console.warn("摄像头访问或初始化限制/未能成功调用（此为环境权限限制，如嵌套 iframe 等，已启用备用交互，并非脚本错误）:", err);
        if (active) {
           let errorMsg = err.message || "Failed to access camera";
           
           if (errorMsg.includes("Permission") || err.name === "NotAllowedError") {
             errorMsg = "无法访问相机权限 (Permission denied)。\n\n1. 这是因为浏览器安全策略限制，在嵌套预览窗口(Iframe)中默认禁止调用相机。\n\n2. 强烈建议点击下方【在新标签页中打开】按钮，或在手机浏览器中打开本款应用以轻松调起并授权您的相机。";
           } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
             errorMsg = "未检测到可用摄像头。请检查设备相机。";
           } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
             errorMsg = "摄像头正被其他应用占用，请关闭后重试。";
           }

           setError(errorMsg);
           onErrorRef.current?.(errorMsg);
         }
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
                  onDrowsyRef.current();
                }
              }
            } else {
              if (closedStartTimeRef.current) {
                const closedDuration = now - closedStartTimeRef.current;
                
                if (isDrowsyRef.current) {
                  isDrowsyRef.current = false;
                  onAwakeRef.current();
                } else if (closedDuration > 50 && closedDuration < 800) {
                  onBlinkRef.current();
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
  }, []);

  return (
    <div className="fixed top-0 left-0 w-px h-px opacity-0 pointer-events-none select-none z-[-1] overflow-hidden">
      <video 
        ref={videoRef} 
        playsInline 
        muted 
        autoPlay
      />
    </div>
  );
}
