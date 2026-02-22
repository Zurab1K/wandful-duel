import { useRef, useEffect, useCallback, useState } from "react";

// MediaPipe hand landmark indices
const WRIST = 0;
const INDEX_TIP = 8;
const MIDDLE_TIP = 12;
const RING_TIP = 16;
const PINKY_TIP = 20;
const THUMB_TIP = 4;
const INDEX_MCP = 5;
const MIDDLE_MCP = 9;
const RING_MCP = 13;
const PINKY_MCP = 17;

export interface HandData {
  landmarks: Array<{ x: number; y: number; z: number }>;
  handedness: "Left" | "Right";
  wandTip: { x: number; y: number } | null;
  gesture: string;
}

export interface TrackingState {
  isLoading: boolean;
  isTracking: boolean;
  error: string | null;
  hands: HandData[];
  wandTrail: Array<{ x: number; y: number; t: number }>;
}

// Exponential smoothing
const smooth = (prev: number, curr: number, alpha = 0.4) =>
  prev + alpha * (curr - prev);

function detectGesture(landmarks: Array<{ x: number; y: number; z: number }>): string {
  if (!landmarks || landmarks.length < 21) return "unknown";

  const fingerTips = [INDEX_TIP, MIDDLE_TIP, RING_TIP, PINKY_TIP];
  const fingerMcps = [INDEX_MCP, MIDDLE_MCP, RING_MCP, PINKY_MCP];

  let extended = 0;
  for (let i = 0; i < fingerTips.length; i++) {
    if (landmarks[fingerTips[i]].y < landmarks[fingerMcps[i]].y) {
      extended++;
    }
  }

  // Thumb check
  const thumbExtended = landmarks[THUMB_TIP].x < landmarks[THUMB_TIP - 2].x;

  if (extended === 0 && !thumbExtended) return "fist";
  if (extended === 4 && thumbExtended) return "open_palm";
  if (extended === 1 && landmarks[INDEX_TIP].y < landmarks[INDEX_MCP].y) return "pointing";
  if (extended === 2) return "peace";

  return "partial";
}

export function useHandTracking(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const [state, setState] = useState<TrackingState>({
    isLoading: false,
    isTracking: false,
    error: null,
    hands: [],
    wandTrail: [],
  });

  const handLandmarkerRef = useRef<any>(null);
  const animFrameRef = useRef<number>(0);
  const smoothedRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const trailRef = useRef<Array<{ x: number; y: number; t: number }>>([]);
  const lastTimestampRef = useRef<number>(0);

  const initMediaPipe = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const vision = await import("@mediapipe/tasks-vision");
      const { HandLandmarker, FilesetResolver } = vision;

      const fileset = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      const handLandmarker = await HandLandmarker.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          delegate: "GPU",
        },
        numHands: 2,
        runningMode: "VIDEO",
      });

      handLandmarkerRef.current = handLandmarker;
      setState((s) => ({ ...s, isLoading: false }));
    } catch (err) {
      console.error("MediaPipe init error:", err);
      setState((s) => ({
        ...s,
        isLoading: false,
        error: "Failed to load hand tracking model. Please check your connection.",
      }));
    }
  }, []);

  const startTracking = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      if (!handLandmarkerRef.current) {
        await initMediaPipe();
      }

      setState((s) => ({ ...s, isTracking: true }));

      const detect = () => {
        if (!videoRef.current || !handLandmarkerRef.current) return;
        if (videoRef.current.readyState < 2) {
          animFrameRef.current = requestAnimationFrame(detect);
          return;
        }

        const now = performance.now();
        if (now === lastTimestampRef.current) {
          animFrameRef.current = requestAnimationFrame(detect);
          return;
        }
        lastTimestampRef.current = now;

        try {
          const results = handLandmarkerRef.current.detectForVideo(
            videoRef.current,
            now
          );

          const hands: HandData[] = [];
          if (results.landmarks && results.landmarks.length > 0) {
            for (let i = 0; i < results.landmarks.length; i++) {
              const lm = results.landmarks[i];
              const handedness =
                results.handednesses?.[i]?.[0]?.categoryName === "Left"
                  ? "Right" // Mirror
                  : "Left";

              const rawTip = lm[INDEX_TIP];
              const sx = smooth(smoothedRef.current.x, rawTip.x);
              const sy = smooth(smoothedRef.current.y, rawTip.y);
              smoothedRef.current = { x: sx, y: sy };

              const gesture = detectGesture(lm);

              // Add to trail
              trailRef.current.push({ x: sx, y: sy, t: now });
              // Keep last 60 points
              if (trailRef.current.length > 60) {
                trailRef.current = trailRef.current.slice(-60);
              }

              hands.push({
                landmarks: lm,
                handedness,
                wandTip: { x: sx, y: sy },
                gesture,
              });
            }
          }

          setState((s) => ({
            ...s,
            hands,
            wandTrail: [...trailRef.current],
          }));
        } catch {
          // Silently ignore detection errors
        }

        animFrameRef.current = requestAnimationFrame(detect);
      };

      animFrameRef.current = requestAnimationFrame(detect);
    } catch (err) {
      setState((s) => ({
        ...s,
        error: "Camera access denied. Please allow webcam access.",
      }));
    }
  }, [videoRef, initMediaPipe]);

  const stopTracking = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    trailRef.current = [];
    setState((s) => ({ ...s, isTracking: false, hands: [], wandTrail: [] }));
  }, [videoRef]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return { ...state, startTracking, stopTracking, initMediaPipe };
}
