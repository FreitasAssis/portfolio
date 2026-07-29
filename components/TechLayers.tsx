import { LAYER_1, LAYER_2, LAYER_2_CAVEAT } from '@/content/tech';

/**
 * As camadas de tecnologia do §4.4, em **peso visual decrescente** — e a
 * decrescência é o conteúdo desta seção, não estilo. Ela diz sem escrever que
 * nem toda linha de currículo vale o mesmo.
 *
 * Como o peso cai, em quatro eixos e nenhum deles cor (§9 pede que nada dependa
 * só de cor):
 *
 * |            | camada 1                  | camada 2                     |
 * |------------|---------------------------|------------------------------|
 * | forma      | itens em caixa, um a um   | uma frase corrida            |
 * | tamanho    | `text-sm`                 | `text-xs`                    |
 * | tinta      | `text-ink`                | `text-ink-2`                 |
 * | rótulo     | afirmação em `text-ink`   | rótulo dentro do parágrafo   |
 *
 * **Sem ícone colorido em nenhuma delas.** O §4.4 é explícito ("texto e
 * tipografia bastam, e ficam melhor") e o §6.5 já limita o site a duas fontes de
 * imagem — logotipo de linguagem não é nenhuma das duas. Não acrescente SVG
 * aqui; `tests/unit/sobre.test.tsx` falha se aparecer.
 *
 * **A camada 3 não existe neste arquivo.** HTML, CSS, Git e Bootstrap foram
 * removidos do site — "é como um chef listar 'sei usar faca'". Também travado
 * em teste, porque a tentação de "completar a lista" é a mais barata que existe.
 */
export function TechLayers() {
  return (
    <section className="pt-16">
      <h2 className="font-display text-xl font-bold tracking-tight">Tecnologia</h2>

      {/* Camada 1 — "uso hoje e defendo em profundidade". O destaque do §4.4. */}
      <p className="mt-6 text-sm text-ink">Uso hoje e defendo em profundidade:</p>
      <ul className="mt-3 flex flex-wrap gap-2 font-mono text-sm">
        {LAYER_1.map((item) => (
          <li key={item} className="border border-rule px-3 py-1.5 text-ink">
            {item}
          </li>
        ))}
      </ul>

      {/* Camada 2 — "bloco secundário, menor, um parágrafo", com a frase de
          honestidade do §4.4 literal no fim.

          Sem `.prose-measure`: o token vale 68ch medidos no corpo de 18px, e
          este parágrafo é `text-xs`. A mesma caixa em fonte menor daria uns 76
          caracteres — acima do teto de 75 do §6.3, e os testes de medida têm
          teto além de piso. O limite aqui é declarado em `ch` sobre a fonte
          deste bloco, que é a conta certa para ele. */}
      <p className="mt-8 max-w-[62ch] text-xs leading-relaxed text-ink-2">
        <span className="font-mono">Já entreguei em produção:</span>{' '}
        {LAYER_2.join(', ')}. {LAYER_2_CAVEAT}
      </p>
    </section>
  );
}
