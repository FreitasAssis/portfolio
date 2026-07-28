import { StrictMode } from 'react';

import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AccentTracker, coverage, pickWinner } from '@/components/AccentTracker';
import { AccentZone } from '@/components/AccentZone';

describe('AccentZone', () => {
  it('marca a região com o data-accent do projeto', () => {
    render(
      <AccentZone accent="asafe">
        <p>conteúdo</p>
      </AccentZone>,
    );
    expect(screen.getByText('conteúdo').closest('[data-accent]')).toHaveAttribute(
      'data-accent',
      'asafe',
    );
  });

  it('sem accent, não emite o atributo — a base permanece neutra', () => {
    render(
      <AccentZone>
        <p>neutro</p>
      </AccentZone>,
    );
    expect(screen.getByText('neutro').closest('[data-accent]')).toBeNull();
  });
});

/* ------------------------------------------------------------------------- *
 * A decisão do tracker é função pura da geometria que o browser entrega. Os
 * blocos abaixo testam essa função direto, com geometria sintética: é o único
 * jeito honesto de travá-la aqui, porque o jsdom não faz layout (todo
 * getBoundingClientRect é 0×0) nem implementa IntersectionObserver.
 *
 * NÃO é testável neste ambiente, e só se verifica em browser real:
 *   - se os thresholds disparam nos momentos certos durante o scroll;
 *   - a transição de 200ms e o desligamento dela por prefers-reduced-motion;
 *   - o comportamento visual com duas zonas lado a lado (a histerese abaixo é
 *     testada como regra, não como ausência de piscada na tela).
 * ------------------------------------------------------------------------- */

const VIEWPORT = { width: 1000, height: 1000 };

/** Entry sintética: `fraction` é a fatia da viewport que a zona cobre. */
function entryCovering(target: Element, fraction: number): IntersectionObserverEntry {
  return {
    target,
    isIntersecting: fraction > 0,
    intersectionRatio: fraction,
    intersectionRect: { width: VIEWPORT.width, height: VIEWPORT.height * fraction } as DOMRectReadOnly,
    rootBounds: VIEWPORT as DOMRectReadOnly,
    boundingClientRect: {} as DOMRectReadOnly,
    time: 0,
  };
}

describe('coverage — fatia da viewport coberta pela zona', () => {
  const el = document.createElement('div');

  it('zona fora da tela não cobre nada', () => {
    const out = { ...entryCovering(el, 0.8), isIntersecting: false };
    expect(coverage(out)).toBe(0);
  });

  it('metade da viewport vale 0.5', () => {
    expect(coverage(entryCovering(el, 0.5))).toBeCloseTo(0.5);
  });

  it('uma zona mais alta que a viewport cobre a viewport inteira', () => {
    // Este é o caso que a razão de interseção erra: uma página de case com 5x a
    // altura da viewport tem intersectionRatio ~0.2 e nunca passaria de 0.35.
    const tall: IntersectionObserverEntry = {
      ...entryCovering(el, 0.2),
      intersectionRect: { width: 1000, height: 1000 } as DOMRectReadOnly,
    };
    expect(coverage(tall)).toBe(1);
  });

  it('sem rootBounds, cai para o tamanho da janela', () => {
    const noRoot: IntersectionObserverEntry = {
      ...entryCovering(el, 0.5),
      rootBounds: null,
      intersectionRect: { width: window.innerWidth, height: window.innerHeight / 2 } as DOMRectReadOnly,
    };
    expect(coverage(noRoot)).toBeCloseTo(0.5);
  });
});

describe('pickWinner — qual zona domina a viewport', () => {
  const a = document.createElement('div');
  const b = document.createElement('div');

  it('ninguém acima do limiar: a página volta ao neutro', () => {
    expect(pickWinner(new Map([[a, 0.2]]), null)).toBeNull();
  });

  it('acima do limiar, a zona domina', () => {
    expect(pickWinner(new Map([[a, 0.9]]), null)).toBe(a);
  });

  it('com duas zonas na tela, vence a que cobre mais', () => {
    expect(
      pickWinner(
        new Map([
          [a, 0.4],
          [b, 0.8],
        ]),
        null,
      ),
    ).toBe(b);
  });

  it('empate técnico não troca o acento (histerese contra piscada)', () => {
    // Dois cards lado a lado na home cobrem quase a mesma área; ruído de
    // subpixel não pode ficar trocando a cor da página a cada scroll.
    const current = pickWinner(
      new Map([
        [a, 0.46],
        [b, 0.45],
      ]),
      null,
    );
    expect(current).toBe(a);
    expect(
      pickWinner(
        new Map([
          [a, 0.45],
          [b, 0.46],
        ]),
        current,
      ),
    ).toBe(a);
  });

  it('vantagem clara toma o lugar do acento atual', () => {
    expect(
      pickWinner(
        new Map([
          [a, 0.4],
          [b, 0.9],
        ]),
        a,
      ),
    ).toBe(b);
  });

  it('quando o dono da vez sai da tela, a página volta ao neutro', () => {
    expect(pickWinner(new Map([[a, 0.1]]), a)).toBeNull();
  });
});

/* --- fiação: o que o efeito observa e o que ele escreve no <html> ---------- */

class FakeIntersectionObserver implements IntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];

  readonly root = null;
  readonly rootMargin = '';
  readonly thresholds: readonly number[];
  readonly observed: Element[] = [];
  disconnected = false;
  private readonly callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
    this.thresholds = (options?.threshold as number[]) ?? [];
    FakeIntersectionObserver.instances.push(this);
  }

  observe(target: Element) {
    this.observed.push(target);
  }
  unobserve() {}
  disconnect() {
    this.disconnected = true;
  }
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
  /** Simula o browser chamando de volta com as entries dadas. */
  emit(entries: IntersectionObserverEntry[]) {
    this.callback(entries, this);
  }
}

const root = document.documentElement;
const lastObserver = () => FakeIntersectionObserver.instances.at(-1)!;

function renderZones(wrapper?: typeof StrictMode) {
  return render(
    <>
      <AccentZone accent="asafe">
        <p>asafe</p>
      </AccentZone>
      <AccentZone accent="eaifez">
        <p>eaifez</p>
      </AccentZone>
      <AccentTracker />
    </>,
    wrapper ? { wrapper } : undefined,
  );
}

describe('AccentTracker', () => {
  beforeEach(() => {
    FakeIntersectionObserver.instances = [];
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
    root.removeAttribute('data-accent');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    root.removeAttribute('data-accent');
  });

  it('observa as zonas da página e nunca o próprio <html>', () => {
    // O <html> passa a casar com [data-accent] assim que o tracker escreve nele.
    // Se ele entrasse na lista de observados, se elegeria sozinho e travaria a
    // página no acento anterior.
    root.setAttribute('data-accent', 'asafe');
    renderZones();

    const observed = lastObserver().observed;
    expect(observed).toHaveLength(2);
    expect(observed).not.toContain(root);
    expect(observed.map((el) => el.getAttribute('data-accent'))).toEqual(['asafe', 'eaifez']);
  });

  it('propaga pro <html> o acento da zona que domina', () => {
    renderZones();
    const [asafe, eaifez] = lastObserver().observed;

    lastObserver().emit([entryCovering(asafe, 0.9), entryCovering(eaifez, 0.1)]);
    expect(root.getAttribute('data-accent')).toBe('asafe');

    lastObserver().emit([entryCovering(asafe, 0.1), entryCovering(eaifez, 0.9)]);
    expect(root.getAttribute('data-accent')).toBe('eaifez');
  });

  it('sem zona dominante, o <html> volta a não ter acento', () => {
    renderZones();
    const [asafe, eaifez] = lastObserver().observed;

    lastObserver().emit([entryCovering(asafe, 0.9)]);
    expect(root.getAttribute('data-accent')).toBe('asafe');

    lastObserver().emit([entryCovering(asafe, 0.05), entryCovering(eaifez, 0)]);
    expect(root.hasAttribute('data-accent')).toBe(false);
  });

  it('ao desmontar, desconecta e devolve a base ao neutro', () => {
    const { unmount } = renderZones();
    const observer = lastObserver();
    observer.emit([entryCovering(observer.observed[0], 0.9)]);
    expect(root.getAttribute('data-accent')).toBe('asafe');

    unmount();
    expect(observer.disconnected).toBe(true);
    expect(root.hasAttribute('data-accent')).toBe(false);
  });

  it('página sem zonas limpa o acento que veio da página anterior', () => {
    root.setAttribute('data-accent', 'eaifez');
    render(<AccentTracker />);
    expect(root.hasAttribute('data-accent')).toBe(false);
    expect(FakeIntersectionObserver.instances).toHaveLength(0);
  });

  it('sobrevive ao mount duplo do StrictMode com um observer vivo', () => {
    renderZones(StrictMode);
    const live = lastObserver();
    expect(live.disconnected).toBe(false);
    for (const stale of FakeIntersectionObserver.instances.slice(0, -1)) {
      expect(stale.disconnected).toBe(true);
    }

    live.emit([entryCovering(live.observed[0], 0.9)]);
    expect(root.getAttribute('data-accent')).toBe('asafe');
  });
});
