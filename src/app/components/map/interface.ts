type GeoCoordinate = [number, number];

// Define a linear ring (a sequence of coordinates forming a closed loop)
type GeoLinearRing = GeoCoordinate[];

// Define polygon coordinates (an outer ring and optionally inner rings for holes)
// Your data usually has only one inner array, representing the outer boundary.
type GeoPolygon = GeoLinearRing[];

// Define multi-polygon coordinates (an array of polygons)
type GeoMultiPolygon = GeoPolygon[];

// A union type to cover both single and multi-polygon structures based on your input
// It appears your data has some inconsistencies in nesting.
// "Aguascalientes" is `GeoPolygon`.
// "Por BCN" and "Por BCN 2" are `GeoMultiPolygon` where each GeoPolygon only has one GeoLinearRing.
type StateBoundaryData = GeoPolygon | GeoMultiPolygon;

// Define the structure for a single state entry in your dictionary
export interface StateEntry {
  [key: string]: StateBoundaryData; // An index signature: allows any string key
}