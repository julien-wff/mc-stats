import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

interface TextureData {
    timestamp: number;
    profileId: string;
    profileName: string;
    textures: {
        SKIN: {
            url: string;
        };
        CAPE?: {
            url: string;
        };
    };
}

function extractSkinUrl(value: string): string {
    const decoded = atob(value);
    const data: TextureData = JSON.parse(decoded);
    return data.textures.SKIN.url;
}

export const GET: RequestHandler = async ({ params }) => {
    const res = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${params.uuid}`);
    if (!res.ok) {
        return json({ error: 'Failed to fetch player name' }, { status: res.status });
    }

    const data = await res.json();

    let skinUrl: string | null = null;
    try {
        const properties = data.properties as Array<{ name: string; value: string }>;
        const textures = properties.find(prop => prop.name === 'textures');
        if (textures) {
            skinUrl = extractSkinUrl(textures.value);
        }
    } catch {}

    return json({ name: data.name, skinUrl });
};
