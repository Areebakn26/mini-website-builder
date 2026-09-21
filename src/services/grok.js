import OpenAI from 'openai';

// Comprehensive Dictionary of Verified, High-Resolution, 100% Working Unsplash Photo URLs
const VERIFIED_IMAGE_POOLS = {
  makeup: [
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&auto=format&fit=crop'
  ],
  nail: [
    'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=800&auto=format&fit=crop'
  ],
  hair: [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&auto=format&fit=crop'
  ],
  salon: [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop'
  ],
  coffee: [
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop'
  ],
  pastry: [
    'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=800&auto=format&fit=crop'
  ],
  brunch: [
    'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1484723091479-0016912550a7?w=800&auto=format&fit=crop'
  ],
  bakery: [
    'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop'
  ],
  burger: [
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&auto=format&fit=crop'
  ],
  pizza: [
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop'
  ],
  sushi: [
    'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&auto=format&fit=crop'
  ],
  food: [
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop'
  ],
  sneaker: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop'
  ],
  fashion: [
    'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&auto=format&fit=crop'
  ],
  gym: [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1581009146145-b5ef05062e4e?w=800&auto=format&fit=crop'
  ],
  tech: [
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop'
  ],
  realestate: [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&auto=format&fit=crop'
  ],
  celebration: [
    'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&auto=format&fit=crop'
  ],
  car: [
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format&fit=crop'
  ],
  general: [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop'
  ]
};

// Flatten set of all known good Unsplash URLs
const ALL_VERIFIED_URLS = new Set(Object.values(VERIFIED_IMAGE_POOLS).flat());

/**
 * Match text context to the best category key & image pool
 */
function getCategoryInfoForText(text) {
  const lower = (text || '').toLowerCase();
  
  // Celebration, party, gender reveal
  if (lower.includes('reveal') || lower.includes('gender') || lower.includes('baby shower') || lower.includes('party') || lower.includes('celebration') || lower.includes('confetti') || lower.includes('balloon')) {
    return { key: 'celebration', pool: VERIFIED_IMAGE_POOLS.celebration };
  }

  // Food / Bakery / Brunch / Drinks sub-categories
  if (lower.includes('brunch') || lower.includes('avocado') || lower.includes('toast') || lower.includes('egg') || lower.includes('benedict') || lower.includes('breakfast')) {
    return { key: 'brunch', pool: VERIFIED_IMAGE_POOLS.brunch };
  }
  if (lower.includes('pastry') || lower.includes('croissant') || lower.includes('éclair') || lower.includes('eclair') || lower.includes('tart') || lower.includes('bakery') || lower.includes('bread') || lower.includes('dough') || lower.includes('macaron') || lower.includes('cupcake') || lower.includes('dessert') || lower.includes('sweet')) {
    return { key: 'pastry', pool: VERIFIED_IMAGE_POOLS.pastry };
  }
  if (lower.includes('coffee') || lower.includes('espresso') || lower.includes('cappuccino') || lower.includes('latte') || lower.includes('flat white') || lower.includes('cold brew') || lower.includes('drink') || lower.includes('beverage') || lower.includes('cafe') || lower.includes('café')) {
    return { key: 'coffee', pool: VERIFIED_IMAGE_POOLS.coffee };
  }
  if (lower.includes('panini') || lower.includes('sandwich') || lower.includes('cheese') || lower.includes('herb') || lower.includes('caramelized')) {
    return { key: 'food', pool: VERIFIED_IMAGE_POOLS.food };
  }
  if (lower.includes('burger') || lower.includes('cheeseburger')) return { key: 'burger', pool: VERIFIED_IMAGE_POOLS.burger };
  if (lower.includes('pizza')) return { key: 'pizza', pool: VERIFIED_IMAGE_POOLS.pizza };
  if (lower.includes('sushi') || lower.includes('roll')) return { key: 'sushi', pool: VERIFIED_IMAGE_POOLS.sushi };
  if (lower.includes('food') || lower.includes('restaurant') || lower.includes('dining') || lower.includes('dish') || lower.includes('menu')) {
    return { key: 'food', pool: VERIFIED_IMAGE_POOLS.food };
  }

  if (lower.includes('nail') || lower.includes('manicure') || lower.includes('pedicure') || lower.includes('polish')) return { key: 'nail', pool: VERIFIED_IMAGE_POOLS.nail };
  if (lower.includes('makeup') || lower.includes('cosmetic') || lower.includes('beauty') || lower.includes('facial') || lower.includes('spa')) return { key: 'makeup', pool: VERIFIED_IMAGE_POOLS.makeup };
  if (lower.includes('hair') || lower.includes('hairstyle') || lower.includes('barber') || lower.includes('cut')) return { key: 'hair', pool: VERIFIED_IMAGE_POOLS.hair };
  if (lower.includes('salon')) return { key: 'salon', pool: VERIFIED_IMAGE_POOLS.salon };

  if (lower.includes('sneaker') || lower.includes('shoe') || lower.includes('kicks')) return { key: 'sneaker', pool: VERIFIED_IMAGE_POOLS.sneaker };
  if (lower.includes('fashion') || lower.includes('cloth') || lower.includes('apparel') || lower.includes('store')) return { key: 'fashion', pool: VERIFIED_IMAGE_POOLS.fashion };
  if (lower.includes('gym') || lower.includes('fitness') || lower.includes('workout') || lower.includes('muscle') || lower.includes('training')) return { key: 'gym', pool: VERIFIED_IMAGE_POOLS.gym };
  if (lower.includes('code') || lower.includes('developer') || lower.includes('laptop') || lower.includes('tech') || lower.includes('saas') || lower.includes('software')) return { key: 'tech', pool: VERIFIED_IMAGE_POOLS.tech };
  if (lower.includes('house') || lower.includes('home') || lower.includes('property') || lower.includes('real estate') || lower.includes('living')) return { key: 'realestate', pool: VERIFIED_IMAGE_POOLS.realestate };

  // STRICT WORD BOUNDARY FOR CARS - DO NOT MATCH "caramelized" OR "macaron"!
  if (/\b(car|cars|automobile|vehicle)\b/i.test(lower)) {
    return { key: 'car', pool: VERIFIED_IMAGE_POOLS.car };
  }

  return { key: 'general', pool: VERIFIED_IMAGE_POOLS.general };
}

/**
 * Clean markdown extraction helper using regex to return ONLY clean HTML
 * starting with <!DOCTYPE html> or <html>, and transform any unreliable image URLs
 * to guaranteed relevant, working Unsplash images.
 */
export function extractHtml(rawResponse) {
  if (!rawResponse) return '';

  // 1. Strip markdown codeblock fences ```html ... ```
  let clean = rawResponse.replace(/```(?:html)?\s*/gi, '').replace(/```$/gi, '').trim();

  // 2. Extract starting from <!DOCTYPE html> or <html...>
  const lower = clean.toLowerCase();
  const docTypeIdx = lower.indexOf('<!doctype html>');
  const htmlIdx = lower.indexOf('<html');

  if (docTypeIdx !== -1) {
    clean = clean.substring(docTypeIdx);
  } else if (htmlIdx !== -1) {
    clean = clean.substring(htmlIdx);
  }

  // 3. CONTEXT-AWARE IMAGE SANITIZER: Transform <img> tags to guaranteed real, working Unsplash URLs
  const poolCounters = {};
  clean = clean.replace(/<img\s+([\s\S]*?)src=["']([^"']+)["']([\s\S]*?)>/gi, (fullTag, beforeSrc, srcUrl, afterSrc) => {
    // Combine full tag text (alt, class, id) to detect category context
    const tagContext = `${fullTag} ${beforeSrc} ${afterSrc}`;
    const { key: poolKey, pool } = getCategoryInfoForText(tagContext);

    // If srcUrl is ALREADY in the correct category pool for this specific image context, keep it!
    if (pool.includes(srcUrl)) {
      return fullTag;
    }

    // Otherwise, select a verified working photo from the matching category pool
    poolCounters[poolKey] = (poolCounters[poolKey] || 0);
    const selectedUrl = pool[poolCounters[poolKey] % pool.length];
    poolCounters[poolKey]++;

    return `<img ${beforeSrc}src="${selectedUrl}"${afterSrc}>`;
  });

  // 4. CONTEXT-AWARE IMAGE SANITIZER: Transform background-image: url('...')
  clean = clean.replace(/url\(['"]?(https:\/\/[^'")]*)['"]?\)/gi, (fullMatch, bgUrl) => {
    const { pool } = getCategoryInfoForText(clean.substring(0, 500));
    if (pool.includes(bgUrl)) {
      return fullMatch;
    }
    return `url('${pool[0]}')`;
  });

  return clean;
}

/**
 * Safely prepares current HTML context for edit prompts without losing site topic
 */
function compressHtmlForPrompt(html) {
  if (!html) return '';
  let compressed = html
    .replace(/<svg[\s\S]*?<\/svg>/gi, '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>')
    .replace(/\s+/g, ' ');

  if (compressed.length > 8000) {
    compressed = compressed.slice(0, 8000) + '... (truncated context)';
  }
  return compressed;
}

const SYSTEM_PROMPT = `You are WebCraft AI, an elite web developer creating full, production-ready, highly interactive single-page web applications.

STRICT GENERATION RULES:
1. Output ONLY a valid single-file HTML document starting with <!DOCTYPE html>. Do NOT wrap in markdown fences or include conversational text.

2. IMAGES — USE ONLY REAL, VERIFIED UNSPLASH PHOTO URLs (CRITICAL):
   - For EVERY <img> tag, you MUST use one of these verified, high-resolution Unsplash photo URLs:
     • Makeup & Beauty: https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop or https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&auto=format&fit=crop
     • Nails & Manicure: https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&auto=format&fit=crop or https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800&auto=format&fit=crop
     • Hair & Styling: https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop or https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&auto=format&fit=crop
     • Coffee & Espresso: https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop or https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop
     • Pastries & Croissants: https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&auto=format&fit=crop or https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop
     • Brunch & Toast: https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop or https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&auto=format&fit=crop
     • Sneakers & Fashion: https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop or https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&auto=format&fit=crop
     • Gym & Fitness: https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop or https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop
     • Tech & Coding: https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop or https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop
     • Real Estate & Interiors: https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop or https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop
   - NEVER use pollinations.ai, loremflickr.com, picsum.photos, or placehold.co.
   - Set descriptive alt text on every image tag (e.g. alt="Manicure nail art", alt="Espresso coffee", alt="Avocado toast").

3. NO BLOCKING OVERLAYS / EMBEDDED SECTIONS:
   - NEVER create unhidden fixed overlays (like <div class="fixed inset-0">) that block the website screen!
   - Contact forms, reservation forms, and shopping cart drawers MUST be embedded directly inside clean <section> tags in the natural flow of the page (e.g., <section id="contact" class="py-20 rounded-3xl">).
   - Follow the user's requested color scheme and aesthetic (light mode, dark mode, pink/lilac, pastel, gold/vibrant, etc.). Ensure contrast is readable and visually cohesive.

4. SCROLLING & ROOT CONTAINER:
   - The <body> tag MUST be scrollable: class="min-h-screen w-full overflow-y-auto font-sans" (along with your chosen background and text color classes, e.g. bg-slate-950 text-slate-100 for dark mode or bg-slate-50 text-slate-900 / bg-pink-50 text-slate-800 for light/pink mode).
   - NEVER add "h-screen" or "overflow-hidden" to the <body> tag.

5. NAVBAR & MATCHING SECTION IDs:
   - Every major section MUST have a clear id attribute matching the navbar links!
   - Example Navbar links must scroll to sections with matching id attributes (e.g., href="#products" -> <section id="products">).

6. HEAD CDN REQUIREMENTS:
   - Tailwind CSS: <script src="https://cdn.tailwindcss.com"></script>
   - Lucide Icons: <script src="https://unpkg.com/lucide@latest"></script>
   - Alpine.js: <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>

7. ALPINE.JS INTERACTIVITY (WORKING TABS & TOGGLES):
   - Interactive category filter tabs or pricing toggles using x-data, @click, and x-show.

8. LUCIDE ICON INITIALIZATION:
   - Place <script>if (window.lucide) lucide.createIcons();</script> before </body>.`;

/**
 * Stream website generation using Gemini or OpenAI-compatible endpoints
 */
export async function streamWebsiteGeneration({ 
  apiKey, 
  baseUrl = 'https://generativelanguage.googleapis.com/v1beta/openai/', 
  model = 'gemini-2.0-flash', 
  prompt, 
  currentCode, 
  onChunk, 
  onError 
}) {
  if (!apiKey) {
    throw new Error("API Key is missing. Please configure your API key in Settings.");
  }

  const client = new OpenAI({
    apiKey: apiKey,
    baseURL: baseUrl || 'https://generativelanguage.googleapis.com/v1beta/openai/',
    dangerouslyAllowBrowser: true
  });

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT }
  ];

  if (currentCode && currentCode.length > 50 && !currentCode.includes('Describe your dream website')) {
    const compressedCode = compressHtmlForPrompt(currentCode);
    messages.push({
      role: 'user',
      content: `Current website HTML:\n\`\`\`html\n${compressedCode}\n\`\`\``
    });
    messages.push({
      role: 'user',
      content: `User requested fix: ${prompt}\n\nPlease output the COMPLETE updated <!DOCTYPE html> document applying this fix while preserving all existing sections, image tags, matching section IDs, and applying the requested color theme/style changes. DO NOT output conversational text.`
    });
  } else {
    messages.push({
      role: 'user',
      content: `Build a complete, scrollable, multi-section single-page website with embedded sections (NO blocking overlays), Alpine.js tabs, and styled with the user's requested theme/aesthetic for: ${prompt}`
    });
  }

  try {
    const stream = await client.chat.completions.create({
      model: model || 'openai/gpt-oss-120b',
      messages: messages,
      stream: true,
      temperature: 0.2,
      max_tokens: 8192
    });

    let fullText = '';
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || '';
      fullText += delta;
      onChunk(fullText);
    }

    return fullText;
  } catch (error) {
    if (import.meta.env.DEV) console.error('AI API Error:', error);
    if (onError) onError(error);
    throw error;
  }
}
