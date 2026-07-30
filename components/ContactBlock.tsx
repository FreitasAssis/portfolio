import { ContactLinks } from '@/components/ContactLinks';
import { Container } from '@/components/Container';

export function ContactBlock() {
  return (
    <Container as="section" className="py-16">
      <h2 className="font-display text-xl font-bold tracking-tight">Contato</h2>
      <div className="mt-8">
        <ContactLinks />
      </div>
    </Container>
  );
}
