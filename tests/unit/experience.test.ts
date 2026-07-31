import { describe, expect, it } from 'vitest';

import { type Experience, experience } from '@/content/experience';

/** Posição em aberto: qualquer data ISO real é menor que isto. */
const EM_ABERTO = '9999-99';

/**
 * Intervalo **semiaberto** `[start, end)`. O mês em que uma posição termina é o
 * mesmo em que a seguinte começa — tratar como fechado transformaria toda
 * transição de emprego numa sobreposição.
 */
function seSobrepoe(a: Experience, b: Experience): boolean {
  return a.start < (b.end ?? EM_ABERTO) && b.start < (a.end ?? EM_ABERTO);
}

const byCompany = (company: string): Experience =>
  experience.find((e) => e.company === company)!;

describe('timeline', () => {
  it('está em ordem cronológica decrescente', () => {
    const starts = experience.map((e) => e.start);
    expect([...starts].sort().reverse()).toEqual(starts);
  });

  it('rotula exatamente as posições que se sobrepõem no tempo', () => {
    // O invariante: o conjunto rotulado é DERIVADO das datas, não escrito à mão.
    // Mexer numa data sem mexer no rótulo (ou o contrário) quebra aqui.
    const sobrepostas = experience
      .filter((a) => experience.some((b) => b !== a && seSobrepoe(a, b)))
      .map((e) => e.company)
      .sort();
    const rotuladas = experience
      .filter((e) => e.parallel)
      .map((e) => e.company)
      .sort();

    expect(rotuladas).toEqual(sobrepostas);
    // Âncora contra derivação vazia: sem isto, `[] === []` passaria sozinho e o
    // teste viraria enfeite. Não é a asserção principal — é a prova de que a de
    // cima tem sobre o que falar.
    expect(sobrepostas).toEqual(['Boomer', 'Opah IT', 'ez.devs']);
  });

  it('o rótulo nomeia cada posição com que aquela correu em paralelo', () => {
    // Rotular sem dizer com quem só troca uma dúvida por outra. E impede que o
    // rótulo certo apareça na posição errada.
    for (const item of experience) {
      for (const outra of experience.filter((o) => o !== item && seSobrepoe(item, o))) {
        expect(item.parallel, `${item.company} → ${outra.company}`).toContain(outra.company);
      }
    }
  });

  it('passagem de bastão não é sobreposição', () => {
    // ez.devs termina em set/2021, quando a Opah começa; a Opah termina em
    // mar/2023, quando a Analytica começa. Se o intervalo fosse fechado, os dois
    // handoffs virariam "em paralelo" e o rótulo perderia o sentido justamente
    // onde a trajetória é mais limpa.
    expect(seSobrepoe(byCompany('ez.devs'), byCompany('Opah IT'))).toBe(false);
    expect(seSobrepoe(byCompany('Opah IT'), byCompany('Analytica Ensino'))).toBe(false);
    expect(byCompany('Analytica Ensino').parallel).toBeUndefined();
    expect(byCompany('IFRN').parallel).toBeUndefined();
  });

  it('marca o fio contínuo da plataforma nas duas posições', () => {
    const fio = experience.filter((e) => e.thread === 'plataforma-analytica');
    expect(fio.map((e) => e.company).sort()).toEqual(['Analytica Ensino', 'Opah IT']);
  });

  it('não expõe número de usuários da Boomer', () => {
    const boomer = experience.find((e) => e.company === 'Boomer')!;
    expect(`${boomer.built} ${boomer.impact}`).not.toMatch(/\d[\d.,]*\s*(usuários|mil)/i);
  });

  it('tem exatamente as cinco posições curadas', () => {
    expect(experience.map((e) => e.company)).toEqual([
      'Analytica Ensino',
      'Opah IT',
      'ez.devs',
      'Boomer',
      'IFRN',
    ]);
  });

  it('deixa de fora a Agga System e a SERT, de propósito', () => {
    const companies = experience.map((e) => e.company);
    expect(companies).not.toContain('Agga System');
    expect(companies).not.toContain('SERT');
  });

  it('carrega o que foi construído e o que mudou em cada posição', () => {
    for (const item of experience) {
      expect(item.built.length, item.company).toBeGreaterThan(80);
      expect(item.impact.length, item.company).toBeGreaterThan(40);
      expect(item.stack.length, item.company).toBeGreaterThan(0);
      expect(item.mode.length, item.company).toBeGreaterThan(0);
    }
  });

  it('usa datas ISO de ano-mês, com end null só na posição atual', () => {
    for (const item of experience) {
      expect(item.start, item.company).toMatch(/^\d{4}-\d{2}$/);
      if (item.end !== null) expect(item.end, item.company).toMatch(/^\d{4}-\d{2}$/);
    }
    expect(experience.filter((e) => e.end === null).map((e) => e.company)).toEqual([
      'Analytica Ensino',
    ]);
  });

  it('nenhuma posição termina antes de começar', () => {
    for (const item of experience) {
      // ISO ano-mês ordena lexicograficamente, então comparação de string basta.
      if (item.end !== null) expect(item.end > item.start, item.company).toBe(true);
    }
  });
});
