async function run() {
    try {
        const res = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=-7.3032412&longitude=110.0044145&localityLanguage=id');
        const json = await res.json();
        console.log("Reverse geocode result:", json.locality, json.principalSubdivision, json.city);
        console.log("Full json:", JSON.stringify(json, null, 2));
    } catch (e) {
        console.error(e);
    }
}
run();
