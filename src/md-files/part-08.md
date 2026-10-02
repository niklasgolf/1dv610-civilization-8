## **Part VIII — `coast.ts`: Creating Coastal Water**

We have now studied `ocean.ts` in detail. That makes `coast.ts` especially interesting, because the two files have almost exactly the same **structural idea**.

That is not accidental.

Ocean and Coast are different terrain types in our world model, but visually they belong to the same family:

🌊 **Ocean** — deeper, darker water

🏝️ **Coast** — shallower, lighter water

So `coast.ts` lets us see an important programming principle:

> The same graphical technique can represent different semantic world data.

---

# **🏝️ Chapter 79 — Coast Begins in IndexedDB**

Before discussing SVG, remember where Coast actually begins.

Our database can contain:

`terrain: 'coast'`

That is fundamentally different from:

`terrain: 'ocean'`.

The distinction exists in the **world data**, not merely in the colour of the SVG.

When `MapArea` encounters a Coast record, it calls `createCoast()` and passes the resulting SVG to `MapGrid`. map-area

So:

🗄️ `terrain = coast`

↓

🧠 `MapArea`

↓

🏝️ `createCoast()`

↓

🎨 Coast SVG

↓

🗺️ `MapGrid`

↓

👁️ visible coastal tile

---

# **📥 79.1 Coast Uses the Same Foundations as Ocean**

At the top, `coast.ts` imports:

`HEX_BOUNDS`

`HEX_POINTS`

and our SVG helper functions. coast

This immediately tells us something important.

Coast does **not** invent:

a new hex size,

a new hex shape,

or:

a new SVG construction system.

It uses the same canonical graphics foundation as Ocean.

That guarantees that Coast occupies exactly the same kind of tile.

---

# **🔢 Chapter 80 — `coastSerial`**

Just like Ocean, Coast maintains a serial counter.

Each time `createCoast()` is called, that counter increases.

It is then used to create unique identifiers for:

✂️ the Coast clip path

and:

🎨 the Coast gradient. coast

So different generated Coast tiles can have definitions such as:

**coast-clip-1**

**coast-gradient-1**

and:

**coast-clip-2**

**coast-gradient-2**

and so forth.

---

# **🧠 80.1 Ocean and Coast Counters Are Independent**

Ocean has its own serial.

Coast has its own serial.

That is perfectly reasonable because their IDs also contain different prefixes.

So:

`ocean-gradient-1`

and:

`coast-gradient-1`

are still different IDs.

The important requirement is not that every serial number across the entire program must be globally unique.

The important requirement is that the resulting complete ID strings do not collide.

---

# **🖼️ Chapter 81 — Creating the Coast SVG**

`createCoast()` creates an outer SVG using the same canonical `viewBox` strategy as Ocean.

Its coordinate system begins at:

`0,0`

and extends across:

`HEX_BOUNDS.width`

and:

`HEX_BOUNDS.height`. coast

It also uses:

`preserveAspectRatio="none"`

and:

`aria-hidden="true"`.

So structurally we are still working with:

**one rectangular local SVG canvas**

designed to fit:

**one canonical hex tile.**

---

# **📚 Chapter 82 — Coast Also Uses `<defs>`**

The function creates:

`defs`. coast

Inside it, Coast defines:

✂️ a clip path

and:

🎨 a gradient.

This is the same SVG technique we learned with Ocean.

The important point is that these definitions belong to this particular generated Coast SVG.

---

# **✂️ Chapter 83 — The Coast Clip Is the Same Hex Shape**

Inside the clip path, `coast.ts` creates a polygon using:

`pointsAttribute()`. coast

And `pointsAttribute()` ultimately uses:

`HEX_POINTS`.

Therefore Coast is clipped using exactly the same canonical hex geometry as Ocean.

This gives us:

**Ocean shape \= canonical hex**

**Coast shape \= canonical hex**

Later:

**Grass shape \= canonical hex**

**Desert shape \= canonical hex**

and so forth.

The artwork can vary dramatically while the underlying tile contract remains stable.

---

# **🎨 Chapter 84 — The Major Visual Difference: The Gradient**

The first obvious difference between Coast and Ocean is colour.

Ocean uses deeper, darker blues.

Coast uses a noticeably lighter cyan/teal family.

Its gradient moves through:

`#3f91a8`

then:

`#2f7f98`

then:

`#226a84`. coast

Compare that conceptually with Ocean:

🌊 **Ocean**

deep blue

↓

dark blue

↓

deeper blue

while Coast becomes:

🏝️ **Coast**

lighter blue-green

↓

medium teal-blue

↓

slightly deeper coastal blue

The structure is similar.

The visual vocabulary changes.

---

# **🌅 84.1 Why Lighter Water Makes Sense Graphically**

The code itself tells us the colours; the interpretation is ours as viewers.

A lighter coastal palette gives us an immediate visual distinction between:

**deep water**

and:

**water near land**.

That means a player can eventually look at the map and recognize terrain without reading database records.

This is exactly what the graphics layer should accomplish:

> Translate semantic differences into visible differences.

---

# **🎨 Chapter 85 — The Coast Background**

After creating the definitions, Coast creates a clipped artwork group and fills the entire tile rectangle using its gradient. coast

The construction is therefore the same pattern:

▭ full rectangular gradient

* 

✂️ canonical hex clip

\=

⬡ Coast-shaped water.

This repetition is useful because we already understand the mechanism.

We can concentrate on what differs visually.

---

# **💡 Chapter 86 — Coast's Lighter Ellipse**

Coast adds a translucent ellipse in the upper-left region.

Its fill is:

`#78bfd0`

with low opacity. coast

This is considerably lighter than the base Coast colours.

The effect is a subtle brighter region over the underlying gradient.

Again, because opacity is low, we are not painting an obvious solid oval.

We are modifying the water underneath.

---

# **🌑 Chapter 87 — Coast's Darker Ellipse**

A second ellipse creates a darker region toward the lower-right area.

Its fill is:

`#155a73`

again with low opacity. coast

So Coast uses the same compositional strategy as Ocean:

**gradient base**

➕

**light translucent region**

➕

**dark translucent region**

➕

**waves**

The exact colours make the resulting terrain distinct.

---

# **〰️ Chapter 88 — Coast Uses Six Waves Too**

After the tonal layers, Coast adds six waves. coast

The underlying wave technique is the same one we studied in Ocean:

📍 calculate the starting position

📏 calculate the width

↕️ calculate a small rise

✏️ create an SVG path

📍 use `M` to establish the starting point

🌀 use cubic Bézier `C` commands to form the curve.

This creates a coherent graphical language between the two water terrains.

---

# **🎨 88.1 Coast's Wave Colour Is Different**

The Coast waves use a lighter stroke appropriate to the lighter water.

So although the geometry and technique are related to Ocean, the palette distinguishes the terrain.

This is an important design lesson.

We do not necessarily need completely different geometry for every terrain type.

Sometimes:

**shared visual structure \+ different colour language**

is enough to create a recognizable family of related terrains.

---

# **🌀 Chapter 89 — The Same Bézier Technique**

`addWave()` calculates:

`startX`

`startY`

`waveWidth`

and:

`rise`.

It then creates the path from two cubic Bézier curves. coast

The basic movement is:

baseline

↗️ upward curve

↘️ back to baseline

↘️ downward curve

↗️ back to baseline.

That creates the gentle water-line shape.

Because Coast and Ocean use the same general curve language, they visually feel related.

---

# **🧰 Chapter 90 — Why Does Coast Have Its Own `addWave()`?**

This is an interesting programming question.

We now have similar wave-building logic in:

`ocean.ts`

and:

`coast.ts`.

A programmer might immediately think:

> “Duplicate code\! We must extract this into a shared `water-wave.ts` helper immediately\!”

But abstraction is not automatically an improvement.

---

# **🧠 90.1 Similar Today Does Not Mean Identical Tomorrow**

We are currently in a **breadth-first graphics phase**.

We want to create many terrain types and discover what visual language works.

Perhaps Coast waves later become:

shorter,

more frequent,

more turquoise,

more irregular,

or concentrated near one edge.

Perhaps Ocean eventually gains:

long rolling waves,

deeper shadows,

or several deterministic variants.

If we prematurely force both files through one highly generalized abstraction, we may make experimentation harder.

---

# **🧩 90.2 Duplication Versus Coupling**

There are two costs to consider.

### **Repetition**

Some similar code exists twice.

### **Coupling**

If we create a shared abstraction, Ocean and Coast now depend on that common abstraction.

Neither option is automatically correct.

At this early graphical stage, a small amount of clear duplication can sometimes be easier to work with than an abstraction whose true shape we do not yet understand.

---

# **🌱 90.3 Let the Pattern Stabilize First**

A useful development principle is:

> **Do not abstract merely because two things currently look similar. Abstract when you understand what is genuinely stable and shared.**

After we create:

Ocean,

Coast,

perhaps Rivers,

Reefs,

Lakes,

and other water-related graphics,

we may understand the reusable graphical primitives much better.

Then extracting shared functionality could become obvious.

For now, the two files remain very easy to read independently.

---

# **🗄️ Chapter 91 — Ocean and Coast Are Similar Graphically but Different Semantically**

This is particularly important from our IndexedDB perspective.

Suppose Ocean and Coast looked almost identical.

They would still be different terrain values:

`'ocean'`

and:

`'coast'`.

The database should not collapse them merely because their current artwork happens to share implementation techniques.

Semantic identity and graphical implementation are different concerns.

---

# **🧠 91.1 The Database Doesn't Know They Share Code**

IndexedDB sees:

`terrain: 'ocean'`

or:

`terrain: 'coast'`.

It has no knowledge that both SVG files happen to use:

gradients,

ellipses,

waves,

and:

clip paths.

That is exactly the separation we want.

---

# **🎨 91.2 The Graphics Don't Need to Know Why Coast Matters to Gameplay**

Likewise, `createCoast()` does not need to know future gameplay rules.

It does not need to decide:

whether ships can travel there,

whether resources can spawn there,

whether cities receive bonuses,

or:

whether Coast has different movement costs.

Its job is graphical:

> **Create the visual representation of Coast.**

Again, each layer has its own responsibility.

---

# **🧬 Chapter 92 — Comparing Ocean and Coast Structurally**

We can now compare the two without needing to read every line again.

### **🌊 Ocean**

Creates unique IDs.

Creates canonical SVG.

Creates definitions.

Creates hex clip.

Creates dark-blue gradient.

Creates clipped artwork group.

Creates gradient rectangle.

Creates light variation.

Creates dark variation.

Creates six waves.

Returns SVG.

### **🏝️ Coast**

Creates unique IDs.

Creates canonical SVG.

Creates definitions.

Creates hex clip.

Creates lighter teal-blue gradient.

Creates clipped artwork group.

Creates gradient rectangle.

Creates light variation.

Creates dark variation.

Creates six waves.

Returns SVG.

The **algorithmic skeleton** is very similar.

The **visual parameters** differ.

---

# **🧠 Chapter 93 — This Suggests a Future Graphics Vocabulary**

Even though we are not rushing to abstract it, the similarity teaches us something about the graphics system.

We are beginning to discover reusable concepts:

🎨 gradients

✂️ hex clipping

💡 translucent highlights

🌑 translucent shadows

〰️ curved line details

These may eventually become part of a richer collection of graphics primitives.

But we should discover that vocabulary through actual terrain work rather than designing a giant graphics framework in advance.

This fits the incremental way we are developing the project.

---

# **🗄️ Chapter 94 — Following Our Special Coast Hex**

Our database currently has a special starting Coast coordinate:

**`(6,4)`**.

Let's follow it through the whole system.

### **🗄️ 1\. IndexedDB**

The record says:

**x:** 6  
**y:** 4  
**terrain:** coast  
**relief:** flat

↓

### **📦 2\. Dexie**

`toArray()` returns the record.

↓

### **🧠 3\. `MapArea`**

It sees:

`terrain === 'coast'`.

↓

### **🏝️ 4\. `createCoast()`**

A new Coast SVG is constructed.

↓

### **📐 5\. `HEX_BOUNDS`**

Defines its rectangular local canvas.

↓

### **⬡ 6\. `HEX_POINTS`**

Defines its clipping shape.

↓

### **🎨 7\. Coast artwork**

The gradient, ellipses and waves are constructed.

↓

### **🗺️ 8\. `MapGrid.setHexGraphic()`**

The SVG is positioned over the geometric hex belonging to `(6,4)`.

↓

### **👁️ 9\. Browser**

We see the lighter coastal-water hex among the darker Ocean tiles.

That one visible difference is the result of several layers cooperating.

---

# **🔄 Chapter 95 — What Happens After a Reload?**

This example also reinforces persistence.

When we reload the browser:

❌ the existing Coast SVG DOM element does not somehow remain alive.

❌ the old `coastSerial` value does not need to be preserved.

❌ the old JavaScript `HexRecord` object does not remain in memory.

But:

✅ IndexedDB still contains:

`terrain: 'coast'`

So the application starts again.

It reads the database.

It encounters Coast.

It calls:

`createCoast()`

again.

A fresh SVG is generated.

The visual world is reconstructed from persistent semantic data.

That is exactly how we want the system to behave.

---

# **🎭 Chapter 96 — State Versus Representation**

We can now give these two concepts very clear names.

### **🗄️ State**

**What the world is.**

For example:

`terrain: 'coast'`

### **🎨 Representation**

**How that state currently looks.**

For example:

lighter teal gradient \+ highlights \+ shadows \+ waves.

This distinction is fundamental far beyond this project.

Games, web applications and graphical editors frequently separate:

**model/state**

from:

**view/representation**.

Our architecture is already doing that in a very concrete way.

---

# **⭐ 97\. What to Remember From `coast.ts`**

### **🏝️ Coast is its own semantic terrain**

It is not merely “Ocean with a lighter CSS colour.”

### **📐 It uses the same canonical geometry as Ocean**

`HEX_BOUNDS` and `HEX_POINTS` keep the tile compatible with the map.

### **✂️ It clips a rectangular canvas to the hex shape**

Exactly as Ocean does.

### **🎨 Its palette is lighter**

The gradient and translucent overlays make it visually distinguishable from deep Ocean.

### **〰️ It uses the same general wave technique**

SVG paths and cubic Bézier curves create the water details.

### **🔢 Unique IDs protect each generated SVG's definitions**

The serial is rendering machinery, not persistent world data.

### **🧩 Similarity does not force immediate abstraction**

While our graphical language is still evolving, explicit terrain files can be easier to experiment with.

### **🗄️ IndexedDB stores only the semantic fact**

`coast`

not the SVG artwork used to represent it.

---

# **🌍 98\. Our Graphics Architecture So Far**

We now have a complete path from geometry and persistence to actual artwork:

**`midgard-hex-grid`**

⬇️

⬡ authoritative geometry

⬇️

**`graphics/definitions/hex.ts`**

⬇️

📐 canonical 260-unit graphical hex

⬇️

**`graphics/primitives/svg.ts`**

⬇️

🧰 SVG construction tools

⬇️

**`ocean.ts` / `coast.ts`**

⬇️

🎨 complete terrain SVGs

⬇️

**`world-database.ts`**

🗄️ tells us which terrain belongs to which coordinate

⬇️

**`map-area.ts`**

🧠 chooses the appropriate representation

⬇️

**`map-grid.ts`**

🗺️ places it in the world

⬇️

👁️ **the player sees the map**

At this point, we understand not only *that* Ocean and Coast appear, but the entire chain that makes them appear.

