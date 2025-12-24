import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
    const res = await fetch(`https://api.mojang.com/minecraft/profile/lookup/${params.uuid}`);
    if (!res.ok) {
        return json({ error: 'Failed to fetch player name' }, { status: res.status });
    }

    const data = await res.json();
    return json({ name: data.name });
};
