import Map from "@arcgis/core/Map.js";
import MapView from "@arcgis/core/views/MapView";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Point from "@arcgis/core/geometry/Point.js";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol.js";
import Graphic from "@arcgis/core/Graphic";
import Polygon from "@arcgis/core/geometry/Polygon.js";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol.js";
import Polyline from "@arcgis/core/geometry/Polyline.js";
import SimpleLineSymbol from "@arcgis/core/symbols/SimpleLineSymbol.js";
import {
  GeoJSONFeatureLineString,
  GeoJSONFeaturePoint,
  GeoJSONFeaturePolygon,
} from "./types";
import Basemap from "@arcgis/core/Basemap";
import WebMap from "@arcgis/core/WebMap.js";
import TileLayer from "@arcgis/core/layers/TileLayer";

function convertToGeoJSON(geometry: __esri.Geometry) {
  switch (geometry.type) {
    case "point":
      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [
            (geometry as __esri.Point).x,
            (geometry as __esri.Point).y,
          ],
        },
        properties: {}, // Add properties as needed
      } as GeoJSONFeaturePoint;

    case "polyline":
      return {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: (geometry as __esri.Polyline).paths.map((path) =>
            path.map((point) => point as [number, number])
          ),
        },
        properties: {},
      } as unknown as GeoJSONFeatureLineString;

    case "polygon":
      // Construct the entire GeoJSON object for a Polygon
      return {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: (geometry as __esri.Polygon).rings.map((ring) =>
            ring.map((point) => point as [number, number])
          ),
        },
        properties: {},
      } as GeoJSONFeaturePolygon;

    default:
      throw new Error("Unsupported geometry type: " + geometry.type);
  }
}

async function createMap() {
  const streetsLayer = new TileLayer({
    url: "https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer",
  });

  const basemap = new Basemap({
    baseLayers: [streetsLayer],
  });

  const map = new WebMap({
    basemap,
  });

  const belgiumExtent = {
    xmin: 2.5,
    ymin: 49,
    xmax: 6.4,
    ymax: 51.8,
    spatialReference: { wkid: 4326 }, // WGS84 spatial reference
  };

  const view = new MapView({
    container: "mapDiv",
    map,
    extent: belgiumExtent,
  });

  const graphicsLayer = new GraphicsLayer();

  view.map.add(graphicsLayer);

  return { map, view, graphicsLayer };
}

class GeoJsonMap {
  constructor() {}

  public map: Map | undefined;
  public view: MapView | undefined;
  public graphicsLayer: GraphicsLayer | undefined;

  async initialize() {
    const { map, view, graphicsLayer } = await createMap();

    this.map = map;
    this.view = view;
    this.graphicsLayer = graphicsLayer;
  }

  // Function to draw a point on the map and return GeoJSON
  public async drawPointAndGetGeoJson(): Promise<GeoJSONFeaturePoint> {
    // Enable drawing mode for point
    const { point, pointGraphic } = await this.getPointFromClick();
    const geoJson = convertToGeoJSON(point);

    this.graphicsLayer?.remove(pointGraphic);

    return geoJson as GeoJSONFeaturePoint;
  }

  // Handle the click event to add a point to the map
  private async getPointFromClick(): Promise<{
    point: __esri.Point;
    pointGraphic: __esri.Graphic;
  }> {
    return new Promise<{
      point: __esri.Point;
      pointGraphic: __esri.Graphic;
    }>((resolve) => {
      this.view?.on("click", (event) => {
        const point = new Point({
          longitude: event.mapPoint.longitude,
          latitude: event.mapPoint.latitude,
        });

        const symbol = new SimpleMarkerSymbol({
          color: [226, 119, 40], // Orange color
          outline: { color: [255, 255, 255], width: 2 }, // White outline
        });

        const pointGraphic = new Graphic({
          geometry: point,
          symbol: symbol,
        });

        this.graphicsLayer?.add(pointGraphic);
        resolve({ point, pointGraphic });
      });
    });
  }

  /**
   * Removes a GeoJSON feature from the map's graphics layer by its ID.
   *
   * This function finds a graphic on the graphics layer that matches the given ID
   * and removes it. If no graphic is found with the given ID, this function does
   * nothing.
   *
   * @param {string} id ID of the GeoJSON feature to remove
   * @returns {Promise<void>} Promise that resolves when the graphic has been removed
   */
  async removeGeoJson(id: string) {
    const graphicToDelete = this.graphicsLayer?.graphics.find((graphic) => {
      return graphic.attributes.id === id;
    });
    if (graphicToDelete) {
      this.graphicsLayer?.remove(graphicToDelete);
    }
  }

  /**
   * Adds a GeoJSON feature to the map's graphics layer.
   *
   * This function supports adding Point, Polygon, and LineString geometries.
   * It creates a graphic with appropriate symbols and attributes derived from
   * the GeoJSON feature and adds it to the graphics layer for rendering on the map.
   *
   * @param {string} id - A unique identifier for the GeoJSON feature.
   * @param {Object} geojson - The GeoJSON object containing the geometry and properties.
  
   * 
   * Supported geometry types:
   * - "Point": Creates a red point with a white outline.
   * - "Polygon": Creates a semi-transparent blue polygon with a black outline.
   * - "LineString": Creates an orange solid line.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async addGeoJson(id: string, geojson: any) {
    const geometry = geojson.geometry;
    const attributes = geojson.properties;

    let graphic;

    if (geometry.type === "Point") {
      const point = new Point({
        longitude: geometry.coordinates[0],
        latitude: geometry.coordinates[1],
      });

      const symbol = new SimpleMarkerSymbol({
        color: [255, 0, 0], // Red color
        size: 10, // Point size
        outline: { color: [255, 255, 255], width: 2 }, // White outline
      });

      graphic = new Graphic({
        geometry: point,
        symbol: symbol,
        attributes: { id, ...attributes },
      });
    }

    if (geometry.type === "Polygon") {
      const polygon = new Polygon({
        rings: geometry.coordinates,
      });

      const symbol = new SimpleFillSymbol({
        color: [51, 51, 204, 0.3], // Semi-transparent blue
        outline: { color: [0, 0, 0], width: 2 }, // Black outline
      });

      graphic = new Graphic({
        geometry: polygon,
        symbol: symbol,
        attributes: { id, ...attributes },
      });
    }

    if (geometry.type === "LineString") {
      const polyline = new Polyline({
        paths: geometry.coordinates,
      });

      const lineSymbol = new SimpleLineSymbol({
        color: [226, 119, 40], // Orange color
        width: 4,
        style: "solid", // Line style
      });

      graphic = new Graphic({
        geometry: polyline,
        symbol: lineSymbol,
        attributes: { id, ...attributes },
      });
    }

    console.log("should add");

    if (graphic) this.graphicsLayer?.add(graphic);
  }
}

export default GeoJsonMap;
