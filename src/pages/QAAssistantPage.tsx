import { useState } from 'react';
import { Bot, Send, ShieldOff, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useDemoMode } from '@/contexts/DemoModeContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const mockResponses: Record<string, string> = {
  'default': "I can help you analyze quality metrics, identify risks, and provide insights about your releases. Try asking about release readiness, flaky tests, or service health.",
  'risk': "**Release 2026.04 Risk Analysis:**\n\nThe release is currently at **78% readiness** with key risks:\n\n• **PaymentService** - 2.4% error rate, degraded health\n• **KYCService** - Down with 8.2% error rate\n• **CheckoutAPI** - Pipeline failing at 65% success rate\n\n2 critical defects remain open. I recommend holding the release until these are resolved.",
  'flaky': "**Top Flaky Tests:**\n\n1. `KYCVerificationE2E` - 40% flakiness (highest)\n2. `NotificationDeliveryAsync` - 30% flakiness\n3. `CheckoutPaymentTest` - 25% flakiness\n\n**Root Cause Analysis:** The KYC test appears to have timing issues with external API mocks. The checkout test may be affected by race conditions in payment gateway stubs.",
  'coverage': "**Coverage Summary:**\n\n• Best covered: **ComplianceService** (92%), **FraudDetection** (91%)\n• Needs attention: **KYCService** (58%), **CheckoutAPI** (65%)\n\nOverall automation coverage is at 79%, below the 80% threshold. Focus coverage efforts on KYC and Checkout modules.",
};

function getResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('risk') || lower.includes('ready') || lower.includes('release')) return mockResponses['risk'];
  if (lower.includes('flaky') || lower.includes('unstable')) return mockResponses['flaky'];
  if (lower.includes('coverage')) return mockResponses['coverage'];
  return mockResponses['default'];
}

export default function QAAssistantPage() {
  const { aiMode } = useDemoMode();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm your QA AI Assistant. Ask me about release readiness, flaky tests, coverage gaps, or service health." },
  ]);
  const [input, setInput] = useState('');

  const send = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: 'user', content: input };
    const assistantMsg: Message = { role: 'assistant', content: getResponse(input) };
    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setInput('');
  };

  if (aiMode === 'disabled') {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
          <ShieldOff size={28} className="text-destructive" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">AI Features Disabled</h2>
        <p className="text-sm text-muted-foreground mb-2">
          The QA AI Assistant is currently disabled by your organization's governance policy.
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          An administrator can re-enable AI features by navigating to <strong>Settings → Governance</strong> and switching the AI Decision Mode to <strong>"Decision Support"</strong> or <strong>"Autonomous"</strong>.
        </p>
        <Link
          to="/settings"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Settings size={14} /> Go to Settings
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-foreground">QA AI Assistant</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Ask questions about quality metrics and release health</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--gradient-accent)' }}>
                <Bot size={14} className="text-accent-foreground" />
              </div>
            )}
            <div className={`max-w-[70%] rounded-lg px-4 py-3 text-sm ${
              msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
            }`}>
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 px-4 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Ask about release readiness, flaky tests, coverage..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
        />
        <button
          onClick={send}
          className="px-4 py-2.5 rounded-lg text-primary-foreground flex items-center gap-2 text-sm font-medium"
          style={{ background: 'var(--gradient-primary)' }}
        >
          <Send size={14} /> Send
        </button>
      </div>
    </div>
  );
}
