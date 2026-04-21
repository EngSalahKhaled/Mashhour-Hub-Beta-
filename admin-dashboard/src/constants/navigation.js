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
