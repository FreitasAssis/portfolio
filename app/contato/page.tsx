import type { Metadata } from 'next';

import { ContactLinks } from '@/components/ContactLinks';
import { Container } from '@/components/Container';
import { Portrait } from '@/components/Portrait';
import { META } from '@/content/site';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({ meta: META.contato, path: '/contato' });

/**
 * Sem `<form>`, e há teste que falha se nascer um: o site é export estático, sem
 * onde receber um POST.
 */
export default function ContatoPage() {
  return (
    <>
      <Container className="pt-14">
        <h1 className="font-display text-2xl font-bold tracking-tight">Contato</h1>
        <p className="prose-measure mt-6 text-ink">Qualquer um destes canais chega em mim.</p>
      </Container>

      <Container className="pt-10">
        <div className="flex flex-wrap items-start gap-x-10 gap-y-6">
          <ContactLinks />
          <Portrait size="inline" />
        </div>
      </Container>
    </>
  );
}
