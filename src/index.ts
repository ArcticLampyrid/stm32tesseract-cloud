import { Octokit, RestEndpointMethodTypes } from '@octokit/rest';
import { Hono } from 'hono'
import { proxy } from 'hono/proxy';
import { verifyPoW, generatePoWPrefix } from './pow';
const octokit = new Octokit();
const app = new Hono<{ Bindings: CloudflareBindings }>()

const getGHReleaseLatestWithCache = async (owner: string, repo: string, cache: KVNamespace): Promise<RestEndpointMethodTypes["repos"]["getLatestRelease"]["response"]["data"] | null> => {
    const cacheKey = `gh-release:${owner}/${repo}`;
    const cached = await cache.get(cacheKey, 'json');
    if (cached) {
        return cached as any;
    }
    const result = await octokit.repos.getLatestRelease({
        owner,
        repo
    });
    if (result.status !== 200) {
        return null;
    }
    await cache.put(cacheKey, JSON.stringify(result.data), {
        expirationTtl: 86400 // 1 day
    });
    return result.data;
}

interface PkgMapTarget {
    upstream: 'gh-release',
    owner: string
    repo: string
}

const pkgMap: {
    [key: string]: PkgMapTarget
} = {
    "stm32tesseract": {
        "upstream": "gh-release",
        "owner": "ArcticLampyrid",
        "repo": "stm32tesseract"
    },
    "arm-none-eabi-gcc-xpack": {
        "upstream": "gh-release",
        "owner": "xpack-dev-tools",
        "repo": "arm-none-eabi-gcc-xpack"
    },
    "cmake": {
        "upstream": "gh-release",
        "owner": "Kitware",
        "repo": "CMake"
    },
    "ninja": {
        "upstream": "gh-release",
        "owner": "ninja-build",
        "repo": "ninja"
    },
    "openocd": {
        "upstream": "gh-release",
        "owner": "openocd-org",
        "repo": "openocd"
    }
};
const pkgIndex = Object.keys(pkgMap).join('\n')

app.get('/campanula/v1/index', (c) => {
    return c.text(pkgIndex)
})

app.get('/campanula/v1/package/:pkg', async (c) => {
    const pkg = c.req.param('pkg')
    const pkgContent = pkgMap[pkg];
    if (!pkgContent) {
        return c.json({
            status: 404,
            error: `Package ${pkg} not found`
        }, 404)
    }
    let result: any = null;
    switch (pkgContent.upstream) {
        case 'gh-release':
            const ghResult = await getGHReleaseLatestWithCache(pkgContent.owner, pkgContent.repo, c.env.pkginfo);
            if (ghResult) {
                let assets = [];
                for (const asset of ghResult.assets) {
                    assets.push({
                        name: asset.name,
                        download_url: new URL(`../download/${pkg}/${ghResult.tag_name}/${asset.name}`, c.req.url).toString(),
                        pow: {
                            difficulty: c.env.POW_DIFFICULTY,
                            prefix: await generatePoWPrefix(c.env.POW_SIGN_KEY, pkg + '|' + ghResult.tag_name + '|' + asset.name)
                        }
                    })
                }
                result = {
                    name: pkg,
                    version_name: ghResult.tag_name,
                    version_code: ghResult.target_commitish,
                    assets
                }
            } else {
                result = {
                    status: 500,
                    error: `Failed to fetch package info ${pkg} from upstream 'gh-release'`
                }
            }
            break;
        default:
            result = {
                status: 500,
                error: `Invalid upstream ${pkgContent.upstream}`
            }
            break;
    }
    if (result?.status) {
        return c.json(result, result.status, {
            'Cache-Control': 'no-store',
        })
    }
    return c.json(result, 200, {
        'Cache-Control': 'public, max-age=600',
    })
})

app.all('/campanula/v1/download/:pkg/:version/:asset', async (c) => {
    const pkg = c.req.param('pkg')
    const version = c.req.param('version')
    const asset = c.req.param('asset')
    const pkgContent = pkgMap[pkg];
    if (!pkgContent) {
        return c.json({
            status: 404,
            error: `Package ${pkg} not found`
        }, 404)
    }
    const pow = c.req.query('pow');
    if (!pow) {
        return c.json({
            status: 400,
            error: 'PoW is required'
        }, 400)
    }
    const verified = await verifyPoW(c.env.POW_SIGN_KEY, c.env.POW_DIFFICULTY, pkg + '|' + version + '|' + asset, pow, c.env.replay_check);
    if (!verified.valid) {
        return c.json({
            status: 401,
            error: verified.message || 'PoW verification failed due to unknown reason'
        }, 401)
    }
    switch (pkgContent.upstream) {
        case 'gh-release':
            return proxy(`https://github.com/${pkgContent.owner}/${pkgContent.repo}/releases/download/${version}/${asset}`, {
                headers: {
                    ...c.req.header(),
                    Authorization: undefined,
                },
                cf: {
                    cacheTtl: 86400,
                }
            });
        default:
            return c.json({
                status: 500,
                error: `Invalid upstream ${pkgContent.upstream}`
            }, 500)
    }
})

export default app