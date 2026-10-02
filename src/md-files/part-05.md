## **Part V — `map-grid.ts`: Building and Navigating the Hexagonal World**

We now arrive at one of the most important graphical files in the application:

**`map-grid.ts`**

If `world-database.ts` answers:

**“What is stored at each coordinate?”**

then `map-grid.ts` answers:

**“Where is each coordinate in the world, and how do we display it?”**

This file is where our reusable `midgard-hex-grid` library meets the browser's SVG system.

It also contains the machinery for:

⬡ creating the map  
🔎 zooming  
🎯 centering the camera  
🖱️ reacting to map clicks  
🎨 changing a hex's fill  
🖼️ placing a complete terrain graphic over a hex  
🧭 informing the minimap when the viewport changes

There is quite a lot happening, so we will build the picture gradually.

---

# **⬡ Chapter 23 — Geometry Versus World Data**

Before looking at the file itself, we should reinforce a distinction from the previous chapter.

`MapGrid` does **not** decide whether a hex is Ocean or Grass.

That belongs to our world data.

Instead, `MapGrid` deals with geometry.

It knows things such as:

**this coordinate exists**

**this is the polygon belonging to that coordinate**

**this is where its center is**

**this is where a terrain SVG should be positioned**

**this part of the world is currently visible**

That makes `MapGrid` largely independent of Civilization terrain semantics.

This is why the same map grid could theoretically display very different kinds of content.

---

# **📦 23.1 Importing the Hex Library**

The file imports:

`Coordinate`

and:

`HexGrid`

from:

`midgard-hex-grid`. map-grid

`HexGrid` is the actual class we use to construct our hexagonal geometry.

`Coordinate` is a TypeScript type describing a coordinate.

The application therefore does not duplicate all the mathematics needed to construct a hexagonal grid.

That responsibility stays inside our reusable library.

This is an important architectural success.

---

# **📐 23.2 Importing the Canonical Hex Definitions**

`MapGrid` also imports:

`HEX_BOUNDS`

and:

`HEX_WORLD_WIDTH`

from our graphics definitions. map-grid

We will study `hex.ts` itself in the next part, but for now:

**`HEX_WORLD_WIDTH` \= 260**

and `HEX_BOUNDS` describes the rectangular bounding box around one canonical hex.

These definitions allow the map and our terrain graphics to agree on a common scale.

---

# **🎨 23.3 Importing SVG Helpers**

Finally, `MapGrid` imports:

`appendSvg`

and:

`createSvg`. map-grid

These are our own small helper functions for constructing SVG elements.

Instead of repeatedly writing the browser's lower-level SVG creation code, `MapGrid` can say things conceptually like:

**create an SVG**

or:

**append a polygon**

We will examine exactly how those helpers work later.

---

# **🗺️ Chapter 24 — The Size of Our World**

Near the top of `map-grid.ts` are two important constants:

**Skeleton width \= 42**

**Skeleton height \= 13**. map-grid

These are the dimensions we supply to our hex-grid library.

However, they do **not** mean that the finished map contains only:

42 × 13 \= 546 hexagons.

Our library's grid-generation behaviour fills around the skeleton.

The actual map currently contains:

**1,174 hexagons.**

That is why we found 1,174 records in IndexedDB.

This is another nice connection between different layers:

⬡ `MapGrid` produces 1,174 valid coordinates.

↓

🗄️ `initializeWorld()` receives those coordinates.

↓

🗄️ IndexedDB receives 1,174 `HexRecord` objects.

The database count therefore ultimately reflects the geometry produced by our hex library.

---

# **📏 24.1 `WORLD_VIEW_PADDING`**

The file defines padding using:

`HEX_WORLD_WIDTH * (12 / 32)`. map-grid

Because our canonical width is 260 world units, this padding is proportional to the hex size.

That is preferable to choosing some unrelated magic number.

The padding gives the world some breathing room when the entire map is shown.

Without it, the outermost hexagons could sit uncomfortably against the viewport edges.

---

# **🔎 Chapter 25 — Zoom Levels**

The file defines five zoom levels.

The type is effectively restricted to:

**1 | 2 | 3 | 4 | 5**. map-grid

This is another TypeScript union type.

A zoom level cannot accidentally become:

`37`

or:

`'very-close'`

if the code expects this type.

Only the five supported numerical levels are valid.

---

# **🌍 25.1 What the Zoom Levels Mean**

The map supports two particularly important conceptual extremes.

### **🔭 Zoom 1**

Show the entire world.

### **🔬 Zoom 5**

Use a scale where approximately:

**1 world unit \= 1 CSS pixel.**

Because our canonical hex is 260 world units wide, Zoom 5 makes it appear roughly 260 CSS pixels wide.

This is why Zoom 5 became so useful while developing terrain graphics.

At that level we can inspect our SVG artwork close to its natural design scale.

---

# **📐 Chapter 26 — World Coordinates and Screen Pixels Are Not the Same Thing**

This distinction is fundamental to SVG.

Suppose a hex is:

**260 world units wide.**

That does **not** mean it must always occupy 260 physical pixels on the monitor.

At Zoom 1, it may appear much smaller.

At Zoom 5, it may appear around 260 CSS pixels wide.

The underlying world geometry has not changed.

Only the **view** of that geometry has changed.

This is exactly what SVG's `viewBox` makes possible.

---

# **🖼️ Chapter 27 — Understanding SVG `viewBox`**

This is one of the most important SVG concepts in the entire project.

A `viewBox` consists of four numbers:

**x**

**y**

**width**

**height**

Conceptually:

`viewBox="x y width height"`

It says:

> “This rectangular region of SVG world coordinates is what should currently be visible.”

Imagine our SVG is a camera looking down at the Civilization world.

Then the `viewBox` describes:

📍 where the camera starts

📏 how much world width it sees

📏 how much world height it sees

---

# **🔎 27.1 Zooming Does Not Make the Hex Geometry Bigger**

This is a subtle but very useful idea.

When we zoom in, we do **not** need to reconstruct every hexagon with larger coordinates.

Instead, we show a smaller region of the same world inside the same screen area.

Suppose the screen stays 1000 pixels wide.

If the SVG `viewBox` displays 10,000 world units across that screen, everything appears small.

If it displays only 1,000 world units across the same screen, everything appears much larger.

The objects did not change size in world coordinates.

The camera changed.

---

# **🎥 27.2 SVG as a Camera**

A very useful beginner mental model is:

**SVG world coordinates \= the actual map**

**viewBox \= the camera**

**CSS width/height \= the physical window through which we look**

Then zooming becomes intuitive.

🔭 Large viewBox → see lots of world → things look small.

🔬 Small viewBox → see less world → things look large.

And moving the `x` and `y` of the viewBox pans the camera around the world.

---

# **🧩 Chapter 28 — The `MapGrid` Class**

`MapGrid` exposes its SVG through:

`readonly element: SVGSVGElement`

and internally stores the actual `HexGrid` from our reusable library. map-grid

It also keeps several pieces of state.

Among them are maps for:

**polygons**

and:

**placements**.

These deserve careful attention because they solve an important problem.

---

# **🗂️ 28.1 Why Store the Polygons?**

When the world is initially drawn, we create an SVG polygon for every hex.

Later, another part of the application may say:

**“Change the hex at coordinate `(12,4)`.”**

We do not want to search blindly through more than a thousand SVG elements.

Instead, `MapGrid` stores a relationship between a coordinate key and its polygon.

Conceptually:

`"12,4"` → SVG polygon

`"6,4"` → SVG polygon

and so on.

This gives us fast access to the graphical object associated with a coordinate.

---

# **🔑 28.2 Turning a Coordinate Into a Key**

JavaScript `Map` objects need keys.

Our coordinate is an object with:

`x`

and:

`y`.

The code therefore converts coordinates into string keys.

Conceptually:

`{ x: 12, y: 4 }`

becomes something like:

`"12,4"`

Now that string can identify the corresponding polygon and placement.

Notice how the same coordinate appears in several forms across the application:

⬡ **Geometry:** `{ x: 12, y: 4 }`

🗄️ **IndexedDB key:** `[12, 4]`

🗺️ **MapGrid lookup key:** `"12,4"`

They represent the same conceptual world location but are formatted appropriately for different jobs.

---

# **📦 28.3 Why Store Placements Separately?**

`MapGrid` also stores a placement for each coordinate.

The placement describes the top-left position at which the rectangular terrain graphic should be placed.

This is necessary because the terrain artwork is created inside a rectangular SVG canvas.

Remember:

⬡ the visible tile is hexagonal

but:

🖼️ the terrain SVG itself has a rectangular bounding box.

So `MapGrid` needs to know:

**where should that rectangle begin so that its hex lines up with the map hex?**

That is what the placement solves.

---

# **🏗️ Chapter 29 — Constructing the Hexagonal World**

Inside the constructor, `MapGrid` creates its underlying hex grid and asks it to create the world.

The orientation is:

**x-dominated**

and the hex diameter/width is based on our canonical 260-unit definition.

The grid uses our 42 × 13 skeleton dimensions.

The result gives us the collection of actual hexagons that make up the world.

Each generated hexagon has information such as:

📍 coordinate

🎯 center

⬡ corner points

Those are geometry facts.

No terrain semantics are involved yet.

---

# **🖼️ 29.1 Creating the Main SVG**

`MapGrid` creates an SVG element for the map. map-grid

This SVG is the large vector-graphics world that sits inside `.map-area`.

All our hex polygons and terrain SVGs ultimately become descendants of this map SVG.

So the hierarchy begins approximately like:

**map SVG**

↳ polygon

↳ terrain SVG

↳ polygon

↳ terrain SVG

↳ polygon

↳ terrain SVG

…and so forth.

---

# **⬡ Chapter 30 — Turning Hex Geometry Into SVG Polygons**

For every generated hexagon, `MapGrid` creates an SVG:

`polygon`. map-grid

An SVG polygon is defined by a list of points.

For a hexagon, we have six corners.

Conceptually:

**point 1**

→ **point 2**

→ **point 3**

→ **point 4**

→ **point 5**

→ **point 6**

→ back to the beginning.

The browser connects those points and fills the enclosed shape.

This is where the mathematical geometry from `midgard-hex-grid` becomes an actual visible SVG shape.

---

# **📍 30.1 The Hex Library Does the Mathematics**

This is worth emphasizing.

`MapGrid` does not contain formulas calculating the six corners of an x-dominated hexagon.

That work already belongs to:

**midgard-hex-grid**.

The application receives the points and translates them into SVG.

That separation means our Civilization project is a **consumer** of the reusable library.

Exactly as intended.

---

# **🎨 30.2 The Initial Polygon Appearance**

The base polygons have an initial fill and stroke.

The fill is our dark map colour, while the stroke outlines the hex boundaries.

At this stage, think of these polygons as the geometric foundation.

Later, `MapArea` can change the fill according to the database and can place richer SVG artwork over the polygon.

So we have:

**base polygon**

plus optionally:

**terrain graphic**

This is why our Ocean tiles can have waves while the geometric hex still exists underneath.

---

# **📐 Chapter 31 — Calculating the Terrain Graphic Placement**

When each hex is created, `MapGrid` also calculates where its rectangular terrain canvas belongs.

The placement uses the hexagon's center and half of the canonical bounding-box dimensions. map-grid

Conceptually:

**left edge \= center X − half tile width**

**top edge \= center Y − half tile height**

This is standard centering mathematics.

Imagine an object 260 units wide.

If its center is at X \= 500, then its left edge needs to begin half its width before the center.

Half of 260 is 130\.

So:

500 − 130 \= 370\.

The rectangular tile would begin at X \= 370\.

The same principle applies vertically using the tile height.

---

# **🎯 31.1 Why the Center Is So Useful**

The hex-grid library already knows each hexagon's center.

That gives us an excellent anchor point.

We can say:

> “Take the canonical terrain rectangle and center it exactly on the hex center.”

Now the terrain graphic and geometric polygon line up.

This is another reason our canonical graphics system works so nicely.

Every terrain graphic follows the same dimensions.

`MapGrid` therefore doesn't need special placement mathematics for Ocean, Coast, Grass or Desert.

It simply places a **hex graphic**.

---

# **🎨 Chapter 32 — `setHexFill()`: Changing the Base Polygon**

`MapGrid` provides a method that allows another object to change a hex's fill colour.

`MapArea` uses this after reading the terrain from IndexedDB.

Conceptually:

🗄️ database says:

`grass`

↓

🧠 `MapArea` translates Grass to:

`green`

↓

🗺️ `MapGrid.setHexFill(...)`

↓

⬡ correct SVG polygon becomes green

Notice the division of knowledge.

`MapGrid` doesn't need to know what Grass means.

It simply receives:

**coordinate \+ fill colour**

That makes the method generic.

---

# **🖼️ Chapter 33 — `setHexGraphic()`: Placing a Complete SVG Tile**

Now we reach one of the most important methods in the graphics architecture:

`setHexGraphic()`.

It receives:

a coordinate

and:

an `SVGSVGElement`. map-grid

That second parameter is significant.

It does not receive:

`OceanGraphic`

or:

`CoastGraphic`.

It simply receives an SVG.

So `MapGrid` doesn't care what the artwork represents.

It could be Ocean today.

Grass tomorrow.

Some entirely different hex graphic later.

---

# **🔍 33.1 Find the Coordinate**

The method first creates the coordinate key and uses it to retrieve:

the polygon,

and:

the placement. map-grid

If either cannot be found, it throws an error.

This protects us from trying to place graphics at coordinates that do not correspond to rendered hexes.

---

# **📍 33.2 Give the Graphic Its World Position**

Next, the terrain SVG receives:

`x`

and:

`y`

based on the stored placement. map-grid

This says:

**“Place the top-left corner of this nested SVG here in the world.”**

Then it receives:

`width`

and:

`height`

matching the canonical hex bounding box. map-grid

So the terrain graphic is positioned in exactly the rectangular area for which it was designed.

---

# **🏷️ 33.3 `data-hex-graphic`**

The terrain SVG also receives a custom data attribute containing the coordinate key. map-grid

HTML and SVG can use custom `data-*` attributes to attach application-specific information to DOM elements.

This does not change how the SVG looks.

It gives the element useful identifying metadata in the DOM.

That can be helpful for debugging and future interaction.

---

# **🥪 33.4 `polygon.after(graphic)`**

Finally, the terrain SVG is inserted:

**after the polygon**. map-grid

This matters because SVG drawing order is generally affected by document order.

Later elements are drawn over earlier elements.

So conceptually:

**polygon first**

then:

**terrain artwork**

allows the terrain graphic to appear over the base polygon.

This is the beginning of what will eventually become a layered graphical system.

---

# **🎨 33.5 This Method Knows Nothing About Ocean**

This deserves repeating.

`setHexGraphic()` does not contain:

`if ocean`

or:

`if coast`

It receives a generic:

`SVGSVGElement`

That means we have separated:

**choosing the graphic**

from:

**placing the graphic**.

`MapArea` chooses.

`MapGrid` places.

This is a strong design decision.

---

# **🗄️ Chapter 34 — Where IndexedDB Ends and SVG Begins**

This is a perfect point to mark the boundary explicitly.

Suppose IndexedDB contains:

**x:** 6  
**y:** 4  
**terrain:** coast  
**relief:** flat

### **🗄️ IndexedDB's job ends with semantic data.**

`MapArea` reads that record.

Then:

`createCoast()`

creates the artwork.

Then:

`setHexGraphic()`

places the artwork.

So the chain is:

🗄️ **IndexedDB**

`coast`

↓

🧠 **MapArea**

“Coast requires the Coast graphic.”

↓

🎨 **createCoast()**

creates an SVG

↓

🗺️ **MapGrid**

places that SVG at `(6,4)`

↓

👁️ **Browser**

renders the light-blue coastal tile.

This boundary is one of the most important things to understand about the project.

---

# **🖱️ Chapter 35 — Clicking the Map**

`MapGrid` also contains click handling.

When the user clicks the map, the browser initially gives us a position related to the screen.

But our world uses its own SVG coordinate system.

Those are not automatically the same.

At Zoom 1 especially, one screen pixel may correspond to many world units.

So a conversion is necessary.

---

# **📐 35.1 Screen Space Versus SVG World Space**

Imagine clicking at:

**screen X \= 500**

**screen Y \= 300**

Those values describe the browser display.

But perhaps the current SVG `viewBox` starts thousands of world units into the map.

The click therefore cannot simply be interpreted as:

**world coordinate (500,300)**.

We must transform it into the SVG's coordinate system.

This is another example of the difference between:

🖥️ **screen coordinates**

and:

🌍 **world coordinates**.

---

# **⬡ 35.2 Finding the Hex From the Click**

Once the click has been translated into the appropriate SVG/world coordinate space, `MapGrid` can determine which hexagon is relevant and work with its coordinate.

This lays the groundwork for the actual World Builder interaction we will eventually need:

🖱️ choose Grass

↓

🖱️ click a hex

↓

⬡ determine its coordinate

↓

🗄️ change that coordinate's database record

↓

🎨 update its graphic

The current file provides important geometric pieces needed for that future interaction.

---

# **🔭 Chapter 36 — The World Frame**

`MapGrid` also exposes:

`getWorldFrame()`.

A frame describes a rectangle with values such as:

x,

y,

width,

height.

The minimap receives this frame when it is created.

This means the minimap knows the dimensions of the actual world rather than inventing its own scale.

Again, there is one authoritative world geometry.

That reduces duplication.

---

# **🧭 Chapter 37 — Viewport Listeners**

`MapGrid` supports listeners that can be informed when the viewport changes.

This is important for the minimap.

Imagine zooming into the main map.

The minimap needs to update the rectangle showing:

**“This is the part of the world you are currently looking at.”**

We therefore need communication in the opposite direction too.

Earlier we saw:

🧭 Minimap → MapGrid

when clicking the minimap or choosing zoom.

But we also need:

🗺️ MapGrid → Minimap

when the viewport changes.

The listener mechanism enables that relationship.

---

# **👀 37.1 The Observer Idea**

This resembles an important general programming pattern:

**one object changes**

↓

**interested objects are notified**

The map does not need to contain hard-coded instructions specifically for drawing the minimap.

Instead, another object can register interest in viewport changes.

This reduces coupling between the components.

---

# **📏 Chapter 38 — `ResizeObserver`**

The map also needs to know when its visible container changes size.

For example, the browser window may be resized.

The available map area might become wider or narrower.

The code uses the browser's:

`ResizeObserver`

to observe such changes.

This is useful because Zoom 1 is intended to show the whole map appropriately inside the available area.

If the available display area changes, the view may need to be recalculated.

---

# **🔬 Chapter 39 — Why Zoom 5 Is Special for Our Graphics**

Zoom 5 was deliberately designed around the relationship:

**1 world unit ≈ 1 CSS pixel**

at that close inspection level.

Our canonical hex width is:

**260 world units.**

Therefore, at Zoom 5, the tile appears approximately:

**260 CSS pixels wide.**

This is extremely useful while developing terrain artwork.

Suppose `ocean.ts` places a wave at:

**x \= 130**

inside its canonical tile.

At Zoom 5, that design coordinate becomes visually intuitive because we are viewing the tile near its natural coordinate scale.

We can inspect the actual shapes rather than looking at a tiny compressed version of them.

---

# **🌊 39.1 Why the Ocean Still Works at Zoom 1**

SVG is vector graphics.

The Ocean tile is not a fixed 260 × 300 bitmap that becomes inherently blurry when resized.

Its waves, ellipses, gradients and polygons are mathematical vector shapes.

The browser can render them at different display sizes.

That is one of the major reasons SVG is so suitable for this project.

---

# **🧠 Chapter 40 — Three Coordinate Systems to Keep Separate**

By this stage we are working with several notions of coordinates.

Keeping them separate will prevent a lot of confusion.

### **⬡ 1\. Hex-grid coordinates**

Examples:

`(6,4)`

`(12,4)`

These identify **which hex** we mean.

They are discrete logical coordinates.

---

### **🌍 2\. SVG world coordinates**

Examples might be positions measured in hundreds or thousands of world units.

These determine **where the hex is physically drawn** inside the map SVG.

Our canonical tile width of 260 belongs to this coordinate system.

---

### **🖥️ 3\. Screen/CSS pixels**

These describe the physical display area in the browser.

Zoom determines the relationship between world units and visible pixels.

These are different concepts.

A hex coordinate such as:

`(12,4)`

does **not** mean:

X \= 12 pixels, Y \= 4 pixels.

The hex library converts the logical grid coordinate into a physical world position.

SVG then transforms the world position into the visible screen according to the `viewBox`.

---

# **🧩 Chapter 41 — The Entire Geometry Pipeline**

We can now trace the graphical side of one hex.

### **1️⃣ Logical coordinate**

`(12,4)`

↓

### **2️⃣ `midgard-hex-grid`**

Calculates the hex's center and six corner points.

↓

### **3️⃣ `MapGrid`**

Creates an SVG polygon from those points.

↓

### **4️⃣ `MapGrid`**

Calculates the rectangular placement around the center.

↓

### **5️⃣ `MapArea`**

Reads IndexedDB and discovers:

`terrain = grass`

↓

### **6️⃣ Renderer**

Chooses the appropriate representation.

↓

### **7️⃣ `MapGrid`**

Places that representation into the canonical rectangle.

↓

### **8️⃣ SVG `viewBox`**

Determines how much of the world is currently visible.

↓

### **9️⃣ Browser**

Scales that world view into the available CSS display area.

This is a surprisingly rich journey from:

**one logical coordinate**

to:

**one visible Civilization tile.**

---

# **🗄️ 42\. How `MapGrid` and IndexedDB Deliberately Do Not Know Too Much About Each Other**

One of the strongest aspects of the current design is what these classes **do not know**.

`WorldDatabase` does not know:

how many pixels wide a hex appears,

how to create an SVG polygon,

how Zoom 5 works,

how waves are drawn.

`MapGrid` does not know:

what `terrain: 'ocean'` means,

what a Dexie table is,

which database version we are on,

how Relief was migrated.

Instead:

**MapArea connects them.**

That gives us three clear responsibilities:

### **🗄️ `WorldDatabase`**

**Store the world.**

### **🗺️ `MapGrid`**

**Represent and navigate the world's geometry.**

### **🧠 `MapArea`**

**Interpret stored world data and connect it to graphics.**

This separation is becoming the central architecture of Civilization 8 — World Builder.

---

# **⭐ 43\. What to Remember From `map-grid.ts`**

You do not need to memorize every zoom calculation.

Remember the concepts.

### **⬡ The reusable library owns hex mathematics**

Civilization 8 consumes that geometry rather than duplicating it.

### **🌍 The map has its own world coordinate system**

The canonical hex is 260 world units wide.

### **🖼️ SVG `viewBox` behaves like a camera**

Changing the viewBox changes what part of the world we see and how large it appears.

### **🔎 Zoom does not rebuild the hexagons**

It changes our view of the same geometry.

### **📍 `MapGrid` remembers polygons and placements by coordinate**

This lets other parts of the application address a particular hex.

### **🎨 `setHexFill()` changes the basic polygon appearance**

### **🖼️ `setHexGraphic()` places an entire nested SVG over a hex**

It is generic and does not know whether that SVG represents Ocean, Coast or something else.

### **🗄️ IndexedDB does not belong inside `MapGrid`**

The database describes the world.

`MapGrid` handles its geometry and graphical placement.

---

# **🌟 44\. Where We Are Now**

We have now connected three major concepts:

🗄️ **Persistent semantic world**

⬇️

⬡ **Hexagonal world geometry**

⬇️

🎨 **SVG representation**

But there is still a question we have deliberately postponed:

> **How can `ocean.ts` know exactly what shape and size one canonical Civilization hex should have?**

And another:

> **How do our TypeScript files actually create SVG elements such as `<svg>`, `<polygon>`, `<path>` and `<linearGradient>`?**

Those questions lead directly into the small but extremely important foundation of our graphics system.

