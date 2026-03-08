const https = require('https');
const fs = require('fs');

https.get('https://www.gdacs.org/gdacsapi/api/events/geteventlist/MAP', (res) => {
    let data = '';
    res.on('data', chunk => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.features && json.features.length > 0) {
                const idnEvents = json.features.filter(f =>
                    f.properties && f.properties.country && f.properties.country.toLowerCase().includes('indonesia')
                );

                fs.writeFileSync('gdacs_floods.json', JSON.stringify(idnEvents, null, 2));
                console.log(`Wrote ${idnEvents.length} Indonesian events to gdacs_floods.json.`);
            }
        } catch (e) {
            console.error("Error:", e.message);
        }
    });
}).on('error', err => {
    console.error("Error:", err.message);
});
