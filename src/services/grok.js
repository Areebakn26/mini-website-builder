import OpenAI from 'openai';

/**
 * Clean markdown extraction helper using regex to return ONLY clean HTML
 * starting with <!DOCTYPE html> or <html>.
 */
export function extractHtml(rawResponse) {
  if (!rawResponse) return '';

  // 1. Strip markdown codeblock fences ```html ... ```
  let clean = rawResponse.replace(/```(?:html)?\s*/gi, '').replace(/```$/gi, '').trim();

  // 2. Extract starting from <!DOCTYPE html> or <html...> to </html>
  const match = clean.match(/(?:<!DOCTYPE\s+html[\s\S]*?>\s*)?<html[\s\S]*?(?:<\/html>|$)/i);
  if (match) {
    clean = match[0];
  }

  // 3. SAFETY NET: Strip any pollinations.ai or loremflickr URLs the LLM might still emit (both are unreliable/random).
  //    Replace with a subtle gradient placeholder so nothing looks broken.
  clean = clean.replace(/https:\/\/image\.pollinations\.ai\/[^\s"'<>]*/gi, 
    'https://placehold.co/800x600/334155/94a3b8?text=Image');
  clean = clean.replace(/https:\/\/loremflickr\.com\/[^\s"'<>]*/gi, 
    'https://placehold.co/800x600/334155/94a3b8?text=Image');

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

2. IMAGES — USE ONLY REAL UNSPLASH PHOTO URLs (CRITICAL):
   - For EVERY <img> tag, you MUST use a real Unsplash photo URL that you know from your training data.
   - Format: https://images.unsplash.com/photo-{real-photo-id}?w=800&auto=format&fit=crop
   - Pick photos that EXACTLY match the content of each section. Examples:
     • Salon/Makeup: https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop
     • Nail Art/Manicure: https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&auto=format&fit=crop
     • Hair Styling: https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop
     • Coffee/Cafe: https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop
     • Sneakers/Shoes: https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop
     • Gym/Fitness: https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop
     • Tech/Laptops: https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop
   - NEVER use picsum.photos, loremflickr.com, pollinations.ai, placeholder.com, or via.placeholder.com. These return random/broken images.
   - Use DIFFERENT photo IDs for each image on the page — do not repeat the same photo.

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
 * Stream website generation using Groq or OpenAI-compatible endpoints
 */
export async function streamWebsiteGeneration({ 
  apiKey, 
  baseUrl = 'https://api.groq.com/openai/v1', 
  model = 'openai/gpt-oss-120b', 
  prompt, 
  currentCode, 
  onChunk, 
  onError 
}) {
  if (!apiKey) {
    throw new Error("API Key is missing. Please configure your API key in .env.local or in Settings.");
  }

  const client = new OpenAI({
    apiKey: apiKey,
    baseURL: baseUrl || 'https://api.groq.com/openai/v1',
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
      temperature: 0.7,
      max_tokens: 16384
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
