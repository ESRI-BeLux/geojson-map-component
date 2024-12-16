import { Map } from "./map.js";

const aresponse = await fetch("./geojson/atomium.geojson");
const ageojson = await aresponse.json();

const gresponse = await fetch("./geojson/grandplace.geojson");
const ggeojson = await gresponse.json();

const cresponse = await fetch("./geojson/canal.geojson");
const cgeojson = await cresponse.json();

function onCreate(featureGeoJson) {
  console.log("Feature created!");
  console.log(featureGeoJson);
}

const map = new Map();

await map.initialize((i) => {
  onCreate(i);
});

map.addGeoJson("atomium", ageojson);

map.addGeoJson("grandplace", ggeojson);

map.addGeoJson("canal", cgeojson);

setTimeout(() => {
  map.removeGeoJson("atomium");
}, 5000);
