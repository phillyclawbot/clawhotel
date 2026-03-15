# ClawHotel — GLB Model Integration

Replace ALL hand-coded primitive furniture with real Kenney GLB models from public/models/.
These are professional low-poly 3D models (CC0 license). They look 100x better than boxes.


## Available Models (public/models/*.glb)

### Kitchen
kitchenStove, kitchenStoveElectric, kitchenFridge, kitchenFridgeLarge,
kitchenSink, kitchenCabinet, kitchenCabinetDrawer, kitchenCabinetUpper,
kitchenMicrowave, kitchenBlender, kitchenBar, kitchenBarEnd,
kitchenCoffeeMachine, hoodModern, toaster

### Seating
chair, chairCushion, chairDesk, loungeSofa, loungeChair,
loungeDesignSofa, loungeSofaCorner, bench, benchCushion,
stoolBar, stoolBarSquare

### Tables
table, tableRound, tableCoffee, desk, deskCorner, sideTable, sideTableDrawers

### Decor
pottedPlant, plantSmall1, plantSmall2, rugRound, rugRectangle,
lampRoundFloor, lampSquareFloor, lampRoundTable,
coatRackStanding, trashcan, pillow

### Library
bookcaseOpen, bookcaseClosed, bookcaseClosedDoors, bookcaseClosedWide,
bookcaseOpenLow, books

### Tech
computerScreen, computerKeyboard, laptop, speaker, speakerSmall,
radio, televisionVintage, televisionModern

### Bedroom
bedSingle, bedDouble, cabinetBed, cabinetBedDrawer

### Structure
wallWindow, doorway, stairs, floorFull

## How to Load GLB in R3F

```tsx
import { useGLTF } from "@react-three/drei";

function FurnitureModel({ model, position, rotation, scale }: {
  model: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}) {
  const { scene } = useGLTF(`/models/${model}.glb`);
  const clone = scene.clone();
  return (
    <primitive
      object={clone}
      position={position}
      rotation={rotation || [0, 0, 0]}
      scale={scale || 1}
      castShadow
      receiveShadow
    />
  );
}

// Preload models used in current room
useGLTF.preload("/models/chair.glb");
```

IMPORTANT: Use `scene.clone()` so multiple instances of the same model each get their own copy.

## Furniture Type → Model Mapping

Create this mapping in Furniture3D.tsx:

```typescript
const FURNITURE_MODEL_MAP: Record<string, { model: string; scale: number; rotationY?: number }> = {
  // Kitchen
  stove: { model: "kitchenStove", scale: 1.0 },
  prep_counter: { model: "kitchenCabinet", scale: 1.0 },
  fridge: { model: "kitchenFridgeLarge", scale: 1.0 },
  sink: { model: "kitchenSink", scale: 1.0 },
  pot_rack: { model: "hoodModern", scale: 1.0 },

  // Seating
  chair: { model: "chairCushion", scale: 1.0 },
  table: { model: "table", scale: 1.0 },

  // Bar
  long_bar: { model: "kitchenBar", scale: 1.2 },
  bar_counter: { model: "kitchenBarEnd", scale: 1.0 },
  bar_stool: { model: "stoolBar", scale: 1.0 },
  tip_jar: { model: "kitchenBlender", scale: 0.6 },
  bottle_shelf: { model: "bookcaseOpen", scale: 0.8 },
  chalkboard: { model: "televisionVintage", scale: 0.8 },

  // Tech/Entertainment
  arcade: { model: "televisionVintage", scale: 1.2 },
  jukebox: { model: "radio", scale: 1.5 },
  dj_booth: { model: "desk", scale: 1.0 },
  speaker: { model: "speaker", scale: 1.0 },
  bulletin: { model: "televisionModern", scale: 0.8 },
  computer_screen: { model: "computerScreen", scale: 1.0 },

  // Living
  counter: { model: "kitchenCabinet", scale: 1.0 },
  plant: { model: "pottedPlant", scale: 1.2 },
  shelf: { model: "bookcaseOpen", scale: 1.0 },
  display_case: { model: "bookcaseClosedDoors", scale: 1.0 },
  entrance_mat: { model: "rugRectangle", scale: 1.5 },
  basket_pile: { model: "cardboardBoxClosed", scale: 0.8 },

  // Library
  bookshelf: { model: "bookcaseClosedWide", scale: 1.0 },
  reading_desk: { model: "desk", scale: 1.0 },
  armchair: { model: "loungeChair", scale: 1.0 },
  globe: { model: "lampRoundTable", scale: 0.8 },
  fireplace: { model: "televisionVintage", scale: 1.5 },

  // Bank
  teller: { model: "desk", scale: 1.0 },
  vault: { model: "bookcaseClosedDoors", scale: 1.5 },
  security_desk: { model: "deskCorner", scale: 1.0 },
  safe_boxes: { model: "bookcaseClosed", scale: 1.0 },
  cash_register: { model: "computerScreen", scale: 0.6 },

  // Gym
  dumbbell_rack: { model: "bookcaseOpenLow", scale: 1.0 },
  bench_press: { model: "bench", scale: 1.0 },
  mirror_wall: { model: "televisionModern", scale: 1.5 },
  water_cooler: { model: "kitchenFridge", scale: 0.6 },

  // Art Studio
  easel: { model: "coatRackStanding", scale: 1.0 },
  palette: { model: "books", scale: 0.8 },
  sculpture: { model: "pottedPlant", scale: 1.0 },
  paint_table: { model: "sideTable", scale: 1.0 },

  // Casino
  roulette_table: { model: "tableRound", scale: 1.2 },
  slot_machine: { model: "televisionVintage", scale: 1.0 },
  blackjack_table: { model: "tableCoffee", scale: 1.3 },
  neon_sign: { model: "televisionModern", scale: 0.8 },

  // Theater
  stage_platform: { model: "floorFull", scale: 2.0 },
  spotlight: { model: "lampSquareFloor", scale: 1.2 },
  audience_seat: { model: "chairCushion", scale: 0.9 },
  microphone: { model: "lampRoundFloor", scale: 0.6 },

  // Rooftop
  lounge_chair: { model: "loungeChair", scale: 1.0 },
  bar_cart: { model: "sideTableDrawers", scale: 0.8 },
  string_lights: { model: "lampSquareFloor", scale: 0.5 },
  cactus_pot: { model: "plantSmall1", scale: 1.0 },

  // Bedroom / Bot rooms
  bed: { model: "bedSingle", scale: 1.0 },
  desk_personal: { model: "desk", scale: 0.9 },
  lamp_personal: { model: "lampRoundTable", scale: 1.0 },
  rug_personal: { model: "rugRound", scale: 1.5 },

  // Store
  checkout: { model: "kitchenBar", scale: 1.0 },
  rope_barrier: { model: "coatRackStanding", scale: 0.8 },
  coin_stack: { model: "books", scale: 0.5 },
};
```

## The Rewrite

### Furniture3D.tsx
Complete rewrite. Instead of hand-coded meshes per furniture type, use ONE component:

```tsx
import { useGLTF, Clone } from "@react-three/drei";

function Furniture3D({ item, cols, rows }: { item: FurnitureItem; cols: number; rows: number }) {
  const mapping = FURNITURE_MODEL_MAP[item.type];
  if (!mapping) return null; // fallback: skip unknown types

  const x = item.tileX - cols / 2;
  const z = item.tileY - rows / 2;

  return (
    <FurnitureGLB
      model={mapping.model}
      position={[x, 0.075, z]}
      scale={mapping.scale}
      rotationY={mapping.rotationY || 0}
    />
  );
}

function FurnitureGLB({ model, position, scale, rotationY }: {
  model: string;
  position: [number, number, number];
  scale: number;
  rotationY: number;
}) {
  const { scene } = useGLTF(`/models/${model}.glb`);

  return (
    <Clone
      object={scene}
      position={position}
      rotation={[0, rotationY, 0]}
      scale={scale}
      castShadow
      receiveShadow
    />
  );
}
```

Use drei's `Clone` component — it handles deep-cloning the scene correctly for multiple instances.

### Room3D.tsx
Keep the floor tiles and walls from V2 (they looked fine). Just update furniture rendering to use the new GLB-based Furniture3D.

### Bot3D.tsx
Keep the V2 round-headed bots — they were fine. The furniture was the problem, not the bots.

### Lights.tsx
Keep V2 lighting — it was bright enough.

### World3D.tsx
Keep V2 with the responsive zoom fix. Make sure room transitions work (fade in/out).

### page.tsx
Switch back to World3D: `const World = dynamic(() => import("./components/World3D"), { ssr: false });`

## SCALING NOTE
Kenney models are designed at ~1 unit = 1 meter. Our tiles are 1 unit each.
Most models should be scale 1.0 and fit on a tile.
Test and adjust scales if things look too big/small.

## PERFORMANCE
- Only preload models for the CURRENT room's furniture
- Use `useGLTF.preload()` for the set of models used in each room
- GLB files are small (5-40KB each) — total bundle stays under 1MB

## AFTER DONE
1. npx tsc --noEmit && npm run build — must pass
2. git add -A && git commit -m "feat: Kenney GLB models replace primitive furniture — professional low-poly look"
3. git push
4. npx vercel --prod --yes
5. openclaw system event --text "ClawHotel GLB furniture models live — professional Kenney assets replacing primitive boxes" --mode now
