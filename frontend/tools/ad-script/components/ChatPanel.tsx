import { useRef, useEffect, useCallback } from 'react';
import { RotateCcw, History } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { sendChatMessage } from '../services/api';
import type { OptionCard } from '../types';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

export default function ChatPanel() {
  const messages = useChatStore((s) => s.messages);
  const sessionId = useChatStore((s) => s.sessionId);
  const currentStep = useChatStore((s) => s.currentStep);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const error = useChatStore((s) => s.error);
  const addMessage = useChatStore((s) => s.addMessage);
  const appendToLastMessage = useChatStore((s) => s.appendToLastMessage);
  const appendStepContent = useChatStore((s) => s.appendStepContent);
  const setStepContent = useChatStore((s) => s.setStepContent);
  const setSessionId = useChatStore((s) => s.setSessionId);
  const setCurrentStep = useChatStore((s) => s.setCurrentStep);
  const setIsStreaming = useChatStore((s) => s.setIsStreaming);
  const setShowTierModal = useChatStore((s) => s.setShowTierModal);
  const setError = useChatStore((s) => s.setError);
  const reset = useChatStore((s) => s.reset);
  const setHistoryOpen = useChatStore((s) => s.setHistoryOpen);
  const setLastMessageOptions = useChatStore((s) => s.setLastMessageOptions);
  const replaceLastMessage = useChatStore((s) => s.replaceLastMessage);

  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const activeStepRef = useRef(currentStep);
  activeStepRef.current = currentStep;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(
    async (message: string, images?: string[], confirmStep?: boolean) => {
      setError(null);
      addMessage('user', message, images);
      addMessage('assistant', '');
      setIsStreaming(true);

      let streamStep = activeStepRef.current;
      if (!confirmStep) {
        setStepContent(streamStep, '');
      }

      abortRef.current = new AbortController();

      try {
        const stream = sendChatMessage(
          { sessionId: sessionId || undefined, message, images, confirmStep },
          abortRef.current.signal
        );

        for await (const event of stream) {
          switch (event.type) {
            case 'session':
              if (event.sessionId) setSessionId(event.sessionId);
              break;
            case 'delta':
              if (event.content) {
                appendToLastMessage(event.content);
                appendStepContent(streamStep, event.content);
              }
              break;
            case 'step':
              if (event.currentStep) {
                setCurrentStep(event.currentStep);
                streamStep = event.currentStep;
                setStepContent(streamStep, '');
              }
              if (event.isReadyToGenerate) setShowTierModal(true);
              break;
            case 'content_replace':
              if (event.content !== undefined) {
                replaceLastMessage(event.content);
                setStepContent(streamStep, event.content);
              }
              break;
            case 'options':
              if (event.options) setLastMessageOptions(event.options);
              break;
            case 'done':
              if (event.currentStep) setCurrentStep(event.currentStep);
              break;
            case 'error':
              setError(event.error || '未知错误');
              break;
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [sessionId, addMessage, appendToLastMessage, appendStepContent, setStepContent, setSessionId, setCurrentStep, setIsStreaming, setShowTierModal, setError, setLastMessageOptions, replaceLastMessage]
  );

  const handleOptionSelect = useCallback(
    (option: OptionCard) => {
      setLastMessageOptions(
        messages[messages.length - 1]?.options?.map((o) =>
          o.id === option.id ? { ...o, selected: true } : o
        ) || []
      );
      handleSend(`选择了「${option.label}」：${option.description}`);
    },
    [messages, setLastMessageOptions, handleSend]
  );

  const handleConfirmStep = useCallback(() => {
    handleSend('确认当前步骤，进入下一步', undefined, true);
  }, [handleSend]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
        <div>
          <h2 className="text-sm font-semibold text-white">对话</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setHistoryOpen(true)}
            className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
            title="历史记录"
          >
            <History className="w-3.5 h-3.5" />
          </button>
          {messages.length > 0 && (
            <button
              onClick={reset}
              disabled={isStreaming}
              className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors disabled:opacity-30"
              title="新建对话"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 min-h-0">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-2">
            <p className="text-white/40 text-xs leading-relaxed">
              发送产品图片、淘宝链接或文字描述，开始创作
            </p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              isLatest={i === messages.length - 1 && !isStreaming}
              onOptionSelect={handleOptionSelect}
            />
          ))
        )}
      </div>

      {!isStreaming && currentStep <= 5 && messages.some((m) => m.role === 'assistant' && m.content) && (
        <div className="px-3 pb-2 shrink-0">
          <button
            onClick={handleConfirmStep}
            className="w-full py-2.5 rounded-xl bg-cm-primary text-cm-surface text-sm font-medium hover:bg-cm-primary/80 transition-colors"
          >
            确认，进入下一步 →
          </button>
        </div>
      )}

      {error && (
        <div className="mx-3 mb-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs shrink-0">
          {error}
        </div>
      )}

      <ChatInput
        onSend={handleSend}
        disabled={isStreaming}
        placeholder={
          messages.length === 0
            ? '描述你的产品...'
            : isStreaming
              ? 'AI 正在思考...'
              : '继续对话...'
        }
      />
    </div>
  );
}
