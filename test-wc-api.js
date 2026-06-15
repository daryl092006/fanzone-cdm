async function run() {
    try {
        const res = await fetch('https://worldcup26.ir/get/games');
        console.log("Status:", res.status);
        if (res.ok) {
            const data = await res.json();
            console.log("Data sample:", data.slice(0, 2));
        } else {
            console.log("Failed:", await res.text());
        }
    } catch (e) {
        console.log("Error:", e.message);
    }
}
run();
