import { Container } from '@/components/Container';

// Placeholder — a home real é a Task 4. O <main> agora vem do layout, então a
// página compõe só o conteúdo.
export default function Page() {
  return (
    <Container className="py-16">
      <h1 className="font-display text-2xl font-extrabold tracking-tight">placeholder</h1>
      <p className="prose-measure mt-4 text-ink-2">tokens, tema e layout base.</p>
    </Container>
  );
}
