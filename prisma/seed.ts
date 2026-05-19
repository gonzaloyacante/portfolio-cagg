import 'dotenv/config';

import { prisma } from '../src/lib/prisma';

async function main() {
  // Hero
  await prisma.hero.upsert({
    where: { id: 'hero-main' },
    update: {},
    create: {
      id: 'hero-main',
      overlineEs: 'INGENIERO ELECTRÓNICO DE CONTROL INDUSTRIAL',
      overlineEn: 'INDUSTRIAL CONTROL ELECTRONIC ENGINEER',
      name: 'Carlos Armando Guerra',
      headlineEs: 'Más de 30 años optimizando líneas de producción industrial.',
      headlineEn: '30+ years optimizing industrial production lines.',
      summaryEs:
        'Especialista en termoformado, extrusión de polipropileno, líneas BOPP, metalizado, mantenimiento industrial, optimización de procesos y eficiencia energética. Soluciones técnicas reales, probadas en planta.',
      summaryEn:
        'Specialist in thermoforming, polypropylene extrusion, BOPP lines, metallization, industrial maintenance, process optimization and energy efficiency. Real technical solutions, proven on the shop floor.',
      stats: {
        create: [
          {
            value: '30+',
            labelEs: 'Años de experiencia industrial',
            labelEn: 'Years of industrial experience',
            order: 0,
          },
          {
            value: '13',
            labelEs: 'Marcas de maquinaria operadas',
            labelEn: 'Industrial machinery brands',
            order: 1,
          },
          {
            value: '9',
            labelEs: 'Áreas de especialización',
            labelEn: 'Specialization areas',
            order: 2,
          },
          {
            value: 'BA',
            labelEs: 'Buenos Aires, Argentina',
            labelEn: 'Buenos Aires, Argentina',
            order: 3,
          },
        ],
      },
    },
  });

  // ContactInfo
  await prisma.contactInfo.upsert({
    where: { id: 'contact-main' },
    update: {},
    create: {
      id: 'contact-main',
      name: 'Carlos Armando Guerra',
      phoneDisplay: '+54 9 11 3396-8703',
      whatsappNumber: '5491133968703',
      email: 'ING_CAGG@HOTMAIL.COM',
      linkedinUrl: 'https://www.linkedin.com/in/armando-guerra-19bb57147',
      linkedinHandle: 'armando-guerra-19bb57147',
      location: 'Buenos Aires, Argentina',
    },
  });

  // Brands
  const brands = [
    'Dusemberry',
    'Battenfeld',
    'Gabler',
    'Illig',
    'Kiefel',
    'DMT',
    'Bruckner',
    'Galileo',
    'General Vacuum',
    'BOBST',
    'Goebel',
    'Atlas',
    'Kampf',
  ];
  for (const [i, name] of brands.entries()) {
    await prisma.brand.upsert({
      where: { id: `brand-${i}` },
      update: {},
      create: { id: `brand-${i}`, name, order: i },
    });
  }

  // Experience
  const experience: [string, string, string, string, string][] = [
    [
      '01',
      'Termoformado',
      'Thermoforming',
      'Mantenimiento eléctrico/electrónico, diagnóstico de fallas y mejora de calidad y eficiencia en termoformadoras Gabler, Illig y Kiefel.',
      'Electrical/electronic maintenance, fault diagnosis and quality/efficiency improvement on Gabler, Illig and Kiefel thermoformers.',
    ],
    [
      '02',
      'Extrusión PP',
      'PP Extrusion',
      'Extrusoras Dusemberry y Battenfeld. Análisis de fallas recurrentes, mejora de proveedores, repuestos y eficiencia energética.',
      'Dusemberry and Battenfeld extruders. Recurrent fault analysis, supplier development, spare parts and energy efficiency.',
    ],
    [
      '03',
      'Líneas BOPP',
      'BOPP Lines',
      'Líneas de producción DMT y Bruckner: mantenimiento integral, reducción de consumo eléctrico y costos de producción.',
      'DMT and Bruckner production lines: full maintenance, electrical consumption reduction and production cost savings.',
    ],
    [
      '04',
      'Metalizado',
      'Metallization',
      'Líneas Galileo y General Vacuum / BOBST. Optimización de tiempos de vacío, productividad y soluciones alternativas de insumos.',
      'Galileo and General Vacuum / BOBST lines. Vacuum cycle and productivity optimization, alternative input solutions.',
    ],
    [
      '05',
      'Slitter / Cortadoras',
      'Slitters',
      'Cortadoras Goebel, Dusemberry, Atlas y Kampf. Procesos para mejorar productividad y reducir consumo energético.',
      'Goebel, Dusemberry, Atlas and Kampf slitters. Processes to improve productivity and lower energy consumption.',
    ],
    [
      '06',
      'Líneas globo · Bolsas',
      'Blown film · T-shirt bags',
      'Instalación, puesta a punto y reacondicionamiento de líneas tipo camiseta. Planos eléctricos, neumáticos e hidráulicos.',
      'Installation, commissioning and refurbishment of T-shirt bag lines. Electrical, pneumatic and hydraulic drawings.',
    ],
    [
      '07',
      'Automatización industrial',
      'Industrial automation',
      'Diseño e implementación de controles, planillas de proceso y herramientas para sostener objetivos productivos.',
      'Design and implementation of controls, process sheets and tools to keep production targets on track.',
    ],
    [
      '08',
      'Mantenimiento eléctrico/electrónico',
      'Electrical/electronic maintenance',
      'Corrección de fallas, desarrollo de proveedores y stock estratégico de repuestos para minimizar paradas.',
      'Fault correction, supplier development and strategic spare parts stock to minimize downtime.',
    ],
    [
      '09',
      'Eficiencia energética',
      'Energy efficiency',
      'Análisis de consumos y facturación, demanda de potencia y proyectos para reducir costos de energía eléctrica.',
      'Consumption and billing analysis, power demand and projects to reduce electrical energy costs.',
    ],
  ];
  for (const [i, [code, titleEs, titleEn, bodyEs, bodyEn]] of experience.entries()) {
    await prisma.experienceCard.upsert({
      where: { code },
      update: {},
      create: { code, titleEs, titleEn, bodyEs, bodyEn, order: i },
    });
  }

  // Process
  const process: [string, string, string, string, string, string, string][] = [
    [
      '01',
      'Diagnóstico técnico',
      'Technical diagnosis',
      'Visita a planta o auditoría remota. Relevamiento eléctrico/electrónico, lectura de fallas recurrentes, análisis de consumos y entrevistas con mantenimiento y producción.',
      'On-site visit or remote audit. Electrical/electronic survey, recurrent fault reading, consumption analysis and interviews with maintenance and production teams.',
      'Informe de hallazgos + foco de intervención',
      'Findings report + intervention focus',
    ],
    [
      '02',
      'Plan de intervención',
      'Intervention plan',
      'Propuesta técnica con alcance, repuestos críticos, tiempos estimados y criterios de éxito medibles. Revisión conjunta con plant manager y jefe de mantenimiento.',
      'Technical proposal with scope, critical spares, estimated times and measurable success criteria. Joint review with plant manager and maintenance lead.',
      'Documento de alcance + plan de trabajo',
      'Scope document + work plan',
    ],
    [
      '03',
      'Intervención en planta',
      'On-site intervention',
      'Ejecución directa: corrección de fallas, puesta a punto, ajuste de variadores, planos eléctricos / neumáticos / hidráulicos y capacitación operativa.',
      'Direct execution: fault correction, commissioning, drive tuning, electrical / pneumatic / hydraulic drawings and operator training.',
      'Línea operativa + documentación técnica',
      'Operational line + technical documentation',
    ],
    [
      '04',
      'Seguimiento & KPIs',
      'Follow-up & KPIs',
      'Medición de resultados, planillas de control, reportes de gestión y plan de mejora continua. Soporte técnico ante eventos posteriores.',
      'Result tracking, control sheets, management reports and continuous improvement plan. Ongoing technical support for later events.',
      'Dashboard de KPIs + plan de mejora',
      'KPI dashboard + improvement plan',
    ],
  ];
  for (const [
    i,
    [code, titleEs, titleEn, bodyEs, bodyEn, deliverableEs, deliverableEn],
  ] of process.entries()) {
    await prisma.processStep.upsert({
      where: { code },
      update: {},
      create: { code, titleEs, titleEn, bodyEs, bodyEn, deliverableEs, deliverableEn, order: i },
    });
  }

  // Services
  const services: [string, string][] = [
    ['Troubleshooting industrial', 'Industrial troubleshooting'],
    ['Diagnóstico eléctrico y electrónico', 'Electrical and electronic diagnostics'],
    ['Optimización de líneas de producción', 'Production line optimization'],
    ['Reducción de consumo energético', 'Energy consumption reduction'],
    ['Mantenimiento preventivo', 'Preventive maintenance'],
    ['Mejora de procesos productivos', 'Productive process improvement'],
    ['Instalación y puesta a punto de maquinaria', 'Machinery installation and commissioning'],
    ['Capacitación técnica al personal', 'Technical training for staff'],
    ['Consultoría en eficiencia productiva', 'Production efficiency consulting'],
    ['Análisis de KPIs industriales', 'Industrial KPI analysis'],
  ];
  for (const [i, [labelEs, labelEn]] of services.entries()) {
    await prisma.service.upsert({
      where: { id: `service-${i}` },
      update: {},
      create: { id: `service-${i}`, labelEs, labelEn, order: i },
    });
  }

  // Projects
  const projects: [
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
  ][] = [
    [
      'BOPP',
      'Línea de producción',
      'Production line',
      'Reducción de consumo eléctrico en línea BOPP',
      'Electrical consumption reduction on BOPP line',
      'Línea Bruckner con desvíos en consumo y demanda de potencia fuera del óptimo de facturación.',
      'Bruckner line with consumption deviations and power demand outside the optimal billing range.',
      'Análisis de cargas, rediseño de tableros, ajuste de variadores y plan de demanda contratada.',
      'Load analysis, switchboard redesign, drive tuning and contracted demand plan.',
      'Reducción sostenida de costo eléctrico y mejora de factor de potencia.',
      'Sustained reduction of electrical cost and improved power factor.',
    ],
    [
      'TERMOFORMADO',
      'Mantenimiento integral',
      'Full maintenance',
      'Diagnóstico de fallas recurrentes en termoformadora Illig',
      'Recurrent fault diagnosis on Illig thermoformer',
      'Paradas no programadas por fallas eléctrico/electrónicas que afectaban OEE y calidad.',
      'Unplanned stops due to electrical/electronic faults affecting OEE and quality.',
      'Análisis raíz, reemplazo de componentes críticos, desarrollo de proveedores y stock de repuestos.',
      'Root cause analysis, replacement of critical components, supplier development and spare parts stock.',
      'Reducción significativa del MTTR y de paradas no planificadas.',
      'Significant reduction of MTTR and unplanned downtime.',
    ],
    [
      'METALIZADO',
      'Optimización de proceso',
      'Process optimization',
      'Mejora de tiempos de vacío · línea Galileo / BOBST',
      'Vacuum cycle improvement · Galileo / BOBST line',
      'Tiempos de vacío extendidos impactaban productividad y consumo energético del proceso.',
      'Extended vacuum times impacted productivity and energy consumption of the process.',
      'Auditoría de sellos y bombas, ajuste de secuencia eléctrica y soluciones alternativas de insumos.',
      'Seal and pump audit, electrical sequence tuning and alternative input solutions.',
      'Mejora de productividad por turno y reducción del consumo asociado al ciclo de vacío.',
      'Productivity gain per shift and reduced consumption tied to the vacuum cycle.',
    ],
    [
      'SLITTER',
      'Puesta a punto',
      'Refurbishment',
      'Reacondicionamiento de cortadoras Atlas / Kampf',
      'Atlas / Kampf slitter refurbishment',
      'Líneas con desgaste eléctrico/electrónico y procedimientos de operación poco estandarizados.',
      'Lines with electrical/electronic wear and weakly standardized operating procedures.',
      'Mantenimiento integral, planos eléctricos actualizados, capacitación operativa y planillas de control.',
      'Full maintenance, updated electrical drawings, operator training and control sheets.',
      'Estabilidad operativa, mejora de calidad de bobina y trazabilidad del proceso.',
      'Operational stability, better reel quality and process traceability.',
    ],
    [
      'EXTRUSIÓN PP',
      'Eficiencia productiva',
      'Production efficiency',
      'Mejora de eficiencia y calidad en extrusoras Battenfeld',
      'Efficiency and quality improvement on Battenfeld extruders',
      'Variabilidad de producto y consumo energético elevado en línea de PP.',
      'Product variability and high energy consumption on the PP line.',
      'Diagnóstico eléctrico, ajuste de control de proceso y desarrollo de KPIs de seguimiento diario.',
      'Electrical diagnosis, process control tuning and daily KPI tracking development.',
      'Reducción de scrap, mayor estabilidad de producto y bajada de costo unitario.',
      'Scrap reduction, better product stability and lower unit cost.',
    ],
    [
      'BOLSAS · GLOBO',
      'Instalación llave en mano',
      'Turnkey commissioning',
      'Puesta a punto de línea china de bolsas tipo camiseta',
      'Commissioning of Chinese T-shirt bag line',
      'Línea importada sin documentación técnica ni puesta en servicio formal.',
      'Imported line without technical documentation or formal commissioning.',
      'Instalación, planos eléctricos / neumáticos / hidráulicos, capacitación al operador y planillas de producción.',
      'Installation, electrical / pneumatic / hydraulic drawings, operator training and production sheets.',
      'Línea operativa con procedimientos claros, repuestos identificados y producción estabilizada.',
      'Operational line with clear procedures, identified spares and stabilized output.',
    ],
  ];
  for (const [
    i,
    [
      tag,
      periodEs,
      periodEn,
      titleEs,
      titleEn,
      challengeEs,
      challengeEn,
      interventionEs,
      interventionEn,
      outcomeEs,
      outcomeEn,
    ],
  ] of projects.entries()) {
    await prisma.project.upsert({
      where: { id: `project-${i}` },
      update: {},
      create: {
        id: `project-${i}`,
        tag,
        periodEs,
        periodEn,
        titleEs,
        titleEn,
        challengeEs,
        challengeEn,
        interventionEs,
        interventionEn,
        outcomeEs,
        outcomeEn,
        order: i,
      },
    });
  }

  // Results
  const results: [string, string, string, string][] = [
    ['Costos energéticos', 'Energy costs', 'Reducidos', 'Reduced'],
    ['Productividad', 'Productivity', 'Aumentada', 'Increased'],
    ['Eficiencia productiva', 'Production efficiency', 'Mejorada', 'Improved'],
    ['Tiempo de paro', 'Downtime', 'Disminuido', 'Decreased'],
    ['Procesos productivos', 'Production processes', 'Optimizados', 'Optimized'],
    ['Calidad de producto', 'Product quality', 'Mejorada', 'Improved'],
    ['Diagnóstico de fallas', 'Fault diagnosis', 'Más rápido', 'Faster'],
    ['Estabilidad operativa', 'Operational stability', 'Reforzada', 'Strengthened'],
  ];
  for (const [i, [kEs, kEn, vEs, vEn]] of results.entries()) {
    await prisma.resultItem.upsert({
      where: { id: `result-${i}` },
      update: {},
      create: { id: `result-${i}`, kEs, kEn, vEs, vEn, order: i },
    });
  }

  // Testimonials
  const testimonials: [string, string, string, string, string, string][] = [
    [
      'Resolvió en una semana fallas eléctricas que arrastrábamos hace meses. Bajamos paradas no programadas y mejoró el clima del equipo de mantenimiento.',
      "He solved electrical faults in a week that we had been carrying for months. Unplanned stops dropped and the maintenance team's mood improved.",
      'Jefe de Mantenimiento',
      'Maintenance Lead',
      'Planta de envases flexibles · GBA',
      'Flexible packaging plant · Greater Buenos Aires',
    ],
    [
      'Lectura quirúrgica del proceso. Identificó dónde estábamos pagando de más en energía y armó un plan que pagamos en pocos meses.',
      'Surgical reading of the process. He found where we were overpaying for energy and built a plan that paid back in a few months.',
      'Director Técnico',
      'Technical Director',
      'Productora BOPP · Argentina',
      'BOPP producer · Argentina',
    ],
    [
      'Llegó, escuchó al operario y a mantenimiento, y propuso. Capacitó al equipo y dejó procedimientos escritos. Eso es valor real.',
      "He arrived, listened to the operator and to maintenance, and proposed. Trained the team and left written procedures. That's real value.",
      'Plant Manager',
      'Plant Manager',
      'Industria del packaging',
      'Packaging industry',
    ],
    [
      'Instalamos una línea china sin documentación. Carlos dejó planos eléctricos, neumáticos e hidráulicos completos y al operario formado.',
      'We installed a Chinese line with no documentation. Carlos delivered full electrical, pneumatic and hydraulic drawings and trained the operator.',
      'Gerente de Producción',
      'Production Manager',
      'Bolsas tipo camiseta · LATAM',
      'T-shirt bags · LATAM',
    ],
  ];
  for (const [
    i,
    [quoteEs, quoteEn, roleEs, roleEn, sectorEs, sectorEn],
  ] of testimonials.entries()) {
    await prisma.testimonial.upsert({
      where: { id: `testimonial-${i}` },
      update: {},
      create: {
        id: `testimonial-${i}`,
        quoteEs,
        quoteEn,
        roleEs,
        roleEn,
        sectorEs,
        sectorEn,
        order: i,
      },
    });
  }

  // Timeline
  const timeline: [string, string, string, string, string][] = [
    [
      '1990s',
      'Formación y arranque industrial',
      'Training and industrial start',
      'Ingreso a la industria como técnico electrónico de control. Primer contacto con extrusoras Dusemberry y Battenfeld.',
      'Joined the industry as electronic control technician. First contact with Dusemberry and Battenfeld extruders.',
    ],
    [
      '2000s',
      'Consolidación en termoformado y BOPP',
      'Thermoforming & BOPP consolidation',
      'Mantenimiento integral en termoformadoras Gabler, Illig, Kiefel y líneas DMT / Bruckner. Análisis de fallas recurrentes.',
      'Full maintenance on Gabler, Illig, Kiefel thermoformers and DMT / Bruckner lines. Recurrent fault analysis.',
    ],
    [
      '2010s',
      'Metalizado, slitter y eficiencia energética',
      'Metallization, slitters & energy',
      'Líneas Galileo, General Vacuum / BOBST. Cortadoras Goebel, Atlas, Kampf. Proyectos para reducir consumo eléctrico.',
      'Galileo, General Vacuum / BOBST lines. Goebel, Atlas, Kampf slitters. Projects to reduce electrical consumption.',
    ],
    [
      '2020s',
      'Consultoría y dirección técnica',
      'Consulting & technical direction',
      'Instalación y puesta a punto de líneas de producción. Desarrollo de KPIs, reportes de gestión y herramientas de control de costos.',
      'Installation and commissioning of production lines. KPI development, management reports and cost control tools.',
    ],
  ];
  for (const [i, [period, titleEs, titleEn, bodyEs, bodyEn]] of timeline.entries()) {
    await prisma.timelineItem.upsert({
      where: { id: `timeline-${i}` },
      update: {},
      create: { id: `timeline-${i}`, period, titleEs, titleEn, bodyEs, bodyEn, order: i },
    });
  }

  // FAQs
  const faqs: [string, string, string, string][] = [
    [
      '¿Atiende plantas in-situ o también remoto?',
      'Do you work on-site or remotely?',
      'Ambos. Para diagnóstico inicial y troubleshooting puntual trabajo remoto sobre planos, fotos y videollamada con el equipo. La intervención y puesta a punto se hace en planta.',
      'Both. For initial diagnosis and targeted troubleshooting I work remotely on drawings, photos and video calls with the team. Intervention and commissioning are done on-site.',
    ],
    [
      '¿Trabaja bajo NDA?',
      'Do you work under NDA?',
      'Sí. La confidencialidad sobre procesos productivos, proveedores y documentación técnica es estándar. Firmo el NDA que aporte la empresa o uno propio si prefieren.',
      "Yes. Confidentiality on production processes, suppliers and technical documentation is standard. I sign the company's NDA or my own if preferred.",
    ],
    [
      '¿Atiende plantas fuera de Argentina?',
      'Do you serve plants outside Argentina?',
      'Sí, para proyectos con alcance definido. He trabajado con líneas de origen europeo, asiático y latinoamericano. Los costos de viaje y estadía corren por la empresa contratante.',
      "Yes, for projects with a defined scope. I've worked with European, Asian and Latin American lines. Travel and accommodation costs are covered by the contracting company.",
    ],
    [
      '¿Cómo se cotiza un proyecto?',
      'How are projects priced?',
      'Tras una primera conversación sin costo, se hace un diagnóstico inicial y se cotiza por alcance + horas estimadas. Sin retainers obligatorios.',
      'After a first no-cost conversation, an initial diagnosis is done and pricing is built around scope + estimated hours. No mandatory retainers.',
    ],
    [
      '¿Qué información necesita para empezar?',
      'What information do you need to start?',
      'Marca y modelo de la maquinaria, descripción del problema o síntomas, planos eléctricos si están disponibles y un contacto técnico de planta. Con eso suelo dar una primera lectura en 24-48 hs.',
      'Machinery brand and model, description of the problem or symptoms, electrical drawings if available and a plant technical contact. With that I usually deliver an initial reading in 24-48 hs.',
    ],
    [
      '¿En qué industrias tiene experiencia probada?',
      'What industries do you have proven experience in?',
      'Termoformado, extrusión de polipropileno, líneas BOPP, metalizado, slitter / cortadoras de BOPP, líneas tipo globo para bolsas tipo camiseta y líneas de confección.',
      'Thermoforming, polypropylene extrusion, BOPP lines, metallization, BOPP slitters, blown film lines for T-shirt bags and bag confection lines.',
    ],
  ];
  for (const [i, [qEs, qEn, aEs, aEn]] of faqs.entries()) {
    await prisma.faqItem.upsert({
      where: { id: `faq-${i}` },
      update: {},
      create: { id: `faq-${i}`, qEs, qEn, aEs, aEn, order: i },
    });
  }

  // Section meta
  const sections: {
    slug: string;
    overlineEs?: string;
    overlineEn?: string;
    titleEs?: string;
    titleEn?: string;
    descEs?: string;
    descEn?: string;
    extra?: object;
  }[] = [
    {
      slug: 'brands',
      overlineEs: 'MAQUINARIA Y SISTEMAS',
      overlineEn: 'MACHINERY & SYSTEMS',
      titleEs: 'Marcas industriales con experiencia comprobada',
      titleEn: 'Industrial brands with proven hands-on experience',
      descEs:
        'Operación, mantenimiento, diagnóstico y puesta a punto en líneas y sistemas de los principales fabricantes mundiales.',
      descEn:
        "Operation, maintenance, troubleshooting and commissioning across lines and systems from the world's leading manufacturers.",
    },
    {
      slug: 'experience',
      overlineEs: 'EXPERIENCIA TÉCNICA',
      overlineEn: 'TECHNICAL EXPERIENCE',
      titleEs: 'Áreas de especialización',
      titleEn: 'Specialization areas',
      descEs:
        'Cobertura integral del ciclo productivo: desde la extrusión y el termoformado hasta el slitting, metalizado y la gestión energética de la planta.',
      descEn:
        'Full coverage of the production cycle: from extrusion and thermoforming to slitting, metallization and plant energy management.',
    },
    {
      slug: 'process',
      overlineEs: 'CÓMO TRABAJO',
      overlineEn: 'HOW I WORK',
      titleEs: 'Un método claro, planta a planta',
      titleEn: 'A clear method, plant by plant',
      descEs:
        'Cuatro etapas con entregables concretos en cada una. Sin promesas vagas: diagnóstico, plan, intervención y seguimiento.',
      descEn:
        'Four stages with concrete deliverables in each one. No vague promises: diagnosis, plan, intervention and follow-up.',
    },
    {
      slug: 'services',
      overlineEs: 'SERVICIOS DE CONSULTORÍA',
      overlineEn: 'CONSULTING SERVICES',
      titleEs: 'Asesoría industrial técnica de alto nivel',
      titleEn: 'Senior-level industrial technical advisory',
      descEs:
        'Servicios pensados para gerentes de planta, jefes de mantenimiento y directores técnicos que necesitan soluciones reales, no diagnósticos genéricos.',
      descEn:
        'Services designed for plant managers, maintenance leaders and technical directors who need real solutions, not generic diagnoses.',
    },
    {
      slug: 'projects',
      overlineEs: 'PROYECTOS · CASOS DE INTERVENCIÓN',
      overlineEn: 'PROJECTS · INTERVENTION CASES',
      titleEs: 'Casos representativos de intervención técnica',
      titleEn: 'Representative technical intervention cases',
      descEs:
        'Proyectos anonimizados que ilustran el tipo de intervención, alcance técnico y resultados cualitativos obtenidos en planta.',
      descEn:
        'Anonymized projects illustrating the type of intervention, technical scope and qualitative outcomes obtained on the plant floor.',
      extra: {
        disclaimer_es:
          '* Casos anonimizados por confidencialidad. Métricas detalladas disponibles bajo NDA.',
        disclaimer_en:
          '* Cases anonymized for confidentiality. Detailed metrics available under NDA.',
        cta_es: 'Discutir un caso similar',
        cta_en: 'Discuss a similar case',
        challenge_label_es: 'Desafío',
        challenge_label_en: 'Challenge',
        intervention_label_es: 'Intervención',
        intervention_label_en: 'Intervention',
        outcome_label_es: 'Resultado',
        outcome_label_en: 'Outcome',
      },
    },
    {
      slug: 'results',
      overlineEs: 'RESULTADOS Y VALOR',
      overlineEn: 'RESULTS & VALUE',
      titleEs: 'Impacto medible en planta',
      titleEn: 'Measurable impact on the plant',
      descEs:
        'Cada intervención apunta a uno o más indicadores duros del negocio: costo, tiempo, calidad y disponibilidad.',
      descEn:
        'Every intervention targets one or more hard business indicators: cost, time, quality and availability.',
    },
    {
      slug: 'testimonials',
      overlineEs: 'VOCES DE PLANTA',
      overlineEn: 'VOICES FROM THE PLANT',
      titleEs: 'Feedback de quienes operan la línea',
      titleEn: 'Feedback from those who run the line',
      descEs:
        'Testimonios anonimizados de plant managers, jefes de mantenimiento y directores técnicos con quienes he trabajado en planta.',
      descEn:
        "Anonymized testimonials from plant managers, maintenance leaders and technical directors I've worked with on the shop floor.",
      extra: {
        disclaimer_es:
          '* Testimonios parafraseados y anonimizados por confidencialidad. Referencias verificables disponibles bajo solicitud.',
        disclaimer_en:
          '* Testimonials paraphrased and anonymized for confidentiality. Verifiable references available on request.',
      },
    },
    {
      slug: 'timeline',
      overlineEs: 'TRAYECTORIA INDUSTRIAL',
      overlineEn: 'INDUSTRIAL CAREER',
      titleEs: 'Recorrido técnico, planta a planta',
      titleEn: 'Plant by plant, a technical journey',
      descEs:
        'Una carrera construida en piso de fábrica, frente a tableros, extrusoras, termoformadoras y líneas BOPP.',
      descEn:
        'A career built on the factory floor, in front of cabinets, extruders, thermoformers and BOPP lines.',
    },
    {
      slug: 'faq',
      overlineEs: 'PREGUNTAS FRECUENTES',
      overlineEn: 'FREQUENTLY ASKED',
      titleEs: 'Cómo es trabajar conmigo',
      titleEn: 'What working with me looks like',
      descEs:
        'Respuestas directas a las consultas más comunes de plant managers y directores técnicos antes de iniciar un proyecto.',
      descEn:
        'Direct answers to the most common questions from plant managers and technical directors before starting a project.',
    },
    {
      slug: 'contact',
      overlineEs: 'CONTACTO DIRECTO',
      overlineEn: 'DIRECT CONTACT',
      titleEs: 'Hablemos de tu planta.',
      titleEn: "Let's talk about your plant.",
      descEs:
        'Atiendo consultas técnicas, auditorías, troubleshooting y proyectos de optimización para industrias plásticas, BOPP y manufactura en general.',
      descEn:
        'I take technical inquiries, audits, troubleshooting and optimization projects for plastics, BOPP and general manufacturing industries.',
      extra: {
        form_name_es: 'Nombre y empresa',
        form_name_en: 'Name and company',
        form_email_es: 'Email corporativo',
        form_email_en: 'Corporate email',
        form_phone_es: 'Teléfono (opcional)',
        form_phone_en: 'Phone (optional)',
        form_message_es: 'Cuénteme sobre el proyecto, la planta o la consulta',
        form_message_en: 'Tell me about the project, plant or inquiry',
        form_submit_es: 'Enviar por WhatsApp',
        form_submit_en: 'Send via WhatsApp',
        form_note_es:
          'Al enviar, se abrirá WhatsApp con su consulta precargada y se guardará una copia para Carlos.',
        form_note_en:
          'On submit, WhatsApp will open with your inquiry pre-filled and a copy will be saved for Carlos.',
        form_success_es: '✓ Abriendo WhatsApp con su mensaje precargado…',
        form_success_en: '✓ Opening WhatsApp with your message pre-loaded…',
        form_validation_es: 'Por favor complete nombre, email y mensaje.',
        form_validation_en: 'Please fill in name, email and message.',
        wa_prefix_es: 'Hola Carlos, le escribo desde su sitio web.',
        wa_prefix_en: "Hi Carlos, I'm reaching out from your website.",
        direct_whatsapp_es: 'WhatsApp',
        direct_whatsapp_en: 'WhatsApp',
        direct_email_es: 'Email',
        direct_email_en: 'Email',
        direct_linkedin_es: 'LinkedIn',
        direct_linkedin_en: 'LinkedIn',
        direct_location_es: 'Buenos Aires, Argentina',
        direct_location_en: 'Buenos Aires, Argentina',
      },
    },
    {
      slug: 'hero',
      extra: {
        id_label: 'ID · 0001 / CAGG',
        location_label_es: 'BUENOS AIRES · AR',
        location_label_en: 'BUENOS AIRES · AR',
        est_label: 'EST. 30+ YR',
      },
    },
    {
      slug: 'footer',
      extra: {
        role_es: 'Ingeniero Electrónico de Control Industrial',
        role_en: 'Industrial Control Electronic Engineer',
        rights_es: 'Todos los derechos reservados.',
        rights_en: 'All rights reserved.',
        back_es: 'Volver arriba',
        back_en: 'Back to top',
        tag_es:
          'Consultoría industrial · Termoformado · Extrusión PP · BOPP · Metalizado · Eficiencia Energética',
        tag_en:
          'Industrial consulting · Thermoforming · PP extrusion · BOPP · Metallization · Energy efficiency',
      },
    },
    {
      slug: 'nav',
      extra: {
        experience_es: 'Experiencia',
        experience_en: 'Experience',
        process_es: 'Proceso',
        process_en: 'Process',
        services_es: 'Servicios',
        services_en: 'Services',
        projects_es: 'Proyectos',
        projects_en: 'Projects',
        testimonials_es: 'Voces',
        testimonials_en: 'Voices',
        faq_es: 'FAQ',
        faq_en: 'FAQ',
        contact_es: 'Contacto',
        contact_en: 'Contact',
        cta_es: 'Contactar',
        cta_en: 'Get in touch',
      },
    },
  ];
  for (const {
    slug,
    overlineEs,
    overlineEn,
    titleEs,
    titleEn,
    descEs,
    descEn,
    extra,
  } of sections) {
    await prisma.sectionMeta.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        overlineEs,
        overlineEn,
        titleEs,
        titleEn,
        descEs,
        descEn,
        extra: extra ?? {},
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
