import { GRADIENT_USER } from '@/app-config/chat';
import { SendIcon } from 'lucide-react';
import { useState, useRef, useEffect, useId } from 'react';
// import {
//   ChatInput as ChatInputFluent,
//   ImperativeControlPlugin,
//   type ImperativeControlPluginRef,
// } from '@fluentui-copilot/react-copilot';
// import { Button, Toast, ToastTitle, Toaster, useId, useToastController, Text, makeStyles, tokens } from '@fluentui/react-components';
// import { Attach24Regular, Settings24Regular, ChatAdd24Regular, Stop24Regular } from '@fluentui/react-icons';
// import { FilePreview } from './FilePreview';
// import { MicrophoneButton } from './MicrophoneButton';
// import { validateFile, validateFileCount } from '../../utils/fileAttachments';
// import styles from './ChatInput.module.css';

const CHAR_WARNING_THRESHOLD = 3000;
const CHAR_DANGER_THRESHOLD = 3500;
const CHAR_MAX_RECOMMENDED = 4000;

 
interface ChatInputProps {
  onSubmit: (value: string, files?: File[]) => void;
  disabled?: boolean;
  placeholder?: string;
  autoSubmitText?: string | null;
  onAutoSubmitComplete?: () => void;
  onOpenSettings?: () => void;
  onNewChat?: () => void;
  hasMessages?: boolean;
  isStreaming?: boolean;
  onCancelStream?: () => void;
  getAccessToken?: () => Promise<string | null>;
  apiUrl?: string;
  isFull?: boolean;
}

const focusInput = (containerRef: React.RefObject<HTMLDivElement | null>) => {
  const editableDiv = containerRef.current?.querySelector('[contenteditable="true"]') as HTMLElement;
  if (editableDiv) {
    editableDiv.focus();
  }
};

export const ChatInput: React.FC<ChatInputProps> = ({
  onSubmit,
  disabled = false,
  placeholder = "Type your message...",
  autoSubmitText,
  onAutoSubmitComplete,
  onOpenSettings,
  onNewChat,
  hasMessages = false,
  isStreaming = false,
  onCancelStream,
  getAccessToken,
  apiUrl = '/api',
  isFull,
}) => {
  const [inputText, setInputText] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
   const fileInputRef = useRef<HTMLInputElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
    const [input, setInput] = useState("");
  const lastAutoSubmittedRef = useRef<string | null>(null);

  const toasterId = useId();
   const charCounterId = useId();
 
  const charCount = inputText.length;
  const showCounter = charCount >= CHAR_WARNING_THRESHOLD;
   

  // Auto-focus on mount for immediate typing
  useEffect(() => {
    if (!disabled) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => focusInput(inputContainerRef), 100);
      return () => clearTimeout(timer);
    }
  }, []); // Only on mount

  // Restore focus after message is sent (when status changes from disabled back to enabled)
  useEffect(() => {
    if (!disabled && !isStreaming) {
      // Small delay to allow state to settle
      const timer = setTimeout(() => focusInput(inputContainerRef), 50);
      return () => clearTimeout(timer);
    }
  }, [disabled, isStreaming]);

  // Focus input when messages are cleared (new chat button clicked)
  useEffect(() => {
    if (!hasMessages && !disabled) {
      // Delay to ensure state has settled after clearing
      const timer = setTimeout(() => focusInput(inputContainerRef), 100);
      return () => clearTimeout(timer);
    }
  }, [hasMessages, disabled]);

  useEffect(() => {
    if (!autoSubmitText) {
      lastAutoSubmittedRef.current = null;
      return;
    }

    if (disabled || isStreaming || lastAutoSubmittedRef.current === autoSubmitText) {
      return;
    }

    lastAutoSubmittedRef.current = autoSubmitText;
    setInput(autoSubmitText);

    const timer = window.setTimeout(() => {
      onSubmit(autoSubmitText);
      setInput("");
      onAutoSubmitComplete?.();
    }, 150);

    return () => window.clearTimeout(timer);
  }, [autoSubmitText, disabled, isStreaming, onSubmit, onAutoSubmitComplete]);

 
  const handleCancelStream = () => {
    onCancelStream?.();
  };

  const handleSubmit = () => {
    const trimmedInput = input.trim();

    if (!trimmedInput || disabled || isStreaming) {
      return;
    }

    onSubmit(trimmedInput, selectedFiles.length > 0 ? selectedFiles : undefined);
    setInput("");
  };

 
   
  const handleKeyDown = (event: React.KeyboardEvent) => {
    // Escape to cancel streaming
    if (event.key === 'Escape' && isStreaming) {
      event.preventDefault();
      handleCancelStream();
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      handleSubmit();
    }
  };
 
  return (
    <>
    <div
        className={`bg-white border-t border-gray-100 flex items-center gap-3 flex-shrink-0 ${isFull ? "px-8 py-4" : "px-4 py-3"}`}
      >
        <input
          className={`flex-1 bg-gray-100 rounded-full text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-pink-200 transition min-w-0 ${isFull ? "px-5 py-3 text-sm" : "px-4 py-2.5 text-sm"}`}
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={handleSubmit}
          className={`rounded-full flex items-center justify-center transition hover:opacity-85 active:scale-95 flex-shrink-0 ${isFull ? "w-11 h-11" : "w-9 h-9"}`}
          style={{ background: GRADIENT_USER }}
        >
          <SendIcon />
        </button>
      </div>
    </>
  );
};
