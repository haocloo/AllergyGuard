// external
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// #####################################################
//               SIDEBAR STORE
// #####################################################

interface SidebarStore {
  _open: boolean;
  _setOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
}

const SIDEBAR_COOKIE_NAME = 'sidebar:state';
const SIDEBAR_COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year

// Create store with persistence middleware to handle cookie storage
export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      _open: true, // Set default value to match defaultOpen from SidebarProvider
      _setOpen: (value) =>
        set((state) => ({
          _open: typeof value === 'function' ? value(state._open) : value,
        })),
    }),
    {
      name: SIDEBAR_COOKIE_NAME,
      storage: {
        getItem: (name) => {
          const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
          return match ? { state: { _open: match[2] === 'true' }, version: 0 } : null;
        },
        setItem: (name, value) => {
          document.cookie = `${name}=${value.state._open}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
        },
        removeItem: (name) => {
          document.cookie = `${name}=; path=/; max-age=0`;
        },
      },
    }
  )
);

// #####################################################
//               VOICE RECOGNITION STORE
// #####################################################
interface VoiceRecognitionState {
  isListening: boolean;
  text: string;
  tempText: string;
  setIsListening: (value: boolean) => void;
  setText: (value: string) => void;
  setTempText: (value: string) => void;
  appendText: (transcript: string) => void;
  resetTranscript: () => void;
  startListening: () => void;
  stopListening: () => void;
}

export const useVoiceRecognitionStore = create<VoiceRecognitionState>((set, get) => ({
  isListening: false,
  text: '',
  tempText: '',
  setIsListening: (value) => set({ isListening: value }),
  setText: (value) => set({ text: value }),
  setTempText: (value) => set({ tempText: value }),
  appendText: (transcript) =>
    set((state) => ({
      text: (state.text + ' ' + transcript).trim(),
      tempText: '',
    })),
  resetTranscript: () => set({ text: '', tempText: '' }),
  startListening: () => {
    const state = get();
    if (state.isListening) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onstart = () => {
      set({ isListening: true, tempText: '' });
    };

    recognition.onend = () => {
      if (get().isListening) {
        setTimeout(() => {
          recognition.start();
        }, 1);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      if (get().isListening && event.error !== 'aborted') {
        setTimeout(() => {
          recognition.start();
        }, 1);
      }
    };

    recognition.onresult = (event) => {
      const results = Array.from(event.results);
      const latestResult = results[results.length - 1];
      const transcript = latestResult[0].transcript;

      if (latestResult.isFinal) {
        set((state) => ({
          text: (state.text + ' ' + transcript).trim(),
          tempText: '',
        }));
      } else {
        set({ tempText: transcript });
      }
    };

    recognition.start();
    (window as any).__recognition = recognition; // Store reference to stop later
  },
  stopListening: () => {
    const recognition = (window as any).__recognition;
    if (recognition) {
      recognition.stop();
      delete (window as any).__recognition;
    }
    const state = get();
    set({
      isListening: false,
      text: (state.text + ' ' + state.tempText).trim(),
      tempText: '',
    });
  },
}));

// #####################################################
//               INTERVIEW SESSION SPEECH STORE
// #####################################################
interface InterviewSessionSpeechState {
  permissionState: 'granted' | 'denied' | 'prompt' | 'loading';
  autoSubmit: boolean;
  silenceStartTime: number | null;
  isMessageLoading: boolean;
  isSpeaking: boolean;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;

  // Actions
  setPermissionState: (state: 'granted' | 'denied' | 'prompt' | 'loading') => void;
  setSilenceStartTime: (time: number | null) => void;
  setIsMessageLoading: (value: boolean) => void;
  setIsSpeaking: (value: boolean) => void;
  toggleAutoSubmit: () => void;
  reset: () => void;
  setVoices: (voices: SpeechSynthesisVoice[]) => void;
  setSelectedVoice: (voice: SpeechSynthesisVoice | null) => void;
  initializeVoices: () => void;

  // New shared methods
  handleRecording: (options: {
    setInput?: (text: string) => void;
    onSpeakingDuringRecording?: () => void;
  }) => Promise<void>;
  speakText: (
    text: string,
    options?: {
      onSpeakingComplete?: () => void;
      setInput?: (text: string) => void;
    }
  ) => Promise<void>;
  handleClearTranscript: (options?: { setInput?: (text: string) => void }) => void;

  // Additional shared methods
  submitMessage: (options: {
    onSpeakingInProgress?: () => void;
    onEmptyText?: () => void;
    onSubmit: (text: string) => void;
    resetStates: () => void;
  }) => void;

  handleSilenceThresholdReached: (options: { onSubmit?: () => void }) => void;

  resetMessageState: () => void;

  stopSpeaking: () => void;
}

export const useInterviewSessionSpeechStore = create<InterviewSessionSpeechState>((set, get) => ({
  permissionState: 'loading',
  autoSubmit: false,
  silenceStartTime: null,
  isMessageLoading: false,
  isSpeaking: false,
  voices: [],
  selectedVoice: null,

  // Actions
  setPermissionState: (state) => set({ permissionState: state }),
  setSilenceStartTime: (time) => set({ silenceStartTime: time }),
  setIsMessageLoading: (value) => set({ isMessageLoading: value }),
  setIsSpeaking: (value) => set({ isSpeaking: value }),
  toggleAutoSubmit: () =>
    set((state) => {
      if (state.isSpeaking) {
        return { autoSubmit: state.autoSubmit };
      }
      if (state.autoSubmit) {
        useVoiceRecognitionStore.getState().stopListening();
        useVoiceRecognitionStore.getState().setText(useVoiceRecognitionStore.getState().text);
      } else {
        useVoiceRecognitionStore.getState().startListening();
      }
      return { autoSubmit: !state.autoSubmit };
    }),
  reset: () =>
    set({
      permissionState: 'loading',
      autoSubmit: false,
      silenceStartTime: null,
      isMessageLoading: false,
      isSpeaking: false,
    }),
  setVoices: (voices) => set({ voices }),
  setSelectedVoice: (voice) => set({ selectedVoice: voice }),

  initializeVoices: () => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      const englishVoices = availableVoices.filter((voice) => voice.lang.startsWith('en-'));
      const sgVoice = englishVoices.find(
        (voice) => voice.name === 'Microsoft Wayne Online (Natural) - English (Singapore)'
      );

      set({
        voices: englishVoices,
        selectedVoice: sgVoice || null,
      });
    };

    // Load voices immediately in case they're already available
    loadVoices();

    // Handle browsers that need the voiceschanged event
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  },

  // Shared methods
  handleRecording: async ({ setInput, onSpeakingDuringRecording }) => {
    const { isSpeaking, permissionState } = get();
    const voiceStore = useVoiceRecognitionStore.getState();

    if (isSpeaking) {
      onSpeakingDuringRecording?.();
      return;
    }

    if (voiceStore.isListening) {
      voiceStore.stopListening();
      if (voiceStore.text.trim()) {
        voiceStore.setText(voiceStore.text);
        setInput?.(voiceStore.text);
      }
    } else {
      if (permissionState !== 'granted') {
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
          set({ permissionState: 'granted' });
        } catch (err) {
          console.error('Microphone access error:', err);
          set({ permissionState: 'denied' });
          return;
        }
      }
      voiceStore.setText('');
      setInput?.('');
      voiceStore.resetTranscript();
      voiceStore.startListening();
    }
  },

  speakText: async (text, options) => {
    const state = get();
    const voiceStore = useVoiceRecognitionStore.getState();

    if (voiceStore.isListening) {
      voiceStore.stopListening();
    }

    window.speechSynthesis.cancel();
    set({ isSpeaking: true });

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.4;
    utterance.pitch = 1;

    // Use the stored selected voice
    if (state.selectedVoice) {
      utterance.voice = state.selectedVoice;
    }

    utterance.onend = () => {
      set({ isSpeaking: false });
      if (state.autoSubmit) {
        setTimeout(() => {
          voiceStore.startListening();
        }, 100);
      }
      options?.onSpeakingComplete?.();
    };

    window.speechSynthesis.speak(utterance);
  },

  handleClearTranscript: (options) => {
    const voiceStore = useVoiceRecognitionStore.getState();
    voiceStore.resetTranscript();
    options?.setInput?.('');
  },

  submitMessage: ({ onSpeakingInProgress, onEmptyText, onSubmit, resetStates }) => {
    const { isSpeaking } = get();
    const voiceStore = useVoiceRecognitionStore.getState();
    const { text, isListening } = voiceStore;

    if (isSpeaking) {
      onSpeakingInProgress?.();
      return;
    }

    if (!text.trim()) {
      onEmptyText?.();
      return;
    }

    if (isListening) {
      voiceStore.stopListening();
    }

    onSubmit(text);
    resetStates();
  },

  handleSilenceThresholdReached: ({ onSubmit }) => {
    const { isSpeaking, autoSubmit } = get();
    const voiceStore = useVoiceRecognitionStore.getState();
    const { text } = voiceStore;

    if (isSpeaking) return;

    if (text.trim()) {
      voiceStore.setText(text);
      if (autoSubmit) {
        onSubmit?.();
      } else {
        voiceStore.stopListening();
      }
    } else if (!autoSubmit) {
      voiceStore.stopListening();
    }
    set({ silenceStartTime: null });
  },

  resetMessageState: () => {
    const voiceStore = useVoiceRecognitionStore.getState();
    voiceStore.setText('');
    voiceStore.resetTranscript();
    set({ silenceStartTime: null });
  },

  stopSpeaking: () => {
    window.speechSynthesis.cancel();
    set({ isSpeaking: false });

    // If auto-submit is enabled, restart listening after a short delay
    const state = get();
    if (state.autoSubmit) {
      setTimeout(() => {
        useVoiceRecognitionStore.getState().startListening();
      }, 100);
    }
  },
}));

