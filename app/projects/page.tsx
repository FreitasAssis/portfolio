"use client";
import Footer from "../components/footer/Footer";
import Header from "../components/header/Header";
import SkillIcon from "../components/skillIcon/SkillIcon";
import styles from './page.module.css';
import projects from '../lib/projects';
import { useState } from "react";

export interface projectType {
    name: string,
    local: string,
    start: string,
    end: string,
    present: boolean,
    mode: string,
    description: string,
    stacks: string[]
}

const ProjectsPage = () => {
    const [detailedProject, setDetailedProject] = useState<null | number>(null);
    const [project, setProject] = useState<null | projectType>();

    const detail = (project: projectType, index: number) => {
        setDetailedProject(index);
        setProject(project);
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-10">
            <Header />
            <div className={`${styles.container} w-full max-w-5xl flex flex-col items-center`}>
                <h1 className="mb-5 text-2xl font-bold underline">Projetos</h1>
                <div className="flex flex-row items-center justify-center">
                    <a href="https://www.linkedin.com/in/luiz-dev/" target="_blank" className="mr-5">
                        <SkillIcon icon="/icons/social/linkedin.webp" />
                    </a>
                    <a href="https://github.com/FreitasAssis" target="_blank">
                        <SkillIcon icon="/icons/social/github.svg" />
                    </a>
                </div>
                <div className={`${styles.timeline} mt-12 flex flex-col`}>
                    <p className="block mb-5 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">Clique para mais detalhes</p>
                    <ol className="items-center sm:flex">
                        {projects.map((project, index) => (
                            <>
                                <li key={index} className="relative mb-6 sm:mb-0">
                                    <div className="flex items-center">
                                        <div className="z-10 flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full ring-0 ring-white dark:bg-blue-900 sm:ring-8 dark:ring-gray-900 shrink-0">
                                            <svg className="w-2.5 h-2.5 text-blue-800 dark:text-blue-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
                                            </svg>
                                        </div>
                                        <div className="hidden sm:flex w-full bg-gray-200 h-0.5 dark:bg-gray-700"></div>
                                    </div>
                                    <a href="#" className={`${detailedProject === index ? 'dark:bg-gray-700' : ''} block max-w-sm p-6 dark:hover:bg-gray-700`} onClick={() => detail(project, index)}>
                                        <div className="mt-3 sm:pe-8">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{ project.name }</h3>
                                            <time className="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">{project.start}</time>
                                            <time className="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">{ project.present ? 'atualmente' : project.end }</time>
                                            <p className="text-base font-normal text-gray-500 dark:text-gray-400">{ project.local }</p>
                                            <p className="text-base font-normal text-gray-500 dark:text-gray-400">{ project.mode }</p>
                                        </div>
                                    </a>
                                </li>
                            </>
                        ))}
                    </ol>
                    {
                        project ? <div className="w-full max-w-5xl flex flex-col mt-5">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Atividades:</h3>
                            <p className="text-base font-normal text-gray-500 dark:text-gray-400">{project.description}</p>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-5">Tecnologias / Métodos:</h3>
                            <p className="text-base font-normal text-gray-500 dark:text-gray-400">{project.stacks.toString().replaceAll(',', ', ')}</p>
                        </div> : <></>
                    }
                </div>
            </div>
            <Footer />
        </main>
    );
};

export default ProjectsPage;