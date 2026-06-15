async function run() {
    try {
        const res = await fetch('https://worldcup26.ir/get/games');
        if (res.ok) {
            const data = await res.json();
            const knockouts = data.games.filter(g => g.type !== 'group');
            console.log("Found knockouts:", knockouts.length);
            console.log("Sample knockout:", knockouts[0]);
        }
    } catch (e) {
        console.log("Error:", e.message);
    }
}
run();
