import { useState } from 'react';
import { Bot, Send, ShieldOff, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useDemoMode } from '@/contexts/DemoModeContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const mockResponses: Record<string, string> = {
  'default': "I can help you analyze quality metrics, identify risks, and provide insights about your releases. Try asking about release readiness, flaky tests, or service health.",
  'risk': `**Release 2026.04 Risk Analysis:**

The release is currently at **78% readiness** with key risks:

• **PaymentService** - 2.4% error rate, degraded health
• **KYCService** - Down with 8.2% error rate
• **CheckoutAPI** - Pipeline failing at 65% success rate

2 critical defects remain open. I recommend holding the release until these are resolved.

---

> **🧠 Reasoning**
>
> I arrived at this assessment by cross-referencing several data points:
>
> 1. **Service Health Metrics** — I pulled real-time error rates from all 8 monitored services. PaymentService (2.4%) and KYCService (8.2%) exceed the 1% error-rate threshold defined in your org's release policy.
> 2. **Pipeline Success Rate** — CheckoutAPI's CI/CD pipeline is at 65%, well below the 95% pass-rate gate. The last 3 runs failed at the integration-test stage.
> 3. **Open Defects** — There are 2 P1/critical defects (DEF-2048, DEF-2051) still in "Open" status assigned to the payments team. Historical data shows P1s take an average of 2.3 days to resolve.
> 4. **Readiness Score Calculation** — The 78% score is a weighted composite: test pass rate (25%), service health (25%), pipeline stability (20%), defect closure (15%), and coverage (15%). The failing services and open criticals drag the score below the 85% go/no-go threshold.
> 5. **Historical Comparison** — Releases shipped below 80% readiness in the past 6 months had a 3× higher post-release incident rate.`,
  'flaky': `**Top Flaky Tests:**

1. \`KYCVerificationE2E\` - 40% flakiness (highest)
2. \`NotificationDeliveryAsync\` - 30% flakiness
3. \`CheckoutPaymentTest\` - 25% flakiness

**Root Cause Analysis:** The KYC test appears to have timing issues with external API mocks. The checkout test may be affected by race conditions in payment gateway stubs.

---

> **🧠 Reasoning**
>
> Here's how I identified these tests and their root causes:
>
> 1. **Flakiness Score** — I calculated flakiness as \`(inconsistent runs / total runs)\` over the last 14 days. A test that passes and fails on the same commit is flagged as inconsistent.
> 2. **KYCVerificationE2E (40%)** — Failed 8 out of 20 runs. Stack traces show \`TimeoutError\` at the external KYC API mock boundary. The mock server responds in 50-3200ms (p99), but the test has a 2s hard timeout. This is a classic async mock timing issue.
> 3. **NotificationDeliveryAsync (30%)** — 6/20 failures. All failures show the assertion firing before the async notification callback completes. The test doesn't properly await the event bus delivery confirmation.
> 4. **CheckoutPaymentTest (25%)** — 5/20 failures. Failures correlate with parallel test runs—the payment gateway stub uses a shared port, causing socket conflicts. This is a test isolation problem.
> 5. **Prioritization** — I ranked by flakiness percentage because higher flakiness = more CI noise and developer productivity loss. KYC is the top priority as it also blocks the release pipeline gate.`,
  'coverage': `**Coverage Summary:**

• Best covered: **ComplianceService** (92%), **FraudDetection** (91%)
• Needs attention: **KYCService** (58%), **CheckoutAPI** (65%)

Overall automation coverage is at 79%, below the 80% threshold. Focus coverage efforts on KYC and Checkout modules.

---

> **🧠 Reasoning**
>
> Here's how I analyzed coverage and made these recommendations:
>
> 1. **Data Source** — Coverage percentages are pulled from the latest test execution reports across unit, integration, and E2E test suites, mapped to each service's codebase.
> 2. **Threshold Policy** — Your organization's quality gate requires ≥80% automation coverage per service. Two services fall below: KYCService (58%) and CheckoutAPI (65%).
> 3. **KYCService Gap Analysis** — 58% coverage leaves 42% of code paths untested. The uncovered areas are concentrated in error-handling branches (identity verification failures, document upload edge cases). These are high-risk paths given KYC is a compliance-critical service.
> 4. **CheckoutAPI Gap** — At 65%, the primary gaps are in multi-currency conversion logic and partial-refund flows. These were recently refactored (sprint 2026.03) but tests weren't updated.
> 5. **Overall Score Impact** — The 79% overall score is a weighted average. Bringing KYC to 80% (+22%) and Checkout to 80% (+15%) would push the overall to ~85%, comfortably above the gate.
> 6. **Priority Recommendation** — I recommend KYC first because (a) it's further from the threshold, (b) it's compliance-critical, and (c) its low coverage correlates with its high flakiness—more tests will also help stabilize flaky results.`,
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
              <div className="prose prose-sm prose-invert max-w-none [&>blockquote]:border-l-primary/50 [&>blockquote]:bg-primary/5 [&>blockquote]:rounded-r-lg [&>blockquote]:py-2 [&>blockquote]:px-3 [&>hr]:border-border/50">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
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
