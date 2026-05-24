'use client';

import { useTranslations } from 'next-intl';

import { ArrowUp, Mail, MessageCircle } from 'lucide-react';

import { type ContactInfo } from './ContactDirect';

type FooterProps = {
  contact: ContactInfo;
  year: number;
};

export function Footer({ contact, year }: FooterProps) {
  const t = useTranslations('footer');

  return (
    <footer data-testid="site-footer" className="border-border bg-background border-t">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <div className="font-display text-foreground text-2xl tracking-tight uppercase lg:text-3xl">
              {contact.name}
            </div>
            <div className="text-muted-foreground mt-2 text-sm">{t('role')}</div>
            <p className="text-muted-foreground/60 text-overline tracking-overline mt-6 max-w-md font-mono leading-relaxed uppercase">
              {t('tag')}
            </p>
          </div>

          <div className="lg:col-span-3">
            <div className="text-muted-foreground/60 text-label tracking-label mb-4 font-mono uppercase">
              {t('contact_label')}
            </div>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href={`https://wa.me/${contact.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="footer-whatsapp"
                  className="text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
                >
                  <MessageCircle size={14} /> {contact.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${contact.email}`}
                  data-testid="footer-email"
                  className="text-muted-foreground hover:text-foreground flex items-center gap-2 break-all transition-colors"
                >
                  <Mail size={14} /> {contact.email.toLowerCase()}
                </a>
              </li>
              <li>
                <a
                  href={contact.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="footer-linkedin"
                  className="text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
                >
                  <MessageCircle size={14} /> {contact.name}
                </a>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3 lg:text-right">
            <a
              href="#top"
              data-testid="footer-back-to-top"
              className="border-border text-foreground hover:border-foreground inline-flex items-center gap-2 border-b pb-1 text-sm font-semibold transition-colors"
            >
              {t('back')} <ArrowUp size={14} />
            </a>
            <div className="text-muted-foreground/60 text-label tracking-label mt-6 font-mono uppercase">
              BUENOS AIRES · AR
            </div>
          </div>
        </div>

        <div className="border-border text-muted-foreground/60 text-overline tracking-overline mt-12 flex flex-col gap-3 border-t pt-6 font-mono uppercase sm:flex-row sm:items-center sm:justify-between">
          <div>
            © {year} C. A. GUERRA · {t('rights')}
          </div>
          <div>{t('site_version')}</div>
        </div>
      </div>
    </footer>
  );
}
