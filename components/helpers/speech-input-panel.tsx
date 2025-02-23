import Image from 'next/image';

// ui
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Rocket, Send, X, Square } from 'lucide-react';
import { ShineBorder } from '@/components/magicui/shine-border';

type InputPanelProps = {
  input: string;
  permissionState: 'granted' | 'denied' | 'prompt' | 'loading';
  tempText: string;
  autoSubmit: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  isLoading: boolean;
  handleClearTranscript: () => void;
  handleRecording: () => void;
  toggleAutoSubmit: () => void;
  submitMessage: () => void;
  stopSpeaking: () => void;
};

export function InputPanel({
  input,
  permissionState,
  tempText,
  autoSubmit,
  isListening,
  isSpeaking,
  isLoading,
  handleClearTranscript,
  handleRecording,
  toggleAutoSubmit,
  submitMessage,
  stopSpeaking,
}: InputPanelProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 flex justify-center p-4 bg-gradient-to-t from-background via-background to-transparent">
      <div className="w-full max-w-3xl">
        <ShineBorder
          className="relative w-full overflow-hidden rounded-lg"
          color={['#A07CFE', '#FE8FB5', '#FFBE7B']}
          borderWidth={2}
        >
          <div className="relative flex items-center w-full bg-white dark:bg-gray-800">
            <Input
              placeholder="Type or speak your answer..."
              className="flex-1 w-full text-lg px-6 py-6 bg-transparent border-none focus-visible:ring-0 focus-visible:border-primary/50 transition-all duration-200"
              value={input}
              readOnly
            />
            <div className="flex items-center gap-2 px-2">
              {/* Clear button */}
              {input && (
                <button
                  type="button"
                  onClick={handleClearTranscript}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              {/* Voice button */}
              <button
                type="button"
                onClick={handleRecording}
                disabled={!!tempText.trim() || permissionState === 'denied'}
                className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  isListening ? 'bg-blue-500' : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                {isListening ? (
                  <div className="relative size-full rounded-full overflow-hidden">
                    <Image
                      src="/voice-assistant/voice-animation-start.gif"
                      width={100}
                      height={100}
                      alt="Voice recording Start"
                      className="w-full h-full object-cover rounded-full"
                      priority
                    />
                  </div>
                ) : (
                  <Image
                    src="/voice-assistant/voice-animation-stop.png"
                    width={100}
                    height={100}
                    alt="Voice recording Stop"
                    className="w-full h-full object-cover rounded-full"
                    priority
                  />
                )}
              </button>

              {/* Auto submit button */}
              <button
                type="button"
                onClick={toggleAutoSubmit}
                disabled={isSpeaking}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 ${
                  autoSubmit ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-300 hover:bg-gray-400'
                }`}
                title={autoSubmit ? 'Auto-submit enabled' : 'Auto-submit disabled'}
              >
                <Rocket className={`w-5 h-5 ${autoSubmit ? 'text-white' : 'text-gray-700'}`} />
              </button>

              {/* Send button */}
              {!autoSubmit && (
                <Button
                  type="button"
                  onClick={submitMessage}
                  disabled={isLoading || !input.trim()}
                  className="w-10 h-10 p-0 rounded-full flex items-center justify-center bg-green-500 hover:bg-green-600 text-white"
                >
                  <Send className="w-5 h-5" />
                </Button>
              )}

              {/* Stop speaking button */}
              {isSpeaking && (
                <button
                  type="button"
                  onClick={stopSpeaking}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-white"
                  title="Stop speaking"
                >
                  <Square className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </ShineBorder>
      </div>
    </div>
  );
}
