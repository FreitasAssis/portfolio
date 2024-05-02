import Footer from "../components/footer/Footer";
import Header from "../components/header/Header";
import styles from './page.module.css';

const AboutPage = () => {
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <Header />
            <div className={`${styles.container} w-full max-w-5xl flex flex-col items-center`}>
                <h1 className="mb-5 text-2xl font-bold">Sobre mim</h1>
                <p className="text-xl text-justify leading-relaxed">
                    Santista (nascido em Santos e torcedor do Peixe) e nordestino, moro em Natal/RN, casado e músico nas horas vagas.<br />
                    Apaixonado por desenvolvimento, especializado na criação de experiências digitais de alto desempenho.<br />
                    Minha expertise abrange desde sites dinâmicos até robustos sistemas, passando por web apps e aplicativos nativos.<br />
                    Fluente em uma variedade de tecnologias essenciais, incluindo HTML5, CSS3, JavaScript (React, React Native, VueJS), Node.js, Ruby on Rails, Django, e domino bancos de dados como MySql e PostgreSQL.<br />
                    Uma grande característica minha é a constante busca por inovação e aprimoramento.<br />
                    Também tenho boa experiência com Git e Docker, garantindo práticas de desenvolvimento eficientes e colaborativas.<br />
                    Microserviços, integração com APIs externas, AWS e GCP também fazem parte das minhas ferramentas.<br />
                    Sempre animado em colaborar com projetos desafiadores e fazer parte de equipes visionárias.
                </p>
            </div>
            <Footer />
        </main>
    );
};

export default AboutPage;