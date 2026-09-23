/**
 * Bridge Structural Configuration & Component Hierarchy
 * Cable-stayed 4-span bridge geometry & metadata
 */

export const BRIDGE_DIMENSIONS = {
  totalLength: 160,    // -80 to +80 along Z
  deckWidth: 14,       // -7 to +7 along X
  deckThickness: 1.2,
  deckElevation: 7.5,  // Y elevation above water
  towerHeight: 38,     // Peak Y of towers
  towerZPositions: [-28, 28], // Z locations of Tower 1 and Tower 2
  waterElevation: 0,
};

export const BRIDGE_COMPONENTS = [
  {
    id: "SPAN_01",
    type: "span",
    name: "Span 1 (South Approach)",
    code: "S-01",
    zRange: [-80, -28],
    length: 52,
    centerPos: [0, 7.5, -54],
    description: "South concrete approach span with elastomeric bearings",
    designLoadLimit: "480 kN/m",
    baselineStrain: 210, // µε
  },
  {
    id: "SPAN_02",
    type: "span",
    name: "Span 2 (South Main Span)",
    code: "S-02",
    zRange: [-28, 0],
    length: 28,
    centerPos: [0, 7.5, -14],
    description: "Cable-supported steel composite orthotropic deck",
    designLoadLimit: "620 kN/m",
    baselineStrain: 320,
  },
  {
    id: "SPAN_03",
    type: "span",
    name: "Span 3 (North Main Span - Critical Zone)",
    code: "S-03",
    zRange: [0, 28],
    length: 28,
    centerPos: [0, 7.5, 14],
    description: "Primary navigational channel span with mid-span expansion joint",
    designLoadLimit: "620 kN/m",
    baselineStrain: 340,
  },
  {
    id: "SPAN_04",
    type: "span",
    name: "Span 4 (North Approach)",
    code: "S-04",
    zRange: [28, 80],
    length: 52,
    centerPos: [0, 7.5, 54],
    description: "North concrete approach span with abutment connection",
    designLoadLimit: "480 kN/m",
    baselineStrain: 205,
  },
  {
    id: "TOWER_01",
    type: "tower",
    name: "Tower 1 (South Pylon)",
    code: "T-01",
    pos: [0, 0, -28],
    height: 38,
    description: "A-frame reinforced concrete pylon with stay cable saddle anchorages",
    designLoadLimit: "12,500 kN",
    baselineStrain: 180,
  },
  {
    id: "TOWER_02",
    type: "tower",
    name: "Tower 2 (North Pylon)",
    code: "T-02",
    pos: [0, 0, 28],
    height: 38,
    description: "A-frame reinforced concrete pylon with stay cable saddle anchorages",
    designLoadLimit: "12,500 kN",
    baselineStrain: 185,
  },
  {
    id: "PIER_01",
    type: "pier",
    name: "Pier 1 (South Abutment Pier)",
    code: "P-01",
    pos: [0, 3.5, -80],
    description: "Reinforced concrete shore abutment pier with seismic stopper",
    designLoadLimit: "8,200 kN",
  },
  {
    id: "PIER_02",
    type: "pier",
    name: "Pier 2 (South Channel Pier)",
    code: "P-02",
    pos: [0, 3.5, -28],
    description: "Deep caisson foundation pier supporting Tower 1",
    designLoadLimit: "18,000 kN",
  },
  {
    id: "PIER_03",
    type: "pier",
    name: "Pier 3 (North Channel Pier)",
    code: "P-03",
    pos: [0, 3.5, 28],
    description: "Deep caisson foundation pier supporting Tower 2",
    designLoadLimit: "18,000 kN",
  },
  {
    id: "PIER_04",
    type: "pier",
    name: "Pier 4 (North Abutment Pier)",
    code: "P-04",
    pos: [0, 3.5, 80],
    description: "Reinforced concrete shore abutment pier with expansion teeth",
    designLoadLimit: "8,200 kN",
  },
  {
    id: "CABLE_SYS_01",
    type: "cables",
    name: "South Stay Cable Array",
    code: "CAB-S",
    description: "High-tensile parallel strand stay cables (16 pairs)",
    designLoadLimit: "3,200 kN / strand",
  },
  {
    id: "CABLE_SYS_02",
    type: "cables",
    name: "North Stay Cable Array",
    code: "CAB-N",
    description: "High-tensile parallel strand stay cables (16 pairs)",
    designLoadLimit: "3,200 kN / strand",
  },
];
