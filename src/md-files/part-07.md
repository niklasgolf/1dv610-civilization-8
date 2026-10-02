## **Part VII — `ocean.ts`: Drawing an Ocean Hex From Scratch**

We have now built all the foundations needed to understand one of our first real terrain graphics:

**`graphics/terrain/ocean.ts`**

This file does something very different from `world-database.ts`.

IndexedDB stores a simple semantic fact:

**terrain \= ocean**

It does not store colours, waves, gradients or SVG paths.

When `MapArea` encounters an Ocean record, it calls:

`createOcean()`

That function's job is to answer:

> **What should one Ocean hex actually look like?**

The result is a complete `SVGSVGElement` that `MapGrid` can position over the appropriate hex.

---

# **🌊 Chapter 58 — One Function Creates One Complete Ocean Tile**

The central function is:

`createOcean()`.

Every time this function is called, it creates a new SVG representing one Ocean hex.

This is important because our current world contains a very large number of Ocean records.

For each one, `MapArea` calls `createOcean()` and receives a new SVG element.

So conceptually:

🗄️ Ocean record

↓

🌊 `createOcean()`

↓

🖼️ one complete Ocean SVG

↓

🗺️ `MapGrid.setHexGraphic()`

↓

⬡ positioned on the map

The function does not need to know *which* coordinate it will occupy.

It simply creates one reusable kind of terrain representation.

---

# **📥 58.1 The Imports Tell the Story**

Ocean imports:

`HEX_BOUNDS`

`HEX_POINTS`

from our graphics definitions.

It also imports:

`appendSvg`

and:

`createSvg`

from our SVG primitives.

This is exactly the architecture we discussed in the previous part.

From `hex.ts`, Ocean learns:

📐 **how large the canonical canvas is**

and:

⬡ **where the six hex corners are**

From `svg.ts`, Ocean gets:

🧰 **tools for constructing SVG elements**

Ocean itself can therefore concentrate on the artistic composition.

---

# **🔢 Chapter 59 — `oceanSerial`: Why Every Ocean Gets a Number**

Near the top is:

`let oceanSerial = 0`

Then, every time `createOcean()` runs:

`oceanSerial += 1`

The function uses that number to create two IDs:

an Ocean clip ID

and:

an Ocean gradient ID.

Conceptually, the first tile might receive:

**ocean-clip-1**

**ocean-gradient-1**

The next:

**ocean-clip-2**

**ocean-gradient-2**

Then:

**ocean-clip-3**

**ocean-gradient-3**

and so forth.

Why do we bother?

Because SVG definitions can be referenced by ID.

---

# **🏷️ 59.1 IDs Must Not Collide**

Later in the file, our artwork refers to its clip path using an ID.

Likewise, the water rectangle refers to its gradient using an ID.

If every Ocean tile created:

`id="ocean-gradient"`

we could end up with hundreds or more elements in the document using exactly the same identifier.

Then a reference intended for one Ocean tile could become ambiguous or resolve to the wrong definition.

Our serial counter avoids this.

Every generated tile receives unique identifiers.

This is especially relevant in our architecture because we are not drawing one Ocean.

We can have more than a thousand terrain SVGs inside the world.

---

# **🧠 59.2 The Serial Number Is Runtime Graphics State**

This number is not world data.

We do **not** store:

`oceanSerial`

in IndexedDB.

If the page reloads and the counter starts again from zero, that is fine.

The IDs only need to work correctly in the SVG document that currently exists.

This gives us another useful distinction:

🗄️ **Persistent state:** this coordinate is Ocean.

🎨 **Temporary rendering detail:** this particular generated SVG happens to use `ocean-gradient-437`.

Only the first fact needs to survive the reload.

---

# **🖼️ Chapter 60 — Creating the Outer SVG**

The function creates its outer SVG using:

`createSvg('svg', ...)`

Its `viewBox` begins at:

`0 0`

and uses:

`HEX_BOUNDS.width`

and:

`HEX_BOUNDS.height`

for its dimensions.

So once again, the terrain graphic lives in the local canonical coordinate system we established earlier.

The tile thinks:

**my upper-left corner is `(0,0)`**

It does not care where the tile will eventually be placed in the world.

---

# **📐 60.1 `viewBox` Revisited**

Suppose the canonical bounds are approximately:

**260 world units wide**

and:

**300 world units high**

Then the Ocean can design its artwork using that coordinate space.

An X position near:

130

is roughly halfway across the tile.

A Y position near half the height is roughly halfway down.

This is why the rest of the file frequently calculates positions from:

`HEX_BOUNDS.width`

and:

`HEX_BOUNDS.height`.

The artwork is expressed relative to the canonical canvas.

---

# **📚 Chapter 61 — `<defs>`: Definitions That Are Not Directly Drawn**

The first child added to the SVG is:

`defs`

This is short for:

**definitions**.

SVG's `<defs>` element is a place where we can define graphical resources for later use.

Things inside `<defs>` are generally not intended to appear simply because they have been declared there.

Instead, other SVG elements refer to them.

Our Ocean uses `<defs>` for two important resources:

✂️ the hexagonal clipping shape

and:

🎨 the water gradient.

Conceptually:

**Ocean SVG**

↳ **defs**

 ↳ clipPath

 ↳ linearGradient

↳ actual artwork

This is a very common SVG pattern.

---

# **✂️ Chapter 62 — `<clipPath>`: Turning a Rectangle Into a Hex Tile**

Next we create:

`clipPath`

and assign it our unique:

`clipId`.

Inside that clip path we create:

`polygon`

whose points come from:

`pointsAttribute()`.

This is one of the most important pieces of the terrain system.

---

# **🖼️ 62.1 Our Canvas Is Rectangular**

Remember that the Ocean SVG itself is rectangular.

If we simply painted its entire background blue, we would have a blue rectangle.

But the Civilization map is composed of hexagons.

So we need to say:

> **“You may draw throughout this rectangular canvas, but only the portion inside this hexagon should actually be visible.”**

That is what the clip path does.

---

# **⬡ 62.2 The Clip Polygon Uses `HEX_POINTS`**

At the bottom of the file, `pointsAttribute()` transforms our normalized `HEX_POINTS` into the string format expected by an SVG polygon.

Each point has:

`x`

and:

`y`.

The function maps them into:

`x,y`

pairs

and joins those pairs with spaces.

Conceptually, six points become something resembling:

`x1,y1 x2,y2 x3,y3 x4,y4 x5,y5 x6,y6`

That string becomes the polygon's:

`points`

attribute.

So the clipping polygon has exactly the same canonical geometry derived from `midgard-hex-grid`.

---

# **🔗 62.3 Geometry Flows All the Way From the Library**

This is worth following carefully.

**midgard-hex-grid**

↓

creates authoritative hex points

↓

**`hex.ts`**

normalizes those points

↓

exports:

`HEX_POINTS`

↓

**`ocean.ts`**

turns those points into an SVG polygon

↓

**clipPath**

uses that polygon to cut the artwork

The Ocean tile therefore has the same shape as the geometry used by the map.

We have not manually approximated the hex.

---

# **🎨 Chapter 63 — `<linearGradient>`: Giving the Ocean Depth**

The second important definition is:

`linearGradient`.

It receives the unique:

`gradientId`.

The gradient is configured vertically.

It begins toward the top of the tile and progresses toward the bottom.

Inside the gradient are three:

`stop`

elements.

A gradient stop says:

> **“At this position along the gradient, use this colour.”**

---

# **🌊 63.1 The Three Ocean Colours**

Our current Ocean gradient uses three dark blue tones.

At the top:

`#164f70`

Around the middle:

`#0e4664`

At the bottom:

`#0a3854`

The middle stop is positioned at:

**55%**

rather than exactly 50%.

This produces a subtle vertical variation rather than one completely flat blue colour.

---

# **🎨 63.2 What the Browser Does Between Stops**

We do not manually calculate every intermediate blue.

SVG interpolates between the colours.

Conceptually:

top dark-blue colour

↓

gradually changes

↓

middle blue

↓

gradually changes

↓

deeper bottom blue

This is one of the strengths of vector graphics.

We describe the structure of the gradient.

The browser performs the interpolation.

---

# **🧠 63.3 The Gradient Is a Definition, Not Yet Water**

At this point we have created:

`linearGradient`

inside:

`defs`.

But we have not yet drawn a visible rectangle using it.

The gradient is simply available for reference.

This is similar to defining a paint before painting something with it.

---

# **🖼️ Chapter 64 — `<g>`: Grouping the Actual Artwork**

After the definitions are complete, Ocean creates:

`artwork`

as an SVG:

`g`

element.

`g` means:

**group**.

A group lets us collect multiple SVG shapes together.

Our Ocean group will contain:

a rectangle,

two ellipses,

and several wave paths.

But most importantly, the group receives:

`clip-path`

pointing to our unique clipping definition.

---

# **✂️ 64.1 One Clip Applied to the Whole Group**

This is very convenient.

Instead of individually clipping:

the rectangle,

ellipse 1,

ellipse 2,

wave 1,

wave 2,

wave 3,

and so on,

we put them all inside one group and clip the group.

Conceptually:

✂️ **Hexagonal clip**

applies to:

📦 **Artwork group**

containing:

🌊 background

💡 light area

🌑 shadow area

〰️ waves

Anything outside the hex is hidden.

---

# **🔗 64.2 `url(#...)`**

The clip reference has the form conceptually:

`url(#ocean-clip-17)`

This does not mean an external web URL.

Here SVG is saying:

**“Use the definition in this document whose ID is `ocean-clip-17`.”**

The `#` indicates an ID reference.

We will use the same idea for the gradient.

---

# **🌊 Chapter 65 — The Base Water Rectangle**

Inside the clipped group, the first visible shape is:

`rect`.

It begins at:

`x = 0`

`y = 0`

and covers:

the complete `HEX_BOUNDS.width`

and:

the complete `HEX_BOUNDS.height`.

So it paints the entire rectangular tile canvas.

But remember:

the group is clipped.

Therefore the user sees only the hexagonal portion of that rectangle.

---

# **🎨 65.1 Filling the Rectangle With the Gradient**

Instead of a plain colour, its fill refers to:

`url(#${gradientId})`

So conceptually:

**rectangle**

says:

> “Paint me using the gradient defined earlier.”

This finally turns the gradient definition into visible water.

We now have:

🟦 rectangular gradient

* 

✂️ hexagonal clipping

\=

⬡ hex-shaped gradient water tile.

---

# **💡 Chapter 66 — The First Ellipse: Subtle Light in the Water**

Next we add an:

`ellipse`.

An SVG ellipse is described using:

`cx` — center X

`cy` — center Y

`rx` — horizontal radius

`ry` — vertical radius

Our first ellipse is positioned toward the upper-left portion of the tile.

Its center uses proportions of the tile dimensions:

about 28% across

and:

32% down.

Its horizontal radius is about:

42% of the tile width

and its vertical radius about:

24% of the tile height.

---

# **📐 66.1 Why Multiply by Width and Height?**

Instead of writing a hard-coded position such as:

`cx = 72.8`

we express it as:

`HEX_BOUNDS.width * 0.28`

This says:

**28% across the tile.**

That communicates the artistic intention more clearly.

Likewise:

`HEX_BOUNDS.height * 0.32`

means:

**32% down the tile.**

This relative style also keeps the artwork conceptually tied to the canonical bounds.

---

# **🌤️ 66.2 Colour and Opacity**

The ellipse uses:

`fill: '#28718e'`

and:

`opacity: '0.16'`

An opacity of 1 would be fully opaque.

An opacity of 0 would be completely invisible.

So:

0.16

means only 16% opacity.

The ellipse therefore does not look like a solid oval painted on the Ocean.

Instead, it gently modifies the water underneath.

This creates a subtle patch of lighter water.

---

# **🌑 Chapter 67 — The Second Ellipse: A Darker Region**

The next ellipse is positioned more toward the lower-right area.

Its fill is:

`#062f49`

with:

`opacity: '0.18'`.

This produces the opposite effect:

a subtle darker region.

So before drawing even a single wave, the water already contains several visual layers:

🎨 vertical gradient

➕

💡 translucent lighter region

➕

🌑 translucent darker region

This prevents the tile from looking like a completely flat block of blue.

---

# **🥞 67.1 SVG Is Layered by Drawing Order**

The order in which these shapes are appended matters.

First:

background rectangle

then:

light ellipse

then:

dark ellipse

then:

waves.

Later shapes are drawn over earlier shapes.

So the Ocean is constructed like layers of transparent paint.

This is a very useful way to think about SVG artwork.

---

# **〰️ Chapter 68 — Adding the Waves**

Now the file calls:

`addWave(...)`

six times.

Each call provides:

an X position,

a Y position,

and:

a width.

For example, one wave begins around:

20% across,

27% down,

with a width of around:

43% of the tile.

Another appears elsewhere.

The waves are deliberately distributed around the tile rather than forming a rigid repeated grid.

---

# **🧠 68.1 `addWave()` Is a Drawing Primitive Inside Ocean**

Instead of writing six nearly identical SVG path constructions, the file extracts the repeated logic into:

`addWave()`.

This helper knows:

**how to draw one wave**

while:

`createOcean()`

decides:

**where the waves should go.**

This is another small example of separating:

**construction technique**

from:

**composition**.

---

# **📐 Chapter 69 — Converting Relative Wave Values Into Real Coordinates**

`addWave()` receives values such as:

`0.20`

`0.27`

`0.43`.

These are proportions.

Inside the function they are converted into actual local SVG coordinates.

The start X becomes:

tile width × X proportion.

The start Y becomes:

tile height × Y proportion.

The wave width becomes:

tile width × width proportion.

The amount of rise/fall is based on:

tile height × 0.018.

So the wave geometry is constructed relative to the tile.

---

# **🌊 69.1 A Wave Has a Start, Width and Rise**

Conceptually, we now know:

📍 **where the wave begins**

↔️ **how wide it is**

↕️ **how much it bends vertically**

The remaining question is:

**How does SVG turn those numbers into a smooth curved line?**

That is the job of the path.

---

# **✏️ Chapter 70 — SVG `<path>`: One of the Most Powerful SVG Elements**

The wave is created as an SVG:

`path`.

A path can describe extremely complex shapes and lines.

Its most important attribute is:

`d`

which stands for the path's drawing instructions.

The `d` string is essentially a tiny drawing language.

Our Ocean wave uses:

**M**

and:

**C**

commands.

---

# **📍 70.1 `M` Means Move To**

The wave begins with something conceptually like:

`M startX startY`

`M` means:

**move to this position.**

Imagine putting a pen down at a particular coordinate without drawing the journey to get there.

So:

`M 50 80`

means:

**“Start the path at X 50, Y 80.”**

---

# **🌀 Chapter 71 — `C` Means Cubic Bézier Curve**

Next comes:

`C`.

This is where the smooth wave shape is created.

`C` means:

**cubic Bézier curve**.

A cubic Bézier segment uses:

a starting point,

two control points,

and:

an ending point.

The starting point is already known from the previous path command.

The `C` command therefore supplies six numbers:

**control point 1 X**

**control point 1 Y**

**control point 2 X**

**control point 2 Y**

**end X**

**end Y**

---

# **🎯 71.1 What Are Control Points?**

Control points influence the direction and curvature of the line.

The curve does not necessarily pass through the control points.

Instead, think of them as magnets pulling the curve.

If both control points sit above the straight line between start and end, the curve bends upward.

If they sit below, it bends downward.

This is how we create smooth wave-like motion.

---

# **🌊 71.2 The First Half of Our Wave**

Our first cubic curve uses control points slightly above the baseline.

It ends halfway across the wave at the original Y level.

Conceptually:

**start on baseline**

↓

**curve upward**

↓

**return to baseline at the middle**

That creates the first hump.

---

# **🌊 71.3 The Second Half**

The second `C` command uses control points below the baseline.

Then it ends at the full wave width back on the baseline.

Conceptually:

**middle baseline**

↓

**curve downward**

↓

**return to baseline at the end**

Together:

upward curve

* 

downward curve

\=

〰️ a gentle S-like water wave.

---

# **🧮 71.4 Why Fractions Such as `0.18`, `0.32`, `0.5` Appear**

The code positions its control points relative to the total wave width.

For example:

18% through the wave,

32% through,

50% through,

68% through,

82% through,

100% through.

This creates a balanced curve without hard-coding absolute coordinates.

The structure is approximately:

**0%** → start

**18–32%** → control upward curvature

**50%** → return to baseline

**68–82%** → control downward curvature

**100%** → finish on baseline

That gives the wave its smooth symmetry.

---

# **🖌️ Chapter 72 — Styling the Wave**

The path uses:

`fill: 'none'`

because we do not want a filled shape.

We want a line.

The stroke colour is:

`#82b9ca`

a lighter blue.

The stroke width is:

`2.2`

The line caps are:

`round`

and opacity is:

`0.22`.

So the wave is intentionally subtle.

It should add texture to the Ocean without looking like a bright cartoon line sitting on top of it.

---

# **✨ 72.1 `stroke-linecap="round"`**

Without rounded line caps, the ends of the wave could look abruptly chopped off.

`round`

gives the endpoints a softer appearance.

Small attributes like this can make simple vector graphics look considerably more polished.

---

# **👻 72.2 Low Opacity Again**

The wave uses only 22% opacity.

This means the underlying gradient remains visible through it.

Our Ocean artwork relies heavily on transparency.

Rather than using many strong opaque shapes, we layer subtle effects.

This gives the tile more visual depth while keeping the design simple.

---

# **📤 Chapter 73 — Returning the Finished SVG**

After the background, ellipses and waves have been created, `createOcean()` returns:

the outer `svg`.

At this point it is a complete independent graphical object.

It contains:

📚 definitions

✂️ clipping

🎨 gradient

🌊 background

💡 light variation

🌑 shadow variation

〰️ six wave paths

But it still does not know where it belongs in the world.

That happens later.

---

# **🗺️ 73.1 `MapGrid` Does the Placement**

Remember what `MapArea` does when a database record says:

`ocean`.

It creates:

`createOcean()`

and passes the result to:

`setHexGraphic()`.

`MapGrid` then gives that returned SVG its:

world X,

world Y,

canonical width,

and:

canonical height.

This is the moment the local Ocean artwork becomes part of the global world.

---

# **🗄️ Chapter 74 — Following One Ocean From IndexedDB to the Screen**

Now we know enough to follow the complete process in detail.

Suppose IndexedDB contains a record:

**x:** 20  
**y:** 8  
**terrain:** ocean  
**relief:** flat

### **🗄️ Step 1 — IndexedDB**

The persistent fact is:

**this coordinate is Ocean and Flat.**

No waves are stored.

No gradient is stored.

No SVG is stored.

↓

### **📦 Step 2 — Dexie**

`toArray()` returns that record to our TypeScript application.

↓

### **🧠 Step 3 — `MapArea`**

`renderHexTerrain()` sees:

`terrain === 'ocean'`

↓

### **🌊 Step 4 — `createOcean()`**

A completely new Ocean SVG is constructed.

It receives unique clip and gradient IDs.

↓

### **📐 Step 5 — Canonical geometry**

`HEX_BOUNDS` determines its canvas dimensions.

`HEX_POINTS` determines the clipping polygon.

↓

### **🎨 Step 6 — SVG artwork**

Gradient, ellipses and waves are constructed.

↓

### **🗺️ Step 7 — `MapGrid`**

The graphic is positioned over coordinate `(20,8)`.

↓

### **🎥 Step 8 — Main map `viewBox`**

The current zoom and center determine whether that world location is visible and how large it appears.

↓

### **👁️ Step 9 — Browser**

The user sees an Ocean hex.

This is the entire architecture working together.

---

# **🧠 Chapter 75 — Why We Don't Store `createOcean()` in IndexedDB**

This is worth emphasizing because it gets to the heart of good data modelling.

The database should store:

**meaningful world state.**

The Ocean SVG is merely one current visual interpretation of that state.

Imagine that tomorrow we decide:

🌊 waves should be smaller,

🎨 the gradient should be more purple,

✨ there should be tiny highlights,

or:

🌀 we want four deterministic Ocean variants.

We can change the graphics code.

Every existing database record saying:

`terrain: 'ocean'`

remains perfectly valid.

When the world is next rendered, those records simply receive the new visual representation.

This is one of the major benefits of keeping **data and presentation separate**.

---

# **🧱 Chapter 76 — Ocean Is Built From Simple Pieces**

It is also worth noticing how little exotic technology was required.

Our Ocean consists primarily of:

⬡ one polygon used for clipping

🎨 one linear gradient

▭ one rectangle

🥚 two ellipses

〰️ six paths

No bitmap image.

No Photoshop texture.

No WebGL.

No complicated filter effects.

The richness comes from **composition**.

Simple vector primitives are layered together.

This is an important SVG lesson:

> Complex-looking graphics can often be constructed from surprisingly simple shapes.

---

# **🧬 76.1 The Same Philosophy Appears in Our Data Model**

There is an interesting parallel here.

Our data model prefers:

**Grass \+ Hills**

rather than inventing one giant concept:

**GrassHillsTerrain**

Our graphics similarly prefer composition:

**gradient \+ ellipse \+ ellipse \+ waves \+ clipping**

rather than one monolithic graphical object.

Both systems become easier to extend when complex things are built from smaller parts.

---

# **⭐ 77\. What to Remember From `ocean.ts`**

### **🌊 `createOcean()` creates one complete terrain SVG**

It does not place it in the world.

### **🔢 `oceanSerial` creates unique IDs**

This prevents the many Ocean SVG definitions from colliding.

### **📚 `<defs>` contains reusable SVG definitions**

Our clip path and gradient live there.

### **✂️ `<clipPath>` makes the rectangular artwork appear hexagonal**

It uses the authoritative normalized `HEX_POINTS`.

### **🎨 `<linearGradient>` creates the basic water depth**

Three colour stops produce vertical variation.

### **🥚 Transparent ellipses create light and shadow regions**

They make the water less visually flat.

### **〰️ SVG paths create the waves**

`M` moves to the starting point.

`C` draws cubic Bézier curves.

### **👻 Opacity allows layers to blend**

Much of the Ocean's visual character comes from subtle transparent overlays.

### **🗄️ IndexedDB stores none of these graphical details**

It stores the semantic terrain value:

`ocean`.

That value is what causes this graphic to be created.

---

# **🌊 78\. From Ocean to Coast**

Our Coast graphic uses the same overall architecture.

That is intentional.

Both represent water.

Both need:

a canonical canvas,

hexagonal clipping,

a vertical gradient,

subtle tonal variation,

and:

wave paths.

But Coast needs to communicate a different semantic terrain type.

IndexedDB distinguishes:

`ocean`

from:

`coast`.

The graphics layer must therefore make that distinction visible too.

