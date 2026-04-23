const ALLOWED_SITE_FIELDS = {
    site_hero: ['title', 'titleAr', 'subtitle', 'subtitleAr', 'label', 'labelAr', 'description', 'descriptionAr', 'imageUrl', 'linkUrl', 'visible', 'order', 'position', 'sectionId'],
    site_services: ['title', 'titleAr', 'description', 'descriptionAr', 'icon', 'imageUrl', 'linkUrl', 'visible', 'order', 'position', 'sectionId'],
    site_portfolio: ['title', 'titleAr', 'client', 'clientAr', 'results', 'resultsAr', 'description', 'descriptionAr', 'imageUrl', 'linkUrl', 'visible', 'order', 'position', 'sectionId'],
    site_metrics: ['number', 'value', 'label', 'labelAr', 'visible', 'order', 'position', 'sectionId'],
    site_testimonials: ['name', 'company', 'companyAr', 'quote', 'quoteAr', 'imageUrl', 'rating', 'visible', 'order', 'position', 'sectionId'],
    site_team: ['name', 'role', 'roleAr', 'imageUrl', 'linkedinUrl', 'visible', 'order', 'position', 'sectionId'],
    site_announcements: ['text', 'textAr', 'title', 'titleAr', 'linkUrl', 'linkLabel', 'linkLabelAr', 'visible', 'order', 'position', 'sectionId'],
    site_settings: ['phone', 'email', 'whatsapp', 'linkedinUrl', 'instagramUrl', 'facebookUrl', 'snapchatUrl', 'tiktokUrl', 'pinterestUrl', 'seoTitle', 'seoDescription', 'seoKeywords', 'ogImage', 'maintenanceMode', 'cacheVersion', 'theme', 'visible', 'sectionId'],
    site_pages: ['pageId', 'contentEn', 'contentAr', 'visible', 'sectionId'],
    site_clients: ['title', 'titleAr', 'imageUrl', 'linkUrl', 'visible', 'order', 'position', 'sectionId'],
    site_faqs: ['question', 'questionAr', 'answer', 'answerAr', 'category', 'visible', 'order', 'position', 'sectionId'],
    site_process: ['title', 'titleAr', 'description', 'descriptionAr', 'icon', 'visible', 'order', 'position', 'sectionId'],
    site_values: ['title', 'titleAr', 'description', 'descriptionAr', 'icon', 'visible', 'order', 'position', 'sectionId'],
    site_partners: ['title', 'titleAr', 'imageUrl', 'linkUrl', 'visible', 'order', 'position', 'sectionId'],
};

const GENERIC_ALLOWED_FIELDS = ['visible', 'order', 'position', 'sectionId'];

const sanitizeString = (value) =>
    value.replace(/[<>]/g, '').trim();

const sanitizeValue = (value) => {
    if (typeof value === 'string') return sanitizeString(value);
    if (Array.isArray(value)) return value.map(sanitizeValue);
    if (value && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value).map(([key, nestedValue]) => [key, sanitizeValue(nestedValue)]),
        );
    }
    return value;
};

const normalizeBoolean = (value) => {
    if (typeof value === 'boolean') return value;
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
};

const normalizeNumber = (value) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) {
        return Number(value);
    }
    return value;
};

const sanitizeSitePayload = (collection, payload = {}) => {
    const allowedFields = new Set([
        ...(ALLOWED_SITE_FIELDS[collection] || []),
        ...GENERIC_ALLOWED_FIELDS,
    ]);

    const sanitized = {};
    for (const [key, rawValue] of Object.entries(payload)) {
        if (!allowedFields.has(key)) continue;

        let value = sanitizeValue(rawValue);
        if (key === 'visible' || key === 'maintenanceMode') value = normalizeBoolean(value);
        if (key === 'order' || key === 'position') value = normalizeNumber(value);
        sanitized[key] = value;
    }

    return sanitized;
};

const sanitizeSettingsPayload = (payload = {}) =>
    sanitizeSitePayload('site_settings', payload);

module.exports = {
    sanitizeSettingsPayload,
    sanitizeSitePayload,
};
