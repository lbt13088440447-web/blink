import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

let faceLandmarker: FaceLandmarker | null = null;
let runningMode: "IMAGE" | "VIDEO" = "VIDEO";

export async function initializeMediapipe() {
  if (faceLandmarker) return faceLandmarker;

  try {
    console.log("正在获取 MediaPipe WASM 资源...");
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
    );
    
    // 判断是否是移动端，移动端优先使用 CPU 避免 WebGL 崩溃
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const delegate = isMobile ? "CPU" : "GPU";
    
    console.log(`正在创建 FaceLandmarker 实例 (使用 ${delegate})...`);
    
    const initPromise = FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
        delegate: delegate
      },
      outputFaceBlendshapes: true,
      minFaceDetectionConfidence: 0.5,
      minFacePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
      runningMode,
      numFaces: 1
    });

    faceLandmarker = await initPromise;

    console.log(`MediaPipe FaceLandmarker 初始化成功 (${delegate})`);
  } catch (error) {
    console.warn("主初始化策略失败，尝试回退到后备方案(CPU):", error);
    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
      );
      faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "CPU"
        },
        outputFaceBlendshapes: true,
        runningMode,
        numFaces: 1
      });
      console.log("MediaPipe FaceLandmarker 回退初始化成功 (CPU)");
    } catch (innerError) {
      console.warn("MediaPipe 完全初始化未成功:", innerError);
      throw innerError;
    }
  }

  return faceLandmarker;
}

export function getFaceLandmarker() {
  return faceLandmarker;
}
