import Footer from "../components/footer/Footer";
import Header from "../components/header/Header";
import SkillIcon from "../components/skillIcon/SkillIcon";
import styles from './page.module.css';

const ProjectsPage = () => {
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-10">
            <Header />
            <div className={`${styles.container} w-full max-w-5xl flex flex-col items-center`}>
                <h1 className="mb-5 text-2xl font-bold underline">My projects</h1>
                <div className="flex flex-row items-center justify-center">
                    <a href="https://www.linkedin.com/in/luiz-dev/" target="_blank" className="mr-5">
                        <SkillIcon icon="/icons/social/linkedin.webp" />
                    </a>
                    <a href="https://github.com/FreitasAssis" target="_blank">
                        <SkillIcon icon="/icons/social/github.svg" />
                    </a>
                </div>
                <div className="mt-12">
                    <p className="text-xl text-justify leading-relaxed">I am building this page.</p>
                </div>
            </div>
            <Footer />
        </main>
    );
};

export default ProjectsPage;