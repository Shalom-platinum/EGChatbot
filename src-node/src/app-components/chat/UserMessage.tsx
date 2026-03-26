import { Suspense, memo } from 'react';
// import { Spinner, Badge } from '@fluentui/react-components';
// import { Attach24Regular, ImageRegular } from '@fluentui/react-icons';
// import { UserMessage as CopilotUserMessage } from '@fluentui-copilot/react-copilot-chat';
// import { Markdown } from '../core/Markdown';
// import { useFormatTimestamp } from '../../hooks/useFormatTimestamp';
// import type { IChatItem } from '../../types/chat';
import { IChatItem } from '@/app-model/chat';
import { useFormatTimestamp } from '@/utils/useFormatTimestamp';
import { AppSpinner } from '../AppSpinner';
const GRADIENT =
  "linear-gradient(135deg, #e8184e 0%, #c0396b 60%, #8b2fc9 100%)";
const GRADIENT_BTN = "linear-gradient(135deg, #8b2fc9, #c0396b)";
const GRADIENT_USER = "linear-gradient(135deg, #e8184e, #8b2fc9)";
interface UserMessageProps {
  message: IChatItem;
  isFull?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function UserMessageComponent({ message, isFull }: UserMessageProps) {
  const formatTimestamp = useFormatTimestamp();
  const timestamp = message.more?.time ? formatTimestamp(new Date(message.more.time)) : '';

  const botBubbleWidth = isFull ? "max-w-md" : ""; // cap bot bubble width in full mode
  const userBubbleWidth = isFull ? "max-w-md" : "max-w-sm";
  return (
  
      <Suspense fallback={<AppSpinner className={undefined}   />}>
        <div key={message.id} className="flex justify-end">
              <div
                 className={`px-4 py-2.5 rounded-2xl rounded-br-sm shadow-sm ${userBubbleWidth}`}
               style={{ background: GRADIENT_USER }}
              >
                <p className="text-white text-sm leading-relaxed">{message.content}</p>
               </div>
             </div>
      </Suspense>
   );
}

export const UserMessage = memo(UserMessageComponent, (prev, next) => {
  // Re-render only if message content or attachments change
  return (
    prev.message.id === next.message.id &&
    prev.message.content === next.message.content &&
    prev.message.attachments?.length === next.message.attachments?.length
  );
});