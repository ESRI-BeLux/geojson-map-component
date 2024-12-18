type GeoJSONPoint = {
  type: "Point";
  coordinates: [number, number];
};
export type GeoJSONFeaturePoint = {
  type: "Feature";
  geometry: GeoJSONPoint;
  properties: { [key: string]: any };
};
type GeoJSONLineString = {
  type: "LineString";
  coordinates: [number, number][] | [number, number, number][];
};
type GeoJSONPolygon = {
  type: "Polygon";
  coordinates: [number, number][][] | [number, number, number][][];
};

export type GeoJSONFeatureLineString = {
  type: "Feature";
  geometry: GeoJSONLineString;
  properties: { [key: string]: any };
};

export type GeoJSONFeaturePolygon = {
  type: "Feature";
  geometry: GeoJSONPolygon;
  properties: { [key: string]: any };
};
