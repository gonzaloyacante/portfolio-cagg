import { describe, expect, it } from 'vitest';

import {
  brandSchema,
  contactInfoUpdateSchema,
  experienceCardSchema,
  faqItemSchema,
  heroUpdateSchema,
  processStepSchema,
  projectSchema,
  resultItemSchema,
  sectionMetaUpdateSchema,
  serviceSchema,
  testimonialSchema,
  timelineItemSchema,
} from '@/validations/admin';

describe('heroUpdateSchema', () => {
  describe('valid payloads', () => {
    it('accepts empty (all fields optional)', () => {
      expect(heroUpdateSchema.safeParse({}).success).toBe(true);
    });

    it('accepts full payload', () => {
      const result = heroUpdateSchema.safeParse({
        overlineEs: 'Consultor Industrial',
        overlineEn: 'Industrial Consultant',
        name: 'Carlos',
        headlineEs: 'Transformo empresas',
        headlineEn: 'I transform companies',
        summaryEs: 'Resumen',
        summaryEn: 'Summary',
        ctaWhatsappEs: 'WhatsApp',
        ctaWhatsappEn: 'WhatsApp',
        ctaEmailEs: 'Email',
        ctaEmailEn: 'Email',
        ctaLinkedinEs: 'LinkedIn',
        ctaLinkedinEn: 'LinkedIn',
        portraitUrl: 'https://res.cloudinary.com/demo/image.jpg',
        stats: [
          { value: '15+', labelEs: 'Años', labelEn: 'Years', order: 0 },
          { value: '50+', labelEs: 'Proyectos', labelEn: 'Projects', order: 1 },
        ],
      });
      expect(result.success).toBe(true);
    });

    it('accepts portraitUrl as empty string (transforms to null)', () => {
      const result = heroUpdateSchema.safeParse({ portraitUrl: '' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.portraitUrl).toBeNull();
      }
    });

    it('accepts portraitUrl as null', () => {
      const result = heroUpdateSchema.safeParse({ portraitUrl: null });
      expect(result.success).toBe(true);
    });

    it('accepts portraitUrl as undefined', () => {
      const result = heroUpdateSchema.safeParse({ portraitUrl: undefined });
      expect(result.success).toBe(true);
    });

    it('accepts an empty stats array', () => {
      const result = heroUpdateSchema.safeParse({ stats: [] });
      expect(result.success).toBe(true);
    });

    it.each([
      'https://example.com/portrait.jpg',
      'http://example.com/portrait.png',
      'https://res.cloudinary.com/demo/image/upload/v123/abc.jpg',
      'https://cdn.example.com/path/to/img.webp',
    ])('accepts valid portrait URL: %s', (portraitUrl) => {
      const result = heroUpdateSchema.safeParse({ portraitUrl });
      expect(result.success).toBe(true);
    });

    it('accepts very long summary text', () => {
      const result = heroUpdateSchema.safeParse({ summaryEs: 'a'.repeat(10_000) });
      expect(result.success).toBe(true);
    });

    it('accepts unicode + emoji in text fields', () => {
      const result = heroUpdateSchema.safeParse({
        overlineEs: 'Иван 👨‍💻',
        name: '王 明',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('invalid payloads', () => {
    it('rejects empty string for min(1) field (overlineEs)', () => {
      expect(heroUpdateSchema.safeParse({ overlineEs: '' }).success).toBe(false);
    });

    it('rejects empty string for name', () => {
      expect(heroUpdateSchema.safeParse({ name: '' }).success).toBe(false);
    });

    it('rejects empty string for summaryEs', () => {
      expect(heroUpdateSchema.safeParse({ summaryEs: '' }).success).toBe(false);
    });

    it('rejects invalid portraitUrl (not a URL)', () => {
      expect(heroUpdateSchema.safeParse({ portraitUrl: 'not-a-url' }).success).toBe(false);
    });

    it('rejects stat with empty value', () => {
      expect(
        heroUpdateSchema.safeParse({ stats: [{ value: '', labelEs: 'a', labelEn: 'a' }] }).success
      ).toBe(false);
    });

    it('rejects stat with empty labelEs', () => {
      expect(
        heroUpdateSchema.safeParse({ stats: [{ value: 'a', labelEs: '', labelEn: 'a' }] }).success
      ).toBe(false);
    });

    it('rejects stat with empty labelEn', () => {
      expect(
        heroUpdateSchema.safeParse({ stats: [{ value: 'a', labelEs: 'a', labelEn: '' }] }).success
      ).toBe(false);
    });

    it('rejects stat with non-int order', () => {
      expect(
        heroUpdateSchema.safeParse({
          stats: [{ value: 'a', labelEs: 'a', labelEn: 'a', order: 1.5 }],
        }).success
      ).toBe(false);
    });
  });
});

describe('experienceCardSchema', () => {
  it('accepts valid card', () => {
    expect(
      experienceCardSchema.safeParse({
        code: '01',
        titleEs: 'Senior',
        titleEn: 'Senior',
        bodyEs: 'Cuerpo',
        bodyEn: 'Body',
        order: 0,
      }).success
    ).toBe(true);
  });

  it.each([
    [{ code: '', titleEs: 'a', titleEn: 'a', bodyEs: 'a', bodyEn: 'a' }],
    [{ code: 'a', titleEs: '', titleEn: 'a', bodyEs: 'a', bodyEn: 'a' }],
    [{ code: 'a', titleEs: 'a', titleEn: '', bodyEs: 'a', bodyEn: 'a' }],
    [{ code: 'a', titleEs: 'a', titleEn: 'a', bodyEs: '', bodyEn: 'a' }],
    [{ code: 'a', titleEs: 'a', titleEn: 'a', bodyEs: 'a', bodyEn: '' }],
  ])('rejects card with empty field: %j', (input) => {
    expect(experienceCardSchema.safeParse(input).success).toBe(false);
  });

  it('rejects order as non-int', () => {
    expect(
      experienceCardSchema.safeParse({
        code: 'a',
        titleEs: 'a',
        titleEn: 'a',
        bodyEs: 'a',
        bodyEn: 'a',
        order: 1.5,
      }).success
    ).toBe(false);
  });

  it('defaults order to 0 when omitted', () => {
    const result = experienceCardSchema.safeParse({
      code: 'a',
      titleEs: 'a',
      titleEn: 'a',
      bodyEs: 'a',
      bodyEn: 'a',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.order).toBe(0);
    }
  });
});

describe('processStepSchema', () => {
  it('accepts valid step', () => {
    expect(
      processStepSchema.safeParse({
        code: '1',
        titleEs: 'Descubrimiento',
        titleEn: 'Discovery',
        bodyEs: 'Cuerpo',
        bodyEn: 'Body',
        deliverableEs: 'Reporte',
        deliverableEn: 'Report',
        order: 0,
      }).success
    ).toBe(true);
  });

  it.each([
    [
      'code',
      {
        code: '',
        titleEs: 'a',
        titleEn: 'a',
        bodyEs: 'a',
        bodyEn: 'a',
        deliverableEs: 'a',
        deliverableEn: 'a',
      },
    ],
    [
      'titleEs',
      {
        code: 'a',
        titleEs: '',
        titleEn: 'a',
        bodyEs: 'a',
        bodyEn: 'a',
        deliverableEs: 'a',
        deliverableEn: 'a',
      },
    ],
    [
      'titleEn',
      {
        code: 'a',
        titleEs: 'a',
        titleEn: '',
        bodyEs: 'a',
        bodyEn: 'a',
        deliverableEs: 'a',
        deliverableEn: 'a',
      },
    ],
    [
      'bodyEs',
      {
        code: 'a',
        titleEs: 'a',
        titleEn: 'a',
        bodyEs: '',
        bodyEn: 'a',
        deliverableEs: 'a',
        deliverableEn: 'a',
      },
    ],
    [
      'bodyEn',
      {
        code: 'a',
        titleEs: 'a',
        titleEn: 'a',
        bodyEs: 'a',
        bodyEn: '',
        deliverableEs: 'a',
        deliverableEn: 'a',
      },
    ],
    [
      'deliverableEs',
      {
        code: 'a',
        titleEs: 'a',
        titleEn: 'a',
        bodyEs: 'a',
        bodyEn: 'a',
        deliverableEs: '',
        deliverableEn: 'a',
      },
    ],
    [
      'deliverableEn',
      {
        code: 'a',
        titleEs: 'a',
        titleEn: 'a',
        bodyEs: 'a',
        bodyEn: 'a',
        deliverableEs: 'a',
        deliverableEn: '',
      },
    ],
  ])('rejects when %s is empty', (_field, input) => {
    expect(processStepSchema.safeParse(input).success).toBe(false);
  });

  it('rejects non-int order', () => {
    expect(
      processStepSchema.safeParse({
        code: 'a',
        titleEs: 'a',
        titleEn: 'a',
        bodyEs: 'a',
        bodyEn: 'a',
        deliverableEs: 'a',
        deliverableEn: 'a',
        order: '1',
      }).success
    ).toBe(false);
  });
});

describe('serviceSchema', () => {
  it('accepts valid service', () => {
    expect(serviceSchema.safeParse({ labelEs: 'Diseño', labelEn: 'Design' }).success).toBe(true);
  });

  it.each([[{ labelEs: '', labelEn: 'a' }], [{ labelEs: 'a', labelEn: '' }]])(
    'rejects empty label: %j',
    (input) => {
      expect(serviceSchema.safeParse(input).success).toBe(false);
    }
  );

  it('defaults order to 0', () => {
    const result = serviceSchema.safeParse({ labelEs: 'a', labelEn: 'b' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.order).toBe(0);
  });
});

describe('projectSchema', () => {
  const valid = {
    tag: 'Industrial',
    periodEs: '2023',
    periodEn: '2023',
    titleEs: 'Proyecto A',
    titleEn: 'Project A',
    challengeEs: 'C1',
    challengeEn: 'C1',
    interventionEs: 'I1',
    interventionEn: 'I1',
    outcomeEs: 'O1',
    outcomeEn: 'O1',
  };

  it('accepts valid project', () => {
    expect(projectSchema.safeParse(valid).success).toBe(true);
  });

  it.each([
    'tag',
    'periodEs',
    'periodEn',
    'titleEs',
    'titleEn',
    'challengeEs',
    'challengeEn',
    'interventionEs',
    'interventionEn',
    'outcomeEs',
    'outcomeEn',
  ])('rejects when %s is empty', (field) => {
    expect(projectSchema.safeParse({ ...valid, [field]: '' }).success).toBe(false);
  });

  it('rejects non-int order', () => {
    expect(projectSchema.safeParse({ ...valid, order: 1.5 }).success).toBe(false);
  });

  it('defaults order to 0', () => {
    const result = projectSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.order).toBe(0);
  });
});

describe('resultItemSchema', () => {
  it('accepts valid result', () => {
    expect(
      resultItemSchema.safeParse({ kEs: 'Años', kEn: 'Years', vEs: '15+', vEn: '15+' }).success
    ).toBe(true);
  });

  it.each([
    [{ kEs: '', kEn: 'a', vEs: 'a', vEn: 'a' }],
    [{ kEs: 'a', kEn: '', vEs: 'a', vEn: 'a' }],
    [{ kEs: 'a', kEn: 'a', vEs: '', vEn: 'a' }],
    [{ kEs: 'a', kEn: 'a', vEs: 'a', vEn: '' }],
  ])('rejects empty: %j', (input) => {
    expect(resultItemSchema.safeParse(input).success).toBe(false);
  });
});

describe('testimonialSchema', () => {
  it('accepts valid testimonial', () => {
    expect(
      testimonialSchema.safeParse({
        quoteEs: 'Excelente trabajo',
        quoteEn: 'Excellent work',
        roleEs: 'CEO',
        roleEn: 'CEO',
        sectorEs: 'Industrial',
        sectorEn: 'Industrial',
      }).success
    ).toBe(true);
  });

  it.each(['quoteEs', 'quoteEn', 'roleEs', 'roleEn', 'sectorEs', 'sectorEn'])(
    'rejects empty %s',
    (field) => {
      const valid = {
        quoteEs: 'a',
        quoteEn: 'a',
        roleEs: 'a',
        roleEn: 'a',
        sectorEs: 'a',
        sectorEn: 'a',
      };
      expect(testimonialSchema.safeParse({ ...valid, [field]: '' }).success).toBe(false);
    }
  );
});

describe('timelineItemSchema', () => {
  it('accepts valid timeline', () => {
    expect(
      timelineItemSchema.safeParse({
        period: '2020-2023',
        titleEs: 'Fundé X',
        titleEn: 'Founded X',
        bodyEs: 'a',
        bodyEn: 'a',
      }).success
    ).toBe(true);
  });

  it.each(['period', 'titleEs', 'titleEn', 'bodyEs', 'bodyEn'])('rejects empty %s', (field) => {
    const valid = { period: 'a', titleEs: 'a', titleEn: 'a', bodyEs: 'a', bodyEn: 'a' };
    expect(timelineItemSchema.safeParse({ ...valid, [field]: '' }).success).toBe(false);
  });
});

describe('faqItemSchema', () => {
  it('accepts valid FAQ', () => {
    expect(
      faqItemSchema.safeParse({
        qEs: 'Pregunta',
        qEn: 'Question',
        aEs: 'Respuesta',
        aEn: 'Answer',
      }).success
    ).toBe(true);
  });

  it.each(['qEs', 'qEn', 'aEs', 'aEn'])('rejects empty %s', (field) => {
    const valid = { qEs: 'a', qEn: 'a', aEs: 'a', aEn: 'a' };
    expect(faqItemSchema.safeParse({ ...valid, [field]: '' }).success).toBe(false);
  });
});

describe('brandSchema', () => {
  it('accepts valid brand', () => {
    expect(brandSchema.safeParse({ name: 'Acme' }).success).toBe(true);
  });

  it('rejects empty name', () => {
    expect(brandSchema.safeParse({ name: '' }).success).toBe(false);
  });

  it('defaults order to 0', () => {
    const result = brandSchema.safeParse({ name: 'A' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.order).toBe(0);
  });
});

describe('contactInfoUpdateSchema', () => {
  it('accepts empty (all optional)', () => {
    expect(contactInfoUpdateSchema.safeParse({}).success).toBe(true);
  });

  it('accepts full payload', () => {
    expect(
      contactInfoUpdateSchema.safeParse({
        name: 'Carlos',
        phoneDisplay: '+54 9 11 5555 5555',
        whatsappNumber: '5491155555555',
        email: 'carlos@example.com',
        linkedinUrl: 'https://linkedin.com/in/carlos',
        linkedinHandle: '@carlos',
        location: 'Argentina',
      }).success
    ).toBe(true);
  });

  it('rejects invalid email', () => {
    expect(contactInfoUpdateSchema.safeParse({ email: 'not-an-email' }).success).toBe(false);
  });

  it('rejects invalid linkedinUrl (not a URL)', () => {
    expect(contactInfoUpdateSchema.safeParse({ linkedinUrl: 'not-a-url' }).success).toBe(false);
  });

  it('accepts empty string for optional email (z.string().email().optional())', () => {
    // .email() rejects empty string; .optional() means the field can be missing
    expect(contactInfoUpdateSchema.safeParse({ email: '' }).success).toBe(false);
  });

  it.each([
    ['https://linkedin.com/in/user', true],
    ['http://linkedin.com/in/user', true],
    ['linkedin.com/in/user', false],
    ['not a url', false],
  ])('linkedinUrl validation: %s → %s', (url, expected) => {
    expect(contactInfoUpdateSchema.safeParse({ linkedinUrl: url }).success).toBe(expected);
  });
});

describe('sectionMetaUpdateSchema', () => {
  it('accepts empty (all fields nullable/optional)', () => {
    expect(sectionMetaUpdateSchema.safeParse({}).success).toBe(true);
  });

  it('accepts each field as null', () => {
    expect(
      sectionMetaUpdateSchema.safeParse({
        overlineEs: null,
        overlineEn: null,
        titleEs: null,
        titleEn: null,
        descEs: null,
        descEn: null,
      }).success
    ).toBe(true);
  });

  it('accepts each field as a string', () => {
    expect(
      sectionMetaUpdateSchema.safeParse({
        overlineEs: 'Servicios',
        overlineEn: 'Services',
        titleEs: 'Lo que hago',
        titleEn: 'What I do',
        descEs: 'Desc',
        descEn: 'Desc',
      }).success
    ).toBe(true);
  });

  it('accepts empty strings (nullish() is not min(1))', () => {
    expect(sectionMetaUpdateSchema.safeParse({ titleEs: '' }).success).toBe(true);
  });
});
