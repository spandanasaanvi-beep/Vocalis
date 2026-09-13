import { useState, useEffect, useRef, useCallback } from "react";

export function useCameraAndAudio() {
  const [hasCamera, setHasCamera] = useState(false);
  const [hasMic, setHasMic] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0); // 0 to 100
  const [motionLevel, setMotionLevel] = useState(0); // 0 to 100 (gesture activity)
  const [postureFeedback, setPostureFeedback] = useState<string>("Aligning camera...");
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const prevFrameDataRef = useRef<Uint8ClampedArray | null>(null);

  // Start media stream
  const startMedia = useCallback(async (wantCamera = true, wantMic = true) => {
    try {
      setPermissionError(null);
      const constraints: MediaStreamConstraints = {
        video: wantCamera ? { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" } : false,
        audio: wantMic ? { echoCancellation: true, noiseSuppression: true } : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (wantCamera && stream.getVideoTracks().length > 0) {
        setHasCamera(true);
        setIsCameraActive(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((e) => console.warn("Video play error:", e));
        }
      }

      if (wantMic && stream.getAudioTracks().length > 0) {
        setHasMic(true);
        setIsMicActive(true);

        // Setup audio analyzer
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);

          audioContextRef.current = audioCtx;
          analyserRef.current = analyser;
        }
      }

      // Start loop for audio meter and optical motion delta
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 24;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      const updateMetrics = () => {
        // Audio analysis
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
        }

        // Camera frame gesture/motion estimate
        if (videoRef.current && videoRef.current.readyState >= 2 && ctx) {
          try {
            ctx.drawImage(videoRef.current, 0, 0, 32, 24);
            const currentData = ctx.getImageData(0, 0, 32, 24).data;

            if (prevFrameDataRef.current) {
              let diff = 0;
              for (let i = 0; i < currentData.length; i += 4) {
                // Luminance diff
                const rDiff = Math.abs(currentData[i] - prevFrameDataRef.current[i]);
                const gDiff = Math.abs(currentData[i + 1] - prevFrameDataRef.current[i + 1]);
                const bDiff = Math.abs(currentData[i + 2] - prevFrameDataRef.current[i + 2]);
                diff += (rDiff + gDiff + bDiff) / 3;
              }
              const avgDiff = diff / (32 * 24);
              const normalizedMotion = Math.min(100, Math.round((avgDiff / 30) * 100));
              setMotionLevel(normalizedMotion);

              if (normalizedMotion > 35) {
                setPostureFeedback("Expressive gesture activity detected");
              } else if (normalizedMotion > 10) {
                setPostureFeedback("Grounded posture, steady engagement");
              } else {
                setPostureFeedback("Still posture, maintain open chest");
              }
            }
            prevFrameDataRef.current = new Uint8ClampedArray(currentData);
          } catch (e) {}
        }

        animationFrameRef.current = requestAnimationFrame(updateMetrics);
      };

      animationFrameRef.current = requestAnimationFrame(updateMetrics);
    } catch (err: any) {
      console.warn("Media device access rejected or unavailable:", err);
      setPermissionError("Camera/Microphone permission was not granted or devices unavailable. You can still practice using text/audio simulation.");
    }
  }, []);

  const stopMedia = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsCameraActive(false);
    setIsMicActive(false);
    setAudioLevel(0);
    setMotionLevel(0);
  }, []);

  // Capture frame as Base64 image
  const captureFrameBase64 = useCallback((): string | null => {
    if (!videoRef.current || videoRef.current.readyState < 2) return null;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 480;
      canvas.height = 360;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.drawImage(videoRef.current, 0, 0, 480, 360);
      return canvas.toDataURL("image/jpeg", 0.75);
    } catch (e) {
      console.error("Frame capture error:", e);
      return null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopMedia();
    };
  }, [stopMedia]);

  return {
    videoRef,
    hasCamera,
    hasMic,
    isCameraActive,
    isMicActive,
    audioLevel,
    motionLevel,
    postureFeedback,
    permissionError,
    startMedia,
    stopMedia,
    captureFrameBase64,
  };
}
