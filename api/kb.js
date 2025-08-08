// Lightweight JS knowledge base for serverless runtime (no TS imports)

const KNOWLEDGE_BASE = [
  {
    id: 'plans-free-pro',
    question: 'What is included in Free vs Pro?',
    answer:
      'Free: 7 links, basic layouts, QR generator, privacy controls. Pro: unlimited links, premium themes/layouts, analytics, upcoming custom domains and team features.',
    keywords: ['pricing', 'plans', 'free', 'pro', 'upgrade', 'links', 'analytics', 'themes'],
  },
  {
    id: 'pricing-gh',
    question: 'How much does Pro cost in Ghana?',
    answer:
      'Pro is $4/month or $40/year. Pay by card via Paystack for subscriptions. Card orders can support local methods as enabled.',
    keywords: ['Ghana', 'GHS', 'paystack', 'price', 'subscription'],
  },
  {
    id: 'auth',
    question: 'How do I sign up and sign in?',
    answer:
      'Use email/password or continue with Google/Apple. After signing in you will complete a quick onboarding to create your profile.',
    keywords: ['auth', 'login', 'signup', 'google', 'apple', 'onboarding'],
  },
  {
    id: 'onboarding',
    question: 'How does onboarding work?',
    answer:
      'Pick a username, add name/title/bio, add social links, choose a theme and optional wallpaper. You can edit everything later in the dashboard.',
    keywords: ['onboarding', 'profile', 'links', 'themes'],
  },
  {
    id: 'analytics',
    question: 'What analytics are available?',
    answer:
      'Pro shows profile views, unique visitors, link clicks, and time-based summaries. Data appears in your dashboard.',
    keywords: ['analytics', 'stats', 'views', 'clicks'],
  },
  {
    id: 'qr',
    question: 'Do I get a QR code?',
    answer:
      'Yes. Generate and download a dynamic QR that points to your profile. It updates as your profile changes.',
    keywords: ['qr', 'code', 'download'],
  },
  {
    id: 'cards-ghana',
    question: 'Do you ship physical cards in Ghana?',
    answer:
      'Yes. Order premium cards with your QR. Delivery timelines depend on your region; Ghana shipping is supported first.',
    keywords: ['card', 'shipping', 'ghana', 'order'],
  },
  {
    id: 'payments',
    question: 'How do payments work?',
    answer:
      'Subscriptions use Paystack card payments with automatic renewal. Orders are confirmed after successful payment.',
    keywords: ['payment', 'paystack', 'subscription', 'renewal', 'order'],
  },
  {
    id: 'privacy',
    question: 'Can I control what info is shown on my public profile?',
    answer:
      'Yes. Toggle visibility for email/phone and edit links anytime. You can also choose themes and wallpapers.',
    keywords: ['privacy', 'visibility', 'profile', 'email', 'phone'],
  },
  {
    id: 'support',
    question: 'How can I contact support?',
    answer:
      'Use the Contact page or email our support address listed in the footer. We aim to reply within one business day.',
    keywords: ['support', 'contact', 'help'],
  },
  {
    id: 'cancel',
    question: 'How do I cancel Pro?',
    answer:
      'Cancel anytime from Dashboard → Settings → Subscription. You keep Pro until the end of the billing period.',
    keywords: ['cancel', 'subscription', 'billing'],
  },
];

function tokenize(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

export function findBestAnswer(query) {
  const qTokens = new Set(tokenize(query));
  let best = { id: '', answer: '', score: 0 };
  for (const entry of KNOWLEDGE_BASE) {
    const text = `${entry.question} ${entry.answer} ${(entry.keywords || []).join(' ')}`;
    const eTokens = new Set(tokenize(text));
    let overlap = 0;
    qTokens.forEach((t) => { if (eTokens.has(t)) overlap += 1; });
    const denom = qTokens.size + eTokens.size - overlap;
    const score = denom > 0 ? overlap / denom : 0;
    if (score > best.score) best = { id: entry.id, answer: entry.answer, score };
  }
  if (best.score < 0.02) {
    return {
      id: 'fallback',
      score: 0,
      answer:
        "I couldn’t find an exact answer. Try asking about pricing, plans, onboarding, analytics, Ghana cards, or payments—or contact support on the Contact page.",
    };
  }
  return best;
}

