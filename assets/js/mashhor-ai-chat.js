/* =========================================================================
   MASHHOR AI CHAT — Interactive Simulated AI Chatbot Engine
   Premium ChatGPT/Claude-style conversational interface
   © 2025 Mashhor Hub — All Rights Reserved
   ========================================================================= */

(function () {
  'use strict';

  /* ────────── CONFIGURATION ────────── */
  const isRTL = document.documentElement.dir === 'rtl';
  const WA_LINK = 'https://wa.me/96555377309?text=' + encodeURIComponent(
    isRTL ? 'مرحباً مشهور، أحتاج مساعدة من خبير بشري' : 'Hi Mashhor, I need help from a human expert'
  );

  const TYPING_SPEED = 35;       // ms per character when typing
  const ERASE_SPEED = 20;        // ms per character when erasing
  const PAUSE_BEFORE_ERASE = 2500;
  const PAUSE_BEFORE_NEXT = 400;
  const BOT_REPLY_DELAY = 800;   // simulate thinking

  /* ────────── PHRASES FOR HERO PROMPT ────────── */
  const HERO_PHRASES = isRTL ? [
    'كيف يمكن لـ Mashhor AI أتمتة التسويق الخاص بي؟',
    'أنشئ روبوت مبيعات ذكي يعمل على WhatsApp',
    'اكتب خطة تسويقية لمتجر إلكتروني في الخليج',
    'حلل بيانات حملاتي الإعلانية وحسّن الأداء',
    'صمم محتوى سوشيال ميديا احترافي بالذكاء الاصطناعي'
  ] : [
    'How can Mashhor AI automate my marketing?',
    'Build a predictive sales model for my team',
    'Generate high-converting ad copy for GCC',
    'Create an AI agent for WhatsApp customer service',
    'Design an AI-powered content production pipeline'
  ];

  /* ────────── GREETING ────────── */
  const GREETING = isRTL
    ? 'أهلاً بك! 👋 أنا مساعد المشهور الذكي. يمكنني الإجابة على استفساراتك حول خدمات الذكاء الاصطناعي، الأسعار، أو توصيلك بخبير بشري مباشرة.\n\nكيف يمكنني مساعدتك اليوم؟'
    : 'Hello! 👋 I\'m the Mashhor AI Assistant. I can answer questions about our AI services, pricing, or connect you with a human expert.\n\nHow can I help you today?';

  /* ────────── KNOWLEDGE BASE ────────── */
  const KB = [
    {
      keywords: isRTL
        ? ['سعر', 'أسعار', 'باقة', 'باقات', 'تكلفة', 'كم', 'دينار', 'ثمن']
        : ['price', 'pricing', 'cost', 'package', 'packages', 'how much', 'fee', 'kwd', 'dinar'],
      answer: isRTL
        ? '💰 لدينا ثلاث باقات لتكامل الذكاء الاصطناعي:\n\n🟢 **الأساسية — 150 د.ك**: تأسيس ChatGPT، نماذج GPT مخصصة، مكتبة أوامر.\n🔵 **الأكثر طلباً — 350 د.ك**: آلة المحتوى الذكية، أتمتة الإنتاج، ورش عمل.\n🟡 **المتقدمة — 800 د.ك**: ذكاء اصطناعي مؤسسي، وكلاء مخصصين، ربط APIs.\n\nهل تريد معرفة المزيد عن باقة معينة؟'
        : '💰 We offer three AI integration packages:\n\n🟢 **Essential — 150 KWD**: ChatGPT Setup, custom GPTs, prompt library.\n🔵 **Most Requested — 350 KWD**: AI Content Machine, automated workflows, team workshops.\n🟡 **Advanced — 800 KWD**: Enterprise AI, custom agents, API integrations.\n\nWould you like details about a specific package?'
    },
    {
      keywords: isRTL
        ? ['خدمة', 'خدمات', 'ماذا تقدم', 'ايش تسو', 'شو تسو', 'من أنت', 'تعريف']
        : ['service', 'services', 'what do you', 'offer', 'provide', 'about', 'who are'],
      answer: isRTL
        ? '🚀 Mashhor AI هي وحدة الذكاء الاصطناعي داخل منصة مشهور هب. نقدم:\n\n• 💬 محادثة ذكية وتوليد محتوى\n• 🖼️ توليد صور وفيديو بالذكاء الاصطناعي\n• 📈 أدوات تسويق رقمي متقدمة\n• 🤖 وكلاء ذكاء اصطناعي للمبيعات وخدمة العملاء\n• 📊 تحليلات تنبؤية واستشارات\n\nكل أداة مصممة لتحويل عملياتك من يدوية إلى أتمتة ذكية!'
        : '🚀 Mashhor AI is the intelligence division of Mashhor Hub. We provide:\n\n• 💬 AI Chat & Content Generation\n• 🖼️ AI Image & Video Generation\n• 📈 Digital Marketing Automation\n• 🤖 AI Sales Agents & Customer Service Bots\n• 📊 Predictive Analytics & Consulting\n\nEvery tool is designed to transform your operations from manual to intelligent automation!'
    },
    {
      keywords: isRTL
        ? ['تواصل', 'اتصال', 'بشري', 'إنسان', 'خبير', 'مساعدة', 'واتساب', 'واتس']
        : ['contact', 'human', 'agent', 'person', 'real', 'speak', 'talk', 'whatsapp', 'call'],
      answer: isRTL
        ? '👤 بالتأكيد! يمكنك التحدث مباشرة مع أحد خبراء النمو لدينا عبر:\n\n📱 [التواصل عبر واتساب →](' + WA_LINK + ')\n\nأو يمكنك زيارة صفحة التواصل للحجز المباشر. فريقنا مستعد لمساعدتك!'
        : '👤 Absolutely! You can speak directly with one of our growth architects:\n\n📱 [Connect via WhatsApp →](' + WA_LINK + ')\n\nOr visit our contact page to book a call. Our team is ready to help!'
    },
    {
      keywords: isRTL
        ? ['شات', 'محادثة', 'chatgpt', 'gpt', 'كلود', 'claude', 'ذكاء']
        : ['chat', 'chatgpt', 'gpt', 'claude', 'ai', 'artificial', 'intelligence', 'model'],
      answer: isRTL
        ? '🧠 تشمل قدراتنا في الذكاء الاصطناعي التحادثي:\n\n• تدريب نماذج GPT مخصصة لعملك\n• بناء مساعدين افتراضيين للمبيعات\n• أتمتة خدمة العملاء عبر WhatsApp\n• توليد محتوى تسويقي ذكي\n\nنبني الأنظمة التي تعمل من أجلك 24/7!'
        : '🧠 Our conversational AI capabilities include:\n\n• Custom-trained GPT models for your business\n• Virtual sales assistant development\n• WhatsApp customer service automation\n• Smart content generation pipelines\n\nWe build systems that work for you 24/7!'
    },
    {
      keywords: isRTL
        ? ['صورة', 'صور', 'فيديو', 'مقطع', 'تصميم', 'بصري']
        : ['image', 'images', 'video', 'visual', 'design', 'generate', 'create'],
      answer: isRTL
        ? '🎨 أدواتنا للمحتوى البصري تشمل:\n\n• 🖼️ مولد صور AI احترافي (Midjourney, DALL-E)\n• 🎥 إنتاج فيديو سينمائي بالذكاء الاصطناعي\n• ✨ Motion Graphics وتصاميم متحركة\n• 📐 تصميم هويات بصرية كاملة\n\nكل هذا بجودة وكالة إبداعية كاملة!'
        : '🎨 Our visual content tools include:\n\n• 🖼️ Professional AI Image Generation (Midjourney, DALL-E)\n• 🎥 Cinematic AI Video Production\n• ✨ Motion Graphics & Animated Designs\n• 📐 Complete Visual Identity Design\n\nAll at creative agency quality!'
    },
    {
      keywords: isRTL
        ? ['أتمتة', 'اتمته', 'سير عمل', 'زابير', 'ميك', 'n8n', 'api']
        : ['automate', 'automation', 'workflow', 'zapier', 'make', 'n8n', 'api', 'integrate'],
      answer: isRTL
        ? '⚙️ نتخصص في بناء مسارات الأتمتة:\n\n• ربط Zapier وMake.com بأنظمتك\n• بناء Webhooks وAPIs مخصصة\n• أتمتة CRM والمبيعات\n• لوحات تحكم ذكية وتقارير تلقائية\n• مسارات n8n متقدمة\n\nهدفنا جعل كل عملية يدوية تعمل تلقائياً!'
        : '⚙️ We specialize in building automation pipelines:\n\n• Zapier and Make.com integrations\n• Custom Webhooks and APIs\n• CRM and sales automation\n• Smart dashboards and automated reporting\n• Advanced n8n workflows\n\nOur goal is to make every manual process automatic!'
    },
    {
      keywords: isRTL
        ? ['تسويق', 'إعلان', 'إعلانات', 'حملة', 'حملات', 'ميتا', 'سناب', 'تيك']
        : ['marketing', 'ads', 'campaign', 'meta', 'snap', 'tiktok', 'social', 'media', 'seo'],
      answer: isRTL
        ? '📈 خدمات التسويق الرقمي المدعومة بالذكاء الاصطناعي:\n\n• خطط تسويقية مولدة بالـ AI\n• إدارة حملات Meta وSnap وTikTok\n• تحسين محركات البحث (SEO) الآلي\n• تحليل بيانات الأداء التنبؤي\n• محتوى سوشيال ميديا احترافي\n\nنستخدم الذكاء الاصطناعي لمضاعفة ROI حملاتك!'
        : '📈 AI-powered digital marketing services:\n\n• AI-generated marketing plans\n• Meta, Snap & TikTok campaign management\n• Automated SEO optimization\n• Predictive performance analytics\n• Professional social media content\n\nWe use AI to maximize your campaign ROI!'
    }
  ];

  /* ────────── FALLBACK ────────── */
  const FALLBACK = isRTL
    ? '💡 هذا سؤال ممتاز ويحتاج لتخطيط استراتيجي مخصص! دعني أوصلك فوراً بأحد خبراء النمو البشريين لدينا لضمان حصولك على الحل الأمثل.\n\n📱 [تحدث مع خبير بشري →](' + WA_LINK + ')'
    : '💡 That\'s a brilliant question that requires customized strategic planning! Let me connect you directly with one of our human growth architects to ensure you get the best solution.\n\n📱 [Connect with a Human Expert →](' + WA_LINK + ')';

  /* ────────── QUICK SUGGESTIONS ────────── */
  const SUGGESTIONS = isRTL ? [
    'ما هي الأسعار؟', 'ما هي خدماتكم؟', 'أريد التحدث مع خبير', 'أدوات الأتمتة'
  ] : [
    'What are your prices?', 'What services do you offer?', 'Talk to a human expert', 'Automation tools'
  ];

  /* ========================================================================
     DOM CREATION
     ======================================================================== */

  /* ── Hero Prompt Bar ── */
  function createHeroPrompt() {
    const heroSection = document.querySelector('.header-ai .container, .header-ai .container.reveal');
    if (!heroSection) return;

    const promptWrap = document.createElement('div');
    promptWrap.className = 'mai-hero-prompt';
    promptWrap.id = 'mai-hero-prompt';
    promptWrap.setAttribute('role', 'button');
    promptWrap.setAttribute('tabindex', '0');
    promptWrap.setAttribute('aria-label', isRTL ? 'افتح محادثة الذكاء الاصطناعي' : 'Open AI Chat');
    promptWrap.innerHTML = `
      <div class="mai-prompt-glow"></div>
      <div class="mai-prompt-inner">
        <div class="mai-prompt-left">
          <svg class="mai-icon-sparkle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
        </div>
        <div class="mai-prompt-text">
          <span class="mai-typewriter" id="mai-typewriter"></span>
          <span class="mai-cursor">|</span>
        </div>
        <div class="mai-prompt-right">
          <div class="mai-status-dot"></div>
          <svg class="mai-icon-mic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
          <svg class="mai-icon-send" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </div>
      </div>
    `;
    heroSection.appendChild(promptWrap);
    return promptWrap;
  }

  /* ── Chat Modal ── */
  function createChatModal() {
    const modal = document.createElement('div');
    modal.className = 'mai-modal';
    modal.id = 'mai-modal';
    modal.innerHTML = `
      <div class="mai-modal-backdrop" id="mai-modal-backdrop"></div>
      <div class="mai-modal-container">
        <div class="mai-modal-header">
          <div class="mai-modal-brand">
            <div class="mai-avatar-ring">
              <div class="mai-avatar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
              </div>
            </div>
            <div>
              <h3 class="mai-modal-title">Mashhor AI</h3>
              <span class="mai-modal-status">${isRTL ? 'متصل الآن' : 'Online now'}</span>
            </div>
          </div>
          <button class="mai-modal-close" id="mai-modal-close" aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="mai-chat-body" id="mai-chat-body"></div>
        <div class="mai-suggestions" id="mai-suggestions"></div>
        <div class="mai-chat-input-wrap">
          <input type="text" class="mai-chat-input" id="mai-chat-input" placeholder="${isRTL ? 'اكتب رسالتك هنا...' : 'Type your message here...'}" autocomplete="off">
          <button class="mai-send-btn" id="mai-send-btn" aria-label="Send">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    return modal;
  }

  /* ========================================================================
     HERO TYPEWRITER
     ======================================================================== */
  let typewriterRunning = true;

  function startTypewriter(el) {
    let phraseIdx = 0;
    let charIdx = 0;
    let isErasing = false;

    function tick() {
      if (!typewriterRunning) return;
      const phrase = HERO_PHRASES[phraseIdx];

      if (!isErasing) {
        el.textContent = phrase.substring(0, charIdx + 1);
        charIdx++;
        if (charIdx === phrase.length) {
          isErasing = true;
          setTimeout(tick, PAUSE_BEFORE_ERASE);
          return;
        }
        setTimeout(tick, TYPING_SPEED);
      } else {
        el.textContent = phrase.substring(0, charIdx);
        charIdx--;
        if (charIdx < 0) {
          isErasing = false;
          charIdx = 0;
          phraseIdx = (phraseIdx + 1) % HERO_PHRASES.length;
          setTimeout(tick, PAUSE_BEFORE_NEXT);
          return;
        }
        setTimeout(tick, ERASE_SPEED);
      }
    }
    tick();
  }

  /* ========================================================================
     CHAT ENGINE
     ======================================================================== */
  function findAnswer(input) {
    const lower = input.toLowerCase();
    for (const entry of KB) {
      for (const kw of entry.keywords) {
        if (lower.includes(kw)) return entry.answer;
      }
    }
    return FALLBACK;
  }

  function renderMarkdown(text) {
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    return html;
  }

  function appendMessage(body, content, sender) {
    const wrapper = document.createElement('div');
    wrapper.className = 'mai-msg mai-msg-' + sender;

    const bubble = document.createElement('div');
    bubble.className = 'mai-bubble';
    bubble.innerHTML = renderMarkdown(content);
    wrapper.appendChild(bubble);

    body.appendChild(wrapper);
    body.scrollTop = body.scrollHeight;
    return wrapper;
  }

  function showTypingIndicator(body) {
    const wrapper = document.createElement('div');
    wrapper.className = 'mai-msg mai-msg-bot mai-typing-indicator';
    wrapper.innerHTML = `<div class="mai-bubble"><span class="mai-dot"></span><span class="mai-dot"></span><span class="mai-dot"></span></div>`;
    body.appendChild(wrapper);
    body.scrollTop = body.scrollHeight;
    return wrapper;
  }

  function renderSuggestions(container, body) {
    container.innerHTML = '';
    SUGGESTIONS.forEach(text => {
      const chip = document.createElement('button');
      chip.className = 'mai-suggestion-chip';
      chip.textContent = text;
      chip.addEventListener('click', () => {
        handleUserMessage(text, body, container);
      });
      container.appendChild(chip);
    });
  }

  async function handleUserMessage(text, body, suggestionsEl) {
    if (!text.trim()) return;
    appendMessage(body, text, 'user');
    suggestionsEl.innerHTML = '';

    const indicator = showTypingIndicator(body);

    try {
        const endpoint = currentMode === 'analyze' ? '/api/ai/analyze' : '/api/ai/chat';
        const response = await fetch(`${window.location.origin.replace('3000', '5000')}${endpoint}`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ prompt: text })
        });
        const data = await response.json();
        indicator.remove();
        
        if (data.success) {
            appendMessage(body, data.response, 'bot');
        } else {
            appendMessage(body, FALLBACK, 'bot');
        }
    } catch (err) {
        indicator.remove();
        appendMessage(body, FALLBACK, 'bot');
    }
  }

  /* ========================================================================
     INITIALIZATION
     ======================================================================== */
  function init() {
    const heroPrompt = createHeroPrompt();
    if (!heroPrompt) return;

    const modal = createChatModal();
    const typewriterEl = document.getElementById('mai-typewriter');
    const chatBody = document.getElementById('mai-chat-body');
    const chatInput = document.getElementById('mai-chat-input');
    const sendBtn = document.getElementById('mai-send-btn');
    const closeBtn = document.getElementById('mai-modal-close');
    const backdrop = document.getElementById('mai-modal-backdrop');
    const suggestionsEl = document.getElementById('mai-suggestions');

    startTypewriter(typewriterEl);

    function openChat() {
      typewriterRunning = false;
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';

      if (chatBody.children.length === 0) {
        setTimeout(() => {
          appendMessage(chatBody, GREETING, 'bot');
          renderSuggestions(suggestionsEl, chatBody);
        }, 300);
      }

      setTimeout(() => chatInput.focus(), 400);
    }

    function closeChat() {
      modal.classList.remove('active');
      document.body.style.overflow = '';
      typewriterRunning = true;
      startTypewriter(typewriterEl);
    }

    heroPrompt.addEventListener('click', openChat);
    heroPrompt.addEventListener('keydown', e => { if (e.key === 'Enter') openChat(); });
    closeBtn.addEventListener('click', closeChat);
    backdrop.addEventListener('click', closeChat);

    function sendMessage() {
      const text = chatInput.value.trim();
      if (!text) return;
      chatInput.value = '';
      handleUserMessage(text, chatBody, suggestionsEl);
    }

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });

    window.addEventListener('open-ai-assistant', (e) => {
      currentMode = e.detail?.mode || 'chat';
      openChat();
      if (currentMode === 'analyze') {
          appendMessage(chatBody, isRTL ? 'مرحباً! أنا المحلل الذكي الخاص بك. لقد قمت بمراجعة بياناتك للتو. كيف يمكنني مساعدتك في تطوير عملك اليوم؟' : 'Hello! I am your AI Analyst. I have just reviewed your dashboard data. How can I help you grow today?', 'bot');
      }
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal.classList.contains('active')) closeChat();
    });
  }

  let currentMode = 'chat';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
