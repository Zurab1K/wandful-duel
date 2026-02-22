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

// Face landmark indices
const NOSE_TIP = 1;

export interface HandData {
  landmarks: Array<{ x: number; y: number; z: number }>;
  handedness: "Left" | "Right";
  wandTip: { x: number; y: number } | null;
  gesture: string;
}

export interface HeadPose {
  /** Normalized nose position (0-1), center of screen ≈ 0.5 */
  x: number;
  y: number;
  /** All face landmarks for visualization */
  faceLandmarks: Array<{ x: number; y: number; z: number }>;
}

export interface TrackingState {
  isLoading: boolean;
  isTracking: boolean;
  error: string | null;
  hands: HandData[];
  wandTrail: Array<{ x: number; y: number; t: number }>;
  headPose: HeadPose | null;
}

// Exponential smoothing
const smooth = (prev: number, curr: number, alpha = 0.4) =>
  prev + alpha * (curr - prev);

function detectGesture(landmarks: Array<{ x: number; y: number; z: number }>, handedness: "Left" | "Right"): string {
  if (!landmarks || landmarks.length < 21) return "unknown";

  const fingerTips = [INDEX_TIP, MIDDLE_TIP, RING_TIP, PINKY_TIP];
  const fingerMcps = [INDEX_MCP, MIDDLE_MCP, RING_MCP, PINKY_MCP];

  let extended = 0;
  for (let i = 0; i < fingerTips.length; i++) {
    if (landmarks[fingerTips[i]].y < landmarks[fingerMcps[i]].y) {
      extended++;
    }
  }

  const thumbExtended = handedness === "Left"
    ? landmarks[THUMB_TIP].x > landmarks[THUMB_TIP - 2].x
    : landmarks[THUMB_TIP].x < landmarks[THUMB_TIP - 2].x;

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
    headPose: null,
  });

  const handLandmarkerRef = useRef<any>(null);
  const faceLandmarkerRef = useRef<any>(null);
  const animFrameRef = useRef<number>(0);
  const smoothedLeftRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const smoothedRightRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const smoothedHeadRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const trailRef = useRef<Array<{ x: number; y: number; t: number }>>([]);
  const lastTimestampRef = useRef<number>(0);

  const initMediaPipe = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const vision = await import("@mediapipe/tasks-vision");
      const { HandLandmarker, FaceLandmarker, FilesetResolver } = vision;

      const fileset = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      const [handLandmarker, faceLandmarker] = await Promise.all([
        HandLandmarker.createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU",
          },
          numHands: 2,
          runningMode: "VIDEO",
        }),
        FaceLandmarker.createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU",
          },
          numFaces: 1,
          runningMode: "VIDEO",
        }),
      ]);

      handLandmarkerRef.current = handLandmarker;
      faceLandmarkerRef.current = faceLandmarker;
      setState((s) => ({ ...s, isLoading: false }));
    } catch (err) {
      console.error("MediaPipe init error:", err);
      setState((s) => ({
        ...s,
        isLoading: false,
        error: "Failed to load tracking models. Please check your connection.",
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

        let headPose: HeadPose | null = null;

        try {
          // Face detection for head pose
          if (faceLandmarkerRef.current) {
            const faceResults = faceLandmarkerRef.current.detectForVideo(
              videoRef.current,
              now
            );
            if (faceResults.faceLandmarks && faceResults.faceLandmarks.length > 0) {
              const faceLm = faceResults.faceLandmarks[0];
              const nose = faceLm[NOSE_TIP];
              if (nose) {
                const hx = smooth(smoothedHeadRef.current.x, nose.x, 0.3);
                const hy = smooth(smoothedHeadRef.current.y, nose.y, 0.3);
                smoothedHeadRef.current = { x: hx, y: hy };
                headPose = { x: hx, y: hy, faceLandmarks: faceLm };
              }
            }
          }
        } catch {
          // Silently ignore face detection errors
        }

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
                (results.handednesses?.[i]?.[0]?.categoryName as string) === "Left"
                  ? "Left"
                  : "Right";

              // Extrapolate pencil/wand tip: project a line from wrist through
              // the middle finger tip and extend it to estimate the held object's tip
              const wrist = lm[WRIST];
              const midTip = lm[MIDDLE_TIP];
              const idxTip = lm[INDEX_TIP];
              
              // Average of index and middle tip as the "grip direction" reference
              const gripX = (midTip.x + idxTip.x) / 2;
              const gripY = (midTip.y + idxTip.y) / 2;
              
              // Direction from wrist to grip point
              const dirX = gripX - wrist.x;
              const dirY = gripY - wrist.y;
              
              // Extend beyond fingertips by ~60% of the hand length to reach pencil tip
              const extensionFactor = 1.6;
              const rawTipX = wrist.x + dirX * extensionFactor;
              const rawTipY = wrist.y + dirY * extensionFactor;

              const smoothRef = handedness === "Right" ? smoothedRightRef : smoothedLeftRef;
              const sx = smooth(smoothRef.current.x, rawTipX);
              const sy = smooth(smoothRef.current.y, rawTipY);
              smoothRef.current = { x: sx, y: sy };

              const gesture = detectGesture(lm, handedness);

              // Only track trail for wand hand (Right)
              if (handedness === "Right") {
                trailRef.current.push({ x: sx, y: sy, t: now });
                if (trailRef.current.length > 60) {
                  trailRef.current = trailRef.current.slice(-60);
                }
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
            headPose,
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
    setState((s) => ({ ...s, isTracking: false, hands: [], wandTrail: [], headPose: null }));
  }, [videoRef]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return { ...state, startTracking, stopTracking, initMediaPipe };
}
