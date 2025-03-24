import { ReactNode } from "react";
import { useColorMode } from '@docusaurus/theme-common';

export default function MadeWithSlint(): ReactNode {
    const { colorMode } = useColorMode();
    const isDarkTheme = colorMode === 'dark';
    return (
        <div className="made-with-slint">
            <a href="https://slint.dev" target="_blank">
                <img src={isDarkTheme ? '/img/MadeWithSlint-logo-dark.svg' : '/img/MadeWithSlint-logo-light.svg'} alt="Made with Slint" />
            </a>
        </div>
    );
}
