export async function resolvePlayerName(uuid: string): Promise<string> {
    const res = await fetch(`/api/player-names/${uuid}`);
    if (!res.ok) {
        throw new Error(`Failed to fetch player name for UUID: ${uuid}`);
    }

    const data = await res.json();
    return data.name;
}
