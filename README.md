# STM32Tesseract-Cloud
A serverless cloud for [STM32Tesseract](https://stm32tesseract.alampy.com/) that uses Cloudflare Workers, contains homepage, documentation and Campanula server.

## Stack
- [Cloudflare Workers](https://workers.cloudflare.com/) as serverless platform
- [Cloudflare KV](https://developers.cloudflare.com/kv/) as key-value storage
- [Hono](https://hono.dev/) as serverless backend framework
- [Docusaurus](https://docusaurus.io/) as content-driven frontend generator

## Development
```
echo "POW_SIGN_KEY=<your key>" > .dev.vars
pnpm install
pnpm run dev
```

## Deployment
```
pnpm run deploy
```

## License
STM32Tesseract is licensed under the [BSD 3-Clause License](./LICENSE.md).
