import { describe, expect, it } from 'vitest';

import { experience } from '@/content/experience';

describe('timeline', () => {
  it('está em ordem cronológica decrescente', () => {
    const starts = experience.map((e) => e.start);
    expect([...starts].sort().reverse()).toEqual(starts);
  });

  it('rotula as duas posições em paralelo (§4.5)', () => {
    const paralelas = experience.filter((e) => e.parallel);
    expect(paralelas.map((e) => e.company).sort()).toEqual(['Boomer', 'ez.devs']);
  });

  it('marca o fio contínuo da plataforma nas duas posições', () => {
    const fio = experience.filter((e) => e.thread === 'plataforma-analytica');
    expect(fio.map((e) => e.company).sort()).toEqual(['Analytica Ensino', 'Opah IT']);
  });

  it('não expõe número de usuários da Boomer', () => {
    const boomer = experience.find((e) => e.company === 'Boomer')!;
    expect(`${boomer.built} ${boomer.impact}`).not.toMatch(/\d[\d.,]*\s*(usuários|mil)/i);
  });

  /* ----------------------------------------------------------------------- *
   * Os quatro acima vêm do plano. Os de baixo travam o resto do §4.5 que
   * também é fácil de perder numa edição distraída.
   * ----------------------------------------------------------------------- */

  it('tem exatamente as cinco posições do §4.5', () => {
    expect(experience.map((e) => e.company)).toEqual([
      'Analytica Ensino',
      'Opah IT',
      'ez.devs',
      'Boomer',
      'IFRN',
    ]);
  });

  it('deixa de fora a Agga System e a SERT, de propósito (§4.5)', () => {
    const companies = experience.map((e) => e.company);
    expect(companies).not.toContain('Agga System');
    expect(companies).not.toContain('SERT');
  });

  it('carrega o que foi construído e o que mudou em cada posição (§2)', () => {
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
