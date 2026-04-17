(function () {
const root = document.documentElement;
const isArabic = root.getAttribute('dir') === 'rtl' || root.getAttribute('lang') === 'ar';
const pagePath = window.location.pathname.replace(/\/+/g, '/');const strings = isArabic ? {
architecture: 'هيكل الأكاديمية',
architectureTitle: 'من المسار إلى الكورس إلى التطبيق داخل العمل.',
architectureText: 'الأكاديمية هنا مبنية كمنظومة تعلم عملية حول مهارات محمد في الذكاء الاصطناعي، التسويق، الأتمتة، الإبداع، والتحويل.',
liveTracks: 'مسارات حية',
coursesReady: 'كورسات منفصلة',
deliveryModes: 'طرق تقديم',
deliveryTitle: 'طرق تدريب تناسب الأفراد والفرق والشركات.',
deliveryItems: [
['جلسات خاصة', 'لحل تحدٍ محدد أو رفع مهارة بعينها بسرعة.'],
['ورش داخلية', 'لتوحيد الفهم وبناء لغة عمل مشتركة داخل الفريق.'],
['برنامج متكامل', 'عند الحاجة إلى ترتيب منطقي يرفع القدرة التشغيلية بالكامل.']
],
roadmap: 'خارطة المسار',
skillLanes: 'محاور المهارة',
nextStep: 'الخطوة التالية',
whyMohamed: 'لماذا هذا التدريب مختلف؟',
whyMohamedText: 'كل صفحة هنا مبنية على خبرة تنفيذية حقيقية في السوق الكويتي والخليجي، لذلك المحتوى لا يكتفي بالمعلومة بل يركز على التطبيق والنتيجة.',
whatYouMaster: 'ماذا ستتقن داخل هذا الكورس',
handsOn: 'تمارين وتطبيقات عملية',
deliverables: 'مخرجات ستخرج بها',
toolStack: 'الأدوات والمنصات المستخدمة',
bestFor: 'مناسب لمن',
notFor: 'ليس الأنسب إذا',
bookingTitle: 'هل تريد هذا الكورس بشكل خاص أو لفريقك؟',
bookingText: 'يمكن تقديم هذا الكورس كجلسة خاصة، ورشة داخلية، أو ضمن برنامج تدريبي متكامل حسب مستوى الفريق والهدف التجاري.',
bookNow: 'احجز أو اطلب التوصية',
exploreTrack: 'استكشف المسار',
implementationPlan: 'خطة تطبيق داخل العمل',
implementationText: 'الهدف النهائي ليس الإلهام، بل تحويل ما تعلمته إلى قرار، قالب، أداة، أو خطوة تنفيذية قابلة للاستخدام مباشرة.',
roleFit: 'ملاءمة الدور',
outcomes: 'نتائج متوقعة',
pageStats: 'مؤشرات سريعة',
cohortLine: 'مناسب للأفراد والفرق وبرامج الشركات',
sequenceText: 'أفضل نتيجة عادة تأتي من أخذ الكورسات بترتيب عملي بدلاً من الاختيار العشوائي.',
academyMap: 'خريطة التعلم'
} : {
architecture: 'Academy Architecture',
architectureTitle: 'From track, to course, to implementation inside the business.',
architectureText: 'The academy is structured as a practical learning system around Mohamed Reda’s real strengths in AI, marketing, automation, creative work, and conversion.',
liveTracks: 'Live tracks',
coursesReady: 'Dedicated course pages',
deliveryModes: 'Delivery modes',
deliveryTitle: 'Training formats for individuals, internal teams, and company programs.',
deliveryItems: [
['Private intensives', 'Best when the need is focused and immediate.'],
['Internal workshops', 'Built for shared understanding and aligned team execution.'],
['Full capability programs', 'Ideal when the business needs more than a one-off course.']
],
roadmap: 'Track roadmap',
skillLanes: 'Skill lanes',
nextStep: 'Next step',
whyMohamed: 'Why this training feels different',
whyMohamedText: 'Every academy page is tied to real execution work in Kuwait and the GCC, so the training focuses on implementation, decision quality, and commercial usefulness.',
whatYouMaster: 'What you will master inside this course',
handsOn: 'Hands-on labs and applications',
deliverables: 'What you leave with',
toolStack: 'Tools and platforms used',
bestFor: 'Best for',
notFor: 'Less ideal for',
bookingTitle: 'Need this course privately or for a team?',
bookingText: 'This course can be delivered as a private intensive, an internal workshop, or part of a wider capability-building program.',
bookNow: 'Book or get a recommendation',
exploreTrack: 'Explore track',
implementationPlan: 'Implementation plan',
implementationText: 'The end goal is not inspiration. It is a working plan, a set of assets, and a clearer operating method after the training ends.',
roleFit: 'Role fit',
outcomes: 'Expected outcomes',
pageStats: 'Quick signals',
cohortLine: 'Built for individuals, internal teams, and company programs',
sequenceText: 'The strongest results usually come from taking the courses in a practical order instead of picking them randomly.',
academyMap: 'Learning map'
};const trackData = {
flagship: {
lanes: isArabic ? ['استراتيجية تبني الذكاء الاصطناعي', 'تصميم workflows والمساعدين', 'ربط الذكاء الاصطناعي بالمحتوى والقرار'] : ['AI adoption strategy', 'Workflow and assistant design', 'Connecting AI to content and decisions'],
sequence: isArabic ? ['فهم طبقة التشغيل', 'اختيار الأدوات والمنهج', 'بناء الاستخدام داخل الفريق', 'قياس الأثر التجاري'] : ['Clarify the operating layer', 'Choose the right tools and method', 'Build team adoption', 'Measure commercial impact'],
audience: isArabic ? ['المؤسسون', 'قادة التسويق', 'المديرون التنفيذيون'] : ['Founders', 'Marketing leaders', 'Senior operators'],
outcomes: isArabic ? ['خطة واضحة لتبني AI', 'تقليل العشوائية في الاستخدام', 'ربط التنفيذ اليومي بالأثر التجاري'] : ['A clearer AI adoption plan', 'Less fragmented usage', 'A stronger link to commercial output']
},
ai: {
lanes: isArabic ? ['البحث والتحليل', 'الأوامر والمساعدون', 'تحسين جودة المخرجات'] : ['Research and analysis', 'Prompt systems and assistants', 'Output quality control'],
sequence: isArabic ? ['ابدأ بالأوامر', 'ثم الأبحاث', 'ثم المساعدين المخصصين', 'ثم التوسع التشغيلي'] : ['Start with prompting', 'Move into research', 'Build custom assistants', 'Scale into operations'],
audience: isArabic ? ['فرق البحث', 'فرق المحتوى', 'مديرو التسويق'] : ['Research teams', 'Content teams', 'Marketing leads'],
outcomes: isArabic ? ['سرعة أكبر في التخطيط والبحث', 'جودة مخرجات أكثر ثباتاً', 'طبقة AI قابلة للاستخدام اليومي'] : ['Faster research and planning', 'More reliable outputs', 'A usable AI layer for day-to-day work']
},
automation: {
lanes: isArabic ? ['CRM والمنطق التشغيلي', 'Webhooks والربط', 'التقارير واللوحات'] : ['CRM and workflow logic', 'Webhooks and integrations', 'Reporting and dashboards'],
sequence: isArabic ? ['رسم التدفق', 'بناء المشغلات', 'ربط الأدوات', 'مراقبة الأداء'] : ['Map the flow', 'Build triggers', 'Connect tools', 'Monitor performance'],
audience: isArabic ? ['فرق العمليات', 'مسؤولو CRM', 'فرق التسويق'] : ['Operations teams', 'CRM owners', 'Marketing teams'],
outcomes: isArabic ? ['تقليل الأعمال اليدوية', 'متابعة أفضل للعملاء', 'وضوح أعلى في التقارير'] : ['Less manual work', 'Better lead movement', 'Clearer reporting']
},
paid: {
lanes: isArabic ? ['منطق المنصة', 'الميزانية والاختبارات', 'الإبداع الموجه للتحويل'] : ['Platform fit', 'Budgeting and testing', 'Creative built for conversion'],
sequence: isArabic ? ['اختيار القناة', 'ضبط العرض', 'تصميم الاختبار', 'التوسع أو الإيقاف'] : ['Choose the channel', 'Align the offer', 'Design the test', 'Scale or rebuild'],
audience: isArabic ? ['Media buyers', 'فرق الأداء', 'مؤسسون يراجعون الإعلانات'] : ['Media buyers', 'Performance teams', 'Founders reviewing paid efficiency'],
outcomes: isArabic ? ['قرارات أدق للميزانية', 'توافق أقوى بين العرض والمنصة', 'ثقة أعلى في التوسع'] : ['Sharper budget decisions', 'Stronger offer-platform fit', 'More confident scaling']
},
creative: {
lanes: isArabic ? ['هوية بصرية وإخراج', 'فيديو وموشن', 'أصول مدعومة بالذكاء الاصطناعي'] : ['Visual identity and expression', 'Video and motion systems', 'AI-assisted asset production'],
sequence: isArabic ? ['تحديد الرسالة البصرية', 'بناء الأصول', 'تسريع الإنتاج', 'تكييفها للحملات'] : ['Set the visual message', 'Build the assets', 'Speed up production', 'Adapt for campaigns'],
audience: isArabic ? ['مصممون', 'محررو فيديو', 'فرق الإبداع'] : ['Designers', 'Editors', 'Creative teams'],
outcomes: isArabic ? ['إقناع بصري أقوى', 'سرعة إنتاج أعلى', 'ربط الإبداع بالأداء'] : ['Stronger visual persuasion', 'Faster asset cycles', 'Creative output tied to performance']
},
strategy: {
lanes: isArabic ? ['العرض والرسالة', 'التحويل والإقناع', 'قرارات النمو والتسعير'] : ['Offer and messaging design', 'Conversion psychology', 'Growth and pricing judgment'],
sequence: isArabic ? ['تحديد المشكلة', 'إعادة بناء العرض', 'صياغة الرسالة', 'اختبار التحويل'] : ['Clarify the problem', 'Rebuild the offer', 'Sharpen the message', 'Test conversion'],
audience: isArabic ? ['مؤسسون', 'مسوقون كبار', 'استشاريون'] : ['Founders', 'Senior marketers', 'Consultants'],
outcomes: isArabic ? ['رسائل أقوى', 'تحويل أوضح', 'حكم استراتيجي أفضل'] : ['Sharper messaging', 'Clearer conversion logic', 'Stronger strategic judgment']
}
};const categoryFallback = {
flagship: 'flagship',
'flagship cohort': 'flagship',
'flagship ai cohort': 'flagship',
'ai & data': 'ai',
automation: 'automation',
'paid ads': 'paid',
creative: 'creative',
strategy: 'strategy'
};function normalize(value) {
return String(value || '').toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, ' ').trim();
}function dedupe(items) {
return Array.from(new Set(items.filter(Boolean)));
}function detectCategory() {
const badge = document.querySelector('.ac-badge, .cc-tag');
const source = normalize(badge ? badge.textContent : '');
for (const key of Object.keys(categoryFallback)) {
if (source.includes(key)) return categoryFallback[key];
}
if (pagePath.includes('/tracks/ai')) return 'ai';
if (pagePath.includes('/tracks/automation')) return 'automation';
if (pagePath.includes('/tracks/paid')) return 'paid';
if (pagePath.includes('/tracks/creative')) return 'creative';
if (pagePath.includes('/tracks/strategy')) return 'strategy';
return pagePath.includes('professional-ai-course') || pagePath.includes('/tracks/flagship') ? 'flagship' : 'ai';
}function slugFromPath() {
const match = pagePath.match(/\/courses\/([^/.]+)\.html/);
return match ? match[1] : '';
}function createList(items, className) {
return `<ul class="${className}">${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
}function keywordProfile(slug, category, title) {
const key = slug || normalize(title);
const categoryBase = {
flagship: {
tools: ['Claude', 'ChatGPT', 'Notion', 'n8n', 'Research workflows'],
skills: isArabic ? ['بناء طبقة تشغيل للذكاء الاصطناعي', 'تصميم workflow واقعي', 'حوكمة الاستخدام داخل الفريق'] : ['AI operating model design', 'Workflow architecture', 'Team adoption and governance'],
labs: isArabic ? ['تحويل عملية حقيقية داخل الشركة إلى نظام AI-assisted', 'تصميم SOP ذكي للفريق', 'بناء نموذج قرار يحدد أين تستخدم AI وأين لا'] : ['Turn a real company process into an AI-assisted system', 'Design a smart SOP for the team', 'Build a decision model for where AI should and should not be used'],
deliverables: isArabic ? ['خطة تطبيق 30-60-90 يوم', 'قوالب workflows', 'وثيقة تبني داخلية للفريق'] : ['A 30-60-90 rollout plan', 'Workflow templates', 'An internal adoption document'],
bestFor: trackData.flagship.audience,
notFor: isArabic ? ['من يريد مقدمة عامة فقط', 'من لا يملك أي سياق تشغيلي حالياً'] : ['People looking for a basic introduction only', 'Teams with no immediate implementation context']
},
ai: {
tools: ['Claude', 'ChatGPT', 'Gemini', 'Perplexity', 'Sheets'],
skills: isArabic ? ['صياغة الأوامر باحتراف', 'البحث المدعوم بالذكاء الاصطناعي', 'تحسين جودة المخرجات'] : ['Professional prompt design', 'AI-assisted research', 'Output quality control'],
labs: isArabic ? ['إعادة كتابة brief أو framework حقيقي', 'تحليل منافسين باستخدام AI', 'بناء assistant بسيط لمهمة متكررة'] : ['Rewrite a real brief or framework', 'Run an AI competitor audit', 'Build a simple assistant for a repeated task'],
deliverables: isArabic ? ['Prompt stack جاهز', 'قوالب أبحاث', 'قائمة استخدامات عملية للفريق'] : ['A reusable prompt stack', 'Research templates', 'A practical internal use-case list'],
bestFor: trackData.ai.audience,
notFor: isArabic ? ['من يبحث عن استخدام ترفيهي للأدوات', 'من لا يريد تطبيقاً عملياً'] : ['People using AI only for novelty', 'Anyone avoiding practical application']
},
automation: {
tools: ['n8n', 'Make.com', 'Zapier', 'Webhooks', 'Google Sheets'],
skills: isArabic ? ['تصميم تدفقات مؤتمتة', 'بناء منطق CRM', 'ربط الأدوات والبيانات'] : ['Automation flow design', 'CRM logic building', 'Tool and data integration'],
labs: isArabic ? ['رسم تدفق lead حقيقي', 'بناء trigger وتشغيل متابعة', 'إنشاء dashboard أو log تشغيلي'] : ['Map a real lead flow', 'Build a trigger and follow-up path', 'Create a dashboard or operating log'],
deliverables: isArabic ? ['Workflow قابل للتنفيذ', 'خريطة أتمتة', 'قائمة أخطاء تشغيل محتملة'] : ['A working workflow blueprint', 'An automation map', 'A likely failure checklist'],
bestFor: trackData.automation.audience,
notFor: isArabic ? ['من يريد أتمتة بلا فهم للعملية', 'من لا يملك أدوات أو بيانات صالحة للربط'] : ['Teams wanting automation without process clarity', 'Cases with no usable systems or data to connect']
},
paid: {
tools: ['Meta Ads', 'TikTok Ads', 'Google Ads', 'Snapchat', 'Looker Studio'],
skills: isArabic ? ['هيكلة الحملات', 'فهم الإبداع والتحويل', 'قرارات الميزانية والاختبار'] : ['Campaign architecture', 'Creative-conversion fit', 'Budget and testing decisions'],
labs: isArabic ? ['تحليل funnel إعلاني', 'إعادة هيكلة campaign', 'تصميم matrix للاختبار والتوسع'] : ['Audit a paid funnel', 'Restructure a campaign', 'Design a testing and scale matrix'],
deliverables: isArabic ? ['خطة اختبار', 'منطق توزيع ميزانية', 'معايير واضحة للتوسع أو الإيقاف'] : ['A testing plan', 'A budget allocation logic sheet', 'Clear scale-or-stop criteria'],
bestFor: trackData.paid.audience,
notFor: isArabic ? ['من لا يملك عرضاً أو منتجاً واضحاً', 'من يبحث عن وصفات ثابتة لكل منصة'] : ['Anyone with no clear offer', 'People looking for one-size-fits-all platform hacks']
},
creative: {
tools: ['Adobe Creative Suite', 'Figma', 'Midjourney', 'CapCut', 'Brand systems'],
skills: isArabic ? ['إخراج بصري يخدم البيع', 'تسريع الإنتاج الإبداعي', 'مواءمة الأصول مع الحملة'] : ['Commercial visual direction', 'Faster creative production', 'Campaign-ready asset planning'],
labs: isArabic ? ['إعادة بناء asset إعلاني', 'تصميم storyboard أو visual system', 'تكييف أصل إبداعي لمنصات مختلفة'] : ['Rebuild a campaign asset', 'Create a storyboard or visual system', 'Adapt one asset across multiple placements'],
deliverables: isArabic ? ['Creative kit', 'قوالب أو storyboards', 'معايير جودة للإخراج'] : ['A creative kit', 'Templates or storyboards', 'Quality standards for production'],
bestFor: trackData.creative.audience,
notFor: isArabic ? ['من يريد إلهاماً بصرياً فقط', 'من لا يحتاج ربط الإبداع بنتيجة تجارية'] : ['People wanting inspiration only', 'Teams not tying creative to commercial outcomes']
},
strategy: {
tools: ['Offer frameworks', 'Landing pages', 'SEO audits', 'Messaging boards', 'Analytics'],
skills: isArabic ? ['إعادة بناء العرض', 'تحسين الرسالة والتحويل', 'فهم السلوك الشرائي'] : ['Offer rebuilding', 'Messaging and conversion improvement', 'Buyer psychology'],
labs: isArabic ? ['إعادة كتابة عرض أو صفحة', 'تحليل رحلة التحويل', 'صياغة value proposition أقوى'] : ['Rewrite an offer or landing page', 'Audit the conversion journey', 'Build a sharper value proposition'],
deliverables: isArabic ? ['Offer document', 'Messaging framework', 'تحسينات مباشرة للحملة أو الصفحة'] : ['An offer document', 'A messaging framework', 'Direct page or campaign improvements'],
bestFor: trackData.strategy.audience,
notFor: isArabic ? ['من لا يريد تعديل العرض أو الرسالة', 'من يبحث عن تكتيك سريع بلا فهم السبب'] : ['Teams unwilling to revisit the offer', 'People seeking quick tricks without strategic work']
}
};const current = { ...categoryBase[category] };
function applySpecific(config) {
current.tools = dedupe([...(current.tools || []), ...(config.tools || [])]).slice(0, 7);
current.skills = dedupe([...(config.skills || []), ...(current.skills || [])]).slice(0, 6);
current.labs = dedupe([...(config.labs || []), ...(current.labs || [])]).slice(0, 4);
current.deliverables = dedupe([...(config.deliverables || []), ...(current.deliverables || [])]).slice(0, 4);
}if (/prompt/.test(key)) {
applySpecific({
tools: ['Prompt frameworks', 'Role design', 'Chain prompting'],
skills: isArabic ? ['هندسة الأوامر', 'تفكيك المهام المعقدة', 'ضبط tone والقيود'] : ['Prompt engineering', 'Task decomposition', 'Tone and constraint control']
});
} else if (/gpt/.test(key)) {
applySpecific({
tools: ['Custom GPTs', 'Knowledge files', 'Instruction design'],
skills: isArabic ? ['تصميم مساعد مخصص', 'هيكلة المعرفة', 'تقييد السلوك'] : ['Custom assistant design', 'Knowledge structuring', 'Behavioral guardrails']
});
} else if (/market-research/.test(key)) {
applySpecific({ tools: ['Competitive mapping', 'Audience synthesis', 'Research frameworks'] });
} else if (/machine-learning/.test(key)) {
applySpecific({ tools: ['Learning phase analysis', 'Bidding systems', 'Signal interpretation'] });
} else if (/crm|webhooks|zapier|dashboards|email-campaign|lead-nurturing/.test(key)) {
applySpecific({ tools: ['API connectors', 'Lifecycle flows', 'Reporting logic'] });
} else if (/meta-ads|google-performance|max|snapchat|linkedin|budget-allocation|tiktok/.test(key)) {
applySpecific({ tools: ['Campaign structures', 'Attribution reviews', 'Creative testing'] });
} else if (/graphic|midjourney|video|motion|brand-identity|ugc/.test(key)) {
applySpecific({ tools: ['Creative briefs', 'Asset systems', 'Storyboards', 'Design critique'] });
} else if (/psychology|roi|cro|seo|copywriting|personal-branding/.test(key)) {
applySpecific({ tools: ['Offer frameworks', 'Conversion reviews', 'Message hierarchies'] });
}return current;
}function enhanceIndexPage() {
const catalog = document.querySelector('.academy-catalog');
const poster = document.querySelector('.academy-poster');
if (!catalog || !poster || document.querySelector('[data-academy-enhanced-index]')) return;const counts = {
tracks: document.querySelectorAll('.academy-track-card').length,
courses: document.querySelectorAll('.course-card-pro').length
};const metrics = document.createElement('section');
metrics.className = 'academy-stats-band';
metrics.dataset.academyEnhancedIndex = 'true';
metrics.innerHTML = `
<div class="academy-stats-grid wrap">
<article class="academy-stat-card"><span>${strings.pageStats}</span><strong>${counts.tracks}</strong><p>${strings.liveTracks}</p></article>
<article class="academy-stat-card"><span>${strings.pageStats}</span><strong>${counts.courses}</strong><p>${strings.coursesReady}</p></article>
<article class="academy-stat-card"><span>${strings.pageStats}</span><strong>1:1 / Team</strong><p>${strings.cohortLine}</p></article>
</div>
`;
poster.insertAdjacentElement('afterend', metrics);const architecture = document.createElement('section');
architecture.className = 'academy-enhanced-index';
architecture.innerHTML = `
<div class="wrap">
<div class="academy-section-head">
<div>
<div class="story-panel-label">${strings.architecture}</div>
<h2>${strings.architectureTitle}</h2>
</div>
<p>${strings.architectureText}</p>
</div>
<div class="academy-architecture-grid">
<article class="academy-architecture-card">
<span>${strings.academyMap}</span>
<h3>${isArabic ? 'ابدأ من المسار' : 'Start with the track'}</h3>
<p>${isArabic ? 'المسار يسرّع الاختيار ويجمع الكورسات حول تحدٍ حقيقي داخل العمل.' : 'The track speeds up selection by organizing the learning around a real business bottleneck.'}</p>
</article>
<article class="academy-architecture-card">
<span>Course Pages</span>
<h3>${isArabic ? 'ثم افتح صفحة الكورس' : 'Then open the course page'}</h3>
<p>${isArabic ? 'كل كورس الآن يُقرأ كصفحة كاملة توضح المهارات، التطبيقات، الأدوات، والمخرجات.' : 'Each course page now behaves like a full brief covering skills, applications, tools, and deliverables.'}</p>
</article>
<article class="academy-architecture-card">
<span>${strings.nextStep}</span>
<h3>${isArabic ? 'ثم حوّل التدريب إلى تنفيذ' : 'Turn training into implementation'}</h3>
<p>${isArabic ? 'الخطوة التالية ليست القراءة فقط، بل تحويل التعلم إلى حملات، workflows، ورسائل وعروض أقوى.' : 'The destination is not browsing. It is turning learning into campaigns, workflows, offers, and stronger team execution.'}</p>
</article>
</div>
</div>
`;
catalog.insertAdjacentElement('beforebegin', architecture);const delivery = document.createElement('section');
delivery.className = 'academy-delivery-band';
delivery.innerHTML = `
<div class="wrap">
<div class="academy-section-head">
<div>
<div class="story-panel-label">${strings.deliveryModes}</div>
<h2>${strings.deliveryTitle}</h2>
</div>
</div>
<div class="academy-delivery-grid">
${strings.deliveryItems.map((item) => `<article class="academy-delivery-card"><h3>${item[0]}</h3><p>${item[1]}</p></article>`).join('')}
</div>
</div>
`;
document.querySelector('.academy-proof-band')?.insertAdjacentElement('beforebegin', delivery);
}function enhanceTrackPage() {
const hero = document.querySelector('.academy-track-hero');
const courseGrid = document.querySelector('.academy-track-course-grid');
if (!hero || !courseGrid || document.querySelector('[data-academy-enhanced-track]')) return;
const category = detectCategory();
const meta = trackData[category] || trackData.ai;const roadmap = document.createElement('section');
roadmap.className = 'academy-track-band academy-track-band--enhanced';
roadmap.dataset.academyEnhancedTrack = 'true';
roadmap.innerHTML = `
<div class="wrap">
<div class="academy-section-head">
<div>
<div class="story-panel-label">${strings.roadmap}</div>
<h2>${isArabic ? 'المسار مبني بطريقة تنقل الفريق خطوة بخطوة.' : 'The track is structured to move the team step by step.'}</h2>
</div>
<p>${strings.sequenceText}</p>
</div>
<div class="academy-roadmap-grid">
${meta.sequence.map((item, index) => `<article class="academy-roadmap-card"><span>${index + 1}</span><h3>${item}</h3></article>`).join('')}
</div>
</div>
`;const lanes = document.createElement('section');
lanes.className = 'academy-track-band academy-track-band--lanes';
lanes.innerHTML = `
<div class="wrap">
<div class="academy-skill-grid">
<article class="academy-skill-panel">
<div class="story-panel-label">${strings.skillLanes}</div>
${createList(meta.lanes, 'academy-rich-list')}
</article>
<article class="academy-skill-panel">
<div class="story-panel-label">${strings.roleFit}</div>
${createList(meta.audience, 'academy-rich-list')}
</article>
<article class="academy-skill-panel">
<div class="story-panel-label">${strings.outcomes}</div>
${createList(meta.outcomes, 'academy-rich-list')}
</article>
</div>
</div>
`;hero.insertAdjacentElement('afterend', roadmap);
roadmap.insertAdjacentElement('afterend', lanes);
}function enhanceCoursePage() {
const hero = document.querySelector('.course-detail-hero');
const titleNode = document.querySelector('.course-detail-title');
const leadNode = document.querySelector('.course-detail-lead');
const introNode = document.querySelector('.course-detail-text');
if (!hero || !titleNode || document.querySelector('[data-academy-enhanced-course]')) return;const slug = slugFromPath();
const title = titleNode.textContent.trim();
const category = detectCategory();
const profile = keywordProfile(slug, category, title);
const meta = trackData[category] || trackData.ai;
const intro = introNode ? introNode.textContent.trim() : (leadNode ? leadNode.textContent.trim() : '');const stats = document.createElement('section');
stats.className = 'course-enhanced-stats';
stats.dataset.academyEnhancedCourse = 'true';
stats.innerHTML = `
<div class="wrap">
<div class="course-signal-grid">
<article class="course-signal-card"><span>${strings.pageStats}</span><strong>${meta.audience.length}</strong><p>${strings.bestFor}</p></article>
<article class="course-signal-card"><span>${strings.pageStats}</span><strong>${profile.deliverables.length}</strong><p>${strings.deliverables}</p></article>
<article class="course-signal-card"><span>${strings.pageStats}</span><strong>${profile.tools.length}</strong><p>${strings.toolStack}</p></article>
</div>
</div>
`;const mastery = document.createElement('section');
mastery.className = 'course-detail-band course-detail-band--enhanced';
mastery.innerHTML = `
<div class="wrap">
<article class="course-detail-block full">
<div class="story-panel-label">${strings.whatYouMaster}</div>
<div class="academy-mini-grid academy-mini-grid--feature">
${profile.skills.map((item) => `<article class="course-focus-card"><h3>${item}</h3><p>${intro}</p></article>`).join('')}
</div>
</article>
</div>
`;const labs = document.createElement('section');
labs.className = 'course-detail-band';
labs.innerHTML = `
<div class="wrap">
<div class="course-intelligence-grid">
<article class="course-detail-block">
<div class="story-panel-label">${strings.handsOn}</div>
${createList(profile.labs, 'academy-rich-list')}
</article>
<article class="course-detail-block">
<div class="story-panel-label">${strings.deliverables}</div>
${createList(profile.deliverables, 'academy-rich-list')}
</article>
</div>
</div>
`;const tools = document.createElement('section');
tools.className = 'course-detail-band';
tools.innerHTML = `
<div class="wrap">
<article class="course-detail-block full">
<div class="story-panel-label">${strings.toolStack}</div>
<div class="academy-pill-row">
${profile.tools.map((item) => `<span class="academy-pill">${item}</span>`).join('')}
</div>
</article>
</div>
`;const fit = document.createElement('section');
fit.className = 'course-detail-band';
fit.innerHTML = `
<div class="wrap">
<div class="course-intelligence-grid">
<article class="course-detail-block">
<div class="story-panel-label">${strings.bestFor}</div>
${createList(profile.bestFor, 'academy-rich-list')}
</article>
<article class="course-detail-block">
<div class="story-panel-label">${strings.notFor}</div>
${createList(profile.notFor, 'academy-rich-list')}
</article>
</div>
</div>
`;const expertise = document.createElement('section');
expertise.className = 'course-detail-band';
expertise.innerHTML = `
<div class="wrap">
<article class="course-detail-block full">
<div class="story-panel-label">${strings.whyMohamed}</div>
<p class="academy-long-copy">${strings.whyMohamedText}</p>
<div class="academy-mini-grid">
<article class="course-fit-card"><h3>${strings.implementationPlan}</h3><p>${strings.implementationText}</p></article>
<article class="course-fit-card"><h3>${isArabic ? 'مهارات مرتبطة بالسوق' : 'Market-grounded skill stack'}</h3><p>${isArabic ? 'المحتوى يرتبط بالسوق الخليجي وبطريقة اتخاذ القرار داخل الشركات لا بمجرد الشرح النظري.' : 'The material stays tied to GCC market realities, platform behavior, and how teams actually make decisions.'}</p></article>
<article class="course-fit-card"><h3>${isArabic ? 'تكييف حسب الفريق' : 'Adapted to team context'}</h3><p>${isArabic ? 'يمكن توسيع أو ضغط التدريب حسب خبرة الفريق وطبيعة المنتج والقنوات المستخدمة.' : 'The depth can be expanded or tightened based on the team, product type, and operating context.'}</p></article>
</div>
</article>
</div>
`;const cta = document.createElement('section');
cta.className = 'course-cta-band';
const primaryLink = document.querySelector('.course-detail-actions a[href*="wa.me"]');
const secondaryLink = document.querySelector('.course-detail-actions a[href*="../tracks/"]');
cta.innerHTML = `
<div class="wrap">
<div class="course-cta-card">
<div>
<div class="story-panel-label">${strings.nextStep}</div>
<h2>${strings.bookingTitle}</h2>
<p>${strings.bookingText}</p>
</div>
<div class="course-cta-actions">
${primaryLink ? `<a class="btn btn-lime" href="${primaryLink.getAttribute('href')}" target="_blank" rel="noopener noreferrer">${strings.bookNow}</a>` : ''}
${secondaryLink ? `<a class="btn btn-ghost" href="${secondaryLink.getAttribute('href')}">${strings.exploreTrack}</a>` : ''}
</div>
</div>
</div>
`;hero.insertAdjacentElement('afterend', stats);
stats.insertAdjacentElement('afterend', mastery);
mastery.insertAdjacentElement('afterend', labs);
labs.insertAdjacentElement('afterend', tools);
tools.insertAdjacentElement('afterend', fit);
fit.insertAdjacentElement('afterend', expertise);
const faqBand = Array.from(document.querySelectorAll('.course-detail-band')).pop();
if (faqBand) {
faqBand.insertAdjacentElement('beforebegin', cta);
} else {
expertise.insertAdjacentElement('afterend', cta);
}
}if (pagePath.includes('/academy/courses/')) {
enhanceCoursePage();
} else if (pagePath.includes('/academy/tracks/')) {
enhanceTrackPage();
} else if (pagePath.includes('/academy/')) {
enhanceIndexPage();
}
})();