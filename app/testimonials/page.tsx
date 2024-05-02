import Footer from "../components/footer/Footer";
import Header from "../components/header/Header";
import styles from './page.module.css';

const TestimonialsPage = () => {
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-10">
            <Header />
            <div className={`${styles.container} w-full max-w-5xl flex flex-col items-center`}>
                <h1 className="mb-5 text-2xl font-bold underline">Testimonials</h1>
                <p className="text-xl text-justify leading-relaxed">I am building this page.</p>
            </div>
            <Footer />
        </main>
    );
};

export default TestimonialsPage;