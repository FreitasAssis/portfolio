'use client';

import { useEffect } from 'react';

import { usePathname } from 'next/navigation';

/**
 * Fatia da VIEWPORT que uma zona precisa cobrir para dominar a página — não um
 * `intersectionRatio`. Ver `coverage`.
 */
const MIN_COVERAGE = 0.35;

/**
 * Vantagem mínima para tomar o lugar do acento atual. Duas zonas que cobrem
 * quase a mesma área trocariam o acento a cada quadro de scroll por ruído de
 * subpixel, e piscada é movimento novo.
 */
const SWITCH_MARGIN = 0.05;

/**
 * Um degrau a cada 5%. Uma lista esparsa (`[0, 0.35, 0.6, 1]`) deixa buracos:
 * zona mais alta que a viewport nunca chega a 0.6 de razão de interseção e quase
 * não recebe callback no meio do scroll.
 */
const THRESHOLDS = Array.from({ length: 21 }, (_, i) => i / 20);

/**
 * Fatia da viewport coberta pela zona.
 *
 * NÃO é `entry.intersectionRatio`: aquele é área visível / área da ZONA, então
 * uma página de case com 5x a altura da viewport fica presa em ~0.2 e nunca passa
 * do limiar, mesmo ocupando a tela inteira.
 */
export function coverage(entry: IntersectionObserverEntry): number {
  if (!entry.isIntersecting) return 0;
  const root = entry.rootBounds;
  const viewport = root ? root.width * root.height : window.innerWidth * window.innerHeight;
  if (viewport <= 0) return 0;
  const visible = entry.intersectionRect.width * entry.intersectionRect.height;
  return Math.min(visible / viewport, 1);
}

/** Qual zona manda na página, ou `null` quando nenhuma domina. */
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
 * dominando a viewport, para que header, footer e fundo acompanhem.
 */
export function AccentTracker() {
  // A rota é dependência do efeito, e não decoração: o App Router mantém o
  // layout raiz vivo entre navegações, então sem ela o observer fica apontando
  // para zonas já removidas do DOM da segunda página em diante — o acento morre
  // sem erro no console.
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;

    // O filtro é obrigatório: o <html> passa a casar com [data-accent] no
    // instante em que escrevemos nele, e observar o root faria a página se
    // auto-eleger e travar no acento anterior.
    const zones = Array.from(document.querySelectorAll<HTMLElement>('[data-accent]')).filter(
      (el) => el !== root,
    );

    if (zones.length === 0) {
      root.removeAttribute('data-accent');
      return;
    }

    // O jsdom não implementa IntersectionObserver: sem esta guarda, qualquer
    // teste que renderize uma página com o tracker quebra no mount.
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
      root.removeAttribute('data-accent');
    };
  }, [pathname]);

  return null;
}
