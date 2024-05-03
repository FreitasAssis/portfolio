"use client";
import { useState } from "react";
import Footer from "../components/footer/Footer";
import Header from "../components/header/Header";
import SkillIcon from "../components/skillIcon/SkillIcon";
import styles from './page.module.css';

const ContactPage = () => {
    const [hover, setHover] = useState(false);

    const handleMouseEnter = () => {
        setHover(true);
    };

    const handleMouseLeave = () => {
        setHover(false);
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-10">
            <Header />
            <div className={`${styles.container} w-full max-w-5xl flex flex-col items-center`}>
                <h1 className="mb-5 text-2xl font-bold underline">Contato</h1>
                <div className="w-1/2 flex flex-row items-center mt-6 justify-around">
                    <a href="https://www.linkedin.com/in/luiz-dev/" target="_blank">
                        <SkillIcon icon="/icons/social/linkedin.webp" />
                    </a>
                    <a href="https://github.com/FreitasAssis" target="_blank">
                        <SkillIcon icon="/icons/social/github.svg" />
                    </a>
                </div>
                <form
                    action={process.env.FORMSPREE_ENDPOINT}
                    method="POST"
                >
                    <div className="space-y-12">
                        <div className="border-b border-gray-900/10">
                            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                <div className="sm:col-span-4">
                                <label htmlFor="email" className="block text-sm font-medium leading-6">
                                    Endereço de email
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-900 placeholder:text-gray-900 focus:ring-2 focus:ring-inset focus:ring-gray-300 sm:text-sm sm:leading-6 text-gray-900"
                                        required
                                    />
                                </div>
                                </div>

                                <div className="col-span-full">
                                    <label htmlFor="about" className="block text-sm font-medium leading-6">
                                        Mensagem
                                    </label>
                                    <div className="mt-2">
                                        <textarea
                                            id="about"
                                            name="about"
                                            rows={3}
                                            className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-900 placeholder:text-gray-900 focus:ring-2 focus:ring-inset focus:ring-gray-300 sm:text-sm sm:leading-6 text-gray-900"
                                            defaultValue={''}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-10 flex items-center justify-end gap-x-6">
                        <button
                            type="submit"
                            className="w-full flex justify-center rounded-md py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-300 hover:text-gray-900"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            <span className="mr-5">Enviar</span>
                            <SkillIcon icon={`${hover ? '/icons/social/email_black.svg' : '/icons/social/email.svg'}`} animation="bounce" width={20} height={20} />
                        </button>
                    </div>
                </form>
            </div>
            <Footer />
        </main>
    );
};

export default ContactPage;