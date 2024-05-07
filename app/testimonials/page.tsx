"use client";
import Link from "next/link";
import Footer from "../components/footer/Footer";
import Header from "../components/header/Header";
import styles from './page.module.css';
import Icon from "../components/icon/Icon";
import { useEffect, useState } from "react";

export interface Testimonial {
    name: string;
    email: string;
    comment: string;
    relation: string;
}

const TestimonialsPage = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [showThanks, setShowThanks] = useState(false);
    
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
            setTestimonials([]);
            const response = await fetch(process.env.ADD_TESTIMONIAL_URL!, {
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
            setTestimonials(responseData.rows);
            setShowForm(false);
            setShowThanks(true);
        } catch (error: any) {
            console.error('Error:', error.message);
        }
    }

    const getTestimonials = async () => {
        try {
            setTestimonials([]);
            const response = await fetch(process.env.GET_TESTIMONIALS_URL!, {
                cache: 'no-store',
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'

                },
            });
    
            if (!response.ok) {
                throw new Error('Failed to submit the form');
            }
    
            const responseData = await response.json();
            setTestimonials(responseData.rows);
        } catch (error: any) {
            console.error('Error:', error.message);
        }
    }

    useEffect(() => {
        getTestimonials();
    }, []);

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-10">
            <div className="flex flex-row w-full justify-around items-center">
                <Link href="/" className="hidden lg:block">
                    <Icon icon="/icons/general/home.svg" />
                </Link>
                <Header />
            </div>
            <div className={`${styles.container} w-full max-w-5xl flex flex-col items-center`}>
                <h1 className="mb-5 text-2xl font-bold underline">Comentários</h1>
                <div className={`${styles.overflow} w-full flex flex-col items-center`}>
                    <form className={`${showForm ? 'block' : 'hidden'} w-full lg:w-1/2 mb-5`}>
                        <div className="space-y-12">
                            <div className="border-b border-gray-900/10">
                                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                    <div className="col-span-full">
                                        <label htmlFor="name" className="block text-sm font-medium leading-6">
                                            Nome
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                id="name"
                                                name="name"
                                                autoComplete="username"
                                                className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-900 placeholder:text-gray-900 focus:ring-2 focus:ring-inset focus:ring-gray-300 sm:text-sm sm:leading-6 text-gray-900"
                                                required
                                            />
                                        </div>
                                    </div>

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
                                        <label htmlFor="relation" className="block text-sm font-medium leading-6">
                                            Qual sua relação comigo? (Familiar, Amigo, Lider...)
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                id="relation"
                                                name="relation"
                                                className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-900 placeholder:text-gray-900 focus:ring-2 focus:ring-inset focus:ring-gray-300 sm:text-sm sm:leading-6 text-gray-900"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="col-span-full">
                                        <label htmlFor="about" className="block text-sm font-medium leading-6">
                                            Comentário
                                        </label>
                                        <div className="mt-2">
                                            <textarea
                                                id="comment"
                                                name="comment"
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
                                onClick={onSubmit}
                            >
                                <span className="mr-5">Comentar</span>
                            </button>
                        </div>
                    </form>
                    <div className={`${showThanks && !showForm ? 'flex' : 'hidden'} mb-5`}>
                        Obrigado! Seu comentário está aguardando aprovação e muito em breve estará por aqui
                    </div>
                    {testimonials && testimonials.length ? testimonials.map((testimonial: Testimonial, index) => (
                        <section className="bg-white dark:bg-gray-700 w-full mb-3"  key={index}>
                            <div className="text-center mx-auto px-4 py-4 lg:py-6 lg:px-6">
                                <figure className="max-w-screen-md mx-auto">
                                    <svg className="h-8 mx-auto mb-3 text-gray-400 dark:text-gray-600" viewBox="0 0 24 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M14.017 18L14.017 10.609C14.017 4.905 17.748 1.039 23 0L23.995 2.151C21.563 3.068 20 5.789 20 8H24V18H14.017ZM0 18V10.609C0 4.905 3.748 1.038 9 0L9.996 2.151C7.563 3.068 6 5.789 6 8H9.983L9.983 18L0 18Z" fill="currentColor"/>
                                    </svg> 
                                    <blockquote>
                                        <p className="text-xl font-medium text-gray-900 dark:text-white">{testimonial.comment}</p>
                                    </blockquote>
                                    <figcaption className="flex items-center justify-center mt-6 space-x-3">
                                        <div className="flex items-center divide-x-2 divide-gray-500 dark:divide-gray-700">
                                            <div className="pr-3 font-medium text-gray-900 dark:text-white">{testimonial.name}</div>
                                            <div className="pl-3 text-sm font-light text-gray-500 dark:text-gray-400">{testimonial.relation}</div>
                                        </div>
                                    </figcaption>
                                </figure>
                            </div>
                        </section>
                    )) :  <div className={`${styles.loader}`}></div> }
                    <div className={`${showForm ? 'hidden' : 'block'} w-full lg:w-1/2 mt-10 flex items-center justify-end gap-x-6`}>
                        <button
                            type="button"
                            className="w-full flex justify-center rounded-md border border-gray-600 py-2 text-sm font-semibold shadow-sm hover:bg-gray-800 hover:border-gray-800"
                            onClick={() => setShowForm(!showForm)}
                        >
                            <span className="px-5 py-2">Deixar comentário</span>
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
};

export default TestimonialsPage;