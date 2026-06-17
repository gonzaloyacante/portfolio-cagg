export type AdminNavItem = {
  href: string;
  label: string;
  group: string;
};

export const ADMIN_NAV: AdminNavItem[] = [
  { href: '/admin', label: 'Dashboard', group: 'Resumen' },
  { href: '/admin/messages', label: 'Mensajes', group: 'Resumen' },

  { href: '/admin/hero', label: 'Hero', group: 'Contenido' },
  { href: '/admin/contact-info', label: 'Datos de contacto', group: 'Contenido' },
  { href: '/admin/brands', label: 'Marcas', group: 'Contenido' },
  { href: '/admin/experience', label: 'Experiencia', group: 'Contenido' },
  { href: '/admin/process', label: 'Proceso', group: 'Contenido' },
  { href: '/admin/services', label: 'Servicios', group: 'Contenido' },
  { href: '/admin/projects', label: 'Proyectos', group: 'Contenido' },
  { href: '/admin/results', label: 'Resultados', group: 'Contenido' },
  { href: '/admin/testimonials', label: 'Testimonios', group: 'Contenido' },
  { href: '/admin/timeline', label: 'Trayectoria', group: 'Contenido' },
  { href: '/admin/faqs', label: 'FAQ', group: 'Contenido' },
  { href: '/admin/sections', label: 'Etiquetas de sección', group: 'Contenido' },
  { href: '/admin/media', label: 'Imágenes', group: 'Contenido' },

  { href: '/admin/email-settings', label: 'Notificaciones', group: 'Sistema' },
  { href: '/admin/system', label: 'Sitio', group: 'Sistema' },
  { href: '/admin/security', label: 'Seguridad (2FA)', group: 'Sistema' },
];

export const ADMIN_NAV_GROUPS = ['Resumen', 'Contenido', 'Sistema'] as const;

// ─── Collection config ──────────────────────────────────────────────────────

export type SingleFieldDef = {
  kind: 'single';
  name: string;
  label: string;
  type: 'text' | 'textarea';
};

export type BilingualFieldDef = {
  kind: 'bilingual';
  baseName: string;
  label: string;
  type: 'text' | 'textarea';
};

export type CollectionFieldDef = SingleFieldDef | BilingualFieldDef;

export type CollectionConfig = {
  label: string;
  fields: CollectionFieldDef[];
};

const str = (v: unknown): string => (typeof v === 'string' ? v : '');

export type ItemSummarizer = (item: Record<string, unknown>) => string;

export const SUMMARIZERS: Record<string, ItemSummarizer> = {
  brands: (item) => str(item.name),
  experience: (item) => str(item.titleEs),
  process: (item) => str(item.titleEs),
  services: (item) => str(item.labelEs),
  projects: (item) => str(item.titleEs),
  results: (item) => `${str(item.kEs)}: ${str(item.vEs)}`,
  testimonials: (item) => str(item.roleEs),
  timeline: (item) => `${str(item.period)} — ${str(item.titleEs)}`,
  faqs: (item) => str(item.qEs),
};

export const COLLECTION_CONFIG: Record<string, CollectionConfig> = {
  brands: {
    label: 'Marcas',
    fields: [{ kind: 'single', name: 'name', label: 'Nombre', type: 'text' }],
  },

  experience: {
    label: 'Experiencia',
    fields: [
      { kind: 'single', name: 'code', label: 'Código', type: 'text' },
      { kind: 'bilingual', baseName: 'title', label: 'Título', type: 'text' },
      { kind: 'bilingual', baseName: 'body', label: 'Cuerpo', type: 'textarea' },
    ],
  },

  process: {
    label: 'Proceso',
    fields: [
      { kind: 'single', name: 'code', label: 'Código', type: 'text' },
      { kind: 'bilingual', baseName: 'title', label: 'Título', type: 'text' },
      { kind: 'bilingual', baseName: 'body', label: 'Descripción', type: 'textarea' },
      { kind: 'bilingual', baseName: 'deliverable', label: 'Entregable', type: 'text' },
    ],
  },

  services: {
    label: 'Servicios',
    fields: [{ kind: 'bilingual', baseName: 'label', label: 'Etiqueta', type: 'text' }],
  },

  projects: {
    label: 'Proyectos',
    fields: [
      { kind: 'single', name: 'tag', label: 'Tag', type: 'text' },
      { kind: 'bilingual', baseName: 'period', label: 'Período', type: 'text' },
      { kind: 'bilingual', baseName: 'title', label: 'Título', type: 'text' },
      { kind: 'bilingual', baseName: 'challenge', label: 'Desafío', type: 'textarea' },
      { kind: 'bilingual', baseName: 'intervention', label: 'Intervención', type: 'textarea' },
      { kind: 'bilingual', baseName: 'outcome', label: 'Resultado', type: 'textarea' },
    ],
  },

  results: {
    label: 'Resultados',
    fields: [
      { kind: 'bilingual', baseName: 'k', label: 'Métrica', type: 'text' },
      { kind: 'bilingual', baseName: 'v', label: 'Valor', type: 'text' },
    ],
  },

  testimonials: {
    label: 'Testimonios',
    fields: [
      { kind: 'bilingual', baseName: 'quote', label: 'Cita', type: 'textarea' },
      { kind: 'bilingual', baseName: 'role', label: 'Rol', type: 'text' },
      { kind: 'bilingual', baseName: 'sector', label: 'Sector', type: 'text' },
    ],
  },

  timeline: {
    label: 'Trayectoria',
    fields: [
      { kind: 'single', name: 'period', label: 'Período', type: 'text' },
      { kind: 'bilingual', baseName: 'title', label: 'Título', type: 'text' },
      { kind: 'bilingual', baseName: 'body', label: 'Descripción', type: 'textarea' },
    ],
  },

  faqs: {
    label: 'FAQ',
    fields: [
      { kind: 'bilingual', baseName: 'q', label: 'Pregunta', type: 'text' },
      { kind: 'bilingual', baseName: 'a', label: 'Respuesta', type: 'textarea' },
    ],
  },
};
