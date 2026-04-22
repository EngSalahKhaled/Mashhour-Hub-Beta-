const { db } = require('./api/src/config/firebase');

const influencers = [
    { name: 'صلاح خالد', field: 'تكنولوجيا وذكاء اصطناعي', tags: ['AI', 'Tech', 'Reviews'], followers: '500K', country: 'الكويت', username: 'salah' },
    { name: 'أحمد الرفاعي', field: 'جرافيك ديزاين', tags: ['Design', 'Branding', 'Art'], followers: '1.2M', country: 'مصر', username: 'reda' },
    { name: 'نورة العبدالله', field: 'جمال وموضة', tags: ['Fashion', 'Beauty', 'Makeup'], followers: '800K', country: 'الإمارات', username: 'noura' },
    { name: 'فهد المطيري', field: 'سياحة وسفر', tags: ['Travel', 'Adventure', 'Food'], followers: '300K', country: 'الكويت', username: 'fahad' },
    { name: 'ليلى القحطاني', field: 'أعمال واقتصاد', tags: ['Business', 'Investing', 'Stocks'], followers: '450K', country: 'السعودية', username: 'layla' },
    { name: 'يوسف الهيرون', field: 'جيمنج وبث مباشر', tags: ['Gaming', 'Streaming', 'Esports'], followers: '2M', country: 'مصر', username: 'yousef' },
    { name: 'مريم الصالح', field: 'طهي ومطبخ', tags: ['Cooking', 'Recipes', 'Foodie'], followers: '900K', country: 'البحرين', username: 'maryam' },
    { name: 'سلطان بن فهد', field: 'سيارات ومحركات', tags: ['Cars', 'Review', 'Drift'], followers: '1M', country: 'السعودية', username: 'sultan' },
    { name: 'هيا السبيعي', field: 'رياضة ولياقة', tags: ['Fitness', 'Workout', 'Health'], followers: '600K', country: 'الكويت', username: 'haya' },
    { name: 'علي حسن', field: 'تصوير احترافي', tags: ['Photography', 'Editing', 'Cinematic'], followers: '250K', country: 'عمان', username: 'ali' }
];

async function seed() {
    console.log('Seeding 10 Professional Influencers...');
    for (const inf of influencers) {
        await db.collection('portal_users').add({
            pageName: inf.name,
            workField: inf.field,
            tags: inf.tags,
            userType: 'influencer',
            subscriptionPlan: 'pro',
            isVerified: true,
            verificationType: 'blue',
            followers: inf.followers,
            country: inf.country,
            username: inf.username,
            createdAt: new Date().toISOString()
        });
    }
    console.log('Seed Complete! ✅');
}

// Note: This script is intended to be run in the backend environment
// seed();
