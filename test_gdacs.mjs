async function test() {
    try {
        const res = await fetch('https://www.gdacs.org/gdacsapi/api/events/geteventlist/MAP');
        const data = await res.json();
        if (data.features?.length > 0) {
            const idnEvents = data.features.filter(f =>
                f.properties && f.properties.country && f.properties.country.toLowerCase().includes('indonesia')
            );

            const floods = idnEvents.filter(f => f.properties.eventtype === 'FL');
            console.log(`Found ${floods.length} flood events in Indonesia.`);
            if (floods.length > 0) {
                console.log("Flood event sample:", JSON.stringify(floods[0], null, 2));
            } else if (idnEvents.length > 0) {
                console.log("No floods. Other event sample:", JSON.stringify(idnEvents[0], null, 2));
            }
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}
test();
