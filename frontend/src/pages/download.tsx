import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import { sha1 } from 'js-sha1';

interface CampanulaPoWEntity {
    prefix: string;
    difficulty: number;
}

interface CampanulaAsset {
    name: string;
    download_url: string;
    pow: CampanulaPoWEntity | null | undefined;
}

interface CampanulaPkgInfo {
    name: string;
    version_name: string;
    version_code: string;
    assets: CampanulaAsset[];
}

const nonceAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

function solvePow(params: CampanulaPoWEntity): string {
    const difficulty = params.difficulty;
    let nonceIndex = [0];
    while (true) {
        const nonce = nonceIndex.map((index) => nonceAlphabet[index]).join('');
        const hash = sha1.create();
        hash.update(params.prefix);
        hash.update(nonce);
        const hashResult = hash.array();
        let nBits: number = 0;
        byte_loop: for (const byte of hashResult) {
            let byteValue = byte;
            for (let i = 0; i < 8; i++) {
                if ((byteValue & (0x80 >> i)) !== 0) {
                    break byte_loop;
                }
                nBits += 1;
            }
        }

        if (nBits >= difficulty) {
            return `${params.prefix}${nonce}`;
        }

        let carry = false;
        for (let i = 0; i < nonce.length; i++) {
            if (nonceIndex[i] >= nonceAlphabet.length - 1) {
                nonceIndex[i] = 0;
                carry = true;
            } else {
                nonceIndex[i] += 1;
                carry = false;
                break;
            }
        }
        if (carry) {
            nonceIndex.push(0);
        }
    }
}

export default function Download(): ReactNode {
    const { siteConfig } = useDocusaurusContext();
    const [pkgInfo, setPkgInfo] = useState<CampanulaPkgInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const response = await fetch('/campanula/v1/package/stm32tesseract', {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch files');
                }
                const data = await response.json();
                setPkgInfo(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFiles();
    }, []);


    const downloadFile = (elem: HTMLAnchorElement, asset: CampanulaAsset) => {
        if (!elem.href) {
            let url = asset.download_url;
            if (asset.pow) {
                const pow = solvePow(asset.pow);
                url += `?pow=${pow}`;
            }
            elem.href = url;
            elem.style.pointerEvents = null;
        }
    }

    return (
        <Layout
            title="Download"
            description={siteConfig.tagline}>
            <div className="container margin-vert--lg">
                <Heading as="h1">Download</Heading>
                {loading && <p>Loading files...</p>}
                {error && <p className="error">Error: {error}</p>}
                {!loading && !error && (
                    <>
                        <div>
                            <p>Download the latest version ({pkgInfo.version_name}) of STM32Tesseract below.</p>
                        </div>
                        <div className="file-list">
                            {pkgInfo.assets.length === 0 ? (
                                <p>No files available for download.</p>
                            ) : (
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Filename</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pkgInfo.assets.map((file, index) => (
                                            <tr key={index} className="file-item">
                                                <td className="file-name">{file.name}</td>
                                                <td>
                                                    <a className="button button--primary" download={file.name} onClick={(e) => { downloadFile(e.currentTarget, file); }}>
                                                        Download
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </>
                )}
            </div>
        </Layout>
    );
}
