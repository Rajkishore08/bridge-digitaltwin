# 🌉 Smart Bridge Digital Twin — Structural Health Monitoring (SHM)

A real-time, interactive 3D Structural Health Monitoring (SHM) Digital Twin demonstrator built with **React**, **Three.js**, **React Three Fiber (@react-three/fiber)**, **@react-three/drei**, and **Zustand**.

---

## 🚀 Key Features

1. **3D Cable-Stayed Bridge Model**:
   - 4-span realistic structure with concrete towers, stay cables, piers, caissons, bearings, expansion joints, and asphalt road deck.
   - Dynamic Day, Sunset, and Night environmental lighting systems.

2. **Multi-Modal Structural Health Monitoring (SHM)**:
   - 14 live telemetry sensor channels: Strain gauges ($\mu\varepsilon$), Accelerometers ($g$), LVDT Displacement ($mm$), Deck Temperature ($^\circ\text{C}$), Anemometer Wind ($km/h$), and WIM Axle Load sensors.
   - Real-time physics engine coupling traffic density, gross axle weight, wind gusts, and thermal gradients into finite-element stress heatmaps.

3. **Interactive 3D Visualizations & Modes**:
   - **Live Physical Twin**: High-fidelity industrial 3D digital replica.
   - **Finite-Element Stress Heatmap**: 6-segment localized gradient per span (Nominal Green $\rightarrow$ Amber Yellow $\rightarrow$ Crimson Red).
   - **Modal Vibration Mode**: Exaggerated modal oscillation and harmonic frequency response.
   - **Sensor Registry Network**: 3D spatial sensor nodes with status halos, telemetry popovers, and sparkline charts.
   - **Traffic Flow Simulation**: Multi-class vehicular fleet (sedans, vans, buses, heavy trucks) navigating lanes.

4. **Extreme Failure & Bridge Collapse Simulation**:
   - Step-by-step collapse sequence (Forced Overload $\rightarrow$ Concrete Spalling $\rightarrow$ Cable Snapping $\rightarrow$ Deck Fracture & Plunge).
   - Physics-driven vehicular plunge into river with dynamic spray and splash particles.

5. **Camera & Viewport Controls**:
   - Floating camera widget: One-click Zoom In/Out, 30° Orbit Rotation, Pitch Elevation Tilt, and Perspective Presets (3D Iso, Top-Down, Side Profile, Front View, Reset).
   - Manual mouse / touch navigation (left-click drag to rotate, right-click to pan, scroll to zoom) that persists smoothly.

6. **Operations & Maintenance HUD**:
   - Alert triage workflow: Acknowledge alerts, dispatch work orders, and simulate bridge restoration.
   - 30-day historical playback scrubber.
   - 30-day predictive AI fatigue forecast.
   - 14-step automated guided presentation tour.
   - Sensor data table view, engineering architecture overlay, and one-click PDF/CSV report export.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite 6
- **3D Graphics**: Three.js, React Three Fiber, React Three Drei
- **State Management**: Zustand
- **Icons & Effects**: Lucide React, Canvas Confetti

---

## 📦 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run local dev server
npm run dev

# 3. Build production bundle
npm run build

# 4. Preview production build locally
npm run preview
```

---

## 🌐 Production Deployment

The project is pre-configured with relative assets (`base: './'`) and manual code splitting for fast global CDN delivery.

### Option 1: Vercel
```bash
npx vercel
```
*(A `vercel.json` rewrite configuration is already included).*

### Option 2: Netlify
1. Connect your repository or run:
```bash
npx netlify deploy --prod --dir=dist
```

### Option 3: GitHub Pages
1. Build the production bundle: `npm run build`
2. Push the contents of `dist/` to your `gh-pages` branch.

### Option 4: Static Web Server (Nginx, Apache, S3, Firebase)
Serve the contents of the `dist/` directory directly to any static web hosting provider.
