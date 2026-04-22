const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load API .env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!serviceAccount.projectId || !serviceAccount.privateKey) {
  console.error('Error: Firebase environment variables missing in api/.env');
  process.exit(1);
}

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const DATA = {
  services: [
    {
      title: 'Digital Strategy & Growth',
      category: 'Consultancy',
      description: 'Custom-tailored digital roadmaps designed to scale your brand using data-driven insights and AI integration.',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
      bodyHtml: '<h3>Scaling the Future</h3><p>We help businesses navigate the digital landscape with precision.</p><ul><li>Market Analysis</li><li>Competitor Benchmarking</li><li>Growth Hacking</li></ul>'
    },
    {
      title: 'Premium Content Production',
      category: 'Creative',
      description: 'High-end visual storytelling, including videography, photography, and high-impact social media assets.',
      imageUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80',
      bodyHtml: '<h3>Visual Excellence</h3><p>Content that doesn\'t just look good, but converts.</p>'
    },
    {
      title: 'Influencer Marketing 3.0',
      category: 'Marketing',
      description: 'Connecting your brand with authentic voices across the MENA region using our exclusive influencer network.',
      imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80',
      bodyHtml: '<h3>Impactful Connections</h3><p>Access our network of verified influencers.</p>'
    }
  ],
  blog: [
    {
      title: 'The Rise of AI in MENA Digital Marketing',
      category: 'Technology',
      excerpt: 'How artificial intelligence is reshaping consumer behavior in Kuwait and beyond.',
      imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80',
      content: 'Artificial Intelligence is no longer a luxury...',
      author: 'Mashhor Team',
      date: new Date().toISOString()
    }
  ],
  academy: [
    {
      title: 'Mastering Personal Branding',
      level: 'Intermediate',
      duration: '4 Hours',
      description: 'Learn how to build a powerful personal brand that attracts premium clients and opportunities.',
      imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80',
      price: '49 KWD'
    }
  ],
  influencers: [
    {
      name: 'Nora Al-Sabah',
      handle: '@nora.alsabah',
      category: 'lifestyle',
      country: 'Kuwait',
      followers: '1.2M',
      engagement: '4.8',
      bio: 'Premium lifestyle and luxury brand ambassador in Kuwait.',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Ahmed Hassan',
      handle: '@ahmed.tech',
      category: 'tech',
      country: 'Kuwait',
      followers: '890K',
      engagement: '5.2',
      bio: 'Leading tech reviewer and gadget unboxer in the GCC.',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80'
    }
  ],
  site_settings: [
    {
      id: 'global',
      maintenanceMode: false,
      siteTitle: 'Mashhor Hub | The Elite Creator Network',
      announcementText: '🚀 Welcome to the new Mashhor Hub! Explore our vetted influencers.'
    }
  ]
};

async function seed() {
  console.log('🚀 Seeding professional content...');
  
  for (const [col, items] of Object.entries(DATA)) {
    console.log(`- Seeding ${col}...`);
    const collectionRef = db.collection(col);
    
    // Check if empty first (optional, but safer)
    const snap = await collectionRef.limit(1).get();
    if (!snap.empty) {
       console.log(`  ! Collection ${col} already has data. Skipping to avoid duplicates.`);
       continue;
    }

    for (const item of items) {
      const { id, ...data } = item;
      if (id) {
        await collectionRef.doc(id).set({
          ...data,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } else {
        await collectionRef.add({
          ...data,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }
  }
  
  console.log('✅ Seeding complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
