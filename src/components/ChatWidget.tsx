import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { findBestAnswer, KBResult, KNOWLEDGE_BASE, answerWithDeliberation } from '@/lib/faqKnowledgeBase';
const BOT_NAME = 'TapGuide';
import AIService from '@/services/aiService';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: `Hi, I’m ${BOT_NAME}.` }
  ]);
  const [lastResult, setLastResult] = useState<(KBResult & { needsClarification?: boolean; clarifyOptions?: string[] }) | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  // Persist chat in localStorage per session
  useEffect(() => {
    try {
      const raw = localStorage.getItem('s2t_chat_history');
      if (raw) {
        const parsed = JSON.parse(raw) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) setMessages(parsed);
      }
    } catch (_) {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem('s2t_chat_history', JSON.stringify(messages));
    } catch (_) {}
  }, [messages]);

  const ask = async (qIn: string) => {
    const q = qIn.trim();
    if (!q) return;
    setMessages((m) => [...m, { role: 'user', content: q }]);
    setInput('');
    setLoading(true);
    try {
      const deliberate = answerWithDeliberation(q);
      let answer = deliberate?.answer || "Sorry, I couldn't find an answer.";
      setLastResult(deliberate);

      // If match is weak, try AI refinement using KB text as context (if key exists)
      if (deliberate?.score !== undefined && deliberate.score < 0.35 && !deliberate.needsClarification) {
        const kbContext = KNOWLEDGE_BASE.map(e => `Q: ${e.question}\nA: ${e.answer}`).join('\n\n');
        const ai = await AIService.answerProductQuestion(q, kbContext);
        if (ai.success && ai.answer) {
          answer = ai.answer;
        }
      }

      setMessages((m) => [...m, { role: 'assistant', content: answer }]);
      // If clarification is needed, surface options as quick replies
      if (deliberate.needsClarification && deliberate.clarifyOptions && deliberate.clarifyOptions.length > 0) {
        setLastResult({ ...deliberate, related: deliberate.related || [] });
      }
    } finally {
      setLoading(false);
    }
  };
  const sendQuestion = () => ask(input);

  return (
    <div>
      {/* Floating Button */}
      {!open && (
        <button
          aria-label="Open chat"
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-50 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center animate-[slideIn_.3s_ease-out]"
        >
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      )}

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-50 w-[94vw] max-w-[22rem] sm:max-w-sm md:max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden animate-[slideUp_.25s_ease-out]">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="font-bold">{BOT_NAME}</div>
            <button aria-label="Close chat" onClick={() => setOpen(false)} className="opacity-90 hover:opacity-100">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="max-h-[55vh] sm:max-h-80 overflow-y-auto px-3 py-3 space-y-2">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'} px-3 py-2 rounded-xl max-w-[85%] whitespace-pre-wrap`}>{m.content}</div>
              </div>
            ))}
            {/* Starter suggestions when no user message yet */}
            {!messages.some((m) => m.role === 'user') && (
              <div className="text-xs text-gray-600 dark:text-gray-300 space-y-2">
                <div className="font-semibold">Try asking:</div>
                <div className="flex flex-wrap gap-2">
                  {[
                    'What is Scan2Tap?',
                    'How much does Pro cost?',
                    'Do you ship to Kumasi?',
                    'How do I cancel my subscription?',
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => ask(q)}
                      className="px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-800/50 text-blue-700 dark:text-blue-300"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {!loading && lastResult && (lastResult.didYouMean || (lastResult.related && lastResult.related.length > 0) || (lastResult as any).clarifyOptions) && (
              <div className="text-xs text-gray-600 dark:text-gray-300 space-y-2">
                {lastResult.didYouMean && (
                  <div>
                    Did you mean{' '}
                    <button
                      onClick={() => ask(lastResult.didYouMean as string)}
                      className="underline text-blue-600 dark:text-blue-400 hover:opacity-80"
                    >
                      {lastResult.didYouMean}
                    </button>
                    ?
                  </div>
                )}
                {(lastResult as any).clarifyOptions && (
                  <div className="flex flex-wrap gap-2">
                    {(lastResult as any).clarifyOptions.map((opt: string) => (
                      <button
                        key={opt}
                        onClick={() => ask(opt)}
                        className="px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-800/50 text-blue-700 dark:text-blue-300"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
                {lastResult.related && lastResult.related.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {lastResult.related.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => ask(r.question)}
                        className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100"
                      >
                        {r.question}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {loading && (
              <div className="text-xs text-gray-500">Thinking…</div>
            )}
            <div ref={bottomRef} />
          </div>
          <div className="flex items-center gap-2 p-3 border-t border-gray-200 dark:border-gray-700">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') sendQuestion(); }}
              placeholder="Type your question…"
              className="flex-1 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={sendQuestion}
              disabled={loading}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-2 text-sm disabled:opacity-50 flex items-center gap-1"
            >
              <Send className="w-4 h-4" /> Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Keyframes (global tailwind arbitrary)
// slideIn: from { transform: translateY(16px); opacity: 0 } to { transform: translateY(0); opacity: 1 }
// slideUp: from { transform: translateY(24px); opacity: 0 } to { transform: translateY(0); opacity: 1 }

