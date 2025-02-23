import { useEffect } from "react";
import { useInterviewSessionSpeechStore } from "@/services/store";

export function useSpeechSynthesisInit() {
  const { setVoices, setSelectedVoice } = useInterviewSessionSpeechStore();

  useEffect(() => {
    // Function to load and set voices
    function loadVoices() {
      const availableVoices = window.speechSynthesis.getVoices();
      const englishVoices = availableVoices.filter((voice) => voice.lang.startsWith("en-"));
      const sgVoice = englishVoices.find((voice) => voice.name === "Microsoft Wayne Online (Natural) - English (Singapore)");

      setVoices(englishVoices);
      if (sgVoice) {

        setSelectedVoice(sgVoice);
      }
    }

    // Load voices immediately in case they're already available
    loadVoices();

    // Add event listener for when voices change/load
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, [setVoices, setSelectedVoice]);
}
