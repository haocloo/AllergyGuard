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

// Available languages for speech recognition
export const SPEECH_RECOGNITION_LANGUAGES = [
  { code: 'en-US', name: 'English' },
  { code: 'zh-CN', name: 'Chinese' },
  { code: 'ms-MY', name: 'Bahasa Malaysia' },
  { code: 'ta-IN', name: 'Tamil' },
];

interface VoiceRecognitionState {
  isListening: boolean;
  text: string;
  tempText: string;
  selectedLanguage: string; // Added language property
  setIsListening: (value: boolean) => void;
  setText: (value: string) => void;
  setTempText: (value: string) => void;
  setSelectedLanguage: (language: string) => void; // Added language setter
  appendText: (transcript: string) => void;
  resetTranscript: () => void;
  startListening: () => void;
  stopListening: () => void;
}

export const useVoiceRecognitionStore = create<VoiceRecognitionState>((set, get) => ({
  isListening: false,
  text: '',
  tempText: '',
  selectedLanguage: 'en-US', // Default to English
  setIsListening: (value) => set({ isListening: value }),
  setText: (value) => set({ text: value }),
  setTempText: (value) => set({ tempText: value }),
  setSelectedLanguage: (language) => {
    // First ensure we completely stop any existing recognition
    const existingRecognition = (window as any).__recognition;
    if (existingRecognition) {
      try {
        existingRecognition.stop();
      } catch (e) {
        console.error('Error stopping recognition during language change:', e);
      }
      delete (window as any).__recognition;
    }

    // Then update the language
    set({
      selectedLanguage: language,
      isListening: false, // Ensure listening is off during language change
    });

    console.log(`Language changed to: ${language}`);
  },
  appendText: (transcript) =>
    set((state) => ({
      text: (state.text + ' ' + transcript).trim(),
      tempText: '',
    })),
  resetTranscript: () => set({ text: '', tempText: '' }),
  startListening: () => {
    const state = get();
    if (state.isListening) return;

    // Make sure any existing recognition instance is stopped and cleared
    const existingRecognition = (window as any).__recognition;
    if (existingRecognition) {
      try {
        existingRecognition.stop();
      } catch (e) {
        console.error('Error stopping existing recognition:', e);
      }
      delete (window as any).__recognition;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = state.selectedLanguage; // Set the selected language
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log(`Speech recognition started with language: ${state.selectedLanguage}`);
        set({ isListening: true, tempText: '' });
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        if (get().isListening) {
          // Only restart if we're still supposed to be listening
          // and not in the middle of a language change
          setTimeout(() => {
            if (get().isListening) {
              try {
                // Check if recognition is still in a good state or create a new instance
                if ((window as any).__recognition) {
                  delete (window as any).__recognition;
                  recognition.stop();
                }
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                const newRecognition = new SpeechRecognition();
                newRecognition.continuous = true;
                newRecognition.interimResults = true;
                newRecognition.lang = get().selectedLanguage;
                newRecognition.maxAlternatives = 1;
                
                // Re-attach all event handlers
                Object.assign(newRecognition, {
                  onstart: recognition.onstart,
                  onend: recognition.onend,
                  onerror: recognition.onerror,
                  onresult: recognition.onresult
                });
                
                (window as any).__recognition = newRecognition;
                newRecognition.start();
              } catch (e) {
                console.error('Error restarting recognition:', e);
                set({ isListening: false });
              }
            }
          }, 100);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        if (get().isListening && event.error !== 'aborted') {
          setTimeout(() => {
            if (get().isListening) {
              try {
                // Always create a fresh instance after an error
                if ((window as any).__recognition) {
                  delete (window as any).__recognition;
                }
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                const newRecognition = new SpeechRecognition();
                newRecognition.continuous = true;
                newRecognition.interimResults = true;
                newRecognition.lang = get().selectedLanguage;
                newRecognition.maxAlternatives = 1;
                
                // Re-attach all event handlers
                Object.assign(newRecognition, {
                  onstart: recognition.onstart,
                  onend: recognition.onend,
                  onerror: recognition.onerror,
                  onresult: recognition.onresult
                });
                
                (window as any).__recognition = newRecognition;
                newRecognition.start();
              } catch (e) {
                console.error('Error restarting recognition after error:', e);
                set({ isListening: false });
              }
            }
          }, 300);
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
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
      set({ isListening: false });
    }
  },
  stopListening: () => {
    try {
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
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
      // Force reset the state if an error occurs
      set({
        isListening: false,
      });
      delete (window as any).__recognition;
    }
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
      // Simply stop listening and keep the text
      console.log('Stopping voice recognition...');
      voiceStore.stopListening();
      return;
    }

    // Start listening
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

    // Keep existing text when starting to listen again
    if (setInput) {
      setInput(voiceStore.text);
    }

    // Make sure any existing recognition instance is properly cleaned up before starting
    const existingRecognition = (window as any).__recognition;
    if (existingRecognition) {
      try {
        existingRecognition.stop();
      } catch (e) {
        console.error('Error stopping existing recognition:', e);
      }
      delete (window as any).__recognition;
      // Ensure isListening is false before starting again
      voiceStore.setIsListening(false);
    }

    // Wait a moment to ensure cleanup is complete before starting again
    setTimeout(() => {
      console.log('Starting voice recognition...');
      voiceStore.startListening();
    }, 100);
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
