/**
 * Experiência profissional, como dado tipado e texto curado. A fonte irmã é
 * `docs/cv/luiz-freitas.html`, e as duas contam a mesma história com as mesmas
 * palavras: editar um lado sem o outro é o erro que quem lê os dois percebe.
 *
 * Fora da timeline de propósito, e travado em teste: o estágio na Agga System
 * (3 meses, 2017, Delphi) e o de Engenharia Elétrica na SERT (2012–2014) — a
 * mesma decisão tomada no CV.
 */
export type Experience = {
  company: string;
  role: string;
  /** ISO ano-mês, "2023-03". Ordena lexicograficamente. */
  start: string;
  /** `null` = atual. */
  end: string | null;
  mode: string;
  /**
   * Etiqueta "em paralelo": sem ela, a sobreposição parece erro de data.
   * Obrigatória em toda posição que se sobrepõe a outra no tempo — o conjunto é
   * derivado de `start`/`end` em `tests/unit/experience.test.ts`, que também exige
   * que o texto NOMEIE cada contraparte.
   *
   * É `string` e não `string[]` porque o valor carrega o recorte de datas de cada
   * sobreposição ("de mar a dez/2021"), que uma lista de nomes jogaria fora.
   */
  parallel?: string;
  built: string;
  impact: string;
  stack: string[];
  /**
   * Liga Opah → Analytica: o fio contínuo. O marcador SINALIZA sobre o `impact`
   * das duas pontas, que já é texto curado — nunca uma frase paralela escrita à
   * mão. "A plataforma da Analytica nasceu na Opah IT" lê como se a Opah tivesse
   * sido só a Analytica, quando foram três projetos em times distintos.
   */
  thread?: 'plataforma-analytica';
};

/** Ordem cronológica decrescente, por data de início. Travado em teste. */
export const experience: readonly Experience[] = [
  {
    company: 'Analytica Ensino',
    role: 'Desenvolvedor Full Stack Sênior',
    start: '2023-03',
    end: null,
    mode: 'Remoto',
    built:
      'Plataforma educacional da rede pública do Paraná, em arquitetura de microsserviços. Atuo de back-end a mobile, num time de 6 desenvolvedores e 1 designer, todos full stack. Entrei como sênior de back-end.',
    impact:
      'Cerca de 400.000 usuários entre alunos, professores e gestores de escolas e núcleos escolares. Acompanho o produto desde a concepção — comecei nele ainda pela consultoria e fui convidado a integrar o time próprio do cliente. Sou a referência técnica a quem a gestão passa as demandas de maior complexidade e a quem os desenvolvedores pleno e júnior recorrem.',
    stack: [
      'TypeScript',
      'Node.js',
      'React',
      'React Native',
      'PostgreSQL',
      'microsserviços',
      'Docker',
      'AWS',
    ],
    thread: 'plataforma-analytica',
  },
  {
    company: 'Opah IT',
    role: 'Desenvolvedor Full Stack',
    start: '2021-09',
    end: '2023-03',
    mode: 'Remoto',
    parallel: 'Boomer, até dez/2021',
    built:
      'Consultoria em três projetos, cada um em um time distinto: sistema de gestão de condomínios em Node.js com integração à API de pagamentos do StarkBank; aplicativo bancário em React Native, com reconstrução da interface sobre o app existente e novas funcionalidades; e a concepção e o desenvolvimento da plataforma educacional da Analytica Ensino, em microsserviços.',
    impact:
      'O terceiro projeto é o mesmo em que sigo até hoje, já no time próprio do cliente. Ainda como pleno, já era o apoio dos desenvolvedores júnior em dúvidas e pair programming.',
    stack: [
      'Node.js',
      'TypeScript',
      'React',
      'React Native',
      'microsserviços',
      'integrações com APIs de terceiros',
    ],
    thread: 'plataforma-analytica',
  },
  {
    company: 'ez.devs',
    role: 'Desenvolvedor Full Stack',
    start: '2021-03',
    end: '2021-09',
    mode: 'Remoto',
    parallel: 'Boomer',
    built:
      'Outsourcing para três clientes em domínios distintos: integração com meios de pagamento da Mastercard na Neemo (Rails/MySQL); front-end para totens de autoatendimento em Vue.js; e integração com API de terceiros para monitoramento de frota de veículos na Firework.',
    impact: 'Três domínios e três times em sete meses, com entrega em cada um.',
    stack: ['Ruby on Rails', 'Vue.js / Nuxt', 'React', 'MySQL', 'Docker', 'Scrum'],
  },
  {
    company: 'Boomer',
    role: 'Desenvolvedor Full Stack',
    start: '2019-09',
    end: '2021-12',
    mode: 'Natal, RN',
    parallel: 'ez.devs e Opah IT, de mar a dez/2021',
    built:
      'Startup de cashback em compras de supermercado, com três sócios e um único desenvolvedor antes da minha entrada. Internalizei o aplicativo em React Native, até então mantido por fornecedor terceirizado, e assumi sua evolução. Atuei também na API em Ruby on Rails, na área administrativa e nas integrações com serviços de terceiros.',
    // Sem número de usuários, e há teste: a base era pequena e o número
    // enfraquece justamente onde o escopo fortalece.
    impact:
      'Integração com o Nota Potiguar, programa da Secretaria de Tributação do Rio Grande do Norte.',
    stack: ['React Native', 'Ruby on Rails', 'PostgreSQL', 'Sidekiq', 'Docker', 'Heroku', 'Scrum'],
  },
  {
    company: 'IFRN',
    role: 'Desenvolvedor Web (bolsista)',
    start: '2017-10',
    end: '2019-08',
    mode: 'Natal, RN',
    built:
      'Campus de Educação a Distância, em time de cerca de 10 pessoas entre front-end, back-end e design. Templates em Django alinhados ao design do time de UX/UI, e plugins e manutenção do Moodle usado pelos alunos da modalidade EAD do instituto.',
    impact:
      'Onde a carreira começou, e onde o Python/Django, o React e o Vue entraram pela primeira vez.',
    // `Git` aqui não contradiz o `LAYER_3_NEVER` de `content/tech.ts`: aquela regra
    // é sobre a vitrine de tecnologias do /sobre, e stack de posição é registro do
    // que foi usado. Tirá-lo daqui não quebra teste nenhum, e desalinha do CV.
    stack: ['Python', 'Django', 'React', 'Vue.js', 'Docker', 'Git', 'Scrum'],
  },
];
