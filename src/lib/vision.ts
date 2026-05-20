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
    
    console.log("正在创建 FaceLandmarker 实例...");
    const gpuInit = FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
        delegate: "GPU"
      },
      outputFaceBlendshapes: true,
      runningMode,
      numFaces: 1
    });

    const timeout = new Promise<any>((_, reject) => {
      setTimeout(() => reject(new Error("GPU 初始化超时（Android常见问题）")), 5000);
    });

    faceLandmarker = await Promise.race([gpuInit, timeout]);

    console.log("MediaPipe FaceLandmarker 初始化成功 (GPU)");
  } catch (error) {
    console.warn("GPU 初始化失败，尝试回退到 CPU:", error);
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
      console.log("MediaPipe FaceLandmarker 初始化成功 (CPU)");
    } catch (innerError) {
      console.error("MediaPipe 完全初始化失败:", innerError);
      throw innerError;
    }
  }

  return faceLandmarker;
}

export function getFaceLandmarker() {
  return faceLandmarker;
}
