export interface PlayerProfileResponse {
    name: string;
    skinUrl: string | null;
}

export async function resolvePlayerProfile(uuid: string): Promise<PlayerProfileResponse> {
    const res = await fetch(`/api/player-names/${uuid}`);
    if (!res.ok) {
        throw new Error(`Failed to fetch player profile for UUID: ${uuid}`);
    }

    const data = (await res.json()) as PlayerProfileResponse;
    return {
        name: data.name,
        skinUrl: data.skinUrl ?? null,
    };
}

export async function resolvePlayerName(uuid: string): Promise<string> {
    const profile = await resolvePlayerProfile(uuid);
    return profile.name;
}
