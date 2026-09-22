import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Curated high-res Unsplash photo collections by category keyword.
 * Used as fast, reliable fallbacks whenever Unsplash API key is missing or rate limited.
 */
const TOPIC_PHOTO_COLLECTIONS = {
  bakery: [
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&auto=format&fit=crop', // Sourdough bread
    'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1200&auto=format&fit=crop', // Croissants
    'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=1200&auto=format&fit=crop', // Baker at work
    'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=1200&auto=format&fit=crop', // Pastries and cakes
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&auto=format&fit=crop', // Chocolate dessert
  ],
  coffee: [
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&auto=format&fit=crop', // Espresso cup
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&auto=format&fit=crop', // Cafe interior
    'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1200&auto=format&fit=crop', // Latte art
    'https://images.unsplash.com/photo-1497636577773-f1231844b336?w=1200&auto=format&fit=crop', // Coffee beans
  ],
  realestate: [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop', // Luxury villa
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop', // Modern house
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&auto=format&fit=crop', // Living room interior
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&auto=format&fit=crop', // Kitchen interior
  ],
  food: [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&auto=format&fit=crop', // Restaurant dish
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&auto=format&fit=crop', // Pizza
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200&auto=format&fit=crop', // Fresh salad
    'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=1200&auto=format&fit=crop', // Plated meal
  ],
  tech: [
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop', // Laptop coding
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop', // Analytics dashboard
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop', // Team collaboration
  ],
  fitness: [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&auto=format&fit=crop', // Gym workout
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&auto=format&fit=crop', // Dumbbells
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&auto=format&fit=crop', // Yoga session
  ],
  default: [
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop',
  ]
};

function getFallbackImage(altText, index = 0) {
  const alt = (altText || '').toLowerCase();
  let category = 'default';
  
  if (alt.includes('bread') || alt.includes('bakery') || alt.includes('pastry') || alt.includes('croissant') || alt.includes('cake') || alt.includes('bake') || alt.includes('brunch') || alt.includes('sourdough')) {
    category = 'bakery';
  } else if (alt.includes('coffee') || alt.includes('latte') || alt.includes('espresso') || alt.includes('cafe') || alt.includes('tea')) {
    category = 'coffee';
  } else if (alt.includes('house') || alt.includes('home') || alt.includes('villa') || alt.includes('real estate') || alt.includes('interior') || alt.includes('room') || alt.includes('apartment') || alt.includes('property')) {
    category = 'realestate';
  } else if (alt.includes('food') || alt.includes('dish') || alt.includes('restaurant') || alt.includes('dinner') || alt.includes('meal') || alt.includes('chef') || alt.includes('pizza') || alt.includes('burger')) {
    category = 'food';
  } else if (alt.includes('tech') || alt.includes('software') || alt.includes('laptop') || alt.includes('code') || alt.includes('app') || alt.includes('dashboard')) {
    category = 'tech';
  } else if (alt.includes('gym') || alt.includes('fitness') || alt.includes('workout') || alt.includes('yoga') || alt.includes('sport')) {
    category = 'fitness';
  }

  const list = TOPIC_PHOTO_COLLECTIONS[category] || TOPIC_PHOTO_COLLECTIONS.default;
  return list[index % list.length];
}

/**
 * Client-Side Image Hydration Pattern
 * Dynamically replaces transparent placeholders with relevant Unsplash photos.
 *
 * @param {string} htmlString - Raw HTML document generated by LLM containing transparent image placeholders.
 * @returns {Promise<string>} Updated HTML document with hydrated Unsplash photo URLs.
 */
export async function hydrateImages(htmlString) {
  if (!htmlString || typeof window === 'undefined') return htmlString;

  const apiKey =
    import.meta.env.VITE_UNSPLASH_API_KEY ||
    import.meta.env.VITE_UNSPLASH_ACCESS_KEY ||
    '';

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const images = Array.from(doc.querySelectorAll('img'));

    if (images.length === 0) return htmlString;

    const fetchPromises = images.map(async (img, idx) => {
      const altText = (img.getAttribute('alt') || img.getAttribute('title') || '').trim();
      const currentSrc = img.getAttribute('src') || '';

      let success = false;
      if (apiKey && altText.length > 3) {
        try {
          const res = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
              altText
            )}&per_page=1&client_id=${apiKey}`
          );
          if (res.ok) {
            const data = await res.json();
            if (data.results && data.results.length > 0 && data.results[0].urls?.regular) {
              img.setAttribute('src', data.results[0].urls.regular);
              success = true;
            }
          }
        } catch (err) {
          if (import.meta.env.DEV) console.error('Unsplash hydration error:', altText, err);
        }
      }

      // If no API key, or fetch failed/rate-limited, assign topic-matched high-res Unsplash photo
      if (!success && (!currentSrc || currentSrc.startsWith('data:image'))) {
        img.setAttribute('src', getFallbackImage(altText, idx));
      }
    });

    await Promise.all(fetchPromises);

    const hasDocType = htmlString.toLowerCase().includes('<!doctype html');
    const resultHtml = doc.documentElement.outerHTML;
    return hasDocType ? `<!DOCTYPE html>\n${resultHtml}` : resultHtml;
  } catch (err) {
    if (import.meta.env.DEV) console.error('hydrateImages error:', err);
    return htmlString;
  }
}

/**
 * Clean markdown extraction helper using regex to return ONLY clean HTML
 * starting with <!DOCTYPE html> or <html>.
 */
export function extractHtml(rawResponse) {
  if (!rawResponse) return '';

  let clean = rawResponse.replace(/```(?:html)?\s*/gi, '').replace(/```$/gi, '').trim();

  const lower = clean.toLowerCase();
  const docTypeIdx = lower.indexOf('<!doctype html>');
  const htmlIdx = lower.indexOf('<html');

  if (docTypeIdx !== -1) {
    clean = clean.substring(docTypeIdx);
  } else if (htmlIdx !== -1) {
    clean = clean.substring(htmlIdx);
  }

  return clean;
}

/**
 * Safely prepares current HTML context for edit prompts without losing site topic
 */
function compressHtmlForPrompt(html) {
  if (!html) return '';
  let compressed = html
    .replace(/data:image\/[^;]+;base64,[^"']+/gi, 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>')
    .replace(/\s+/g, ' ');

  if (compressed.length > 6000) {
    compressed = compressed.slice(0, 6000) + '... (truncated context)';
  }
  return compressed;
}

const SYSTEM_PROMPT = `You are WebCraft AI, an elite web developer creating full, production-ready, highly interactive single-page web applications.

STRICT GENERATION RULES:
1. Output ONLY a valid single-file HTML document starting with <!DOCTYPE html>. Do NOT wrap in markdown fences or include conversational text.

2. IMAGES (CRITICAL RULE):
   - NEVER guess or invent image URLs. Do NOT use Unsplash source links, Pollinations, LoremFlickr, or placeholder image services.
   - For EVERY single <img> tag, you MUST use this exact transparent pixel for the src attribute:
     src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
   - You MUST write a highly descriptive and specific alt attribute for what the image should depict, based on the section's context.
   - Example Hero: <img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" alt="modern minimalist artisanal sourdough bread and croissants on wooden table" class="...">
   - Example Product: <img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" alt="freshly brewed latte in ceramic mug with latte art" class="...">

3. NO BLOCKING OVERLAYS / EMBEDDED SECTIONS:
   - NEVER create unhidden fixed overlays (like <div class="fixed inset-0">) that block the website screen!
   - Contact forms, reservation forms, and shopping cart drawers MUST be embedded directly inside clean <section> tags in the natural flow of the page (e.g., <section id="reservation" class="py-20 rounded-3xl">).
   - Follow the user's requested color scheme and aesthetic (dark mode, warm tones, pastel, gold/vibrant, etc.). Ensure contrast is readable and visually cohesive.

4. SCROLLING & ROOT CONTAINER:
   - The <body> tag MUST be scrollable: class="min-h-screen w-full overflow-y-auto font-sans" (along with your chosen background and text color classes).
   - NEVER add "h-screen" or "overflow-hidden" to the <body> tag.

5. NAVBAR & EXACT MATCHING SECTION IDs (CRITICAL FOR NAVIGATION):
   - Every single <a> link in the navbar MUST have an href attribute starting with '#' (e.g., href="#menu", href="#story", href="#reservation").
   - You MUST add the EXACT corresponding id attribute to the target section tag (e.g., <section id="menu">, <section id="story">, <section id="reservation">).
   - Ensure the id string in <section id="..."> matches the href anchor in <a href="..."> EXACTLY, letter for letter.

6. HEAD CDN REQUIREMENTS:
   - Tailwind CSS: <script src="https://cdn.tailwindcss.com"></script>
   - Lucide Icons: <script src="https://unpkg.com/lucide@latest"></script>
   - Alpine Collapse Plugin: <script defer src="https://cdn.jsdelivr.net/npm/@alpinejs/collapse@3.x.x/dist/cdn.min.js"></script>
   - Alpine.js Core: <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>

7. LUCIDE ICONS & INTERACTIVE TABS:
   - Use valid Lucide icon names (e.g. "mail", "phone", "map-pin", "star", "check", "arrow-right", "instagram", "facebook", "linkedin", "clock", "utensils", "coffee").
   - For interactive category tabs, toggles, accordions, and dropdowns, use Alpine.js (e.g. x-data="{ activeTab: 'coffee' }", x-show="activeTab === 'coffee'", @click="activeTab = 'pastries'").

8. LUCIDE ICON INITIALIZATION:
   - Place <script>if (window.lucide) lucide.createIcons();</script> before </body>.`;

export async function streamWebsiteGeneration({ apiKey: customKey, model: requestedModel, prompt, currentCode, onChunk, onError }) {
  try {
    const apiKey = customKey || import.meta.env.VITE_AI_API_KEY;
    if (!apiKey) {
      throw new Error("VITE_AI_API_KEY is missing from environment variables.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    let finalPrompt = "";

    if (currentCode && currentCode.length > 50 && !currentCode.includes('Describe your dream website')) {
      const compressedCode = compressHtmlForPrompt(currentCode);
      finalPrompt = `Current website HTML:\n\`\`\`html\n${compressedCode}\n\`\`\`\n\nUser requested edit: ${prompt}\n\nPlease output the COMPLETE updated <!DOCTYPE html> document applying this change while preserving all existing sections, image tags, and matching section IDs. DO NOT output conversational text.`;
    } else {
      finalPrompt = `Build a complete, scrollable, multi-section single-page website with embedded sections (NO blocking overlays), Alpine.js tabs, and styled with the user's requested theme/aesthetic for: ${prompt}`;
    }

    const MODELS_TO_TRY = ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-flash-latest"];
    let fullText = '';
    let lastError;

    for (const modelName of MODELS_TO_TRY) {
      const currentModel = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_PROMPT,
      });

      for (let attempt = 0; attempt < 2; attempt++) {
        fullText = ''; // Reset buffer for retry
        try {
          if (attempt > 0) {
            await new Promise(r => setTimeout(r, 2000));
          }

          const result = await currentModel.generateContentStream(finalPrompt);

          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            fullText += chunkText;
            if (onChunk) onChunk(fullText);
          }

          // If stream finished successfully and produced HTML content, return immediately!
          if (fullText && fullText.length > 50) {
            return fullText;
          }
        } catch (err) {
          lastError = err;
          const msg = String(err.message || err.stack || err || "");
          const isTransient = msg.includes("503") || msg.includes("high demand") || msg.includes("overloaded") || msg.includes("parse stream") || msg.includes("stream") || msg.includes("fetch");

          // If we already received substantial HTML before the stream dropped, use what we have!
          if (fullText && fullText.length > 500 && fullText.toLowerCase().includes('</html>')) {
            console.warn(`Stream dropped mid-way for ${modelName}, but valid HTML was recovered!`);
            return fullText;
          }

          if (isTransient) {
            console.warn(`Model ${modelName} encountered transient error (attempt ${attempt + 1}), retrying...`, err);
            continue;
          }
          if (msg.includes("404") || msg.includes("not found") || msg.includes("no longer available")) {
            console.warn(`Model ${modelName} not available, trying next...`);
            break;
          }
          throw err;
        }
      }
      if (fullText && fullText.length > 50) break;
    }

    if (!fullText || fullText.length < 50) {
      throw lastError || new Error("All AI models are currently unavailable. Please try again in a moment.");
    }

    return fullText;
  } catch (error) {
    console.error('AI API Error:', error);
    if (onError) onError(error);
    throw error;
  }
}
