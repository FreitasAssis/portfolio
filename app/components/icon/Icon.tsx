"use client";
import React from 'react';
import Image from 'next/image'
import styles from './Icon.module.css';

interface IconProps {
    icon: string;
    width?: number;
    height?: number;
    animation?: string;
}

const Icon: React.FC<IconProps> = ({ icon, width = 50, height = 50, animation }) => {
    let iconClass = styles.icon;

    if (animation === 'rotate') {
        iconClass = styles.rotateIcon;
    } else if (animation === 'bounce') {
        iconClass = styles.bounceIcon;
    }

    return <Image src={icon} className={iconClass} alt="icon" width={width} height={height} />
}

export default Icon;
