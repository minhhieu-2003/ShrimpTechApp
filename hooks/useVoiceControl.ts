import { useFirebaseConfig } from '@/contexts/FirebaseConfigContext';
import * as Speech from 'expo-speech';
import { ref, set } from 'firebase/database';
import { useCallback, useRef, useState } from 'react';

interface VoiceCommand {
  command: string;
  variations: string[];
  action: () => Promise<void>;
}

export function useVoiceControl() {
  // ...existing code...
  const { currentDatabase } = useFirebaseConfig();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const commandsRef = useRef<VoiceCommand[]>([]);

  const registerCommand = useCallback((command: VoiceCommand) => {
    commandsRef.current.push(command);
    setDebugInfo(`Command registered: ${command.command}`);
  }, []);

  const clearCommands = useCallback(() => {
    commandsRef.current = [];
    setDebugInfo('All commands cleared');
  }, []);

  const startListening = async () => {
    setIsListening(false);
    setDebugInfo('Voice recognition không khả dụng trên Expo Go. Vui lòng nhập lệnh bằng text.');
  };

  const stopListening = useCallback(() => {
  setIsListening(false);
  setDebugInfo('Voice recognition stopped');
  }, []);

  const speak = async (text: string) => {
    try {
      setIsSpeaking(true);
      setDebugInfo(`Speaking: ${text}`);
      
      // Use expo-speech for text-to-speech
      await new Promise<void>((resolve, reject) => {
        Speech.speak(text, {
          language: 'vi-VN', // Vietnamese
          pitch: 1.0,
          rate: 0.9,
          onDone: () => {
            setIsSpeaking(false);
            setDebugInfo('Speaking completed');
            resolve();
          },
          onError: (error) => {
            setIsSpeaking(false);
            setError(error.toString());
            reject(error);
          }
        });
      });
    } catch (err) {
      setError((err as Error).message);
      setIsSpeaking(false);
    }
  };

  const processVoiceInput = async (text: string) => {
    setRecognizedText(text);
    setDebugInfo(`Processing: ${text}`);
    
    const lowerText = text.toLowerCase().trim();
    
    // Find matching command
    for (const cmd of commandsRef.current) {
      const matches = cmd.variations.some(variation => 
        lowerText.includes(variation.toLowerCase())
      );
      
      if (matches) {
        setDebugInfo(`Matched command: ${cmd.command}`);
        try {
          await cmd.action();
          await speak(`Đã thực hiện: ${cmd.command}`);
          return true;
        } catch (err) {
          setError((err as Error).message);
          await speak('Lỗi khi thực hiện lệnh');
          return false;
        }
      }
    }
    
    setDebugInfo('No matching command found');
    await speak('Không hiểu lệnh. Vui lòng thử lại');
    return false;
  };

  const controlDeviceByConfig = async (path: string, data: any): Promise<boolean> => {
    if (!currentDatabase) {
      setError('Database not connected');
      setDebugInfo('❌ Database not available');
      return false;
    }

    try {
      setDebugInfo(`Controlling device at: ${path}`);
      const deviceRef = ref(currentDatabase, path);
      await set(deviceRef, data);
      setDebugInfo(`✅ Device controlled successfully: ${path}`);
      return true;
    } catch (err) {
      const errorMsg = (err as Error).message;
      setError(errorMsg);
      setDebugInfo(`❌ Error controlling device: ${errorMsg}`);
      return false;
    }
  };

  const createDefaultCommands = useCallback(() => {
    clearCommands();
    
    // Add default Vietnamese commands
    const defaultCommands: VoiceCommand[] = [
      {
        command: 'Bật đèn',
        variations: ['bật đèn', 'mở đèn', 'turn on light'],
        action: async () => {
          await controlDeviceByConfig('devices/lightingLamp', { message: 'ON' });
        }
      },
      {
        command: 'Tắt đèn',
        variations: ['tắt đèn', 'đóng đèn', 'turn off light'],
        action: async () => {
          await controlDeviceByConfig('devices/lightingLamp', { message: 'OFF' });
        }
      },
      {
        command: 'Bật máy bơm oxy',
        variations: ['bật máy bơm oxy', 'mở máy bơm oxy', 'turn on oxygen pump'],
        action: async () => {
          await controlDeviceByConfig('devices/oxygenPump', { message: 'ON' });
        }
      },
      {
        command: 'Tắt máy bơm oxy',
        variations: ['tắt máy bơm oxy', 'đóng máy bơm oxy', 'turn off oxygen pump'],
        action: async () => {
          await controlDeviceByConfig('devices/oxygenPump', { message: 'OFF' });
        }
      },
    ];
    
    defaultCommands.forEach(cmd => registerCommand(cmd));
  }, [registerCommand, clearCommands]);

  const getCommandsStatus = () => {
    return { 
      total: commandsRef.current.length, 
      registered: commandsRef.current.length 
    };
  };

  const initializeVoice = async () => {
    try {
      setIsAvailable(true);
      setDebugInfo('Voice control initialized');
      createDefaultCommands();
    } catch (err) {
      setError((err as Error).message);
      setIsAvailable(false);
    }
  };

  const cleanup = useCallback(() => {
    setIsListening(false);
    setIsSpeaking(false);
    clearCommands();
  }, [clearCommands]);

  return {
  isListening,
  isSpeaking,
  recognizedText,
  error,
  debugInfo,
  isAvailable,
  speak,
  startListening,
  stopListening,
  processVoiceInput,
  registerCommand,
  clearCommands,
  createDefaultCommands,
  controlDeviceByConfig,
  getCommandsStatus,
  setRecognizedText,
  initializeVoice,
  cleanup,
  };
}
