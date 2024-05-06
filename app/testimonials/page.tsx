import Link from "next/link";
import Footer from "../components/footer/Footer";
import Header from "../components/header/Header";
import styles from './page.module.css';
import Icon from "../components/icon/Icon";

const TestimonialsPage = () => {
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-10">
            <div className="flex flex-row w-full justify-around items-center">
                <Link href="/" className="hidden lg:block">
                    <Icon icon="/icons/general/home.svg" />
                </Link>
                <Header />
            </div>
            <div className={`${styles.container} w-full max-w-5xl flex flex-col items-center`}>
                <h1 className="mb-5 text-2xl font-bold underline">Testimonials</h1>
                <p className="text-xl text-justify leading-relaxed">I am building this page.</p>
            </div>
            <Footer />
        </main>
    );
};

export default TestimonialsPage;