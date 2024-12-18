import ageojson from "../geojson/atomium.json";
import ggeojson from "../geojson/grandplace.json";
import cgeojson from "../geojson/canal.json";
import GeoJsonMap from "./components/geojsonMap/map";

function onCreate(featureGeoJson: any) {
  console.log("Feature created!");
  console.log(featureGeoJson);
}

const map = new GeoJsonMap();

// to be able to initialize the map, the .html should have a div with id mapDiv.
// this is the place where the map will be loaded
await map.initialize();

map.addGeoJson("atomium", ageojson);

map.addGeoJson("grandplace", ggeojson);

map.addGeoJson("canal", cgeojson);

setTimeout(() => {
  map.removeGeoJson("atomium");
}, 5000);

// Add the button to the body or a specific div (e.g., button-container)
const button = document.getElementById("button");

if (button)
  button.onclick = function () {
    map.drawPointAndGetGeoJson().then((geoJson) => {
      console.log(geoJson);
      map.addGeoJson("New Point", geoJson);
    });
  };
