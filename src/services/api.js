export async function getHistory() {
    const response = await fetch('src/history.json');
    const data = await response.json();
    return data;
}

export async function getRealtime() {
    const response = await fetch('src/realtime.json');
    const data = await response.json();
    return data;
}