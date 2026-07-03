const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const SkinProfile = require("../models/skinProfileModel");
const AiChatLog = require("../models/aiChatLogModel");

const POPULATE = { path: "categoryId subCategoryId", select: "name slug" };

const INGREDIENTS = {
  retinol: {
    name: "Retinol",
    summary:
      "A vitamin A derivative that supports cell turnover, helps reduce fine lines, and can improve texture. Best used at night — start slowly (2–3 nights per week) and always pair with sunscreen in the morning.",
    goodFor: ["aging", "texture", "dullness"],
  },
  niacinamide: {
    name: "Niacinamide",
    summary:
      "Vitamin B3 that helps balance oil, minimize the look of pores, and calm redness. Gentle enough for most skin types including sensitive skin.",
    goodFor: ["acne", "oily", "dark spots", "redness"],
  },
  "vitamin c": {
    name: "Vitamin C",
    summary:
      "A brightening antioxidant that helps fade dark spots and boosts radiance. Use in the morning under sunscreen for best results.",
    goodFor: ["dullness", "dark spots", "glow"],
  },
  "hyaluronic acid": {
    name: "Hyaluronic Acid",
    summary:
      "A hydration hero that draws moisture into the skin. Apply on damp skin and layer with moisturizer to lock it in.",
    goodFor: ["dryness", "dehydration", "plumping"],
  },
  "salicylic acid": {
    name: "Salicylic Acid",
    summary:
      "A BHA that exfoliates inside pores — excellent for oily and acne-prone skin. Start with lower concentrations if you're new to acids.",
    goodFor: ["acne", "oily", "pores"],
  },
  ceramides: {
    name: "Ceramides",
    summary:
      "Lipids that strengthen your skin barrier and lock in moisture. Ideal for dry, sensitive, or compromised skin.",
    goodFor: ["dryness", "barrier repair", "sensitive"],
  },
  "glycolic acid": {
    name: "Glycolic Acid",
    summary:
      "An AHA that exfoliates the skin surface for smoother texture and brighter tone. Use at night and wear SPF the next day.",
    goodFor: ["dullness", "texture", "dark spots"],
  },
  peptides: {
    name: "Peptides",
    summary:
      "Amino acid chains that support collagen and firmness. Gentle and great for anti-aging routines.",
    goodFor: ["aging", "firmness", "fine lines"],
  },
  spf: {
    name: "SPF / Sunscreen",
    summary:
      "Daily sunscreen is the #1 anti-aging step. Use broad-spectrum SPF 30+ every morning, even on cloudy days.",
    goodFor: ["aging prevention", "dark spots", "all skin types"],
  },
};

const TOPIC_ANSWERS = [
  {
    test: /why.*sunscreen|sunscreen.*important|why.*spf|spf.*important/i,
    answer:
      "Sunscreen is essential because **UV rays cause 80%+ of visible aging**, dark spots, and skin damage — even indoors near windows. Daily **broad-spectrum SPF 30+** is the single most effective anti-aging product you can use.",
  },
  {
    test: /retinol.*vitamin c|vitamin c.*retinol|niacinamide.*vitamin c|mix.*retinol|use.*together/i,
    answer:
      "A safe approach: use **vitamin C in the morning** (then SPF) and **retinol at night** — avoid layering them at the same time to prevent irritation. **Niacinamide pairs well with vitamin C** for most people. Introduce one active at a time.",
  },
  {
    test: /how.*use retinol|start.*retinol|begin.*retinol/i,
    answer:
      "Start retinol **2 nights per week**, then gradually increase. Use a **pea-sized amount** at night after cleansing, before moisturizer. Skip on nights you use strong acids. Always wear **SPF** the next morning.",
  },
  {
    test: /^(hi|hello|hey|hiya|good morning|good evening|howdy)\b/i,
    answer:
      "Hello! I'm **Glow AI** ✨ — your personal skincare expert. Ask me anything about products, ingredients, routines, skin concerns, or your orders. How can I help you glow today?",
  },
  {
    test: /thank|thanks|thx|appreciate/i,
    answer:
      "You're so welcome! I'm always here if you need more skincare advice or product picks. Your glow journey matters to me ✨",
  },
  {
    test: /what can you do|how can you help|help me|what do you do/i,
    answer:
      "I can help with **product recommendations**, **morning & night routines**, **ingredient explainers**, **product comparisons**, **smart search**, **order & delivery questions**, and general skincare advice. Just ask in your own words!",
  },
  {
    test: /who are you|what is glow ai/i,
    answer:
      "I'm **Glow AI** — Glow Skin's intelligent skincare assistant. I know our full product catalog and can guide you to the right formulas for your skin type, concerns, and budget.",
  },
  {
    test: /layer|order of (products|skincare)|which goes first/i,
    answer:
      "General layering rule: **cleanser → toner → serum → eye cream → moisturizer → SPF (AM only)**. Apply thinnest to thickest. Actives like retinol go at night before moisturizer. When in doubt, patch test new products.",
  },
  {
    test: /patch test|allergic|sensitive reaction/i,
    answer:
      "Always **patch test** new products: apply a small amount behind your ear or inner arm for 24–48 hours. If you have known allergies, share them and I'll avoid suggesting harsh actives. For severe reactions, stop use and consult a dermatologist.",
  },
  {
    test: /how often.*exfoliat|exfoliat.*often/i,
    answer:
      "Most people exfoliate **1–3 times per week** depending on skin type. Oily skin may tolerate more; sensitive skin less. Over-exfoliating causes redness and barrier damage — listen to your skin.",
  },
  {
    test: /teen|teenager|young skin|age 1[0-9]/i,
    answer:
      "Teen skin benefits from a simple routine: **gentle cleanser**, **lightweight moisturizer**, and **SPF**. For breakouts, look for salicylic acid or niacinamide — avoid overloading with too many actives at once.",
  },
  {
    test: /men'?s skin|for men|male skin/i,
    answer:
      "Men's skin can use the same great products! Focus on **cleanser**, **moisturizer**, and **SPF**. If you shave, use gentle, hydrating formulas to calm irritation. I can recommend specific Glow Skin picks anytime.",
  },
  {
    test: /pregnant|pregnancy|breastfeed/i,
    answer:
      "During pregnancy, avoid **retinol/retinoids** and high-strength acids unless your doctor approves. Stick to gentle cleansers, hydrating serums, niacinamide, and SPF. Always check with your healthcare provider for personalized advice.",
  },
  {
    test: /drink water|hydration|diet|sleep|stress/i,
    answer:
      "Healthy skin is holistic: **stay hydrated**, eat balanced meals rich in antioxidants, get enough **sleep**, and manage stress. Topicals work best alongside these habits — I can also suggest hydrating products from our catalog.",
  },
  {
    test: /difference between serum and moisturizer|serum vs moisturizer/i,
    answer:
      "**Serums** are concentrated treatments (vitamin C, niacinamide, etc.) with smaller molecules. **Moisturizers** seal hydration and protect the barrier. Use serum first, then moisturizer.",
  },
  {
    test: /do i need toner|is toner necessary/i,
    answer:
      "Toner isn't mandatory for everyone. It can balance pH and prep skin for serums. Dry skin may prefer hydrating toners; oily skin may like exfoliating toners. A simple cleanser + moisturizer + SPF routine is perfectly fine too.",
  },
  {
    test: /oily but dry|dehydrated oily|combination oily/i,
    answer:
      "That's often **dehydrated oily skin** — your skin lacks water but overproduces oil. Use a gentle cleanser, **hyaluronic acid** serum, and a **lightweight, oil-free moisturizer**. Avoid stripping products that make oiliness worse.",
  },
];

const STOP_WORDS = new Set([
  "what", "when", "where", "which", "would", "could", "should", "about", "there",
  "their", "these", "those", "have", "been", "being", "with", "from", "your",
  "that", "this", "they", "them", "then", "than", "also", "just", "like", "need",
  "want", "tell", "know", "help", "please", "really", "very", "some", "any",
]);

const CONCERN_KEYWORDS = {
  acne: ["acne", "breakout", "pimple", "blemish", "oily skin"],
  "dark spots": ["dark spot", "hyperpigmentation", "pigment", "uneven tone"],
  aging: ["aging", "wrinkle", "fine line", "anti-age", "firm"],
  dullness: ["dull", "glow", "radiance", "brighten", "tired skin"],
  dryness: ["dry", "dehydrat", "flaky", "tight skin", "moistur"],
};

const CATEGORY_ROUTINE = {
  morning: ["cleansers", "toners", "serums", "moisturizers", "sun-care"],
  night: ["cleansers", "serums", "masks", "moisturizers", "acne-treatment"],
};

function formatProduct(p) {
  const doc = p.toObject ? p.toObject() : p;
  const cat = doc.categoryId;
  const sub = doc.subCategoryId;
  const price = Number(doc.price);
  const discount = Number(doc.discount || 0);
  const discountPrice =
    discount > 0 ? Math.round(price - (price * discount) / 100) : price;

  return {
    _id: doc._id,
    id: String(doc._id),
    name: doc.name,
    description: doc.description,
    price,
    discountPrice,
    category: cat?.name || "",
    groupSlug: cat?.slug || "",
    subCategory: sub?.name || "",
    subCategorySlug: sub?.slug || "",
    image: doc.image?.url || "",
    rating: doc.rating ?? 4.5,
    tags: doc.tags || [],
    stock: doc.countInStock ?? 0,
  };
}

async function loadProducts() {
  const products = await Product.find().populate(POPULATE).lean();
  return products.map((p) => formatProduct(p));
}

function scoreProduct(product, keywords = []) {
  if (!keywords.length) return 0;
  const haystack = `${product.name} ${product.description} ${product.category} ${product.subCategory} ${(product.tags || []).join(" ")}`.toLowerCase();
  return keywords.reduce((score, kw) => (haystack.includes(kw) ? score + 1 : score), 0);
}

function pickProducts(products, keywords, limit = 4) {
  return [...products]
    .map((p) => ({ p, score: scoreProduct(p, keywords) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.p.rating - a.p.rating)
    .slice(0, limit)
    .map((x) => x.p);
}

function detectIntent(message) {
  const m = message.toLowerCase();
  if (/routine|morning|night|am pm|skincare steps/.test(m)) return "routine";
  if (/compare|vs|versus|difference between/.test(m)) return "compare";
  if (/order|delivery|ship|return|track|where is my/.test(m)) return "order";
  if (/ingredient|retinol|niacinamide|vitamin c|hyaluronic|salicylic/.test(m)) return "ingredient";
  if (/under \d+|below \d+|budget|cheap|affordable|price/.test(m)) return "search";
  if (/add to cart|cart|wishlist|navigate|go to/.test(m)) return "shopping";
  if (/skin type|dry|oily|combination|sensitive|acne prone|recommend|suggest|best for/.test(m)) return "recommend";
  if (/what is|what does|how to use|suitable|good for/.test(m)) return "product_qa";
  if (/show me|find|search|products for|best/.test(m)) return "search";
  return "general";
}

function extractPriceMax(message) {
  const match = message.match(/(?:under|below|less than)\s*₹?\s*(\d+)/i);
  return match ? Number(match[1]) : null;
}

function extractConcerns(message) {
  const found = [];
  for (const [concern, keywords] of Object.entries(CONCERN_KEYWORDS)) {
    if (keywords.some((kw) => message.toLowerCase().includes(kw))) found.push(concern);
  }
  return found;
}

function extractSkinType(message) {
  const m = message.toLowerCase();
  if (/dry skin|skin type.*dry|\bdry\b/.test(m)) return "dry";
  if (/oily skin|skin type.*oily|\boily\b/.test(m)) return "oily";
  if (/combination/.test(m)) return "combination";
  if (/sensitive/.test(m)) return "sensitive";
  return null;
}

async function buildRoutineReply(products, period = "morning") {
  const slugs = CATEGORY_ROUTINE[period] || CATEGORY_ROUTINE.morning;
  const label = period === "night" ? "Night" : "Morning";
  const steps = [];

  for (const slug of slugs) {
    const match = products.find((p) => p.groupSlug === slug || p.category.toLowerCase().includes(slug.replace("-", " ")));
    if (match) {
      steps.push({ step: steps.length + 1, product: match });
    }
  }

  if (steps.length === 0) {
    return {
      reply: `I'd love to build your ${label.toLowerCase()} routine! Browse our categories at /categories/skin or tell me your skin type and concerns.`,
      products: [],
      intent: "routine",
    };
  }

  const lines = steps.map(
    (s) => `${s.step}. **${s.product.category || "Step"}** — ${s.product.name} (₹${s.product.discountPrice})`
  );

  return {
    reply: `Here's a Glow Skin ${label.toLowerCase()} routine I'd suggest:\n\n${lines.join("\n")}\n\nApply thinnest textures first, then seal with moisturizer. ${period === "morning" ? "Always finish with SPF!" : "Use treatments before heavier creams."}`,
    products: steps.map((s) => s.product),
    intent: "routine",
  };
}

function explainIngredient(message) {
  const m = message.toLowerCase();
  const matched = Object.entries(INGREDIENTS).filter(([key]) => m.includes(key));

  if (matched.length >= 2 || (matched.length && /together|combine|mix|with|and|same time/.test(m))) {
    return null;
  }

  for (const [key, info] of matched.length ? matched : Object.entries(INGREDIENTS)) {
    if (m.includes(key)) {
      return {
        reply: `**${info.name}**\n\n${info.summary}\n\nBest for: ${info.goodFor.join(", ")}.`,
        products: [],
        intent: "ingredient",
      };
    }
  }
  return {
    reply: "I can explain retinol, niacinamide, vitamin C, hyaluronic acid, salicylic acid, ceramides, and more. Which ingredient would you like to know about?",
    products: [],
    intent: "ingredient",
  };
}

async function orderSupport(userId, message) {
  const m = message.toLowerCase();
  if (/how long|delivery|shipping|when will/.test(m)) {
    return {
      reply: "Glow Skin orders typically arrive within 3–7 business days across India. You'll receive tracking details once your order ships.",
      products: [],
      intent: "order",
    };
  }
  if (/return|refund|exchange/.test(m)) {
    return {
      reply: "Unopened products can be returned within 7 days of delivery. Visit /contact for return support or email our team from your order confirmation.",
      products: [],
      intent: "order",
    };
  }

  if (!userId) {
    return {
      reply: "Sign in to track your orders, or visit /orders after logging in. I can also explain shipping and returns!",
      products: [],
      intent: "order",
    };
  }

  const orders = await Order.find({ userId }).sort({ createdAt: -1 }).limit(3).lean();
  if (!orders.length) {
    return {
      reply: "You don't have any orders yet. Explore /shop to find your perfect glow essentials!",
      products: [],
      intent: "order",
    };
  }

  const latest = orders[0];
  const status = latest.orderStatus || "Processing";
  return {
    reply: `Your latest order is **${status}**. ${orders.length > 1 ? `You have ${orders.length} recent orders.` : ""} View details at /orders.`,
    products: [],
    intent: "order",
  };
}

async function recommendProducts(products, message, profile) {
  const concerns = extractConcerns(message);
  const skinType = extractSkinType(message) || profile?.skinType;
  const keywords = [...concerns];

  if (skinType === "dry") keywords.push("hydrat", "moistur", "dry");
  if (skinType === "oily") keywords.push("oil", "acne", "lightweight", "gel");
  if (skinType === "sensitive") keywords.push("gentle", "sooth", "calm");
  if (concerns.includes("acne")) keywords.push("acne", "salicylic", "niacinamide", "cleanser");

  if (profile?.concerns?.length) {
    profile.concerns.forEach((c) => {
      const kws = CONCERN_KEYWORDS[c] || [c];
      keywords.push(...kws);
    });
  }

  const picks = pickProducts(products, keywords.length ? keywords : ["serum", "moistur", "cleanser"], 4);

  if (!picks.length) {
    return {
      reply: "Tell me your skin type (dry, oily, combination, sensitive) and main concern — I'll recommend products from our catalog.",
      products: [],
      intent: "recommend",
    };
  }

  const list = picks.map((p, i) => `${i + 1}. **${p.name}** — ₹${p.discountPrice}`).join("\n");
  const skinNote = skinType ? ` for **${skinType}** skin` : "";

  return {
    reply: `Based on your needs${skinNote}, these Glow Skin picks may help:\n\n${list}\n\nTap a product below to view details or add to cart.`,
    products: picks,
    intent: "recommend",
  };
}

function smartSearch(products, message) {
  const maxPrice = extractPriceMax(message);
  const m = message.toLowerCase();
  let keywords = [];

  if (/moistur/.test(m)) keywords.push("moistur", "cream", "hydrat");
  if (/serum/.test(m)) keywords.push("serum");
  if (/sunscreen|spf|sun/.test(m)) keywords.push("sun", "spf");
  if (/cleanser|face wash/.test(m)) keywords.push("cleans", "wash");
  if (/glow|radiance|bright/.test(m)) keywords.push("bright", "vitamin", "glow");

  let results = pickProducts(products, keywords.length ? keywords : m.split(/\s+/).filter((w) => w.length > 3), 6);

  if (maxPrice) {
    results = results.filter((p) => p.discountPrice <= maxPrice);
  }

  if (!results.length) {
    return {
      reply: maxPrice
        ? `I couldn't find products under ₹${maxPrice}. Try /shop or ask me for recommendations!`
        : "Try browsing /shop or ask something like \"best sunscreen\" or \"moisturizers under 1000\".",
      products: [],
      intent: "search",
    };
  }

  const list = results.map((p, i) => `${i + 1}. **${p.name}** — ₹${p.discountPrice}`).join("\n");
  return {
    reply: `Here are products that match your search:\n\n${list}`,
    products: results,
    intent: "search",
  };
}

function compareProducts(products, message) {
  const names = products.filter((p) => message.toLowerCase().includes(p.name.toLowerCase().slice(0, 8)));
  const picks = names.length >= 2 ? names.slice(0, 2) : products.filter((p) => /serum/i.test(p.name)).slice(0, 2);

  if (picks.length < 2) {
    return {
      reply: "Name two products to compare, or visit a product page and ask me about ingredients and skin type fit.",
      products: picks,
      intent: "compare",
    };
  }

  const [a, b] = picks;
  return {
    reply: `**${a.name}** (₹${a.discountPrice})\n${a.description?.slice(0, 120)}...\n\n**${b.name}** (₹${b.discountPrice})\n${b.description?.slice(0, 120)}...\n\nBoth are rated ${a.rating}★ / ${b.rating}★. Choose based on your skin concern — I can help narrow it down!`,
    products: picks,
    intent: "compare",
  };
}

function productQA(products, message) {
  const match = products.find((p) => message.toLowerCase().includes(p.name.toLowerCase().slice(0, 10)));
  if (match) {
    return {
      reply: `**${match.name}** — ₹${match.discountPrice}\n\n${match.description}\n\nCategory: ${match.category}. Rating: ${match.rating}★.`,
      products: [match],
      intent: "product_qa",
    };
  }
  const concerns = extractConcerns(message);
  const keywords = concerns.flatMap((c) => CONCERN_KEYWORDS[c] || [c]);
  const picks = pickProducts(products, keywords, 3);
  if (picks.length) {
    return {
      reply: `Here are options that may suit your question:\n${picks.map((p) => `• **${p.name}** — ₹${p.discountPrice}`).join("\n")}`,
      products: picks,
      intent: "product_qa",
    };
  }
  return {
    reply: "Ask about a specific product by name, or tell me your skin concern for tailored suggestions.",
    products: [],
    intent: "product_qa",
  };
}

function extractKeywords(message) {
  return message
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

function matchTopicAnswer(message) {
  return TOPIC_ANSWERS.find((t) => t.test.test(message))?.answer || null;
}

function findIngredientInMessage(message) {
  const m = message.toLowerCase();
  if (/sunscreen|sun screen|\bspf\b/.test(m)) return INGREDIENTS.spf;
  for (const [key, info] of Object.entries(INGREDIENTS)) {
    if (m.includes(key)) return info;
  }
  return null;
}

function isWeakReply(result) {
  if (!result?.reply) return true;
  const r = result.reply.toLowerCase();
  const weakPhrases = [
    "ask about a specific product",
    "tell me your skin type",
    "which ingredient would you like",
    "name two products to compare",
    "i'm glow ai — your skincare guide",
    "try browsing /shop",
    "ask me anything about skincare, products",
  ];
  return weakPhrases.some((p) => r.includes(p)) && !(result.products?.length);
}

function buildCatalogSummary(products, limit = 50) {
  const byCategory = {};
  products.slice(0, limit).forEach((p) => {
    const cat = p.category || "General";
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(`${p.name} (₹${p.discountPrice})`);
  });
  return Object.entries(byCategory)
    .map(([cat, items]) => `${cat}: ${items.slice(0, 6).join("; ")}`)
    .join("\n");
}

function suggestProductsForMessage(message, products, profile, limit = 4) {
  const concerns = extractConcerns(message);
  const skinType = extractSkinType(message) || profile?.skinType;
  const keywords = [
    ...extractKeywords(message),
    ...concerns.flatMap((c) => CONCERN_KEYWORDS[c] || [c]),
  ];

  if (skinType === "dry") keywords.push("hydrat", "moistur", "cream");
  if (skinType === "oily") keywords.push("gel", "lightweight", "oil", "acne");
  if (skinType === "sensitive") keywords.push("gentle", "sooth", "calm");
  if (profile?.concerns?.length) {
    profile.concerns.forEach((c) => {
      keywords.push(...(CONCERN_KEYWORDS[c] || [c]));
    });
  }

  const maxPrice = extractPriceMax(message);
  let picks = pickProducts(products, keywords, limit);
  if (maxPrice) picks = picks.filter((p) => p.discountPrice <= maxPrice);
  return picks;
}

async function buildGeneralAnswer(message, products, profile) {
  const topic = matchTopicAnswer(message);
  if (topic) {
    const picks = suggestProductsForMessage(message, products, profile, 3);
    return {
      reply: topic,
      products: picks,
      intent: "general",
    };
  }

  const ingredients = Object.entries(INGREDIENTS).filter(([key]) =>
    message.toLowerCase().includes(key)
  );
  if (ingredients.length >= 2) {
    const lines = ingredients
      .slice(0, 3)
      .map(([, info]) => `**${info.name}**: ${info.summary}`)
      .join("\n\n");
    const picks = pickProducts(
      products,
      ingredients.flatMap(([, info]) => info.goodFor),
      3
    );
    return {
      reply: `${lines}\n\nWant help layering these in a routine? Just ask!`,
      products: picks,
      intent: "general",
    };
  }

  const ingredient = findIngredientInMessage(message);
  if (ingredient) {
    const picks = pickProducts(products, ingredient.goodFor, 3);
    return {
      reply: `**${ingredient.name}**\n\n${ingredient.summary}\n\nBest for: ${ingredient.goodFor.join(", ")}.`,
      products: picks,
      intent: "general",
    };
  }

  const picks = suggestProductsForMessage(message, products, profile, 4);
  const keywords = extractKeywords(message);
  const skinType = extractSkinType(message) || profile?.skinType;
  const concerns = extractConcerns(message);

  let reply = "";

  if (/why|how|can i|should i|is it|does .+ work|worth/i.test(message)) {
    reply = "Great question! ";
  }

  if (concerns.length) {
    reply += `For **${concerns.join(" & ")}**, focus on gentle, consistent care and targeted actives. `;
  } else if (skinType) {
    reply += `For **${skinType} skin**, choose formulas that balance your skin's needs without overwhelming it. `;
  }

  if (picks.length) {
    const list = picks.map((p, i) => `${i + 1}. **${p.name}** — ₹${p.discountPrice}`).join("\n");
    reply += `Based on what you asked, these Glow Skin products may help:\n\n${list}\n\nTap below to view or add to cart. I can also explain ingredients or build a routine for you.`;
  } else if (keywords.length) {
    reply += `I specialize in skincare and Glow Skin products. From your question, I'd suggest exploring our **${keywords.slice(0, 3).join(", ")}** category at /shop, or tell me your skin type and main concern for a personalized shortlist.`;
  } else {
    reply +=
      "I'm here to help with anything skincare-related — products, routines, ingredients, skin concerns, comparisons, and orders. Ask me naturally, like \"best serum for glowing skin\" or \"how do I use retinol?\"";
  }

  return { reply: reply.trim(), products: picks, intent: "general" };
}

async function tryOpenAI(message, products, profile, history = []) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const catalog = buildCatalogSummary(products, 60);
  const profileNote = profile
    ? `User skin profile: type=${profile.skinType || "unknown"}, concerns=${(profile.concerns || []).join(", ") || "none"}, allergies=${(profile.allergies || []).join(", ") || "none"}.`
    : "User is browsing as a guest (no saved skin profile).";

  const system = `You are Glow AI, a warm, knowledgeable skincare expert for Glow Skin — a luxury Indian skincare e-commerce brand.

Answer ANY question the user asks: skincare advice, product questions, routines, ingredients, lifestyle, comparisons, orders, or general conversation. Be helpful, concise (under 180 words), and friendly. Use **bold** for emphasis.

If the question is unrelated to skincare or shopping, politely answer briefly and gently connect back to how you can help with their skin.

When recommending products, only suggest items from the catalog below. Mention real product names and prices in ₹.

${profileNote}

Glow Skin product catalog:
${catalog}

Site pages: /shop (all products), /categories/skin, /cart, /orders, /wishlist, /contact`;

  const messages = [
    { role: "system", content: system },
    ...history
      .filter((m) => m.role === "user" || m.role === "assistant")
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: message },
  ];

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages,
        max_tokens: 500,
        temperature: 0.75,
      }),
    });

    if (!res.ok) {
      console.error("OpenAI error:", res.status, await res.text().catch(() => ""));
      return null;
    }
    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content;
    if (!reply) return null;

    const mentioned = products.filter((p) =>
      reply.toLowerCase().includes(p.name.toLowerCase().slice(0, 12))
    );
    const picks =
      mentioned.length > 0
        ? mentioned.slice(0, 4)
        : suggestProductsForMessage(message, products, profile, 3);

    return { reply, products: picks, intent: "openai" };
  } catch (err) {
    console.error("OpenAI fetch failed:", err.message);
    return null;
  }
}

async function runIntentHandler(intent, trimmed, products, profile, userId) {
  switch (intent) {
    case "routine":
      return buildRoutineReply(products, /night|pm|evening/.test(trimmed.toLowerCase()) ? "night" : "morning");
    case "ingredient": {
      const explained = explainIngredient(trimmed);
      if (!explained || isWeakReply(explained)) return buildGeneralAnswer(trimmed, products, profile);
      return explained;
    }
    case "order":
      return orderSupport(userId, trimmed);
    case "compare":
      return compareProducts(products, trimmed);
    case "search":
      return smartSearch(products, trimmed);
    case "recommend":
      return recommendProducts(products, trimmed, profile);
    case "product_qa": {
      const qa = productQA(products, trimmed);
      if (isWeakReply(qa)) return buildGeneralAnswer(trimmed, products, profile);
      return qa;
    }
    case "shopping":
      return {
        reply: /cart/.test(trimmed.toLowerCase())
          ? "Browse products and tap **Add to Cart**, or open /cart to review your bag."
          : "I can help you find products! Try /shop, /categories/skin, or ask me for recommendations.",
        products: pickProducts(products, ["serum", "moistur"], 3),
        intent: "shopping",
      };
    default:
      return buildGeneralAnswer(trimmed, products, profile);
  }
}

async function processChat({ message, userId, history = [] }) {
  const trimmed = String(message || "").trim();
  if (!trimmed) {
    return { reply: "Ask me anything — skincare tips, product picks, routines, ingredients, or your orders!", products: [], intent: "general" };
  }

  const products = await loadProducts();
  let profile = null;
  if (userId) {
    profile = await SkinProfile.findOne({ userId }).lean();
  }

  let result = null;

  if (process.env.OPENAI_API_KEY) {
    result = await tryOpenAI(trimmed, products, profile, history);
  }

  if (!result) {
    const intent = detectIntent(trimmed);
    result = await runIntentHandler(intent, trimmed, products, profile, userId);
    if (isWeakReply(result)) {
      result = await buildGeneralAnswer(trimmed, products, profile);
    }
  }

  await AiChatLog.create({
    userId: userId || undefined,
    message: trimmed,
    intent: result.intent || "general",
    replyPreview: result.reply.slice(0, 200),
    productIds: (result.products || []).map((p) => p._id),
  });

  return result;
}

async function getAnalytics() {
  const logs = await AiChatLog.find().sort({ createdAt: -1 }).limit(500).lean();
  const intentCounts = {};
  const productCounts = {};
  const clickCounts = {};
  const concernKeywords = {};

  logs.forEach((log) => {
    intentCounts[log.intent] = (intentCounts[log.intent] || 0) + 1;
    extractConcerns(log.message).forEach((c) => {
      concernKeywords[c] = (concernKeywords[c] || 0) + 1;
    });
    (log.productIds || []).forEach((id) => {
      const key = String(id);
      productCounts[key] = (productCounts[key] || 0) + 1;
    });
    (log.clickedProductIds || []).forEach((id) => {
      const key = String(id);
      clickCounts[key] = (clickCounts[key] || 0) + 1;
    });
  });

  const topProductIds = Object.entries(productCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([id]) => id);

  const topClickIds = Object.entries(clickCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([id]) => id);

  const allIds = [...new Set([...topProductIds, ...topClickIds])];
  const topProducts = await Product.find({ _id: { $in: allIds } })
    .select("name")
    .lean();

  const productNameMap = Object.fromEntries(topProducts.map((p) => [String(p._id), p.name]));

  return {
    totalChats: logs.length,
    topIntents: Object.entries(intentCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([intent, count]) => ({ intent, count })),
    topConcerns: Object.entries(concernKeywords)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([concern, count]) => ({ concern, count })),
    topProducts: Object.entries(productCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([id, count]) => ({ id, name: productNameMap[id] || "Product", count })),
    recommendationClicks: Object.entries(clickCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([id, count]) => ({ id, name: productNameMap[id] || "Product", count })),
    recentQuestions: logs.slice(0, 10).map((l) => ({
      message: l.message,
      intent: l.intent,
      createdAt: l.createdAt,
    })),
  };
}

module.exports = {
  processChat,
  getAnalytics,
  INGREDIENTS,
};
