import { useState, useEffect, useRef, useCallback } from "react";

// SpeechRecognition type declarations for browser support
interface IWindow extends Window {
  webkitSpeechRecognition?: any;
  SpeechRecognition?: any;
}

export function useSpeechRecognition(options?: {
  language?: string;
  onTranscriptChange?: (fullText: string, latestSegment: string) => void;
}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const manualStopRef = useRef(false);
  const fullTranscriptRef = useRef("");

  const language = options?.language || "en-US";

  useEffect(() => {
    const win = window as unknown as IWindow;
    const SpeechRecognitionAPI = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = "";
        let finalChunk = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            finalChunk += res[0].transcript + " ";
          } else {
            currentInterim += res[0].transcript;
          }
        }

        if (finalChunk) {
          fullTranscriptRef.current += finalChunk;
          setTranscript(fullTranscriptRef.current);
          if (options?.onTranscriptChange) {
            options.onTranscriptChange(fullTranscriptRef.current, finalChunk);
          }
        }
        setInterimText(currentInterim);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          setError("Microphone access denied. Please allow microphone permissions.");
        } else if (event.error === "no-speech") {
          // Benign timeout
        } else {
          setError(`Speech recognition notice: ${event.error}`);
        }
      };

      recognition.onend = () => {
        if (!manualStopRef.current && isListening) {
          // Auto restart to maintain continuous listening
          try {
            recognition.start();
          } catch (e) {
            setIsListening(false);
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
    } catch (err: any) {
      console.error("Speech recognition initialization failed:", err);
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        manualStopRef.current = true;
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [language]);

  const startListening = useCallback(() => {
    manualStopRef.current = false;
    setError(null);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        // May already be active
        setIsListening(true);
      }
    } else {
      setIsListening(true);
    }
  }, []);

  const stopListening = useCallback(() => {
    manualStopRef.current = true;
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  }, []);

  const resetTranscript = useCallback(() => {
    fullTranscriptRef.current = "";
    setTranscript("");
    setInterimText("");
  }, []);

  const appendText = useCallback((text: string) => {
    fullTranscriptRef.current += (fullTranscriptRef.current ? " " : "") + text;
    setTranscript(fullTranscriptRef.current);
    if (options?.onTranscriptChange) {
      options.onTranscriptChange(fullTranscriptRef.current, text);
    }
  }, [options]);

  return {
    isListening,
    transcript,
    interimText,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    appendText,
  };
}
