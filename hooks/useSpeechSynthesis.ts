
import { useState, useCallback, useEffect } from 'react';

interface SpeechSynthesisHook {
  speak: (text: string, onStart?: () => void, onEnd?: () => void) => void;
  isSpeaking: boolean;
  supported: boolean;
  selectedVoiceInfo: string | null;
}

const useSpeechSynthesis = (): SpeechSynthesisHook => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [selectedVoiceInfo, setSelectedVoiceInfo] = useState<string | null>(null);

  const loadAndSetVoice = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return;
    }
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      return;
    }

    const indonesianVoices = voices.filter(voice => voice.lang === 'id-ID');
    let bestVoice: SpeechSynthesisVoice | null = null;

    const femaleIndonesianVoices = indonesianVoices.filter(voice =>
      voice.name.toLowerCase().includes('female') ||
      voice.name.toLowerCase().includes('wanita') ||
      voice.name.toLowerCase().includes('perempuan') ||
      voice.name.toLowerCase().includes('indonesian female')
    );

    if (femaleIndonesianVoices.length > 0) {
      bestVoice = femaleIndonesianVoices.find(voice => voice.localService) || femaleIndonesianVoices[0];
    } else if (indonesianVoices.length > 0) {
      bestVoice = indonesianVoices.find(voice => voice.localService) || indonesianVoices[0];
    }
    
    if (bestVoice) {
      setSelectedVoice(bestVoice);
      setSelectedVoiceInfo(`Using voice: ${bestVoice.name} (${bestVoice.lang})`);
    } else {
      setSelectedVoice(null);
      setSelectedVoiceInfo(indonesianVoices.length > 0 ? "Using default Indonesian voice." : "No Indonesian voice found; using browser default.");
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSupported(true);
      loadAndSetVoice();
      window.speechSynthesis.addEventListener('voiceschanged', loadAndSetVoice);
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', loadAndSetVoice);
        window.speechSynthesis.cancel(); // Clean up any lingering speech on unmount
      };
    }
  }, [loadAndSetVoice]);

  const speak = useCallback((text: string, onStartCallback?: () => void, onEndCallback?: () => void) => {
    if (!supported) { // Removed isSpeaking check here, global lock will handle it
      console.warn('Speech synthesis not supported or no text.');
      onEndCallback?.(); // Ensure onEnd is called if we bail early
      return;
    }
    if (!text.trim()) {
        console.warn('No text provided to speak.');
        onEndCallback?.();
        return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.pitch = 1;
    utterance.rate = 0.9; 
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
      onStartCallback?.();
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      onEndCallback?.();
      // It's generally good practice to cancel, but be mindful if you intend to queue utterances.
      // For single announcements, this is fine.
      // window.speechSynthesis.cancel(); // Consider if this is needed or handled by App's logic.
    };

    utterance.onerror = (event) => {
      console.error('SpeechSynthesisUtterance.onerror', event);
      setIsSpeaking(false);
      onEndCallback?.(); // Ensure onEnd is called on error
    };
    
    window.speechSynthesis.cancel(); // Cancel any previous speech to ensure this one plays.
    window.speechSynthesis.speak(utterance);
  }, [supported, selectedVoice]);

  return { speak, isSpeaking, supported, selectedVoiceInfo };
};

export default useSpeechSynthesis;
