import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import { defaultLocale, locales } from '../i18n.json'

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
    title: 'STM32Tesseract',
    tagline: 'STM32Tesseract is a utility designed to seamlessly integrate STM32CubeMX-generated code with contemporary IDEs and build systems.',
    favicon: 'img/favicon.ico',

    url: 'https://stm32tesseract.alampy.com',
    baseUrl: '/',

    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',

    i18n: {
        defaultLocale,
        locales
    },

    presets: [
        [
            'classic',
            {
                docs: {
                    sidebarPath: './sidebars.ts',
                    editUrl: 'https://github.com/ArcticLampyrid/stm32tesseract-cloud/edit/main/frontend',
                    editLocalizedFiles: true,
                },
                theme: {
                    customCss: './src/css/custom.css',
                },
                blog: false
            } satisfies Preset.Options,
        ],
    ],

    themes: ['@easyops-cn/docusaurus-search-local'],

    themeConfig: {
        navbar: {
            title: 'STM32Tesseract',
            logo: {
                alt: 'STM32Tesseract Logo',
                src: 'img/logo.png',
            },
            items: [
                {
                    type: 'docSidebar',
                    sidebarId: 'docSidebar',
                    label: 'Docs',
                    position: 'left',
                },
                {
                    to: 'download',
                    label: 'Download',
                    position: 'left',
                },
                {
                    href: 'https://afdian.com/a/alampy',
                    label: 'Sponsor',
                    position: 'left',
                },
                {
                    type: 'localeDropdown',
                    position: 'right',
                },
                {
                    href: 'https://github.com/ArcticLampyrid/STM32Tesseract',
                    label: 'GitHub',
                    position: 'right',
                },
            ],
        },
        footer: {
            style: 'dark',
            copyright: `Copyright © 2023 ~ 2025 alampy.com.<br />Released under the BSD 3-Clause License.<br />Built with Docusaurus.`,
        },
        prism: {
            theme: prismThemes.github,
            darkTheme: prismThemes.dracula,
        },
    } satisfies Preset.ThemeConfig,
};

export default config;
