import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceAssistantProps {
  onCommand?: (command: string) => void;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onCommand }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showCommands, setShowCommands] = useState(false);
  const { toast } = useToast();

  const commands = [
    "Find internships in [technology] in [city]",
    "Show my saved internships",
    "Open my profile",
    "Search for remote internships",
    "Filter by paid internships",
    "Go to dashboard"
  ];

  useEffect(() => {
    // Check if browser supports Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
  }, []);

  const startListening = () => {
    if (!isSupported) {
      toast({
        title: "Not supported",
        description: "Speech recognition is not supported in this browser.",
        variant: "destructive",
      });
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };

    recognition.onresult = (event) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
      onCommand?.(result);
      
      toast({
        title: "Command received",
        description: `"${result}"`,
      });
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      toast({
        title: "Recognition error",
        description: "Could not understand the command. Please try again.",
        variant: "destructive",
      });
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const stopListening = () => {
    setIsListening(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="space-y-4">
        {showCommands && (
          <Card className="w-80 shadow-strong">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Voice Commands</h3>
                <Volume2 className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                {commands.map((command, index) => (
                  <p key={index} className="text-xs text-muted-foreground">
                    "{command}"
                  </p>
                ))}
              </div>
              {transcript && (
                <div className="mt-3 p-2 bg-muted rounded text-xs">
                  <strong>Last command:</strong> "{transcript}"
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCommands(!showCommands)}
            className="text-xs"
          >
            {showCommands ? 'Hide' : 'Help'}
          </Button>
          
          <Button
            onClick={isListening ? stopListening : startListening}
            disabled={!isSupported}
            className={`w-14 h-14 rounded-full shadow-strong hover:shadow-medium transition-all duration-300 ${
              isListening 
                ? 'bg-destructive hover:bg-destructive/90 animate-pulse' 
                : 'bg-primary hover:bg-primary/90'
            }`}
          >
            {isListening ? (
              <MicOff className="h-6 w-6" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default VoiceAssistant;