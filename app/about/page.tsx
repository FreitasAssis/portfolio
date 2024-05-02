import Footer from "../components/footer/Footer";
import Header from "../components/header/Header";
import styles from './page.module.css';

const AboutPage = () => {
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-10">
            <Header />
            <div className={`${styles.container} w-full max-w-5xl flex flex-col items-center`}>
                <h1 className="mb-5 text-2xl font-bold underline">Sobre mim</h1>
                <p className="text-xl text-justify leading-relaxed">
                    Santista (nascido em Santos e torcedor do Peixe) e nordestino, moro em Natal/RN, casado e músico nas horas vagas.<br />
                    Apaixonado por desenvolvimento, especializado na criação de experiências digitais de alto desempenho.<br /><br />
                    Minha expertise abrange desde sites dinâmicos até robustos sistemas, passando por web apps e aplicativos nativos.<br />
                    Fluente em uma variedade de tecnologias essenciais, incluindo HTML5, CSS3, JavaScript (React, React Native, VueJS), Typescript, Node.js, Ruby on Rails, Django, e domino bancos de dados como MySql, PostgreSQL, MogoDB e Firebase.<br />
                    Uma grande característica minha é a constante busca por inovação e aprimoramento.<br />
                    Também tenho boa experiência com Git, Docker e CI/CD, garantindo práticas de desenvolvimento eficientes e colaborativas.<br />
                    Microserviços, integração com APIs externas, AWS e GCP e Scrum também fazem parte das minhas ferramentas.<br /><br />
                    Sempre animado em colaborar com projetos desafiadores e fazer parte de equipes visionárias.
                </p>
            </div>
            <Footer />
        </main>
    );
};

export default AboutPage;