"use client";
import { useState } from "react";
import Footer from "../components/footer/Footer";
import Header from "../components/header/Header";
import Icon from "../components/icon/Icon";
import styles from './page.module.css';
import Link from "next/link";

const ContactPage = () => {
    const [hover, setHover] = useState(false);
    const [showThanks, setShowThanks] = useState(false);

    const handleMouseEnter = () => {
        setHover(true);
    };

    const handleMouseLeave = () => {
        setHover(false);
    };

    const onSubmit = async (event: any) => {
        event.preventDefault();
        const form = event.target.closest('form');
        const formData = new FormData(form);
        const requestBody = {
            name: formData.get('name'),
            email: formData.get('email'),
            comment: formData.get('comment'),
            relation: formData.get('relation')
        }
        try {
            const response = await fetch(process.env.FORMSPREE_ENDPOINT!, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
    
            if (!response.ok) {
                throw new Error('Failed to submit the form');
            }
    
            const responseData = await response.json();
            setShowThanks(true);
        } catch (error: any) {
            console.error('Error:', error.message);
        }
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-10">
            <div className="flex flex-row w-full justify-around items-center">
                <Link href="/" className="hidden lg:block">
                    <Icon icon="/icons/general/home.svg" />
                </Link>
                <Header />
            </div>
            <div className={`${styles.container} w-full max-w-5xl flex flex-col items-center`}>
                <h1 className="mb-5 text-2xl font-bold underline">Contato</h1>
                <div className="flex flex-row items-center justify-center">
                    <a href="https://www.linkedin.com/in/luiz-dev/" target="_blank" className="mr-5">
                        <Icon icon="/icons/social/linkedin.webp" />
                    </a>
                    <a href="https://github.com/FreitasAssis" target="_blank">
                        <Icon icon="/icons/social/github.svg" />
                    </a>
                </div>
                <div className={`${showThanks ? 'flex' : 'hidden'} mt-10 text-2xl flex-col items-center`}>
                    <p className="mb-5 text-3xl">Obrigado!</p>
                    <p>Seu email foi enviado com sucesso!</p>
                    <p>Prometo responder em breve, no máximo 24h.</p>
                </div>
                <form className={`${!showThanks ? 'block' : 'hidden'} w-full lg:w-1/2`}>
                    <div className="space-y-12">
                        <div className="border-b border-gray-900/10">
                            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                <div className="col-span-full">
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
                            className="w-full flex justify-center rounded-md border border-gray-300 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-300 hover:text-gray-900"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            onClick={onSubmit}
                        >
                            <span className="mr-5">Enviar</span>
                            <Icon icon={`${hover ? '/icons/social/email_black.svg' : '/icons/social/email.svg'}`} animation="bounce" width={20} height={20} />
                        </button>
                    </div>
                </form>
            </div>
            <Footer />
        </main>
    );
};

export default ContactPage;