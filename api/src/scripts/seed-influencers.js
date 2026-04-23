require('dotenv').config({ path: '../../.env' });
const { db } = require('../config/firebase');

const influencers = [
  // --- GOLD TIER (Macro/Elite) ---
  {
    name: "Feras Al-Qasem",
    pageName: "feras_tech",
    category: "tech",
    field: "Tech & Innovation Leader",
    longBio: "Feras is a leading voice in the GCC tech landscape, specializing in AI, digital transformation, and the future of work. With over 2M followers, he bridges the gap between complex technology and everyday business value.",
    whatsappNumber: "96512345678",
    verificationTier: "gold",
    tags: ["AI", "Innovation", "Business", "Kuwait"],
    isGold: true,
    isVerified: true
  },
  {
    name: "Dana Al-Tuwarish",
    pageName: "dana_tuwarish",
    category: "fashion",
    field: "Fashion & Lifestyle Icon",
    longBio: "Dana is one of the most influential fashion personalities in the Arab world. Known for her impeccable style and trendsetting presence, she collaborates with global luxury brands to bring premium content to her audience.",
    whatsappNumber: "96587654321",
    verificationTier: "gold",
    tags: ["Fashion", "Luxury", "Lifestyle", "GCC"],
    isGold: true,
    isVerified: true
  },
  {
    name: "Boody Al-Refaei",
    pageName: "boody_fit",
    category: "sports",
    field: "Fitness & Wellness Guru",
    longBio: "Boody has transformed the fitness industry in Kuwait with his evidence-based approach to health and wellness. He inspires millions to lead a healthier lifestyle through his interactive programs and seminars.",
    whatsappNumber: "96599887766",
    verificationTier: "gold",
    tags: ["Fitness", "Health", "Kuwait", "Wellness"],
    isGold: true,
    isVerified: true
  },
  {
    name: "Rawan Bin Hussain",
    pageName: "rawan",
    category: "fashion",
    field: "Media & Style Authority",
    longBio: "A multi-talented entrepreneur and media figure, Rawan is a powerhouse in the beauty and lifestyle sector. Her influence spans across the GCC and Egypt, making her a top choice for high-end brand partnerships.",
    whatsappNumber: "97155667788",
    verificationTier: "gold",
    tags: ["Media", "Fashion", "Dubai", "Egypt"],
    isGold: true,
    isVerified: true
  },
  {
    name: "Ahmad Al-Shugairi",
    pageName: "shugairi",
    category: "business",
    field: "Social Change & Inspiration",
    longBio: "Ahmad is a legendary figure known for his 'Khawatir' series. He focuses on personal development, social improvement, and innovative thinking, commanding respect across the entire Arab world.",
    whatsappNumber: "96655112233",
    verificationTier: "gold",
    tags: ["Inspiration", "Education", "Saudi", "Social"],
    isGold: true,
    isVerified: true
  },
  {
    name: "Ascia Al-Faraj",
    pageName: "ascia",
    category: "fashion",
    field: "Modern Fashion & Parenting",
    longBio: "Ascia is a pioneer of modern, modest fashion and a vocal advocate for authentic content. Her journey from fashion blogger to entrepreneur has made her a global icon for the modern Arab woman.",
    whatsappNumber: "96544332211",
    verificationTier: "gold",
    tags: ["Fashion", "Parenting", "Business", "Kuwait"],
    isGold: true,
    isVerified: true
  },
  {
    name: "Joey Al-Zayyat",
    pageName: "joey_gaming",
    category: "gaming",
    field: "Esports & Gaming Legend",
    longBio: "Joey is at the forefront of the Arab gaming revolution. As an esports athlete and content creator, he reaches millions of young gamers with high-energy reviews and competitive gameplay.",
    whatsappNumber: "96177889900",
    verificationTier: "gold",
    tags: ["Gaming", "Esports", "Tech", "Entertainment"],
    isGold: true,
    isVerified: true
  },
  {
    name: "Laila Abdallah",
    pageName: "laila_act",
    category: "fashion",
    field: "Acting & Lifestyle Star",
    longBio: "A celebrated actress and lifestyle influencer, Laila brings grace and charisma to every project. Her engagement levels are among the highest in the region, particularly in the lifestyle and beauty niches.",
    whatsappNumber: "96522334455",
    verificationTier: "gold",
    tags: ["Acting", "Lifestyle", "Beauty", "GCC"],
    isGold: true,
    isVerified: true
  },
  {
    name: "Ibrahim Al-Basha",
    pageName: "ibrahim",
    category: "travel",
    field: "Travel & Culture Explorer",
    longBio: "Ibrahim's cinematic travel content has redefined how the Arab world explores the globe. He focuses on cultural immersion and storytelling, making his audience feel like they are part of the journey.",
    whatsappNumber: "96655443322",
    verificationTier: "gold",
    tags: ["Travel", "Culture", "Cinema", "Saudi"],
    isGold: true,
    isVerified: true
  },

  // --- BLUE TIER (Verified/Mid) ---
  {
    name: "Saud Al-Ammar",
    pageName: "saud_reviews",
    category: "tech",
    field: "Consumer Tech Specialist",
    longBio: "Saud provides honest, in-depth reviews of the latest gadgets and mobile technology. His 'tech-simplified' approach makes him a trusted source for consumers looking to make informed purchases.",
    whatsappNumber: "96511122233",
    verificationTier: "blue",
    tags: ["Tech", "Reviews", "Gadgets", "Kuwait"],
    isGold: false,
    isVerified: true
  },
  {
    name: "Mubarak Al-Mutairi",
    pageName: "mubarak_art",
    category: "tech",
    field: "Visual Artist & Creative",
    longBio: "Mubarak is a digital artist who uses technology to create stunning visual experiences. His work has been featured in major exhibitions across the GCC, blending traditional themes with modern digital tools.",
    whatsappNumber: "96533344455",
    verificationTier: "blue",
    tags: ["Art", "Design", "Tech", "Creative"],
    isGold: false,
    isVerified: true
  },
  {
    name: "Sara Al-Wadaani",
    pageName: "sara_makeup",
    category: "fashion",
    field: "Makeup Artistry & Family",
    longBio: "Sara is a household name in Saudi Arabia, known for her incredible makeup skills and relatable family content. She successfully balances professional artistry with authentic personal storytelling.",
    whatsappNumber: "96622233344",
    verificationTier: "blue",
    tags: ["Makeup", "Beauty", "Family", "Saudi"],
    isGold: false,
    isVerified: true
  },
  {
    name: "Hamad Al-Ali",
    pageName: "hamad_qalam",
    category: "food",
    field: "Social Media Personality",
    longBio: "Hamad (Hamad Qalam) is one of Kuwait's most beloved social figures. His wit and engaging storytelling make him a key influencer for any brand looking to connect with the local Kuwaiti community.",
    whatsappNumber: "96555566677",
    verificationTier: "blue",
    tags: ["Social", "Media", "Kuwait", "TV"],
    isGold: false,
    isVerified: true
  },
  {
    name: "Dalal Al-Doub",
    pageName: "dalalid",
    category: "fashion",
    field: "Hijabi Fashion Pioneer",
    longBio: "Dalal is a global leader in modest fashion and beauty. Her instructional videos and style guides have empowered millions of women to embrace their identity while staying fashionable.",
    whatsappNumber: "96566677788",
    verificationTier: "blue",
    tags: ["Fashion", "Beauty", "Hijab", "Lifestyle"],
    isGold: false,
    isVerified: true
  },
  {
    name: "Abdulaziz Al-Jasmi",
    pageName: "bin_jasmi",
    category: "gaming",
    field: "Gaming & Content Creator",
    longBio: "Abdulaziz is a dynamic gaming influencer known for his entertaining walkthroughs and competitive spirit. He has a highly loyal audience in the GCC gaming community.",
    whatsappNumber: "97122334455",
    verificationTier: "blue",
    tags: ["Gaming", "GCC", "YouTube", "Esports"],
    isGold: false,
    isVerified: true
  },
  {
    name: "Fouz Al-Fahad",
    pageName: "therealfouz",
    category: "fashion",
    field: "Beauty & Entrepreneurship",
    longBio: "Fouz is a prominent beauty influencer and business owner. Her brand 'The Real Fouz' is a testament to her influence and deep understanding of the Arab beauty market.",
    whatsappNumber: "96599001122",
    verificationTier: "blue",
    tags: ["Beauty", "Business", "Kuwait", "Lifestyle"],
    isGold: false,
    isVerified: true
  },
  {
    name: "Mariam Al-Khurafi",
    pageName: "mariam_k",
    category: "business",
    field: "Philanthropy & Business",
    longBio: "Mariam is an entrepreneur and humanitarian who uses her platform to drive positive social change. She is a role model for young Arab women looking to combine business with social responsibility.",
    whatsappNumber: "96588899900",
    verificationTier: "blue",
    tags: ["Business", "Philanthropy", "Social", "Kuwait"],
    isGold: false,
    isVerified: true
  },
  {
    name: "Nasser Al-Qasabi",
    pageName: "nasser_act",
    category: "fashion",
    field: "Iconic Actor & Satirist",
    longBio: "Nasser is a legendary Saudi actor known for his social satire and brilliant performances. His influence transcends generations, making him one of the most respected figures in Arab media.",
    whatsappNumber: "96611223344",
    verificationTier: "blue",
    tags: ["Acting", "Media", "Saudi", "Comedy"],
    isGold: false,
    isVerified: true
  },

  // --- GREEN TIER (Micro/Trusted) ---
  {
    name: "Omar Al-Mutawa",
    pageName: "omar_coach",
    category: "sports",
    field: "Certified Fitness Coach",
    longBio: "Omar is a dedicated fitness professional who focuses on personalized training and nutrition. His micro-influence is characterized by high trust and direct engagement with his trainees.",
    whatsappNumber: "96577788899",
    verificationTier: "green",
    tags: ["Fitness", "Training", "Nutrition", "Micro"],
    isGold: false,
    isVerified: false
  },
  {
    name: "Reem Al-Sane",
    pageName: "reem_sane",
    category: "fashion",
    field: "Rising Fashion Creator",
    longBio: "Reem is a fresh voice in the fashion world, known for her aesthetic eye and authentic reviews of niche brands. She has a highly targeted and engaged young audience.",
    whatsappNumber: "96655667700",
    verificationTier: "green",
    tags: ["Fashion", "Creative", "Saudi", "Micro"],
    isGold: false,
    isVerified: false
  },
  {
    name: "Yousef Al-Enezi",
    pageName: "yousef_dev",
    category: "tech",
    field: "Software Developer & Educator",
    longBio: "Yousef shares tips on coding, app development, and the latest in software engineering. He is a key influencer for the growing developer community in Kuwait.",
    whatsappNumber: "96544455566",
    verificationTier: "green",
    tags: ["Coding", "Dev", "Education", "Kuwait"],
    isGold: false,
    isVerified: false
  },
  {
    name: "Noura Al-Abdullah",
    pageName: "noura_style",
    category: "fashion",
    field: "Style & Aesthetics",
    longBio: "Noura focuses on aesthetic living, home decor, and minimalist fashion. Her followers value her curated eye and consistent high-quality visual content.",
    whatsappNumber: "96533322211",
    verificationTier: "green",
    tags: ["Aesthetics", "Decor", "Minimalism", "Micro"],
    isGold: false,
    isVerified: false
  },
  {
    name: "Fahad Al-Mulla",
    pageName: "fahad_eats",
    category: "food",
    field: "Food Critic & Explorer",
    longBio: "Fahad explores the hidden gems of the Kuwaiti food scene. His honest reviews and focus on local businesses have made him a trusted guide for foodies in the region.",
    whatsappNumber: "96522211100",
    verificationTier: "green",
    tags: ["Food", "Reviews", "Kuwait", "Blogger"],
    isGold: false,
    isVerified: false
  },
  {
    name: "Hessa Al-Loughani",
    pageName: "hessa_media",
    category: "fashion",
    field: "Media Presenter & Host",
    longBio: "Hessa is a familiar face in Kuwaiti media. Her platform combines her professional hosting life with her personal style, offering a unique perspective to her dedicated followers.",
    whatsappNumber: "96566655544",
    verificationTier: "green",
    tags: ["Media", "TV", "Kuwait", "Lifestyle"],
    isGold: false,
    isVerified: false
  },
  {
    name: "Abdullah Jumaa",
    pageName: "abdullah_travel",
    category: "travel",
    field: "Budget Travel Expert",
    longBio: "Abdullah shows his audience how to travel the world on a budget without sacrificing the experience. He is a source of practical advice for young travelers in the GCC.",
    whatsappNumber: "96644433322",
    verificationTier: "green",
    tags: ["Travel", "Budget", "Tips", "Saudi"],
    isGold: false,
    isVerified: false
  },
  {
    name: "Latifa Al-Shamsi",
    pageName: "latifa_sh",
    category: "fashion",
    field: "Lifestyle & Culture",
    longBio: "Latifa is a creative storyteller who explores the intersection of culture, art, and modern lifestyle in the UAE. Her content is thoughtful and visually poetic.",
    whatsappNumber: "97155443322",
    verificationTier: "green",
    tags: ["Culture", "Art", "UAE", "Lifestyle"],
    isGold: false,
    isVerified: false
  },
  {
    name: "Zaid Al-Ali",
    pageName: "zaid_biz",
    category: "business",
    field: "Startup Entrepreneur",
    longBio: "Zaid shares the raw journey of building a startup in the Arab world. His content is invaluable for aspiring entrepreneurs looking for real-world advice and motivation.",
    whatsappNumber: "96511100099",
    verificationTier: "green",
    tags: ["Startup", "Business", "Entrepreneur", "Motivation"],
    isGold: false,
    isVerified: false
  }
];

async function seed() {
  console.log('--- Influencer Seeding Started ---');
  const batch = db.batch();

  for (const inf of influencers) {
    const docRef = db.collection('influencers').doc();
    batch.set(docRef, {
      ...inf,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    console.log(`Prepared: ${inf.name}`);
  }

  await batch.commit();
  console.log('--- Seeding Completed Successfully! ---');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
