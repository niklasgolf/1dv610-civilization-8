## **Part VI — The Foundation of Our SVG Graphics**

We have reached two small files that are much more important than their size suggests:

**`graphics/definitions/hex.ts`**

and:

**`graphics/primitives/svg.ts`**

Together they establish two fundamental rules for the entire graphics system:

📐 **What size and shape is one canonical hex graphic?**

🎨 **How do we create SVG elements from TypeScript?**

Once these two ideas are clear, `ocean.ts` and `coast.ts` become much easier to understand.

---

# **📐 Chapter 45 — `hex.ts`: Defining the Canonical Graphic Hex**

The file begins by importing:

`HexGrid`

from our reusable `midgard-hex-grid` library. hex

This is significant.

Even our graphics system does not invent its own version of a hexagon.

There is still one authority for hex geometry:

**midgard-hex-grid**

That prevents a dangerous situation where the map uses one mathematical hex shape while the terrain graphics use a slightly different one.

---

# **📏 45.1 The Most Important Number: 260**

The file exports:

`HEX_WORLD_WIDTH = 260` hex

This number establishes the standard size of our graphical hex.

It is measured in **world units**, not necessarily screen pixels.

That distinction is important.

At Zoom 5, one world unit is designed to correspond approximately to one CSS pixel, so the hex appears roughly 260 pixels wide.

At Zoom 1, the same 260-world-unit hex appears much smaller.

Its world size has not changed.

Our view of it has.

---

# **🧱 45.2 Why Have One Canonical Size?**

Imagine that every terrain file invented its own dimensions.

Ocean might assume:

260 × 300

Grass might assume:

300 × 350

Desert might assume:

220 × 280

Then `MapGrid` would need special knowledge about every terrain graphic.

Instead, we establish one shared graphical standard.

Every terrain artist can think:

> **“I am drawing inside the standard Civilization hex canvas.”**

Then `MapGrid` can position any compliant graphic in exactly the same way.

This is why `HEX_WORLD_WIDTH` belongs in:

**`graphics/definitions`**

rather than inside `ocean.ts`.

It is a shared graphical definition.

---

# **⬡ 45.3 Asking the Library for a Real Hexagon**

The file creates:

`new HexGrid('x-dominated')` hex

Then it asks the grid to create a single hexagon using our canonical width. hex

This is a clever approach.

We could theoretically hard-code six points ourselves.

But then we would be duplicating geometry already owned by our library.

Instead we say:

**“midgard-hex-grid, give the graphics system one real canonical x-dominated hexagon with width 260.”**

The library returns the hexagon and its points.

Now the graphics system can derive everything else from those authoritative points.

---

# **📍 45.4 What Are `canonicalHexagon.points`?**

A polygonal hexagon has six corners.

The library gives us those corner positions.

Conceptually, imagine:

**top-left-ish corner**

**top-right-ish corner**

**right corner**

**bottom-right-ish corner**

**bottom-left-ish corner**

**left corner**

Each corner has:

`x`

and:

`y`

coordinates.

Together those six points define the shape.

Our code does not need to know the trigonometry that produced them.

It simply receives the result.

---

# **🔍 45.5 Finding the Smallest and Largest Coordinates**

Next, the file calculates:

`minX`

`maxX`

`minY`

`maxY`. hex

This deserves a closer look because it is a common graphics technique.

Suppose the six X coordinates were conceptually:

50, 150, 200, 150, 50, 0

Then:

**minimum X \= 0**

**maximum X \= 200**

Likewise, we inspect every Y coordinate to find the highest and lowest extent of the shape.

Once we know the extremes, we know the rectangle that completely surrounds the hexagon.

---

# **🧮 45.6 The Spread Operator Appears Again**

The calculations use the spread syntax:

`...`

We encountered this earlier in `EditorLayout`.

Here, the points are first transformed using:

`map(...)`

into an array of numbers.

Conceptually:

`[x₁, x₂, x₃, x₄, x₅, x₆]`

Then the spread operator gives those numbers individually to:

`Math.min(...)`

or:

`Math.max(...)`.

So conceptually:

`Math.min(...values)`

means:

**“Give Math.min every number in this array as an individual argument.”**

This lets us find the extreme coordinate among all six corners.

---

# **📦 Chapter 46 — `HEX_BOUNDS`: The Rectangle Around the Hex**

Once the minimum and maximum values are known, the file constructs:

`HEX_BOUNDS`. hex

It contains:

**x \= minX**

**y \= minY**

**width \= maxX − minX**

**height \= maxY − minY**

This describes the smallest axis-aligned rectangle capable of containing the complete hexagon.

---

# **🖼️ 46.1 Why a Rectangle Matters for a Hexagon**

This may initially seem strange.

Our game uses hexagons.

Why are we so interested in a rectangle?

Because our individual terrain SVGs are rectangular SVG canvases.

The relationship is:

**rectangular SVG canvas**

contains:

**hexagonal visible tile**

This is enormously convenient.

SVG itself naturally uses rectangular coordinate systems and `viewBox` rectangles.

So instead of trying to make the entire graphics system conceptually hex-shaped, we let the drawing surface remain rectangular and use clipping to define the visible hexagonal area.

---

# **✂️ 46.2 The Rectangle Can Contain Artwork Outside the Hex**

Suppose we later draw a mountain.

Part of the mountain artwork might extend into a corner of the rectangular canvas that lies outside the actual hex.

That is not necessarily a problem.

We can draw freely.

Later:

`clipPath`

can say:

**“Only show the part of this artwork that falls inside the six-sided hex.”**

This is exactly what our current Ocean and Coast graphics already do.

---

# **📍 Chapter 47 — `HEX_POINTS`: Moving the Hex to a Local Coordinate System**

The original points returned by `midgard-hex-grid` belong to the coordinate system in which the library created the canonical hex.

But our terrain graphics would be easier to design if their local coordinate system started at the top-left of their own bounding rectangle.

So the file creates:

`HEX_POINTS`

by subtracting:

`HEX_BOUNDS.x`

from every X coordinate

and:

`HEX_BOUNDS.y`

from every Y coordinate. hex

This is called **normalizing** the points.

---

# **🧭 47.1 Why Normalize?**

Imagine the library returned a hex whose bounding rectangle begins at:

**x \= 370**

**y \= 500**

That might make perfect sense in some larger coordinate system.

But it would be annoying if every terrain graphic had to think:

**“My local top-left begins at 370,500.”**

Instead we subtract those minimum values.

Now the local graphic begins at:

**0,0**

The hex still has exactly the same size and shape.

We have merely translated it.

---

# **🖼️ 47.2 Local Coordinates Versus World Coordinates**

This gives us another important coordinate distinction.

### **🎨 Local terrain coordinates**

A terrain graphic thinks:

**my top-left is `(0,0)`**

and:

**my width is `HEX_BOUNDS.width`**

**my height is `HEX_BOUNDS.height`**

It doesn't care where it will eventually appear in the world.

### **🌍 World coordinates**

`MapGrid` later says:

**“Place this entire local canvas at world position X,Y.”**

This is a powerful idea.

Ocean can be designed once in its own local coordinate system.

Then the same Ocean graphic design can be placed at:

`(0,2)`

or:

`(6,4)`

or:

`(30,18)`

without changing how Ocean itself is drawn.

---

# **🧩 47.3 The Complete Purpose of `hex.ts`**

The entire file can therefore be summarized as:

⬡ Ask the hex library for one authoritative canonical hex.

↓

📏 Make it 260 world units wide.

↓

📐 Calculate its rectangular bounding box.

↓

📍 Translate its points into a local coordinate system beginning at the bounding rectangle's top-left.

↓

📤 Export the dimensions and normalized points for the rest of the graphics system.

That small file establishes the geometry contract for our terrain artwork.

---

# **🎨 Chapter 48 — `svg.ts`: Creating SVG From TypeScript**

Now we reach:

**`graphics/primitives/svg.ts`**

This file contains only two helper functions and one constant, but almost every graphical part of our application depends on the idea behind them.

It starts with:

`SVG_NS = 'http://www.w3.org/2000/svg'` svg

This introduces an important web concept:

**XML namespaces.**

---

# **🌐 48.1 HTML and SVG Live in the Same Document, but They Are Different Languages**

Our browser page contains ordinary HTML elements such as:

`div`

`button`

`header`

`main`

`h1`

But it also contains SVG elements such as:

`svg`

`polygon`

`path`

`ellipse`

`linearGradient`

`clipPath`

These are not ordinary HTML elements.

They belong to SVG.

The browser therefore needs to know:

> **“When I create this `path`, do I mean an SVG path?”**

That is what the namespace helps establish.

---

# **🧱 48.2 Ordinary HTML Uses `createElement()`**

Earlier we saw code such as:

`document.createElement('button')`

and:

`document.createElement('div')`

Those are HTML elements.

The browser already understands that they belong to the HTML document's normal element namespace.

---

# **🎨 48.3 SVG Uses `createElementNS()`**

Our SVG helper instead uses:

`document.createElementNS(SVG_NS, name)` svg

The `NS` means:

**namespace**.

So conceptually we tell the browser:

**“Create an element named `polygon`, and create it specifically in the SVG namespace.”**

The namespace URI is:

`http://www.w3.org/2000/svg`

It looks like a website address, but here its primary purpose is to identify the SVG namespace.

We are not downloading our graphics from that address every time we create an element.

---

# **🧠 48.4 Why We Created a Helper**

Imagine writing this throughout the application:

`document.createElementNS(...)`

again and again and again.

Then manually looping through attributes every time.

Our code would become noisy.

Instead we created:

`createSvg(...)`

Now another file can simply say conceptually:

**create an SVG polygon with these attributes**

without repeatedly dealing with the lower-level construction details.

This is exactly what a useful helper should do:

**hide repetitive mechanics without hiding the important concept.**

---

# **🧬 Chapter 49 — The Generic Type in `createSvg()`**

The function begins with a TypeScript generic:

`<K extends keyof SVGElementTagNameMap>` svg

This looks intimidating at first, but its purpose is excellent.

Let's unpack it slowly.

---

# **🗺️ 49.1 `SVGElementTagNameMap`**

TypeScript knows about standard SVG tag names.

It has a mapping that conceptually says things like:

`'svg'` → `SVGSVGElement`

`'path'` → `SVGPathElement`

`'polygon'` → `SVGPolygonElement`

`'ellipse'` → `SVGEllipseElement`

and so forth.

That mapping is called:

`SVGElementTagNameMap`.

---

# **🔑 49.2 `keyof`**

`keyof` asks:

**“What are the valid property names/keys of this type?”**

So:

`keyof SVGElementTagNameMap`

gives us the valid SVG tag names TypeScript knows about.

This means our generic `K` represents one of those names.

---

# **🎯 49.3 Why This Is Better Than Just `string`**

Suppose the function simply accepted:

`name: string`

Then TypeScript would know only:

**“Some string is being passed.”**

But with our generic, if we call:

`createSvg('polygon')`

TypeScript can understand that the result is specifically:

`SVGPolygonElement`.

If we call:

`createSvg('svg')`

the result is specifically:

`SVGSVGElement`.

That gives us much better type information.

---

# **🧠 49.4 Generics Preserve Information**

This is a good beginner example of why generics exist.

Without the generic:

**input:** some SVG name

**output:** some vague SVG element

With the generic:

**input:** `'polygon'`

**output:** `SVGPolygonElement`

The function preserves knowledge about what we asked it to create.

---

# **🏷️ Chapter 50 — Passing SVG Attributes as an Object**

The second parameter is:

`attributes`

which is typed as:

`Record<string, string>` svg

A `Record<string, string>` is essentially an object whose:

**keys are strings**

and:

**values are strings.**

For example, conceptually:

`viewBox` → `"0 0 260 300"`

`fill` → `"none"`

`stroke` → `"#ffffff"`

This gives us a convenient way to describe an SVG element's attributes when creating it.

---

# **🔄 50.1 `Object.entries()`**

The helper uses:

`Object.entries(attributes)`

to turn the attributes object into pairs.

Conceptually:

`{ fill: 'blue', opacity: '0.5' }`

becomes something like:

**\[`fill`, `blue`\]**

**\[`opacity`, `0.5`\]**

The function then loops over those pairs. svg

For each pair it calls:

`setAttribute(key, value)`.

---

# **🎨 50.2 SVG Attributes**

SVG makes heavy use of attributes.

For example:

`fill`

controls interior colour.

`stroke`

controls line colour.

`stroke-width`

controls line thickness.

`viewBox`

defines an SVG coordinate system.

`points`

defines a polygon's corners.

`d`

contains path instructions.

`opacity`

controls transparency.

Our helper does not need to understand the meaning of each attribute.

It simply applies whichever string attributes the caller supplies.

That makes it generic.

---

# **📤 50.3 Returning the Element**

After creating the element and applying its attributes, `createSvg()` returns it. svg

This is important because the caller may want to:

append children,

store it,

modify it later,

or return it as a completed graphic.

For example, `createOcean()` creates its outer SVG using this helper and eventually returns that SVG to `MapArea`.

---

# **🧰 Chapter 51 — `appendSvg()`: Create and Attach in One Operation**

The second helper is:

`appendSvg()`.

It receives:

a parent SVG element,

an SVG element name,

and optionally attributes. svg

Internally it first calls:

`createSvg(name, attributes)`

Then:

`parent.append(element)`

Finally it returns the newly created child. svg

So this helper combines two very common operations:

**create**

* 

**append**

---

# **🌳 51.1 Building an SVG Tree**

SVG is structured as a DOM tree just like HTML.

For example, our Ocean graphic will conceptually become:

**svg**

↳ **defs**

 ↳ clipPath

  ↳ polygon

 ↳ linearGradient

  ↳ stop

  ↳ stop

  ↳ stop

↳ **g**

 ↳ rect

 ↳ ellipse

 ↳ ellipse

 ↳ path

 ↳ path

 ↳ …

Each child is appended to a parent.

`appendSvg()` makes constructing that tree much more readable.

---

# **🧩 51.2 A Practical Example From Coast**

Our Coast graphic begins by creating the outer SVG using `createSvg()`. coast

Then it creates:

`defs`

using `appendSvg()`. coast

Then it appends:

`clipPath`

inside `defs`. coast

Then it appends:

`polygon`

inside that `clipPath`. coast

So the helper naturally follows the hierarchy of the SVG we are constructing.

---

# **🎨 Chapter 52 — `viewBox`: Now at the Tile Level**

We previously learned about `viewBox` in `MapGrid`.

There, the viewBox acted like a camera over the entire Civilization world.

Now the same SVG concept appears at a much smaller level.

Ocean creates an SVG with a viewBox based on:

`HEX_BOUNDS.width`

and:

`HEX_BOUNDS.height`. ocean

So the Ocean tile's local coordinate system is:

**X from 0 to tile width**

**Y from 0 to tile height**

This is why normalizing `HEX_POINTS` was useful.

Our entire tile now speaks one simple local coordinate language.

---

# **🌍 52.1 Two `viewBox` Levels at Once**

This is a fascinating aspect of the architecture.

We have:

### **🗺️ Outer SVG**

The **world map SVG**.

Its viewBox determines which part of the whole world we currently see.

Inside it are:

### **🌊 Nested SVGs**

Individual terrain tiles.

Each tile has its own local viewBox describing one canonical hex graphic.

So conceptually:

**World SVG coordinate system**

contains:

**Ocean tile's local SVG coordinate system**

The browser handles these nested transformations for us.

---

# **📐 52.2 Why This Is So Useful**

`ocean.ts` can think entirely in terms of:

**one tile**

It does not need to know:

the world is 42 × 13 skeleton cells,

there are 1,174 actual hexes,

this particular Ocean is at coordinate `(30,8)`,

the user is currently at Zoom 3,

or where the browser window is.

It just creates:

**one correctly designed Ocean tile.**

`MapGrid` handles the larger world.

This is excellent separation of responsibilities.

---

# **↔️ Chapter 53 — `preserveAspectRatio="none"`**

Our Ocean and Coast SVGs use:

`preserveAspectRatio: 'none'`. ocean coast

Normally, SVG can preserve the aspect ratio of its viewBox when displayed at another size.

With:

`preserveAspectRatio="none"`

we allow the nested SVG coordinate system to stretch to exactly the width and height assigned to the element.

In our case, `MapGrid` deliberately assigns the graphic the canonical `HEX_BOUNDS.width` and `HEX_BOUNDS.height`, so the dimensions are designed to correspond.

This attribute ensures the graphic occupies the rectangular area it is given.

---

# **♿ 53.1 `aria-hidden="true"`**

The terrain SVG also receives:

`aria-hidden: 'true'`. ocean

This says that the SVG is decorative from an accessibility perspective.

A screen reader does not need to announce all the individual waves, gradients and decorative shapes.

The semantic application can communicate meaningful information elsewhere rather than exposing every visual SVG primitive as content.

---

# **🗄️ 54\. And Where Is IndexedDB Here?**

Nowhere in these two files.

And again, that is exactly right.

`hex.ts` knows:

📐 **canonical geometry**

`svg.ts` knows:

🎨 **how to construct SVG DOM elements**

Neither should know:

🗄️ whether `(6,4)` is Coast,

🗄️ which Dexie version we are using,

🗄️ whether Relief is Flat,

or:

🗄️ how many records exist.

Later, `MapArea` connects the database meaning to the graphics.

This separation continues to hold.

---

# **🧠 55\. The Graphics Pipeline Is Now Almost Complete**

We can now trace the graphics architecture more precisely than before.

### **⬡ `midgard-hex-grid`**

Defines the authoritative hex geometry.

↓

### **📐 `definitions/hex.ts`**

Creates one canonical 260-unit hex and derives its normalized graphical bounds and points.

↓

### **🧰 `primitives/svg.ts`**

Provides reusable tools for constructing SVG DOM elements.

↓

### **🌊 `terrain/ocean.ts`**

Uses the canonical geometry and SVG helpers to build one Ocean tile.

↓

### **🏝️ `terrain/coast.ts`**

Does the same for Coast.

↓

### **🧠 `MapArea`**

Chooses which graphic is appropriate based on IndexedDB terrain data.

↓

### **🗺️ `MapGrid`**

Places that finished graphic at the correct world position.

↓

### **👁️ Browser**

Renders the nested SVG as part of the complete map.

That is a very clean chain.

---

# **⭐ 56\. What to Remember From These Two Files**

### **📏 260 is our canonical hex width**

It belongs to world/graphics coordinates, not permanently to screen pixels.

### **⬡ We do not manually duplicate hex mathematics**

`midgard-hex-grid` generates the authoritative canonical hex.

### **📦 `HEX_BOUNDS` is the rectangle surrounding that hex**

Terrain SVGs use this rectangle as their canvas.

### **📍 `HEX_POINTS` are normalized**

The local tile coordinate system starts at the top-left of the bounding rectangle.

### **🎨 SVG elements need the SVG namespace**

That is why we use:

`document.createElementNS(...)`

rather than ordinary HTML `createElement()`.

### **🧰 `createSvg()` creates SVG elements and applies attributes**

### **🌳 `appendSvg()` creates an SVG element and immediately attaches it to its parent**

### **🧬 The generic type preserves the precise SVG element type**

Creating `'polygon'` gives TypeScript knowledge of an `SVGPolygonElement`.

### **🗺️ Nested SVGs can have their own coordinate systems**

Our entire world has one SVG coordinate system, while every terrain tile can have its own local one.

---

# **🌊 57\. We Are Finally Ready to Draw Water**

Everything we have learned so far now comes together.

We know:

⬡ where the hex shape comes from,

📐 what its bounding rectangle means,

📍 why its points start from a local `(0,0)` coordinate system,

🎨 how TypeScript creates SVG elements,

🌳 how SVG elements form a tree,

🖼️ how `viewBox` establishes a coordinate system,

and:

✂️ why a rectangular SVG canvas can still produce a hexagonal visible tile.

That means we can now open `ocean.ts` and understand it not as mysterious SVG code, but as a sequence of deliberate graphical operations.

