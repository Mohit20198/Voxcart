import { useState, useEffect, useCallback, useRef } from 'react';

// Extend Window interface for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export type SpeechState = 'idle' | 'listening' | 'processing' | 'error';

export function useSpeechRecognition(lang = 'en-US') {
  const [transcript, setTranscript] = useState('');
  const [state, setState] = useState<SpeechState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMessage('Speech recognition is not supported in this browser.');
      setState('error');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = lang;
    console.log('[SpeechRecognition] Initialized with language:', lang);

    recognition.onstart = () => {
      setState('listening');
      setErrorMessage('');
      setTranscript('');
    };

    recognition.onresult = (event: any) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(currentTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      if (event.error === 'not-allowed') {
        setErrorMessage('Microphone access denied.');
      } else if (event.error === 'no-speech') {
        setErrorMessage('No speech detected.');
      } else {
        setErrorMessage(`Error: ${event.error}`);
      }
      setState('error');
    };

    recognition.onend = () => {
      // If we were listening and it ended without error, we are now processing (or idle if empty)
      setState((prev) => {
        if (prev === 'listening') {
          return 'processing';
        }
        return prev;
      });
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [lang]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && state !== 'listening') {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error(e);
      }
    }
  }, [state]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && state === 'listening') {
      recognitionRef.current.stop();
    }
  }, [state]);

  const resetState = useCallback(() => {
    setState('idle');
    setTranscript('');
    setErrorMessage('');
  }, []);

  return {
    transcript,
    state,
    errorMessage,
    startListening,
    stopListening,
    resetState
  };
}
