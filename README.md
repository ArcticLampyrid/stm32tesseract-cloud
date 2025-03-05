# STM32Tesseract-Cloud
A serverless cloud for [STM32Tesseract](https://stm32tesseract.alampy.com/) that uses Cloudflare Workers, contains homepage, documentation and Campanula server.

## Stack
- [Cloudflare Workers](https://workers.cloudflare.com/) as serverless platform
- [Cloudflare KV](https://developers.cloudflare.com/kv/) as key-value storage
- [Hono](https://hono.dev/) as serverless backend framework
- [Docusaurus](https://docusaurus.io/) as content-driven frontend generator

## Development
```bash
echo "POW_SIGN_KEY=<your key>" > .dev.vars
pnpm install
pnpm run dev
```

## Deployment
```bash
pnpm run deploy
```

## Translation
> [!NOTE]   
> This project is community-driven and lacks professional translation. If you are a native speaker and want to help, please contribute!

Refer to [i18n - Docusaurus](https://docusaurus.io/docs/i18n/tutorial) for translation.

### Translate React Code
This project uses `<Translate>` and `translate()` for translating React code. All strings that need to be translated are wrapped in `<Translate>` and `translate()`.
```tsx
const A = <Translate id="hello">Hello</Translate>; // virtual DOM element
const B = translate({ id: 'hello', message: 'Hello' }); // string
```

Then, you can run the following command to extract translation strings:
```bash
pnpm run write-translations --locale $LOCALE
```

After that, just translate the strings in `frontend/i18n/$LOCALE/**/*.json`, and you're done!

### Translate MD/MDX Files
When translating MD/MDX files, copy the files to `frontend/i18n/$LOCALE/docusaurus-plugin-content-docs/current` and translate them.
```bash
cp -r frontend/docs/** frontend/i18n/$LOCALE/docusaurus-plugin-content-docs/current
```

### Add New Language
To add a new language, modify `i18n.json` and add the language to `locales` array. Then translate files following the steps above.

## License
STM32Tesseract is licensed under the [BSD 3-Clause License](./LICENSE.md).
