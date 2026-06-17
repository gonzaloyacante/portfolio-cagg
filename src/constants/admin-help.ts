/**
 * Single source of truth for "where does this content appear in the
 * public site?" — used by PageHeader, SectionHelp and FieldHelp to give
 * the admin clear, plain-language context for every field.
 *
 * Each entry has:
 *  - title: human-readable name of the public section
 *  - description: short explanation of what the section is for
 *  - url: anchor (or full path) to the public site section
 *  - fieldHelp: detailed plain-language description for FieldHelp
 */

export type SectionHelpEntry = {
  title: string;
  description: string;
  /** Path to the public landing (locale-prefixed) */
  url: string;
  /** Detailed plain-language description shown in the admin form */
  fieldHelp: string;
  /** Optional tips shown as a bulleted list */
  tips?: string[];
  /** Per-field descriptions */
  fields?: Record<string, { description: string; tips?: string[]; appearsIn?: string }>;
};

export const SECTION_HELP: Record<string, SectionHelpEntry> = {
  hero: {
    title: 'Sección principal de la landing (Hero)',
    description:
      'Lo primero que ve alguien cuando entra a tu sitio. Aparece arriba de todo, antes de hacer scroll.',
    url: '/#top',
    fieldHelp:
      'Acá definís todo lo que se ve cuando alguien entra a la página. El nombre, el titular, el resumen, los tres botones de contacto, las estadísticas y la foto de portada. Cada cambio que hagas acá se refleja arriba de todo en la página principal.',
    tips: [
      'Mantené el titular corto (hasta 12 palabras) para que entre bien en una sola línea en pantallas grandes.',
      'La foto de portada es opcional — si no la subís, la sección se centra sin imagen.',
      'Las tres estadísticas son números cortos (ej: 15+, 50, 8) más una etiqueta corta en cada idioma.',
    ],
    fields: {
      overline: {
        description:
          'Una etiqueta chiquita arriba del nombre. Sirve para identificar tu rol o especialidad.',
        tips: ['Ejemplos: "Diseñador industrial", "Ingeniero mecánico", "Consultor de producto".'],
        appearsIn: 'Esquina superior izquierda del Hero, arriba del nombre.',
      },
      name: {
        description: 'Tu nombre completo. Se muestra grande en el Hero.',
        appearsIn: 'Bloque principal del Hero, en mayúsculas, en la tipografía display.',
      },
      headline: {
        description:
          'La frase principal de la sección. Es lo que la gente lee después de tu nombre. Tiene que enganchar en una línea.',
        tips: [
          'Evitá frases genéricas como "Bienvenido". Mejor: "Diseño productos que se fabrican en serie".',
          'Mantenelo entre 6 y 14 palabras para que no se corte.',
        ],
        appearsIn: 'Debajo del nombre, en tamaño grande.',
      },
      summary: {
        description:
          'Dos o tres frases que cuentan quién sos, qué hacés y por qué te importa. Es la versión "extendida" del titular.',
        tips: [
          'Escribilo en segunda persona cuando puedas: "Te ayudo a..."',
          '3 frases como máximo. Si necesitás más, mové el contenido a la sección "Sobre mí" más adelante.',
        ],
        appearsIn: 'Debajo del titular, en un párrafo más largo.',
      },
      ctaWhatsapp: {
        description: 'El texto del botón verde de WhatsApp.',
        tips: ['Que sea claro y motive la acción: "Hablemos por WhatsApp" mejor que "WhatsApp".'],
        appearsIn:
          'Hero (esquina derecha o abajo del resumen). Si el Hero no muestra botones, aparecen en la sección de Contacto.',
      },
      ctaEmail: {
        description: 'El texto del botón de email.',
        appearsIn: 'Hero y sección de Contacto.',
      },
      ctaLinkedin: {
        description: 'El texto del botón de LinkedIn.',
        appearsIn: 'Hero y sección de Contacto.',
      },
      portraitUrl: {
        description:
          'Tu foto de portada. Se muestra en el Hero, al lado del nombre y titular. Si no la subís, el Hero se centra sin imagen.',
        tips: [
          'Formato recomendado: JPG o WebP, mínimo 800×1067px (3:4 vertical).',
          'Evitá selfies con flash — mejor una foto con luz natural y fondo limpio.',
          'Tamaño máximo 10 MB. Se comprime automáticamente al subir.',
        ],
        appearsIn:
          'Hero, columna derecha (escritorio) o debajo del titular (mobile). Marco con nombre y origen.',
      },
      stats: {
        description:
          'Métricas o números clave que se muestran abajo del titular. Tres es un buen número.',
        tips: [
          'Cada stat tiene un valor (ej: 15+), una etiqueta en español y otra en inglés.',
          'Usá números que importen: años de experiencia, proyectos entregados, clientes, etc.',
        ],
        appearsIn: 'Debajo del titular y el resumen, en una fila horizontal.',
      },
    },
  },
  contactInfo: {
    title: 'Datos de contacto',
    description:
      'Tu nombre, email, teléfono, WhatsApp y LinkedIn. Se muestran en el header, el footer y la sección de contacto.',
    url: '/#contact',
    fieldHelp:
      'Toda tu información de contacto en un solo lugar. Cuando la edites, se actualiza automáticamente en el header, el footer, la sección de Contacto, y el botón flotante de WhatsApp.',
    tips: [
      'El número de WhatsApp tiene que estar en formato internacional sin espacios ni símbolos: 5491155555555.',
      'El LinkedIn URL tiene que ser la URL completa (empieza con https://).',
      'El Handle de LinkedIn es el @usuario, no la URL.',
    ],
    fields: {
      name: {
        description: 'Tu nombre completo tal como querés que aparezca en la página.',
        appearsIn: 'Header, footer y sección de Contacto.',
      },
      phoneDisplay: {
        description:
          'Cómo querés que se vea el teléfono en el sitio (con espacios, guiones, código de país, etc.).',
        tips: ['Ejemplo: "+54 9 11 5555 5555" o "+1 (555) 123-4567".'],
        appearsIn: 'Footer y header (versión mobile).',
      },
      whatsappNumber: {
        description:
          'El número real al que abre WhatsApp al hacer click. Sin espacios, sin "+", con código de país.',
        tips: [
          'Para Argentina: 5491155555555 (549 = país + celular).',
          'Para España: 34612345678.',
          'No es lo mismo que "phoneDisplay" — este es el número técnico, el otro es el visual.',
        ],
        appearsIn: 'Botón flotante de WhatsApp, botón del Hero y sección de Contacto.',
      },
      email: {
        description: 'Tu email de contacto público.',
        appearsIn: 'Header, footer, sección de Contacto y botón de email del Hero.',
      },
      linkedinUrl: {
        description: 'La URL completa de tu perfil de LinkedIn.',
        tips: ['Copiá la URL desde la barra de direcciones de LinkedIn.'],
        appearsIn: 'Header, footer, sección de Contacto y botón de LinkedIn del Hero.',
      },
      linkedinHandle: {
        description: 'Tu usuario de LinkedIn (lo que va después de la @).',
        appearsIn: 'Display text del link de LinkedIn (no la URL).',
      },
      location: {
        description: 'Tu ciudad / país. Aparece como "basado en" en la sección de Contacto.',
        appearsIn: 'Sección de Contacto, debajo del email.',
      },
    },
  },
  brands: {
    title: 'Marcas y clientes',
    description:
      'Logos de las empresas con las que trabajaste. Se muestran en un marquee horizontal.',
    url: '/#brands',
    fieldHelp:
      'Acá cargás los nombres de las empresas y clientes con los que colaboraste. Los logos no se suben acá — eso va en la sección "Imágenes". Acá solo va el nombre.',
    tips: ['Ordená los más importantes primero.'],
    fields: {
      name: {
        description: 'El nombre de la marca o cliente tal como querés que aparezca en el marquee.',
        tips: [
          'Mantenelo corto: máximo 20 caracteres.',
          'Si tenés el logo en la galería, asegurate de que el nombre coincida exactamente.',
        ],
        appearsIn:
          'Marquee horizontal en la landing, debajo del Hero. Pasa de derecha a izquierda en loop infinito.',
      },
    },
  },
  experience: {
    title: 'Experiencia profesional',
    description:
      'Bloques de experiencia laboral. Se muestran como tarjetas en la sección "Experiencia".',
    url: '/#experience',
    fieldHelp:
      'Cada item es un puesto o rol profesional importante. Se muestra como tarjeta con código, título y descripción.',
    fields: {
      code: {
        description:
          'Un código corto para identificar este item. Aparece como etiqueta arriba del título.',
        tips: ['Ejemplos: "01", "A1", "EXP-2024".', 'Tiene que ser único entre todos los items.'],
        appearsIn: 'Esquina superior izquierda de la tarjeta.',
      },
      title: {
        description: 'El título del puesto o experiencia.',
        tips: ['"Diseñador Senior", "Founder & Lead Designer", etc.'],
        appearsIn: 'Título de la tarjeta, en tipografía display.',
      },
      body: {
        description: 'La descripción del rol: qué hiciste, qué aprendiste, qué impactaste.',
        tips: ['2 a 4 frases. Es la versión detallada del título.'],
        appearsIn: 'Cuerpo principal de la tarjeta.',
      },
    },
  },
  process: {
    title: 'Pasos del proceso de trabajo',
    description: 'Los pasos de tu proceso. Se muestran numerados en la sección "Proceso".',
    url: '/#process',
    fieldHelp:
      'Cada item es un paso de tu proceso de trabajo. Aparecen numerados en la sección "Proceso".',
    fields: {
      code: {
        description: 'El número del paso (1, 2, 3, 4…) o un código corto.',
        appearsIn: 'Esquina superior izquierda de cada paso.',
      },
      title: {
        description: 'El nombre del paso (ej: "Descubrimiento", "Prototipado", "Entrega").',
        appearsIn: 'Título del paso.',
      },
      body: {
        description: 'Qué hacés en este paso, qué herramientas usás, qué entregás.',
        appearsIn: 'Cuerpo principal del paso.',
      },
      deliverable: {
        description: 'Qué entregable concreto sale de este paso.',
        tips: ['"Reporte de hallazgos", "Prototipo interactivo", "Plan de producción".'],
        appearsIn: 'Chip al pie del paso, destacado.',
      },
    },
  },
  services: {
    title: 'Servicios que ofrecés',
    description:
      'Una lista corta de servicios. Se muestran como bullets en la sección "Servicios".',
    url: '/#services',
    fieldHelp: 'Cada item es un servicio individual que ofrecés. Aparecen como bullets.',
    fields: {
      label: {
        description: 'El nombre del servicio.',
        tips: [
          'Mantenelo corto: "Diseño industrial", "Consultoría de producto", "Prototipado rápido".',
        ],
        appearsIn: 'Lista de bullets en la sección "Servicios".',
      },
    },
  },
  projects: {
    title: 'Proyectos destacados',
    description: 'Casos de proyecto con desafío, intervención y resultado. Sección "Proyectos".',
    url: '/#projects',
    fieldHelp:
      'Cada item es un proyecto o caso de éxito. Aparece como tarjeta con tag, período, título, desafío, lo que hiciste y el resultado.',
    fields: {
      tag: {
        description: 'Una etiqueta corta para categorizar el proyecto.',
        tips: ['"Industrial", "Consumer", "Medical", "Automotive".'],
        appearsIn: 'Chip superior de la tarjeta.',
      },
      period: {
        description: 'Cuándo se hizo el proyecto (ej: "2023", "2022-2023", "Q1 2024").',
        appearsIn: 'Junto al tag, en la parte superior.',
      },
      title: {
        description: 'El nombre o título del proyecto.',
        appearsIn: 'Título principal de la tarjeta.',
      },
      challenge: {
        description: 'Cuál era el problema o el desafío que tenía el cliente.',
        tips: ['1 a 2 frases. Poné el contexto y el "por qué" del proyecto.'],
        appearsIn: 'Bloque "Desafío" dentro de la tarjeta.',
      },
      intervention: {
        description: 'Qué hiciste vos — el proceso, las decisiones, las herramientas.',
        appearsIn: 'Bloque "Intervención" dentro de la tarjeta.',
      },
      outcome: {
        description: 'Qué resultado concreto obtuvo el cliente (idealmente con números).',
        tips: ['"30% menos de tiempo de ensamblaje", "Premio XYZ 2023", "Lanzado en 6 mercados".'],
        appearsIn: 'Bloque "Resultado" dentro de la tarjeta.',
      },
    },
  },
  results: {
    title: 'Resultados / métricas',
    description: 'Números clave de tu carrera. Se muestran como tarjetas grandes en "Resultados".',
    url: '/#results',
    fieldHelp:
      'Cada item es una métrica o número importante. Aparece como tarjeta grande con valor y etiqueta.',
    fields: {
      k: {
        description: 'La etiqueta de la métrica (qué estás midiendo).',
        tips: ['"Años de experiencia", "Proyectos entregados", "Premios ganados".'],
        appearsIn: 'Etiqueta debajo del número grande.',
      },
      v: {
        description: 'El valor de la métrica (el número grande).',
        tips: [
          'Mantenelo corto: "15+", "50", "$2M".',
          'Si usás "+", "%" o "$", asegurate de que se vea bien en todos los tamaños.',
        ],
        appearsIn: 'Número grande, en tipografía display.',
      },
    },
  },
  testimonials: {
    title: 'Testimonios de clientes',
    description: 'Citas breves de clientes felices. Sección "Testimonios".',
    url: '/#testimonials',
    fieldHelp:
      'Cada item es un testimonio de un cliente. Aparece como cita con el rol y el sector de quien lo dijo.',
    fields: {
      quote: {
        description: 'La cita textual del cliente. Usá comillas para resaltarla.',
        tips: ['Mantenela corta: 1-3 frases.', 'Evitá lenguaje genérico, que sea específico.'],
        appearsIn: 'Cuerpo principal del testimonio, entre comillas.',
      },
      role: {
        description: 'El cargo / puesto de quien da el testimonio.',
        tips: ['"CEO de Acme", "Head of Product en X", "Founder".'],
        appearsIn: 'Debajo de la cita, en negrita.',
      },
      sector: {
        description: 'El sector o industria del cliente.',
        appearsIn: 'Debajo del rol, en gris.',
      },
    },
  },
  timeline: {
    title: 'Trayectoria / línea de tiempo',
    description: 'Hitos cronológicos de tu carrera. Sección "Trayectoria".',
    url: '/#timeline',
    fieldHelp:
      'Cada item es un hito cronológico. Aparece con su período, título y descripción, ordenado del más reciente al más antiguo.',
    fields: {
      period: {
        description: 'El período del hito (ej: "2020-2023", "Mar 2024", "2018").',
        appearsIn: 'Esquina superior de cada item, en monoespaciada.',
      },
      title: {
        description: 'El nombre del hito (ej: "Fundé Estudio X", "Premio Y", "Lanzamiento Z").',
        appearsIn: 'Título del item.',
      },
      body: {
        description: 'Una descripción breve de qué pasó en ese momento.',
        appearsIn: 'Cuerpo del item.',
      },
    },
  },
  faqs: {
    title: 'Preguntas frecuentes',
    description: 'Preguntas y respuestas que se muestran en la sección "FAQ".',
    url: '/#faq',
    fieldHelp:
      'Cada item es una pregunta frecuente con su respuesta. Aparece como accordion expandible.',
    fields: {
      q: {
        description: 'La pregunta. Empezá con mayúscula y terminá con "?".',
        appearsIn: 'Encabezado del item (clickeable para expandir).',
      },
      a: {
        description: 'La respuesta. 1-3 frases, en lenguaje claro.',
        appearsIn: 'Cuerpo del item cuando está expandido.',
      },
    },
  },
  sections: {
    title: 'Etiquetas de sección',
    description:
      'Personalizan los títulos, subtítulos y descripciones de cada sección de la landing.',
    url: '/',
    fieldHelp:
      'Cada sección de la landing tiene un eyebrow (etiqueta chiquita arriba), un título y una descripción. Acá los podés personalizar.',
    tips: [
      'El eyebrow es la etiqueta corta que aparece arriba del título (ej: "Servicios").',
      'El título es el encabezado principal de la sección.',
      'La descripción es un párrafo introductorio debajo del título.',
    ],
    fields: {
      overline: {
        description: 'La etiqueta chiquita arriba del título (eyebrow).',
        appearsIn: 'Esquina superior de cada sección de la landing.',
      },
      title: {
        description: 'El título principal de la sección.',
        appearsIn: 'Encabezado principal de la sección.',
      },
      desc: {
        description: 'La descripción o subtítulo debajo del título.',
        appearsIn: 'Párrafo introductorio de la sección.',
      },
    },
  },
  media: {
    title: 'Galería de imágenes',
    description: 'Acá subís todas las imágenes que usás en el sitio (fotos, logos, etc.).',
    url: '/',
    fieldHelp:
      'Esta es tu biblioteca de imágenes. Las imágenes que subís acá se guardan en la nube (Cloudinary) y quedan disponibles para usar en otras secciones (ej: la foto del Hero).',
    tips: [
      'Las imágenes que subís se guardan en Cloudinary (un servicio de hosting de imágenes).',
      'Tamaño máximo: 10 MB por imagen. Formatos: JPG, PNG, WebP, GIF, SVG.',
      'Una vez subidas, podés elegir cualquier imagen en otras secciones (ej: Hero) desde el selector de imágenes.',
    ],
  },
  emailSettings: {
    title: 'Notificaciones por email',
    description:
      'Configurá a qué email te llega un aviso cada vez que alguien te escribe desde el sitio.',
    url: '/admin',
    fieldHelp:
      'Acá configurás a qué email te llega un aviso cuando alguien completa el formulario de contacto del sitio público.',
    fields: {
      notificationsEnabled: {
        description:
          'Si está activo, recibís un email cada vez que alguien te escribe desde el sitio.',
        appearsIn: 'Afecta: emails que llegan a tu casilla.',
      },
      notificationEmail: {
        description:
          'A qué email te llega el aviso. Puede ser distinto al email público del sitio.',
        appearsIn: 'Campo "Para" de los emails automáticos que se envían.',
      },
    },
  },
  system: {
    title: 'Configuración del sitio',
    description: 'Opciones generales que controlan el comportamiento del sitio público.',
    url: '/',
    fieldHelp: 'Opciones globales del sitio.',
    fields: {
      acceptingProjects: {
        description:
          'Si está activo, tu sitio muestra que estás disponible para tomar nuevos clientes.',
        tips: ['Desactivá esto cuando estés muy ocupado o no quieras recibir consultas nuevas.'],
        appearsIn:
          'Sección de Contacto (muestra u oculta el mensaje de "disponible para nuevos proyectos").',
      },
    },
  },
  security: {
    title: 'Seguridad de la cuenta',
    description: 'Activá 2FA, cambiá la contraseña y revisá los dispositivos conectados.',
    url: '/admin',
    fieldHelp:
      'Todo lo relacionado a la seguridad de tu cuenta. Te recomendamos activar 2FA (autenticación de dos factores) cuanto antes.',
    fields: {
      twoFactor: {
        description:
          '2FA agrega un paso extra al login: además de la contraseña, necesitás un código de 6 dígitos de una app como Google Authenticator, 1Password o Authy.',
        tips: [
          'Hacé una captura de los códigos de respaldo cuando los veas. Son tu única forma de entrar si perdés el teléfono.',
        ],
        appearsIn: 'Afecta: el proceso de login en /admin/login.',
      },
    },
  },
  messages: {
    title: 'Buzón de mensajes',
    description: 'Acá llegan los mensajes que la gente te manda desde el formulario del sitio.',
    url: '/admin',
    fieldHelp:
      'Los mensajes se ordenan del más nuevo al más viejo. Podés marcarlos como leídos, expandirlos, copiarlos o eliminarlos.',
    tips: [
      'El ícono de la campana en el sidebar muestra cuántos mensajes sin leer tenés.',
      'Los mensajes llegan a la base de datos inmediatamente después de que alguien completa el formulario.',
    ],
  },
};

export function getSectionHelp(slug: string): SectionHelpEntry | undefined {
  return SECTION_HELP[slug];
}
