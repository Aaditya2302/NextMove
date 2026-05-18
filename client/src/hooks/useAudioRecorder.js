import { useState, useRef, useCallback } from 'react';

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [taskResult, setTaskResult] = useState(null);
  const [error, setError] = useState(null);
  const [analyser, setAnalyser] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const sourceRef = useRef(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setError(null);
      
      // Set up Audio Context and Analyser for 3D visuals
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContext();
      audioContextRef.current = audioCtx;
      
      const analyserNode = audioCtx.createAnalyser();
      analyserNode.fftSize = 256;
      setAnalyser(analyserNode);

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyserNode);
      sourceRef.current = source;

      // Set up Media Recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsProcessing(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Clean up stream tracks
        stream.getTracks().forEach(track => track.stop());
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }

        try {
          // Upload to backend
          const formData = new FormData();
          formData.append('audio', audioBlob, 'voice-recording.webm');
          
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          const response = await fetch(`${apiUrl}/api/voice/upload`, {
            method: 'POST',
            body: formData,
          });
          
          const result = await response.json();
          if (result.success) {
            setTaskResult(result.data);
          } else {
            setError(result.message || 'Error processing audio');
          }
        } catch (err) {
          console.error("Upload error:", err);
          setError("Failed to reach backend.");
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorder.start(200); // chunk every 200ms
      setIsRecording(true);
      setTaskResult(null); // Clear previous results
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Could not access microphone.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  return {
    isRecording,
    isProcessing,
    taskResult,
    error,
    analyser,
    startRecording,
    stopRecording
  };
}
