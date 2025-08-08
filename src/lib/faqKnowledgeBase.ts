export interface KBEntry {
  id: string;
  question: string;
  answer: string;
  keywords?: string[];
}

// Curated in-house knowledge base. Keep answers concise and product-accurate.
// IMPORTANT: Prefer product truths reflected in the codebase (pricing, limits, flows).
export const KNOWLEDGE_BASE: KBEntry[] = [
  // App overview
  {
    id: 'app-overview',
    question: 'What is Scan2Tap?',
    answer:
      'Scan2Tap is a digital business card platform. Create a beautiful profile with your links, share via QR/NFC, track analytics, and optionally order physical cards (Ghana now).',
    keywords: ['app', 'platform', 'digital business card', 'nfc', 'qr', 'profile', 'links'],
  },
  // Plans & Pricing
  {
    id: 'plans-free-pro',
    question: 'What is included in Free vs Pro?',
    answer:
      'Free: 7 links, basic layouts, QR generator, privacy controls. Pro: unlimited links, premium themes/layouts, analytics, and priority support. Team and custom domains are on the roadmap.',
    keywords: ['pricing', 'plans', 'free', 'pro', 'upgrade', 'limit', 'links', 'analytics', 'themes'],
  },
  {
    id: 'free-limit',
    question: 'What is the free links limit?',
    answer: 'Free plans can add up to 7 links. Upgrade to Pro for unlimited links.',
    keywords: ['free', 'limit', 'links', '7'],
  },
  {
    id: 'pricing-amounts',
    question: 'How much does Pro cost?',
    answer:
      'Pro is $4/month or $40/year. In Ghana, payments are processed via Paystack using major cards. Pricing may vary by currency and taxes.',
    keywords: ['price', 'cost', 'monthly', 'annual', 'ghana', 'usd', 'ghs', 'paystack'],
  },

  // Auth & Onboarding
  {
    id: 'auth-methods',
    question: 'How do I sign up and sign in?',
    answer:
      'Use email/password or continue with Google or Apple. After sign-in, a quick onboarding helps you set a username and profile details.',
    keywords: ['auth', 'login', 'signup', 'google', 'apple', 'onboarding'],
  },
  {
    id: 'onboarding-flow',
    question: 'How does onboarding work?',
    answer:
      'Choose a username, add name/title/bio, add social links, pick a theme and optional wallpaper. Everything is editable later in the dashboard.',
    keywords: ['onboarding', 'profile', 'links', 'themes', 'wallpaper'],
  },
  {
    id: 'username-change',
    question: 'Can I change my username later?',
    answer:
      'Yes. You can change your username from the profile settings in the dashboard. Old URLs may stop working, so update your QR if you reprint.',
    keywords: ['username', 'handle', 'slug', 'change'],
  },

  // Profiles & Links
  {
    id: 'links-limit',
    question: 'How many links can I add?',
    answer:
      'Free plans can add up to 7 links. Pro plans have no link limit.',
    keywords: ['links', 'limit', 'max', 'free', 'pro'],
  },
  {
    id: 'links-types',
    question: 'What link types are supported?',
    answer:
      'Common social links (WhatsApp, Instagram, Twitter/X, LinkedIn, Facebook), websites, phone, email, and custom URLs. Icons and labels are auto-applied when possible.',
    keywords: ['links', 'social', 'whatsapp', 'instagram', 'linkedin', 'facebook', 'phone', 'email', 'url'],
  },
  {
    id: 'links-reorder',
    question: 'Can I reorder links?',
    answer:
      'Yes. Drag and drop links in the dashboard to reorder them. The public profile updates instantly.',
    keywords: ['links', 'reorder', 'drag', 'arrange'],
  },
  {
    id: 'privacy-visibility',
    question: 'Can I hide email or phone on my profile?',
    answer:
      'Yes. Toggle visibility for sensitive fields like email and phone in profile settings.',
    keywords: ['privacy', 'visibility', 'email', 'phone'],
  },

  // Themes & Media
  {
    id: 'themes',
    question: 'What themes and wallpapers are available?',
    answer:
      'Choose from multiple themes and curated wallpapers. Pro unlocks premium themes, with more layouts coming soon.',
    keywords: ['themes', 'wallpaper', 'layout', 'design', 'appearance'],
  },
  {
    id: 'avatar-upload',
    question: 'How do I upload or crop my avatar?',
    answer:
      'Upload a clear square image. Use the built-in cropper to adjust. We optimize and store it to load fast on your profile.',
    keywords: ['avatar', 'photo', 'upload', 'crop', 'image'],
  },

  // QR & Sharing
  {
    id: 'qr',
    question: 'Do I get a QR code?',
    answer:
      'Yes. Generate and download a dynamic QR pointing to your profile. It stays valid even if you update your links or theme.',
    keywords: ['qr', 'code', 'download', 'share'],
  },

  // Analytics
  {
    id: 'analytics',
    question: 'What analytics are available?',
    answer:
      'Pro shows profile views, unique visitors, link clicks, and time-based summaries in your dashboard.',
    keywords: ['analytics', 'stats', 'views', 'clicks', 'dashboard'],
  },

  // Payments & Subscriptions
  {
    id: 'payments',
    question: 'How do payments work?',
    answer:
      'Subscriptions are billed via Paystack with automatic renewal. You can cancel anytime from Dashboard → Settings → Subscription.',
    keywords: ['payment', 'paystack', 'subscription', 'renewal', 'billing'],
  },
  {
    id: 'cancel',
    question: 'How do I cancel Pro?',
    answer:
      'Open Dashboard → Settings → Subscription and choose Cancel. Pro remains active until the end of the paid period.',
    keywords: ['cancel', 'subscription', 'billing', 'downgrade'],
  },
  {
    id: 'upgrade',
    question: 'How do I upgrade to Pro?',
    answer:
      'From the dashboard or pricing page, select a Pro plan. Complete payment via Paystack. Your Pro features activate after payment is confirmed.',
    keywords: ['upgrade', 'pro', 'payment', 'plan'],
  },

  // Orders & Shipping (Ghana first)
  {
    id: 'cards-ghana',
    question: 'Do you ship physical cards in Ghana?',
    answer:
      'Yes. Order premium cards with your QR. Delivery timelines vary by region; Ghana shipping is supported first.',
    keywords: ['card', 'shipping', 'ghana', 'order', 'delivery'],
  },
  {
    id: 'cards-us',
    question: 'Can I order physical cards in the United States?',
    answer:
      'US physical card ordering is not available yet. The digital profile works globally today. US hardware and fulfillment are coming soon.',
    keywords: ['united states', 'usa', 'us', 'america', 'shipping', 'card', 'order', 'not available'],
  },
  {
    id: 'card-design',
    question: 'Can I customize my card design?',
    answer:
      'Yes. Choose material and style, and your profile QR links to your live page. More customization options are rolling out.',
    keywords: ['card', 'design', 'material', 'customize'],
  },

  // Profiles & URLs
  {
    id: 'public-url',
    question: 'What is my public profile URL?',
    answer:
      'It is typically yourdomain.com/your-username. You can also access via a user ID URL, but username is recommended for sharing.',
    keywords: ['url', 'link', 'username', 'share'],
  },

  // Support
  {
    id: 'support',
    question: 'How can I contact support?',
    answer:
      'Use the Contact page or the email listed in the site footer. We aim to respond within one business day.',
    keywords: ['support', 'contact', 'help'],
  },
];

// Lightweight NLP utilities (no extra deps)
const normalize = (text: string) => (text || '').toLowerCase();

// Common stopwords to reduce generic overlaps in questions like "what is this"
const STOPWORDS = new Set<string>([
  'the','a','an','and','or','but','of','in','on','to','for','from','with','by','at','as','is','are','be','was','were','it','its','this','that','these','those','what','how','do','does','can','i','you','your','my','we','they','our','about'
]);

const tokenize = (text: string) =>
  normalize(text)
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .filter((t) => !STOPWORDS.has(t));

// Domain synonyms to improve matching quality
const SYNONYMS: Record<string, string[]> = {
  app: ['application', 'platform', 'product', 'service'],
  price: ['pricing', 'cost', 'fee', 'fees', 'charge', 'charges', 'rate'],
  plans: ['tiers', 'packages', 'subscription', 'pro', 'free', 'upgrade'],
  cancel: ['unsubscribe', 'stop', 'terminate', 'end'],
  signup: ['sign', 'register', 'create', 'join'],
  login: ['log', 'signin', 'sign-in', 'sign in'],
  google: ['gmail', 'google sign in'],
  apple: ['ios', 'apple sign in'],
  ghana: ['gh', 'accra', 'kumasi'],
  us: ['usa', 'america', 'united states'],
  card: ['nfc', 'physical', 'print'],
  analytics: ['stats', 'metrics', 'insights'],
  qr: ['qrcode', 'code', 'scan'],
  link: ['links', 'url', 'urls'],
  avatar: ['photo', 'profile picture', 'image'],
  seven: ['7'],
};

function expandTokens(tokens: string[]): string[] {
  const expanded: string[] = [...tokens];
  tokens.forEach((t) => {
    const base = t.trim();
    if (SYNONYMS[base]) expanded.push(...SYNONYMS[base]);
  });
  return expanded;
}

// Precompute document term frequencies and IDF weights
type DocInfo = {
  id: string;
  tokens: string[];
  termFreq: Record<string, number>;
  text: string; // for phrase checks and fuzzy
};

const DOCS: DocInfo[] = KNOWLEDGE_BASE.map((e) => {
  const text = `${e.question} ${e.answer} ${(e.keywords || []).join(' ')}`;
  const tokens = tokenize(text);
  const termFreq: Record<string, number> = {};
  tokens.forEach((t) => {
    termFreq[t] = (termFreq[t] || 0) + 1;
  });
  return { id: e.id, tokens, termFreq, text: normalize(text) };
});

const NUM_DOCS = DOCS.length;
const DOC_FREQ: Record<string, number> = {};
DOCS.forEach((d) => {
  const seen = new Set<string>();
  d.tokens.forEach((t) => {
    if (!seen.has(t)) {
      DOC_FREQ[t] = (DOC_FREQ[t] || 0) + 1;
      seen.add(t);
    }
  });
});

const IDF: Record<string, number> = {};
Object.keys(DOC_FREQ).forEach((t) => {
  IDF[t] = Math.log(1 + NUM_DOCS / (1 + DOC_FREQ[t]));
});

function bigrams(str: string): Set<string> {
  const s = normalize(str).replace(/\s+/g, ' ');
  const grams = new Set<string>();
  for (let i = 0; i < s.length - 1; i++) grams.add(s.slice(i, i + 2));
  return grams;
}

function diceSimilarity(a: string, b: string): number {
  const A = bigrams(a);
  const B = bigrams(b);
  const inter = [...A].filter((x) => B.has(x)).length;
  return (2 * inter) / (A.size + B.size || 1);
}

// Hard routing for very common intents to ensure accurate answers
function routeToEntryId(query: string): string | null {
  const q = normalize(query);
  if (/\bwhat\s+is\s+(scan2tap|your\s+app|this\s+app)\b/.test(q) || /\babout\s+scan2tap\b/.test(q)) {
    return 'app-overview';
  }
  return null;
}

export function scoreQueryAgainstEntry(query: string, entry: KBEntry): number {
  const qTokensRaw = tokenize(query);
  const qTokens = expandTokens(qTokensRaw);
  const doc = DOCS.find((d) => d.id === entry.id);
  if (!doc) return 0;

  let score = 0;
  const seen = new Set<string>();
  qTokens.forEach((t) => {
    const tf = doc.termFreq[t] || 0;
    const idf = IDF[t] || 0;
    if (tf > 0) score += (1 + Math.log(tf)) * idf; // log-tf * idf
    if (!seen.has(t) && tf > 0) {
      seen.add(t);
    }
  });

  // Keyword boost
  const kw = (entry.keywords || []).map(normalize);
  const qSet = new Set(qTokens.map(normalize));
  const kwMatches = kw.filter((k) => qSet.has(k)).length;
  score += kwMatches * 0.25;

  // Section-weighted overlap (question > keywords > answer)
  const questionTokens = tokenize(entry.question);
  const answerTokens = tokenize(entry.answer);
  const questionOverlap = questionTokens.filter((t) => qSet.has(t)).length;
  const answerOverlap = answerTokens.filter((t) => qSet.has(t)).length;
  score += questionOverlap * 0.15 + answerOverlap * 0.05;

  // Phrase/intent boosts
  const qNorm = normalize(query);
  if (/cancel\s+(pro|subscription)/.test(qNorm) && /cancel|subscription/.test(doc.text)) score += 0.6;
  if (/(price|cost|pricing)/.test(qNorm) && /(price|cost|pricing)/.test(doc.text)) score += 0.4;
  if (/(ghana|shipping|delivery)/.test(qNorm) && /(ghana|shipping|delivery)/.test(doc.text)) score += 0.4;
  if (/(united states|usa|america|us)/.test(qNorm) && /(united states|usa|america|us|not available)/.test(doc.text)) score += 0.5;
  if (/(how many|limit|max).*(links?)/.test(qNorm) && /(links?|limit|max)/.test(doc.text)) score += 0.45;

  return score;
}

export type KBResult = {
  id: string;
  answer: string;
  score: number; // 0..~
  related: { id: string; question: string }[];
  didYouMean?: string;
};

export function findBestAnswer(query: string): KBResult {
  const routed = routeToEntryId(query);
  if (routed) {
    const entry = KNOWLEDGE_BASE.find((e) => e.id === routed)!;
    // Build related by normal scoring except the routed one
    const rel = KNOWLEDGE_BASE.filter((e) => e.id !== routed)
      .map((e) => ({ id: e.id, q: e.question, s: scoreQueryAgainstEntry(query, e) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, 3)
      .map((x) => ({ id: x.id, question: x.q }));
    return { id: entry.id, answer: entry.answer, score: 1, related: rel };
  }
  let bestIdx = 0;
  let bestScore = -1;
  const scores = KNOWLEDGE_BASE.map((entry, i) => {
    const s = scoreQueryAgainstEntry(query, entry);
    if (s > bestScore) {
      bestScore = s;
      bestIdx = i;
    }
    return s;
  });

  const best = KNOWLEDGE_BASE[bestIdx];
  const related: { id: string; question: string }[] = [];
  scores
    .map((s, i) => ({ s, i }))
    .filter((x) => x.i !== bestIdx)
    .sort((a, b) => b.s - a.s)
    .slice(0, 3)
    .forEach(({ i }) => related.push({ id: KNOWLEDGE_BASE[i].id, question: KNOWLEDGE_BASE[i].question }));

  // Suggest closest question if overall match is weak
  let didYouMean: string | undefined;
  if (bestScore < 0.45) {
    let bestSim = 0;
    let bestQ = '';
    KNOWLEDGE_BASE.forEach((e) => {
      const sim = diceSimilarity(query, e.question);
      if (sim > bestSim) {
        bestSim = sim;
        bestQ = e.question;
      }
    });
    if (bestSim > 0.22) didYouMean = bestQ;
  }

  // Fallback content when no match
  if (!best || bestScore < 0.08) {
    return {
      id: 'fallback',
      score: 0,
      related,
      didYouMean,
      answer:
        "I couldn’t find an exact answer. Try asking about pricing, plans, onboarding, analytics, Ghana cards, or payments—or contact support on the Contact page.",
    };
  }

  return { id: best.id, answer: best.answer, score: bestScore, related, didYouMean };
}

// Identify a coarse topic label for merging/clarification
function getTopicKeywords(entry: KBEntry): Set<string> {
  const text = `${entry.question} ${(entry.keywords || []).join(' ')}`.toLowerCase();
  const topics = [
    ['plan', 'price', 'pricing', 'pro', 'free', 'subscription'],
    ['link', 'links'],
    ['qr', 'code'],
    ['theme', 'wallpaper', 'design'],
    ['analytics', 'stats'],
    ['shipping', 'ghana', 'delivery', 'card', 'order'],
    ['username', 'url', 'profile'],
    ['support', 'contact']
  ];
  for (const group of topics) {
    if (group.some((t) => text.includes(t))) return new Set(group);
  }
  return new Set<string>();
}

export type Deliberation = KBResult & {
  needsClarification?: boolean;
  clarifyOptions?: string[];
};

// Compose a more thoughtful answer: evaluate top matches, resolve ambiguity, and suggest clarifications
export function answerWithDeliberation(query: string): Deliberation {
  // Hard route first
  const routed = routeToEntryId(query);
  if (routed) {
    const entry = KNOWLEDGE_BASE.find((e) => e.id === routed)!;
    const rel = KNOWLEDGE_BASE.filter((e) => e.id !== routed)
      .map((e) => ({ id: e.id, q: e.question, s: scoreQueryAgainstEntry(query, e) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, 3)
      .map((x) => ({ id: x.id, question: x.q }));
    return { id: entry.id, answer: entry.answer, score: 1, related: rel };
  }

  // Score all entries
  const scored = KNOWLEDGE_BASE.map((e) => ({ e, s: scoreQueryAgainstEntry(query, e) }))
    .sort((a, b) => b.s - a.s);

  const top = scored[0];
  const second = scored[1];
  const third = scored[2];

  // If we have no reasonable match, ask to clarify
  if (!top || top.s < 0.1) {
    return {
      id: 'fallback',
      answer: "I’m not sure yet. Do you want pricing & plans, features, or shipping?",
      score: top?.s || 0,
      related: [],
      needsClarification: true,
      clarifyOptions: ['Pricing & plans', 'Features', 'Ghana shipping']
    };
  }

  // If answers are ambiguous across different topics, prefer clarification over a guess
  const topTopic = getTopicKeywords(top.e);
  const secondTopic = second ? getTopicKeywords(second.e) : new Set<string>();
  const ambiguous = second && top.s - second.s < 0.06 && [...topTopic].every((t) => !secondTopic.has(t));

  if (ambiguous || top.s < 0.2) {
    const options = [top.e.question, second?.e.question, third?.e?.question]
      .filter(Boolean)
      .slice(0, 3) as string[];
    return {
      id: top.e.id,
      answer: 'I can answer this, but it could mean a few things. Which one fits best?',
      score: top.s,
      related: scored.slice(1, 4).map(({ e }) => ({ id: e.id, question: e.question })),
      needsClarification: true,
      clarifyOptions: options
    };
  }

  // Compose related suggestions for exploration
  const related = scored
    .slice(1, 4)
    .map(({ e }) => ({ id: e.id, question: e.question }));

  return { id: top.e.id, answer: top.e.answer, score: top.s, related };
}

