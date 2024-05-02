"use client";
import React from 'react';
import Image from 'next/image'
import styles from './SkillIcon.module.css';

interface SkillIconProps {
    icon: string;
    width?: number;
    height?: number;
}

const SkillIcon: React.FC<SkillIconProps> = ({ icon, width=50, height=50 }) => (
    <Image src={icon} className={styles.icon} alt="icon" width={width} height={height} />
)

export default SkillIcon;
