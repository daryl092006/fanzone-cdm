async function run() {
    try {
        const res = await fetch('https://worldcup26.ir/get/games');
        if (res.ok) {
            const data = await res.json();
            console.log("Keys:", Object.keys(data));
            if (data.games) {
                console.log("Games length:", data.games.length);
                console.log("Sample game:", data.games[0]);
            } else {
                console.log("Data:", JSON.stringify(data).slice(0, 1000));
            }
        }
    } catch (e) {
        console.log("Error:", e.message);
    }
}
run();
