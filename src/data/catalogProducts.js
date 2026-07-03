/** Catalog product data — mirrors frontend generateProducts.js */
const skincareImagePool = [
  "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1608248543809-9f6d08d2041c?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1631729371254-42caa2f1adf4?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-157019a7476838-f322f99452df?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1598440947619-2c89a9107484?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1617897908996-01097e6a4e28?w=800&auto=format&fit=crop&q=80",
];

const productNames = {
  "face-moisturizer": "Silk Barrier Face Moisturizer",
  "day-cream": "Vitamin C Bright Day Cream",
  "night-cream": "Recovery Peptide Night Cream",
  "face-oils": "Night Repair Botanical Oil",
  "gel-moisturizers": "Aqua Dew Gel Moisturizer",
  "vitamin-c-serum": "Vitamin C Radiance Serum",
  "hydrating-serum": "Hydra Glow Hydrating Serum",
  "brightening-serum": "Pearl Brightening Serum",
  "anti-aging-serum": "Retinol Renewal Serum",
  "acne-serum": "Clear Calm Acne Serum",
  "face-wash": "Green Tea Gentle Face Wash",
  "cleansing-gel": "Cloud Foam Cleansing Gel",
  "micellar-water": "Pure Glow Micellar Water",
  "face-wipes": "Soothing Bamboo Face Wipes",
  "makeup-remover": "Melt Away Makeup Remover",
  "sheet-masks": "Hydra Infusion Sheet Mask",
  "sleeping-masks": "Overnight Glow Sleeping Mask",
  "clay-masks": "Natural Detox Clay Mask",
  "peel-masks": "Enzyme Peel Glow Mask",
  "face-packs": "Herbal Revival Face Pack",
  "face-toners": "Balance & Glow Face Toner",
  "face-mists": "Mineral Mist Face Spray",
  "rose-water": "Damask Rose Water Toner",
  "hydrating-toners": "Hyaluronic Hydrating Toner",
  "body-lotion": "Silk Touch Body Lotion",
  "body-butter": "Shea Velvet Body Butter",
  "body-wash": "Coconut Milk Body Wash",
  "body-scrub": "Sugar Glow Body Scrub",
  "bath-products": "Lavender Bath Soak",
  "acne-care": "Blemish Control Acne Gel",
  "spot-correctors": "Spot Fade Corrector",
  "pore-care": "Pore Refine Treatment",
  "exfoliators": "Gentle AHA Exfoliator",
  "peels": "Glycolic Glow Peel",
  "eye-cream": "Peptide Lift Eye Cream",
  "eye-serum": "Bright Eye Revive Serum",
  "eye-masks": "Cooling Hydra Eye Masks",
  "lip-balm": "Honey Nourish Lip Balm",
  "lip-scrub": "Sugar Kiss Lip Scrub",
  "lip-mask": "Overnight Lip Repair Mask",
  "face-sunscreen": "Invisible Shield Face SPF 50",
  "body-sunscreen": "Lightweight Body SPF 40",
  "spf-products": "Daily Defense SPF 30 Mist",
  "face-massagers": "Jade Glow Face Massager",
  "cleansing-brushes": "Sonic Soft Cleansing Brush",
  "blackhead-removers": "Pore Vacuum Blackhead Remover",
  "face-rollers": "Rose Quartz Face Roller",
};

const descriptions = {
  "face-moisturizer": "Lightweight daily moisture that strengthens the skin barrier.",
  "vitamin-c-serum": "Potent vitamin C drops for visible radiance and even tone.",
  "face-wash": "Gentle daily cleanser with green tea and calming botanicals.",
  "face-sunscreen": "Weightless SPF 50 protection with a satin, invisible finish.",
};

function assignTags(index) {
  const tags = [];
  if (index % 5 === 0) tags.push("featured");
  if (index % 4 === 0 || index % 4 === 1) tags.push("bestSeller");
  if (index % 3 === 0 || index % 3 === 1) tags.push("newArrival");
  return tags;
}

function getCatalogImage(index) {
  return {
    url: skincareImagePool[index % skincareImagePool.length],
    public_id: "",
  };
}

function buildCatalogProducts(groups) {
  let index = 0;
  return groups.flatMap((group) =>
    group.items.map((item) => {
      const priceBase = 499 + (index % 8) * 150;
      const product = {
        name: productNames[item.slug] || `Glow ${item.name}`,
        description:
          descriptions[item.slug] ||
          `Premium ${item.name.toLowerCase()} crafted for your glow ritual.`,
        groupSlug: group.slug,
        groupName: group.name,
        subCategorySlug: item.slug,
        subCategoryName: item.name,
        price: priceBase,
        discount: index % 9 === 0 ? 10 : 0,
        rating: Number((4.4 + (index % 6) * 0.1).toFixed(1)),
        countInStock: 20 + (index % 15),
        tags: assignTags(index),
        image: getCatalogImage(index),
      };
      index += 1;
      return product;
    })
  );
}

module.exports = { buildCatalogProducts };
