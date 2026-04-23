import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit2, Trash2, X, Loader2, Eye, EyeOff,
  Image as ImageIcon, Type, Layout, ChevronDown, ChevronRight,
  Globe, Palette, Info,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';


// ─── Brand Design Tokens (matching mashhour-platform.css) ─────────────────────
const BRAND = {
  bg:       '#041121',
  bgAlt:    '#071a33',
  text:     '#f6f2e8',
  muted:    '#b9c7dc',
  gold:     '#f4cd55',
  goldSoft: '#f8e59d',
  blue:     '#2a7fe7',
  cyan:     '#36daf5',
  success:  '#5de6b1',
};

// ─── Website Sections Map ─────────────────────────────────────────────────────
const WEBSITE_SECTIONS = [
  {
    id: 'global',
    label: 'Global Settings',
    labelAr: 'الإعدادات العامة',
    icon: '🌐',
    description: 'Contact info, social media links, and brand settings',
    fields: ['phone', 'email', 'whatsapp', 'linkedinUrl', 'instagramUrl', 'facebookUrl', 'snapchatUrl', 'tiktokUrl', 'pinterestUrl'],
    collection: 'site_settings',
    color: '#f4cd55',
  },
  {
    id: 'pages',
    label: 'Page Content',
    labelAr: 'محتوى الصفحات',
    icon: '📄',
    description: 'Rich text content for About, Privacy, Terms, and more',
    fields: ['pageId', 'contentEn', 'contentAr'],
    collection: 'site_pages',
    color: '#36daf5',
  },
  {
    id: 'hero',
    label: 'Hero Section',
    labelAr: 'القسم الرئيسي',
    icon: '🏠',
    description: 'Main hero slides, headline, lead text, and metrics',
    fields: ['title', 'subtitle', 'label', 'imageUrl', 'linkUrl'],
    collection: 'site_hero',
    color: '#f4cd55',
  },
  {
    id: 'services',
    label: 'Services',
    labelAr: 'الخدمات',
    icon: '⚙️',
    description: 'Service cards shown in the services section',
    fields: ['title', 'description', 'icon', 'imageUrl', 'linkUrl'],
    collection: 'site_services',
    color: '#36daf5',
  },
  {
    id: 'portfolio',
    label: 'Portfolio / Case Studies',
    labelAr: 'أعمالنا',
    icon: '🖼️',
    description: 'Client projects, results, and case study cards',
    fields: ['title', 'client', 'results', 'description', 'imageUrl', 'linkUrl'],
    collection: 'site_portfolio',
    color: '#5de6b1',
  },
  {
    id: 'metrics',
    label: 'Key Metrics',
    labelAr: 'أرقامنا',
    icon: '📊',
    description: 'Numbers displayed in hero (200+ Brands, 7 Markets…)',
    fields: ['number', 'label', 'labelAr'],
    collection: 'site_metrics',
    color: '#2a7fe7',
  },
  {
    id: 'testimonials',
    label: 'Testimonials',
    labelAr: 'آراء العملاء',
    icon: '💬',
    description: 'Client testimonials and reviews',
    fields: ['name', 'company', 'quote', 'imageUrl', 'rating'],
    collection: 'site_testimonials',
    color: '#f4cd55',
  },
  {
    id: 'team',
    label: 'Team Members',
    labelAr: 'الفريق',
    icon: '👥',
    description: 'Team photos, names, and roles',
    fields: ['name', 'role', 'roleAr', 'imageUrl', 'linkedinUrl'],
    collection: 'site_team',
    color: '#36daf5',
  },
  {
    id: 'announcement',
    label: 'Announcement Bar',
    labelAr: 'شريط الإعلانات',
    icon: '📢',
    description: 'Top announcement banner text',
    fields: ['text', 'textAr', 'linkUrl', 'linkLabel'],
    collection: 'site_announcements',
    color: '#f43f5e',
  },
  {
    id: 'seo',
    label: 'SEO & Social Share',
    labelAr: 'الأرشفة ومشاركة الروابط',
    icon: '🔍',
    description: 'Meta title, description, keywords, and OG image for social media',
    fields: ['seoTitle', 'seoDescription', 'seoKeywords', 'ogImage'],
    collection: 'site_settings',
    color: '#10b981',
  },
  {
    id: 'clients',
    label: 'Client Logos',
    labelAr: 'لوجوهات العملاء',
    icon: '🏢',
    description: 'Logo carousel for trusted brands',
    fields: ['title', 'imageUrl', 'linkUrl'],
    collection: 'site_clients',
    color: '#5de6b1',
  },
  {
    id: 'process',
    label: 'Our Process',
    labelAr: 'منهجيتنا',
    icon: '🔄',
    description: 'Steps in our proven growth process',
    fields: ['title', 'description', 'icon'],
    collection: 'site_process',
    color: '#36daf5',
  },
  {
    id: 'faqs',
    label: 'FAQs',
    labelAr: 'الأسئلة الشائعة',
    icon: '❓',
    description: 'Frequently asked questions',
    fields: ['question', 'answer', 'category'],
    collection: 'site_faqs',
    color: '#f4cd55',
  },
  {
    id: 'values',
    label: 'Company Values',
    labelAr: 'قيم الشركة',
    icon: '💎',
    description: 'Core values and principles',
    fields: ['title', 'description', 'icon'],
    collection: 'site_values',
    color: '#2a7fe7',
  },
];

// Field labels
const FIELD_META = {
  // Global
  phone:      { label: 'Phone Number',     type: 'text',     placeholder: '+965 ...'              },
  email:      { label: 'Email Address',    type: 'text',     placeholder: 'info@...'              },
  whatsapp:   { label: 'WhatsApp Link',    type: 'text',     placeholder: 'https://wa.me/...'     },
  instagramUrl:{ label: 'Instagram URL',   type: 'text',     placeholder: 'https://instagram.com/...'},
  facebookUrl: { label: 'Facebook URL',    type: 'text',     placeholder: 'https://facebook.com/...' },
  snapchatUrl: { label: 'Snapchat URL',    type: 'text',     placeholder: 'https://snapchat.com/...' },
  tiktokUrl:   { label: 'TikTok URL',      type: 'text',     placeholder: 'https://tiktok.com/...'   },
  pinterestUrl:{ label: 'Pinterest URL',   type: 'text',     placeholder: 'https://pinterest.com/...'},
  
  // Pages
  pageId:     { label: 'Select Page',      type: 'select',   options: [
    { value: 'home', label: 'Home (الرئيسية)' },
    { value: 'about', label: 'About Us (من نحن)' },
    { value: 'academy', label: 'Academy Home (الأكاديمية)' },
    { value: 'privacy', label: 'Privacy Policy (سياسة الخصوصية)' },
    { value: 'terms', label: 'Terms & Conditions (الشروط والأحكام)' },
    { value: 'sitemap', label: 'Sitemap (خريطة الموقع)' },
    { value: 'blog', label: 'Blog Home (المدونة)' },
  ]},
  contentEn:  { label: 'Content (EN)',     type: 'rich-text', placeholder: 'English content...'     },
  contentAr:  { label: 'Content (AR)',     type: 'rich-text', placeholder: 'المحتوى بالعربي...'      },

  // General
  title:      { label: 'Title (EN)',        type: 'text',     placeholder: 'English title'         },
  titleAr:    { label: 'Title (AR)',        type: 'text',     placeholder: 'العنوان بالعربي'        },
  subtitle:   { label: 'Subtitle',         type: 'text',     placeholder: 'Subtitle or tagline'   },
  label:      { label: 'Label / Tag',      type: 'text',     placeholder: 'e.g. Marketing Guide'  },
  description:{ label: 'Description',     type: 'textarea', placeholder: 'Brief description…'    },
  descriptionAr:{ label:'Description (AR)',type:'textarea',  placeholder: 'الوصف بالعربي…'        },
  imageUrl:   { label: 'Image URL',        type: 'image',    placeholder: 'https://…'             },
  linkUrl:    { label: 'Link URL',         type: 'text',     placeholder: 'https://…'             },
  linkLabel:  { label: 'Link Label',       type: 'text',     placeholder: 'e.g. Book a Call'      },
  icon:       { label: 'Icon / Emoji',     type: 'text',     placeholder: '⚙️ or icon class name' },
  client:     { label: 'Client Name',      type: 'text',     placeholder: 'Client or brand name'  },
  results:    { label: 'Results Metric',   type: 'text',     placeholder: 'e.g. +300% ROI'        },
  number:     { label: 'Number / Value',   type: 'text',     placeholder: 'e.g. 200+'             },
  name:       { label: 'Name',             type: 'text',     placeholder: 'Full name'             },
  role:       { label: 'Role (EN)',        type: 'text',     placeholder: 'Job title'             },
  roleAr:     { label: 'Role (AR)',        type: 'text',     placeholder: 'المسمى الوظيفي'        },
  company:    { label: 'Company',          type: 'text',     placeholder: 'Company name'          },
  quote:      { label: 'Quote / Review',  type: 'textarea', placeholder: 'What the client said…' },
  rating:     { label: 'Rating (1–5)',    type: 'text',     placeholder: '5'                     },
  linkedinUrl:{ label: 'LinkedIn URL',    type: 'text',     placeholder: 'https://linkedin.com/…'},
  text:       { label: 'Announcement Text (EN)', type: 'text', placeholder: 'Announcement text' },
  textAr:     { label: 'Announcement Text (AR)', type: 'text', placeholder: 'نص الإعلان'        },
  
  // SEO
  seoTitle:   { label: 'Meta Title',        type: 'text',     placeholder: 'Site title for Google' },
  seoDescription: { label: 'Meta Description', type: 'textarea', placeholder: 'Brief site summary' },
  seoKeywords:{ label: 'Meta Keywords',     type: 'text',     placeholder: 'marketing, agency, kuwait' },
  ogImage:    { label: 'OG Share Image URL', type: 'image',    placeholder: 'https://…' },

  // FAQs
  question:   { label: 'Question (EN)',     type: 'text',     placeholder: 'What is...?'           },
  questionAr: { label: 'Question (AR)',     type: 'text',     placeholder: 'ما هو...؟'             },
  answer:     { label: 'Answer (EN)',       type: 'textarea', placeholder: 'The answer is...'      },
  answerAr:   { label: 'Answer (AR)',       type: 'textarea', placeholder: 'الإجابة هي...'          },
  category:   { label: 'Category',          type: 'text',     placeholder: 'e.g. Pricing'          },
};

// ─── Brand Preview Badge ──────────────────────────────────────────────────────
function BrandPreview() {
  return (
    <div
      className="glass-card p-4 flex flex-wrap gap-4 items-center"
      style={{ border: `1px solid rgba(244,205,85,0.2)` }}
    >
      <div className="flex items-center gap-2">
        <Palette size={14} color={BRAND.gold} />
        <span className="text-xs font-semibold" style={{ color: BRAND.gold }}>Brand Tokens</span>
      </div>
      {[
        { label: 'Background', color: BRAND.bg, text: '#041121' },
        { label: 'Text', color: BRAND.text, text: '#f6f2e8' },
        { label: 'Gold', color: BRAND.gold, text: '#f4cd55' },
        { label: 'Cyan', color: BRAND.cyan, text: '#36daf5' },
        { label: 'Blue', color: BRAND.blue, text: '#2a7fe7' },
        { label: 'Muted', color: BRAND.muted, text: '#b9c7dc' },
      ].map(({ label, color, text }) => (
        <div key={label} className="flex items-center gap-2">
          <div
            className="rounded-lg flex-shrink-0"
            style={{ width: 20, height: 20, background: color, border: '1px solid rgba(255,255,255,0.15)' }}
          />
          <div>
            <p className="text-xs font-medium" style={{ color: 'var(--text-primary)', lineHeight: 1 }}>{label}</p>
            <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{text}</p>
          </div>
        </div>
      ))}
      <div className="ml-auto flex items-center gap-2">
        <Globe size={13} color="var(--text-muted)" />
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Font: Inter / Cairo (same as website)</span>
      </div>
    </div>
  );
}

// ─── Item Editor Modal ────────────────────────────────────────────────────────
function ItemModal({ section, item, onClose, onSave }) {
  const allFields = [...section.fields];
  // Auto-add Arabic variants
  if (allFields.includes('title'))       allFields.splice(allFields.indexOf('title') + 1, 0, 'titleAr');
  if (allFields.includes('description')) allFields.splice(allFields.indexOf('description') + 1, 0, 'descriptionAr');
  if (allFields.includes('question'))    allFields.splice(allFields.indexOf('question') + 1, 0, 'questionAr');
  if (allFields.includes('answer'))      allFields.splice(allFields.indexOf('answer') + 1, 0, 'answerAr');

  const emptyForm = allFields.reduce((a, k) => ({ ...a, [k]: '' }), {});
  const [form,    setForm]    = useState(item ? { ...emptyForm, ...item } : emptyForm);
  const [saving,  setSaving]  = useState(false);
  const [visible, setVisible] = useState(item?.visible !== false);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    const firstField = section.fields[0];
    if (!form[firstField]?.trim()) return toast.error(`${FIELD_META[firstField]?.label || firstField} is required`);
    setSaving(true);
    try {
      const payload = { ...form, visible, sectionId: section.id };
      const endpoint = `/site-content/${section.collection.replace(/_/g, '-')}`;
      item?.id
        ? await api.put(`${endpoint}/${item.id}`, payload)
        : await api.post(endpoint, payload);
      toast.success(item?.id ? 'Updated ✓' : 'Added ✓');
      onSave();
      onClose();
    } catch (err) {
      toast.error('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <AnimatePresence>
    <motion.div
      key="item-modal"
      className="fixed inset-0 z-[9999] flex"
      style={{ background: 'rgba(4,17,33,0.97)', backdropFilter: 'blur(20px)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      {/* ── Full-screen two-column layout ── */}
      <div className="flex flex-col w-full h-full overflow-hidden">

        {/* ── TOP BAR ── */}
        <div
          className="flex items-center justify-between px-8 py-4 flex-shrink-0"
          style={{
            background: 'rgba(13,21,40,0.95)',
            borderBottom: '1px solid rgba(99,179,237,0.1)',
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center rounded-2xl text-2xl flex-shrink-0"
              style={{
                width: 48, height: 48,
                background: `${section.color}18`,
                border: `1px solid ${section.color}35`,
              }}
            >
              {section.icon}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: section.color }}>
                {section.label} / {section.labelAr}
              </p>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {item?.id ? 'Edit Item' : 'Add New Item'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Visibility Toggle */}
            <button
              onClick={() => setVisible(!visible)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-medium"
              style={{
                background: visible ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.1)',
                border: `1px solid ${visible ? 'rgba(16,185,129,0.3)' : 'rgba(100,116,139,0.2)'}`,
                color: visible ? '#10b981' : 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              {visible ? <Eye size={16} /> : <EyeOff size={16} />}
              {visible ? 'Visible on Website' : 'Hidden from Website'}
            </button>

            <button
              onClick={onClose}
              className="flex items-center justify-center rounded-xl transition-all"
              style={{
                width: 42, height: 42,
                background: 'rgba(244,63,94,0.08)',
                border: '1px solid rgba(244,63,94,0.2)',
                color: '#f43f5e',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ── BODY: two columns ── */}
        <div className="flex flex-1 overflow-hidden">

          {/* LEFT: Form Fields */}
          <div
            className="flex flex-col overflow-y-auto"
            style={{
              width: '55%',
              borderRight: '1px solid rgba(99,179,237,0.08)',
            }}
          >
            {/* Brand reminder strip */}
            <div
              className="flex items-center gap-3 px-8 py-3 flex-shrink-0"
              style={{ background: 'rgba(244,205,85,0.04)', borderBottom: '1px solid rgba(244,205,85,0.1)' }}
            >
              <Info size={14} color={BRAND.gold} />
              <span className="text-xs" style={{ color: BRAND.muted }}>
                Font: <strong style={{ color: BRAND.gold }}>Inter / Cairo</strong> ·
                Text: <strong style={{ color: BRAND.gold }}>{BRAND.text}</strong> ·
                Gold: <strong style={{ color: BRAND.gold }}>{BRAND.gold}</strong> ·
                Images: <strong style={{ color: BRAND.gold }}>WebP / JPG · 16:9 or 1:1</strong>
              </span>
            </div>

            <div className="p-8 space-y-6 flex-1">
              {allFields.map((fieldKey) => {
                const meta = FIELD_META[fieldKey] || { label: fieldKey, type: 'text', placeholder: '' };
                const isAr   = fieldKey.endsWith('Ar');
                const isImage = meta.type === 'image';

                return (
                  <div key={fieldKey}>
                    <label
                      className="flex items-center gap-2 text-sm font-semibold mb-2"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {meta.label}
                      {isAr && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-lg"
                          style={{ background: 'rgba(244,205,85,0.12)', color: BRAND.gold, border: `1px solid rgba(244,205,85,0.2)` }}
                        >
                          عربي
                        </span>
                      )}
                    </label>

                    {meta.type === 'select' ? (
                      <select
                        className="input-field"
                        value={form[fieldKey] || ''}
                        onChange={set(fieldKey)}
                        style={{ fontSize: 15 }}
                      >
                        <option value="">Select an option...</option>
                        {meta.options.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : meta.type === 'rich-text' ? (
                      <div className="bg-white text-black rounded-lg overflow-hidden" dir="ltr">
                        <ReactQuill 
                          theme="snow" 
                          value={form[fieldKey] || ''} 
                          onChange={(val) => setForm(p => ({ ...p, [fieldKey]: val }))}
                          modules={{
                            toolbar: [
                              [{ 'header': [1, 2, 3, false] }],
                              ['bold', 'italic', 'underline', 'strike'],
                              [{'list': 'ordered'}, {'list': 'bullet'}],
                              ['link', 'clean']
                            ],
                          }}
                        />
                      </div>
                    ) : meta.type === 'textarea' ? (
                      <textarea
                        className="input-field resize-none"
                        rows={4}
                        value={form[fieldKey] || ''}
                        onChange={set(fieldKey)}
                        placeholder={meta.placeholder}
                        dir={isAr ? 'rtl' : 'ltr'}
                        style={{ fontSize: 15 }}
                      />
                    ) : (
                      <input
                        className="input-field"
                        value={form[fieldKey] || ''}
                        onChange={set(fieldKey)}
                        placeholder={meta.placeholder}
                        dir={isAr ? 'rtl' : 'ltr'}
                        style={{ fontSize: 15 }}
                      />
                    )}

                    {/* Image Preview under field */}
                    {isImage && form[fieldKey] && (
                      <div className="mt-3">
                        <img
                          src={form[fieldKey]}
                          alt="preview"
                          className="rounded-xl object-cover"
                          style={{ height: 130, maxWidth: '100%' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Save Button */}
            <div
              className="flex items-center justify-end gap-4 px-8 py-5 flex-shrink-0"
              style={{ borderTop: '1px solid rgba(99,179,237,0.08)', background: 'rgba(13,21,40,0.7)' }}
            >
              <button onClick={onClose} className="btn-ghost !px-6 !py-3">Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary !px-8 !py-3 !text-base"
              >
                {saving
                  ? <><Loader2 size={18} className="animate-spin" /> Saving…</>
                  : item?.id ? '✓ Save Changes' : '+ Add to Website'
                }
              </button>
            </div>
          </div>

          {/* RIGHT: Live Preview */}
          <div
            className="flex flex-col overflow-y-auto"
            style={{ width: '45%', background: 'rgba(4,17,33,0.6)' }}
          >
            <div
              className="px-8 py-4 flex-shrink-0"
              style={{ borderBottom: '1px solid rgba(99,179,237,0.08)' }}
            >
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                🎨 Live Preview
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Rendered with your website's exact brand style
              </p>
            </div>

            <div className="p-8 flex-1">
              {/* Card Preview — mimics the website style */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: `linear-gradient(160deg, ${BRAND.bgAlt} 0%, ${BRAND.bg} 100%)`,
                  border: `1px solid rgba(126,184,255,0.18)`,
                  fontFamily: 'Inter, Cairo, sans-serif',
                  boxShadow: '0 28px 72px rgba(0,0,0,0.35)',
                }}
              >
                {/* Image area */}
                {form.imageUrl && (
                  <div style={{ aspectRatio: '16/9', overflow: 'hidden', position: 'relative' }}>
                    <img
                      src={form.imageUrl}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div
                      style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(to top, rgba(4,17,33,0.8) 0%, transparent 50%)',
                      }}
                    />
                  </div>
                )}

                {/* Content area */}
                <div className="p-6">
                  {(form.label || form.icon) && (
                    <p
                      className="text-xs font-bold uppercase tracking-widest mb-2"
                      style={{ color: BRAND.gold }}
                    >
                      {form.icon}  {form.label}
                    </p>
                  )}
                  {form.title && (
                    <h3 className="font-bold mb-2" style={{ color: BRAND.text, fontSize: 20, lineHeight: 1.3 }}>
                      {form.title}
                    </h3>
                  )}
                  {form.titleAr && (
                    <p
                      className="font-semibold mb-2"
                      style={{ color: BRAND.muted, fontFamily: 'Cairo, sans-serif', fontSize: 17 }}
                      dir="rtl"
                    >
                      {form.titleAr}
                    </p>
                  )}
                  {form.subtitle && (
                    <p className="text-sm mb-2" style={{ color: BRAND.cyan }}>{form.subtitle}</p>
                  )}
                  {(form.description || form.quote || form.text || form.question) && (
                    <p className="text-sm" style={{ color: BRAND.muted, lineHeight: 1.7 }}>
                      {form.description || form.quote || form.text || form.question}
                    </p>
                  )}
                  {(form.descriptionAr || form.questionAr) && (
                    <p
                      className="text-sm mt-2"
                      style={{ color: BRAND.muted, lineHeight: 1.7, fontFamily: 'Cairo, sans-serif' }}
                      dir="rtl"
                    >
                      {form.descriptionAr || form.questionAr}
                    </p>
                  )}
                  {form.answer && (
                    <div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                       <p className="text-sm" style={{ color: BRAND.text }}>{form.answer}</p>
                       {form.answerAr && <p className="text-sm mt-2" style={{ color: BRAND.muted, fontFamily: 'Cairo, sans-serif' }} dir="rtl">{form.answerAr}</p>}
                    </div>
                  )}
                  {(form.number || form.results) && (
                    <p className="text-2xl font-bold mt-3" style={{ color: BRAND.cyan }}>
                      {form.number || form.results}
                    </p>
                  )}
                  {form.client && (
                    <p className="text-sm mt-2 font-semibold" style={{ color: BRAND.gold }}>
                      Client: {form.client}
                    </p>
                  )}
                  {form.name && (
                    <p className="font-bold mt-2" style={{ color: BRAND.text }}>{form.name}</p>
                  )}
                  {(form.role || form.roleAr || form.company) && (
                    <p className="text-sm" style={{ color: BRAND.muted }}>
                      {form.role || form.roleAr} {form.company && `· ${form.company}`}
                    </p>
                  )}
                  {form.rating && (
                    <p className="mt-2" style={{ color: BRAND.gold }}>
                      {'★'.repeat(Math.min(5, parseInt(form.rating) || 5))}
                    </p>
                  )}
                  {form.linkUrl && (
                    <div className="mt-4">
                      <span
                        className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl"
                        style={{
                          background: 'linear-gradient(135deg, rgba(244,205,85,0.15), rgba(42,127,231,0.1))',
                          border: `1px solid rgba(244,205,85,0.25)`,
                          color: BRAND.gold,
                        }}
                      >
                        {form.linkLabel || 'Learn More'} →
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Empty preview state */}
              {!form[section.fields[0]] && !form.imageUrl && (
                <div
                  className="rounded-2xl flex flex-col items-center justify-center py-20 text-center"
                  style={{
                    border: '2px dashed rgba(99,179,237,0.15)',
                    background: 'rgba(255,255,255,0.01)',
                  }}
                >
                  <span className="text-4xl mb-3">{section.icon}</span>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                    Start filling the form to see a live preview
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
                    Preview uses your real website brand colors
                  </p>
                </div>
              )}

              {/* Brand color chips */}
              <div className="mt-6 grid grid-cols-3 gap-2">
                {[
                  { name: 'Background', val: BRAND.bg },
                  { name: 'Text', val: BRAND.text },
                  { name: 'Gold', val: BRAND.gold },
                  { name: 'Cyan', val: BRAND.cyan },
                  { name: 'Blue', val: BRAND.blue },
                  { name: 'Muted', val: BRAND.muted },
                ].map(({ name, val }) => (
                  <div
                    key={name}
                    className="flex items-center gap-2 p-2 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(99,179,237,0.06)' }}
                  >
                    <div
                      className="rounded flex-shrink-0"
                      style={{ width: 16, height: 16, background: val, border: '1px solid rgba(255,255,255,0.1)' }}
                    />
                    <div>
                      <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)', lineHeight: 1.1 }}>{name}</p>
                      <p className="text-xs font-mono" style={{ color: 'var(--text-muted)', fontSize: 10 }}>{val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
    </AnimatePresence>
  , document.body);
}

// ─── Section Panel ────────────────────────────────────────────────────────────
function SectionPanel({ section }) {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [open,    setOpen]    = useState(false);
  const [modal,   setModal]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = `/site-content/${section.collection.replace(/_/g, '-')}`;
      const res = await api.get(endpoint);
      setItems(res.data || []);
    }
    catch { setItems([]); }
    finally { setLoading(false); }
  }, [section.collection]);

  useEffect(() => {
    if (open && items.length === 0) load();
  }, [open, load, items.length]);

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title || 'this item'}"?`)) return;
    try {
      const endpoint = `/site-content/${section.collection.replace(/_/g, '-')}`;
      await api.delete(`${endpoint}/${id}`);
      setItems((p) => p.filter((i) => i.id !== id));
      toast.success('Deleted');
    } catch (err) { toast.error(err.message); }
  };

  const toggleVisible = async (item) => {
    try {
      const endpoint = `/site-content/${section.collection.replace(/_/g, '-')}`;
      await api.patch(`${endpoint}/${item.id}`, { visible: !item.visible });
      setItems((p) => p.map((i) => i.id === item.id ? { ...i, visible: !i.visible } : i));
      toast.success(item.visible ? 'Hidden from website' : 'Now visible on website');
    } catch (err) { toast.error(err.message); }
  };

  const firstField = section.fields[0];

  return (
    <motion.div
      className="glass-card overflow-hidden"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Section Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-5 text-left transition-all duration-200"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
      >
        {/* Color dot */}
        <div
          className="flex-shrink-0 flex items-center justify-center rounded-xl text-xl"
          style={{ width: 44, height: 44, background: `${section.color}18`, border: `1px solid ${section.color}30` }}
        >
          {section.icon}
        </div>

        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
              {section.label}
            </h3>
            <span className="text-xs" style={{ color: section.color }}>/ {section.labelAr}</span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{section.description}</p>
        </div>

        {/* Count badge + chevron */}
        {items.length > 0 && (
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: `${section.color}18`, color: section.color }}
          >
            {items.length} items
          </span>
        )}
        <motion.div animate={{ rotate: open ? 90 : 0 }}>
          <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
        </motion.div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t" style={{ borderColor: 'var(--glass-border)' }}>
              {/* Add button */}
              <div className="p-4 flex items-center justify-between">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {items.length === 0 ? 'No items yet' : `${items.length} item(s) in this section`}
                </p>
                <button
                  className="btn-primary !py-2 !px-4 !text-xs"
                  onClick={() => setModal('new')}
                >
                  <Plus size={14} /> Add Item
                </button>
              </div>

              {/* Items List */}
              {loading ? (
                <div className="flex justify-center py-8"><div className="spinner" /></div>
              ) : items.length > 0 ? (
                <div className="px-4 pb-4 space-y-2">
                  <AnimatePresence>
                    {items.map((item, i) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-center gap-3 p-3 rounded-xl group"
                        style={{
                          background: 'rgba(255,255,255,0.025)',
                          border: '1px solid rgba(99,179,237,0.07)',
                          opacity: item.visible === false ? 0.5 : 1,
                        }}
                      >
                        {/* Image thumbnail */}
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt=""
                            className="rounded-lg object-cover flex-shrink-0"
                            style={{ width: 44, height: 44 }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div
                            className="flex-shrink-0 flex items-center justify-center rounded-lg text-xl"
                            style={{ width: 44, height: 44, background: `${section.color}12`, border: `1px solid ${section.color}20` }}
                          >
                            {section.icon}
                          </div>
                        )}

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                            {item[firstField] || item.text || item.number || '—'}
                          </p>
                          <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            {item.description || item.quote || item.titleAr || item.client || item.label || ''}
                          </p>
                        </div>

                        {/* Visibility badge */}
                        <span
                          className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{
                            background: item.visible === false ? 'rgba(100,116,139,0.1)' : 'rgba(16,185,129,0.1)',
                            color:      item.visible === false ? 'var(--text-muted)' : '#10b981',
                            border:     `1px solid ${item.visible === false ? 'rgba(100,116,139,0.2)' : 'rgba(16,185,129,0.2)'}`,
                          }}
                        >
                          {item.visible === false ? 'Hidden' : 'Live'}
                        </span>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => toggleVisible(item)}
                            title={item.visible === false ? 'Show on website' : 'Hide from website'}
                            className="flex items-center justify-center rounded-lg transition-all"
                            style={{
                              width: 30, height: 30,
                              background: 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(99,179,237,0.1)',
                              color: 'var(--text-muted)', cursor: 'pointer',
                            }}
                          >
                            {item.visible === false ? <Eye size={13} /> : <EyeOff size={13} />}
                          </button>
                          <button
                            onClick={() => setModal(item)}
                            title="Edit"
                            className="flex items-center justify-center rounded-lg transition-all"
                            style={{
                              width: 30, height: 30,
                              background: 'rgba(0,212,255,0.06)',
                              border: '1px solid rgba(0,212,255,0.15)',
                              color: 'var(--accent-cyan)', cursor: 'pointer',
                            }}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item[firstField])}
                            title="Delete"
                            className="flex items-center justify-center rounded-lg transition-all"
                            style={{
                              width: 30, height: 30,
                              background: 'rgba(244,63,94,0.06)',
                              border: '1px solid rgba(244,63,94,0.15)',
                              color: '#f43f5e', cursor: 'pointer',
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal — renders via portal directly on body */}
      {modal && (
        <ItemModal
          section={section}
          item={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={load}
        />
      )}
    </motion.div>
  );
}

import CmsSiteElements from './CmsSiteElements';

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function WebsiteEditorPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Website Editor
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Edit your Mashhor Hub website content — images, text, and sections — directly from this panel.
            <span className="ml-2" style={{ color: 'var(--accent-cyan)' }}>
              All content saved to Firestore instantly.
            </span>
          </p>
        </div>
        <a
          href="https://mashhour-hub.web.app"
          target="_blank"
          rel="noreferrer"
          className="btn-ghost flex-shrink-0 !text-xs"
        >
          <Globe size={14} /> View Website
        </a>
      </div>

      {/* Brand Tokens Bar */}
      <BrandPreview />

      {/* How it Works note */}
      <div
        className="glass-card p-4 flex items-start gap-3"
        style={{ border: '1px solid rgba(54,218,245,0.15)' }}
      >
        <Layout size={18} color="var(--accent-cyan)" className="flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            How Website Editor Works
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
            Content is saved to <strong style={{ color: 'var(--accent-cyan)' }}>Firestore</strong> in dedicated collections (site_hero, site_services…).
            Your website JavaScript fetches this data to render dynamic content — same font (Inter/Cairo),
            same colors (Gold #{BRAND.gold.slice(1)}, Cyan #{BRAND.cyan.slice(1)}), same image format (WebP/JPG).
            Use the <strong style={{ color: 'var(--accent-cyan)' }}>Eye icon</strong> to show/hide items without deleting them.
          </p>
        </div>
      </div>

      {/* Section Panels */}
      <div className="space-y-4">
        {WEBSITE_SECTIONS.map((section, i) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <SectionPanel section={section} />
          </motion.div>
        ))}
      </div>

      <div className="pt-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <CmsSiteElements />
      </div>
    </div>
  );
}

