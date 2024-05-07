import Link from "next/link";
import Footer from "../components/footer/Footer";
import Header from "../components/header/Header";
import Icon from "../components/icon/Icon";
import styles from './page.module.css';

const AboutPage = () => {
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-10">
            <div className="flex flex-row w-full justify-around items-center">
                <Link href="/" className="hidden lg:block">
                    <Icon icon="/icons/general/home.svg" />
                </Link>
                <Header />
            </div>
            <div className={`${styles.container} w-full max-w-5xl flex flex-col items-center`}>
                <h1 className="mb-5 text-2xl font-bold underline">Sobre mim</h1>
                <p className={`${styles.about} text-xl text-justify leading-relaxed`}>
                    Santista (nascido em Santos e torcedor do Peixe) e nordestino, moro em Natal/RN, casado e músico nas horas vagas.<br />
                    Apaixonado por desenvolvimento, especializado na criação de experiências digitais de alto desempenho.<br /><br />
                    Minha expertise abrange desde sites dinâmicos até robustos sistemas, passando por web apps e aplicativos nativos.<br />
                    Fluente em uma variedade de tecnologias essenciais, incluindo <span className="underline">HTML5, CSS3, JavaScript (React, React Native, VueJS), Typescript, Node.js, Ruby on Rails, Django</span>, e domino bancos de dados como <span className="underline">MySql, PostgreSQL, MongoDB e Firebase</span>.<br />
                    Uma grande característica minha é a constante busca por inovação e aprimoramento.<br />
                    Também tenho boa experiência com <span className="underline">Git, Docker e CI/CD</span>, garantindo práticas de desenvolvimento eficientes e colaborativas.<br />
                    <span className="underline">Microserviços, integração com APIs externas, AWS, GCP e Scrum</span> também fazem parte das minhas ferramentas.<br /><br />
                    Sempre animado em colaborar com projetos desafiadores e fazer parte de equipes visionárias.
                </p>
            </div>
            <Footer />
        </main>
    );
};

export default AboutPage;