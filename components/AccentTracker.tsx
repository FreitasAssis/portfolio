'use client';

import { useEffect } from 'react';

import { usePathname } from 'next/navigation';

/** Fatia da viewport que uma zona precisa cobrir para dominar a página. */
const MIN_COVERAGE = 0.35;

/**
 * Vantagem mínima para tomar o lugar do acento atual. Na home os dois cards
 * ficam lado a lado (§3.1) e cobrem quase exatamente a mesma área; sem margem,
 * ruído de subpixel trocaria o acento a cada quadro de scroll — piscada, que é
 * justamente o tipo de movimento que o §6.4 proíbe.
 */
const SWITCH_MARGIN = 0.05;

/**
 * Um degrau a cada 5% da área da zona. O esboço original usava
 * `[0, 0.35, 0.6, 1]`, o que deixa buracos grandes: uma zona mais alta que a
 * viewport nunca chega a 0.6 de razão de interseção e quase nunca receberia
 * callback no meio do scroll.
 */
const THRESHOLDS = Array.from({ length: 21 }, (_, i) => i / 20);

/**
 * Fatia da viewport coberta pela zona.
 *
 * NÃO usamos `entry.intersectionRatio`: ela é área visível / área da ZONA, então
 * uma página de case com 5x a altura da viewport fica presa em ~0.2 e nunca
 * passaria do limiar, mesmo ocupando a tela inteira. O sinal certo é o inverso —
 * quanto da tela aquela zona está ocupando.
 */
export function coverage(entry: IntersectionObserverEntry): number {
  if (!entry.isIntersecting) return 0;
  const root = entry.rootBounds;
  // rootBounds vem null quando o root é o viewport de um documento em iframe
  // cross-origin; a janela é a melhor aproximação disponível.
  const viewport = root ? root.width * root.height : window.innerWidth * window.innerHeight;
  if (viewport <= 0) return 0;
  const visible = entry.intersectionRect.width * entry.intersectionRect.height;
  return Math.min(visible / viewport, 1);
}

/**
 * Qual zona manda na página, ou `null` quando nenhuma domina — e aí a base
 * volta a ser neutra, que é o estado natural dela (§6.1).
 */
export function pickWinner(
  scores: ReadonlyMap<Element, number>,
  current: Element | null,
): Element | null {
  let best: Element | null = null;
  let bestScore = MIN_COVERAGE;
  for (const [el, score] of scores) {
    if (score > bestScore) {
      best = el;
      bestScore = score;
    }
  }
  if (best !== current && current !== null) {
    const currentScore = scores.get(current) ?? 0;
    if (currentScore >= MIN_COVERAGE && bestScore < currentScore + SWITCH_MARGIN) return current;
  }
  return best;
}

/**
 * Observa as `AccentZone` da página e propaga pro `<html>` o acento da que está
 * dominando a viewport, para que header, footer e fundo acompanhem (§6.1).
 * É o único momento orquestrado de movimento do site (§6.4).
 */
export function AccentTracker() {
  // O tracker é montado uma vez no layout raiz, e o App Router mantém o layout
  // raiz vivo em toda navegação de cliente — o efeito NÃO roda de novo sozinho.
  // Sem a rota na lista de dependências, da segunda página em diante o observer
  // ficaria apontando para zonas já removidas do DOM e a mecânica de acento
  // morreria em silêncio, sem erro no console. Travado em tests/unit/accent.test.tsx
  // ("re-escaneia ao navegar").
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;

    // O <html> passa a casar com [data-accent] no instante em que escrevemos
    // nele. Observar o próprio root faria a página se auto-eleger e travar no
    // acento anterior — daí o filtro.
    const zones = Array.from(document.querySelectorAll<HTMLElement>('[data-accent]')).filter(
      (el) => el !== root,
    );

    if (zones.length === 0) {
      // Página sem zona é página neutra: limpa o que sobrou da anterior.
      root.removeAttribute('data-accent');
      return;
    }

    // O jsdom não implementa IntersectionObserver; sem a guarda, qualquer teste
    // que renderize uma página com o tracker quebraria no mount.
    if (typeof IntersectionObserver === 'undefined') return;

    const scores = new Map<Element, number>();
    let current: Element | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) scores.set(entry.target, coverage(entry));
        const winner = pickWinner(scores, current);
        if (winner === current) return;
        current = winner;
        const accent = winner?.getAttribute('data-accent');
        if (accent) root.setAttribute('data-accent', accent);
        else root.removeAttribute('data-accent');
      },
      { threshold: THRESHOLDS },
    );

    zones.forEach((zone) => observer.observe(zone));

    return () => {
      observer.disconnect();
      // Sem isto o acento da página que está saindo fica grudado no <html>.
      root.removeAttribute('data-accent');
    };
  }, [pathname]);

  return null;
}
