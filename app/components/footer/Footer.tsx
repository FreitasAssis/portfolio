import PageLink from "../PageLink";

const Footer = () => {
    return (
      <div className="mb-32 grid text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-4 lg:text-left">
        <PageLink path="/about" title="Sobre mim" subtitle="Um pouco mais sobre mim e minha trajetória até aqui."></PageLink>
        <PageLink path="/projects" title="Projetos" subtitle="Linha do tempo com meus principais trabalhos."></PageLink>
        <PageLink path="/testimonials" title="Depoimentos" subtitle="Na dúvida? Aqui algumas opiniões de quem me conhece."></PageLink>
        <PageLink path="/contact" title="Contato" subtitle="Gostou? Manda uma mensagem, respondo em 24h."></PageLink>
      </div>
    );
  };
  
  export default Footer;
  