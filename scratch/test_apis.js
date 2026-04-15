async function testFetch() {
  const urls = [
    'https://data.petabencana.id/reports?timeperiod=604800',
    'https://www.gdacs.org/gdacsapi/api/events/geteventlist/MAP'
  ];

  for (const url of urls) {
    console.log(`\nTesting: ${url}`);
    try {
      const res = await fetch(url);
      console.log(`Status: ${res.status}`);
      const data = await res.json();
      
      if (url.includes('petabencana')) {
        console.log(`PetaBencana Root Keys: ${Object.keys(data)}`);
        if (data.result) {
          console.log(`Result Keys: ${Object.keys(data.result)}`);
          if (data.result.objects) {
            console.log(`Found 'objects' (TopoJSON?)`);
          }
          if (data.result.features) {
            console.log(`Found 'features' count: ${data.result.features.length}`);
          }
        }
      } else {
        console.log(`GDACS Root Keys: ${Object.keys(data)}`);
        if (data.features) {
          console.log(`GDACS Features count: ${data.features.length}`);
          const first = data.features[0];
          if (first) {
            console.log(`First Feature Properties: ${Object.keys(first.properties)}`);
            console.log(`First Feature Country: ${first.properties.country}`);
          }
        }
      }
    } catch (e) {
      console.error(`Error with ${url}:`, e.message);
    }
  }
}

testFetch();
