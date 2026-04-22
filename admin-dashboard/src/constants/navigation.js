// ─── Sidebar Navigation Items ─────────────────────────────────────────────
// Each item maps a route path to a label, icon name, and colour accent.
// `children` creates a collapsible sub-group.
export const navItems = [
  {
    id:    'overview',
    label: 'Overview',
    labelAr: 'نظرة عامة',
    icon:  'LayoutDashboard',
    path:  '/',
  },
  {
    id:    'leads',
    label: 'Leads',
    labelAr: 'العملاء المحتملون',
    icon:  'Users',
    path:  '/leads',
  },
  {
    id:    'erp',
    label: 'ERP & Billing',
    labelAr: 'المحاسبة والفوترة',
    icon:  'Receipt',
    path:  '/erp',
    children: [
      { id: 'erp-clients',    label: 'Clients',     labelAr: 'العملاء',        path: '/erp/clients'    },
      { id: 'erp-quotations', label: 'Quotations',  labelAr: 'عروض الأسعار',   path: '/erp/quotations' },
      { id: 'erp-invoices',   label: 'Invoices',    labelAr: 'الفواتير',       path: '/erp/invoices'   },
    ],
  },
  {
    id:    'media',
    label: 'Media Library',
    labelAr: 'مكتبة الوسائط',
    icon:  'Image',
    path:  '/media',
  },
  {
    id:    'cms',
    label: 'Content (CMS)',
    labelAr: 'إدارة المحتوى',
    icon:  'FileText',
    path:  '/cms',
    children: [
      { id: 'services',     label: 'Services',      labelAr: 'الخدمات',       path: '/cms/services'     },
      { id: 'case-studies', label: 'Case Studies',  labelAr: 'دراسات الحالة', path: '/cms/case-studies' },
      { id: 'blog',         label: 'Blog',          labelAr: 'المدونة',       path: '/cms/blog'         },
      { id: 'academy',      label: 'Academy',       labelAr: 'الأكاديمية',      path: '/cms/academy'      },
      { id: 'tools',        label: 'Tools Vault',   labelAr: 'خزانة الأدوات',   path: '/cms/tools'        },
      { id: 'library',      label: 'Resource Lib',  labelAr: 'مكتبة الموارد',   path: '/cms/library'      },
      { id: 'prompts',      label: 'Std Prompts',   labelAr: 'البرومبتات',     path: '/cms/prompts'      },
      { id: 'vault',        label: 'Premium Vault', labelAr: 'الخزانة المميزة',  path: '/cms/vault'        },
      { id: 'portfolio',    label: 'Portfolio',     labelAr: 'المعرض',         path: '/cms/portfolio'    },
      { id: 'pricing',      label: 'Pricing Hub',   labelAr: 'الباقات',         path: '/cms/pricing'      },
    ],
  },
  {
    id:    'users',
    label: 'Users & Roles',
    labelAr: 'إدارة المشرفين',
    icon:  'Users',
    path:  '/users',
  },
  {
    id:    'website-editor',
    label: 'Website Editor',
    labelAr: 'محرر الموقع',
    icon:  'Globe',
    path:  '/website-editor',
  },
  {
    id:    'settings',
    label: 'Settings',
    labelAr: 'الإعدادات',
    icon:  'Settings',
    path:  '/settings',
  },
  {
    id:    'system-logs',
    label: 'System Logs',
    labelAr: 'سجل النظام',
    icon:  'FileText',
    path:  '/system-logs',
  },
];

// ─── Stat Cards ───────────────────────────────────────────────────────────
export const STAT_CARDS = [
  { id: 'leads',     label: 'Total Leads',       labelAr: 'إجمالي العملاء',    icon: 'Users',       accent: 'cyan',    collection: 'leads'    },
  { id: 'projects',  label: 'Active Projects',   labelAr: 'المشاريع النشطة',   icon: 'Briefcase',   accent: 'purple',  collection: 'projects' },
  { id: 'services',  label: 'Services Listed',   labelAr: 'الخدمات المدرجة',   icon: 'Layers',      accent: 'emerald', collection: 'services' },
  { id: 'media',     label: 'Media Assets',      labelAr: 'ملفات الوسائط',     icon: 'Image',       accent: 'amber',   collection: null       },
];

// ─── Status Options for Leads ─────────────────────────────────────────────
export const LEAD_STATUSES = ['new', 'contacted', 'closed'];
