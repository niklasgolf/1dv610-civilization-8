# **📘 Civilization 8 — World Builder**

## **A Beginner’s Guide to the Code, IndexedDB, SVG, and the Hexagonal World**

### **Part I — Understanding the Application Before We Enter the Files**

---

## **🌍 1\. What Have We Actually Built?**

Civilization 8 — World Builder is a browser application written primarily in **TypeScript**. Its purpose is to let a user construct a Civilization-style world from hexagonal tiles.

At first glance, the application looks graphical: there is a large hexagonal map, terrain tools on the left, placement tools on the right, a minimap, zoom controls, and individually drawn terrain tiles.

But underneath that graphical interface are several quite different systems working together.

The most important ones are:

**🧱 HTML** gives the browser its initial page.

**🎨 CSS** controls the visual layout and appearance of the editor.

**⚙️ TypeScript** creates the application and controls its behaviour.

**⬡ midgard-hex-grid** supplies the geometry of the hexagonal world.

**🗄️ IndexedDB** stores the actual state of the world permanently inside the browser.

**📦 Dexie** gives our TypeScript code a much friendlier way of communicating with IndexedDB.

**🖼️ SVG** draws the map, the hexagons, terrain artwork, icons, minimap, and other vector graphics.

These systems have different responsibilities. Understanding those responsibilities is one of the most important ideas in the entire project.

---

# **🧠 2\. The Most Important Architectural Idea**

A beginner might initially think of a hexagon on the screen as one single thing.

For example:

**“That is an Ocean hex.”**

But our program increasingly treats that visible hexagon as the result of several separate pieces of information.

Consider an Ocean tile.

There is first a **coordinate**, such as:

`x: 4, y: 4`

The hex-grid library determines that this coordinate exists and determines where its hexagon belongs geometrically.

Then there is information stored in our database:

`terrain: 'ocean'`

`relief: 'flat'`

Then our graphical code sees that the terrain is Ocean and creates the corresponding Ocean SVG artwork.

Finally, `MapGrid` places that artwork at the correct physical location in the SVG world.

So the important chain is:

**⬡ Hex geometry → 🗄️ world data → 🎨 graphic → 🗺️ screen**

This separation is deliberate.

The hex-grid library does **not** need to know what Ocean means.

IndexedDB does **not** need to know how blue waves are drawn.

The Ocean graphic does **not** need to know that its database coordinate is `(4,4)`.

Each part has one job.

---

# **🗄️ 3\. The Database Is Becoming the World**

This is particularly important in the current version of the project.

Earlier versions could simply draw a map and colour its polygons. Now we have crossed an important architectural boundary:

**the world has persistent data.**

Our `HexRecord` currently contains four properties:

`x`

`y`

`terrain`

`relief`

The TypeScript interface explicitly describes this structure. world-database

For example, conceptually a database record can say:

**Coordinate:** `(6,4)`  
**Terrain:** `coast`  
**Relief:** `flat`

Another can say:

**Coordinate:** `(12,4)`  
**Terrain:** `grass`  
**Relief:** `flat`

This is a very important distinction:

> 🗄️ **IndexedDB stores what the world IS. SVG determines how the world LOOKS.**

We do **not** store an enormous SVG description of Ocean inside every Ocean database record.

Instead, IndexedDB simply remembers:

`terrain: 'ocean'`

The graphical part of the program can then interpret that information and say:

**“This is Ocean, therefore I should create the Ocean graphic.”**

That relationship is already visible in `map-area.ts`: it reads all the hex records from the database and renders each one according to its terrain. Ocean records receive `createOcean()`, while Coast records receive `createCoast()`. map-area

This will become one of the central themes of this book.

---

# **💾 4\. Why IndexedDB Matters So Much**

Before examining our code, it is worth understanding why IndexedDB represents such a major step.

JavaScript and TypeScript variables normally live in memory.

Suppose we wrote something conceptually like:

`terrain = 'grass'`

That value exists while the application is running.

But if we reload the page, ordinary runtime state disappears unless we have stored it somewhere persistent.

A World Builder obviously cannot work that way.

Imagine spending an hour creating continents, mountains, forests, rivers, and resources, pressing Reload, and discovering that the entire planet has returned to Ocean.

We therefore need **persistent storage**.

That is where IndexedDB enters the architecture.

---

## **🗄️ Here we are talking about IndexedDB**

**IndexedDB is a database provided by the web browser.**

It is not MySQL running on a server.

It is not a text file that we manually create.

It is not merely a TypeScript object.

It is browser-managed persistent storage.

Chrome, for example, stores and manages the database on behalf of our application. That is why we were able to open Chrome DevTools and navigate to:

**Application → IndexedDB → civilization-8-world → hexes**

and actually inspect our 1,174 world records.

That database survives a normal page reload.

So our application has acquired something very important:

**memory between executions.**

---

# **📦 5\. IndexedDB and Dexie Are Not the Same Thing**

This distinction will matter enormously when we reach `world-database.ts`.

Our code imports:

`Dexie`

and:

`Table`

from the package `dexie`. world-database

It is therefore easy for a beginner to think:

**“Dexie is our database.”**

Not quite.

### **🗄️ IndexedDB**

IndexedDB is the actual browser database technology.

### **📦 Dexie**

Dexie is a JavaScript/TypeScript library that makes IndexedDB easier to work with.

The relationship can be pictured as:

**Our TypeScript → Dexie → IndexedDB → browser storage**

Dexie gives us a cleaner programming interface so that we do not have to deal directly with all of IndexedDB's lower-level API machinery.

That is why our code can contain readable operations such as:

`this.hexes.count()`

`this.hexes.bulkAdd(...)`

`worldDatabase.hexes.toArray()`

These look pleasantly like ordinary TypeScript operations, but behind them Dexie is communicating with IndexedDB.

Whenever this happens in later chapters, I will explicitly mark it:

### **🗄️ Here IndexedDB is being used**

and we will distinguish between **our TypeScript**, **Dexie's API**, and **what ultimately happens in IndexedDB**.

---

# **🌊 6\. Ocean as the Blank Canvas**

The current world contains **1,174 hexagons**.

When a new world is initialized, its default terrain is Ocean:

`DEFAULT_TERRAIN` is `'ocean'`. world-database

Its default relief is:

`'flat'`

This gives the World Builder a very useful conceptual model.

A new planet begins as an **Ocean canvas**.

The map creator then changes particular hexes.

For example:

🌊 Ocean  
→ 🏝️ Coast  
→ 🌱 Grass  
→ 🏜️ Desert  
→ and eventually Plains, Tundra, Snow, and other terrain.

This means we do not need an artificial concept such as an “empty hex.”

Every valid coordinate already represents a real tile.

Its starting state is simply Ocean.

---

# **⛰️ 7\. Terrain and Relief Are Two Different Dimensions**

Another important architectural decision has now appeared in the database.

We have:

**Terrain**

and:

**Relief**

They answer different questions.

### **🌱 Terrain asks:**

**What kind of surface is this?**

Our current database type permits:

`ocean`

`coast`

`grass`

`desert` world-database

The editor's catalogue already anticipates additional terrain choices such as Plains, Tundra and Snow, although those have not yet been added to the database `Terrain` type. catalog

That distinction is worth noticing: **the UI catalogue currently describes more future choices than the persistent world model currently supports.**

We should not pretend otherwise simply because buttons already exist.

### **⛰️ Relief asks:**

**What physical form does this terrain have?**

Our database currently permits:

`flat`

`hills`

`mountain` world-database

Eventually that lets us represent combinations such as:

🌱 Grass \+ Flat

🌱 Grass \+ Hills

🌱 Grass \+ Mountain

🏜️ Desert \+ Flat

🏜️ Desert \+ Hills

🏜️ Desert \+ Mountain

without inventing completely separate terrain types such as `grass-hills` and `desert-mountain`.

This is an early example of **composition**: complicated things can be constructed by combining simpler independent concepts.

---

# **🎨 8\. SVG Is Our Drawing Language**

The second major technical theme of this book will be SVG.

SVG means **Scalable Vector Graphics**.

Unlike a PNG or JPEG, an SVG graphic is fundamentally made from geometric instructions.

For example, SVG understands things such as:

**polygon** — a shape made from connected points

**rect** — a rectangle

**ellipse** — an ellipse

**path** — a potentially complex path made from lines and curves

**linearGradient** — a gradual transition between colours

**clipPath** — a shape used to determine which parts of another graphic are allowed to remain visible

**g** — a group containing other SVG elements

These are not just theoretical examples. Our Ocean and Coast graphics already use exactly these SVG features. The Ocean graphic creates its own SVG, definitions, clipping polygon, vertical gradient, rectangular background, translucent ellipses, and several curved wave paths. ocean ocean

So when we eventually look closely at `ocean.ts`, we will not merely say:

**“This draws water.”**

We will learn *how* it draws water.

---

# **📐 9\. Our Hex Graphics Actually Live in Rectangles**

This is one of the more interesting ideas in our graphics architecture.

A hexagon is obviously not rectangular.

Nevertheless, we create a rectangular graphical coordinate system surrounding each canonical hex.

Our canonical hex width is:

**260 world units.**

That value is defined centrally as `HEX_WORLD_WIDTH`. hex

We ask `midgard-hex-grid` to create one canonical x-dominated hexagon. Then we examine all its points to calculate its minimum and maximum X and Y coordinates. From those values we calculate `HEX_BOUNDS`: the rectangular bounding box surrounding that hexagon. hex

Conceptually:

**rectangular tile canvas**

↳ contains the hexagon

↳ contains the terrain artwork

↳ artwork can be clipped to the hexagonal boundary

This makes graphical construction much easier.

We can think in terms of:

**left**

**top**

**width**

**height**

and draw things inside that space.

Then SVG's clipping system can cut away anything that falls outside the actual hexagon.

That is exactly what Ocean and Coast currently do.

---

# **✂️ 10\. SVG Clipping Turns the Rectangle Into a Hex Tile**

The Ocean graphic creates a `<clipPath>` and places a polygon inside it using the canonical hex points. ocean

Later, the artwork group receives that clipping path. ocean

The idea is beautifully simple:

🎨 **Draw freely inside a rectangle.**

⬡ **Define the hexagon as a clipping boundary.**

✂️ **Hide everything outside that boundary.**

The result is a rectangular SVG canvas whose *visible* artwork has the shape of our hexagon.

This will become increasingly valuable as our terrain becomes more elaborate.

We can eventually draw rocks, hills, mountains, forests, snow, shadows and other details in the same coordinate system.

---

# **🗺️ 11\. The Map and the Terrain Graphic Are Different SVG Levels**

There is another subtle idea that will deserve careful attention later.

The entire map itself is an SVG.

`MapGrid` creates an SVG element that represents the world map. map-grid

Inside it, the original geometric hexagons are polygons. map-grid

But our Ocean graphic is itself another SVG element.

So we effectively have:

**World SVG**

↳ hex polygon

↳ Ocean SVG

↳ hex polygon

↳ Ocean SVG

↳ hex polygon

↳ Coast SVG

↳ …

`MapGrid` calculates where the rectangular graphic belonging to each coordinate must be placed. It records those positions and later assigns the nested terrain SVG its `x`, `y`, `width`, and `height`. map-grid map-grid

That is why the Ocean artwork lines up with the underlying hexagonal grid.

The terrain graphic itself does not need to know where `(6,4)` is in the entire world.

`MapGrid` knows.

Again we see separation of responsibilities.

---

# **🔄 12\. The Complete Journey of One Hex**

We can now describe the most important flow in the application.

Imagine one particular coordinate.

### **⬡ Step 1 — Geometry**

`midgard-hex-grid` determines that the coordinate exists and calculates its physical hexagonal geometry.

### **🗄️ Step 2 — Persistent world state**

IndexedDB contains a record describing that coordinate.

For example:

**terrain \= ocean**

**relief \= flat**

### **📦 Step 3 — Dexie retrieves it**

Our TypeScript asks Dexie for the records.

`worldDatabase.hexes.toArray()` retrieves them for the application. map-area

### **🧠 Step 4 — TypeScript interprets the data**

`MapArea` examines `hexRecord.terrain`.

If it is Ocean, it calls `createOcean()`.

If it is Coast, it calls `createCoast()`. map-area

### **🎨 Step 5 — SVG constructs the artwork**

`createOcean()` creates gradients, shapes and waves.

### **📐 Step 6 — MapGrid positions it**

`MapGrid` finds the stored placement for that coordinate and gives the terrain SVG its correct world position and dimensions. map-grid

### **👁️ Step 7 — The browser renders it**

The user sees an Ocean hex.

---

# **🧩 13\. The Architecture in One Picture**

The current application can therefore be understood approximately like this:

**Civilization 8 — World Builder**

⬇

🧱 **HTML**  
Creates the initial page and `#app`

⬇

⚙️ **main.ts**  
Starts the TypeScript application

⬇

🏗️ **WorldBuilder**  
Assembles the editor

↙️ ↓ ↘️

🛠️ **Tool panels**  🗺️ **MapArea / MapGrid**  🧭 **Minimap**

↓         ↓

⬡ **midgard-hex-grid**  🗄️ **WorldDatabase**

↓         ↓

📐 hex geometry   📦 **Dexie**

         ↓

       🗄️ **IndexedDB**

Meanwhile:

🎨 **graphics**

↳ definitions

↳ primitives

↳ terrain

↳ Ocean

↳ Coast

And ultimately all of those pieces meet in the map.

---

# **🌟 14\. What to Keep in Your Head Before We Continue**

You do **not** need to memorize every TypeScript statement.

At this stage, remember these five ideas.

### **🗄️ 1\. IndexedDB remembers the world**

The database stores semantic information such as:

**this coordinate is Ocean and Flat.**

### **📦 2\. Dexie is our bridge to IndexedDB**

Dexie is not the world itself. It is the library through which our TypeScript conveniently communicates with IndexedDB.

### **⬡ 3\. midgard-hex-grid owns the geometry**

It tells us which hexagons exist and what their geometry is.

### **🎨 4\. SVG owns the drawing**

Ocean, Coast, icons, the map and the minimap are constructed from vector elements.

### **🧩 5\. These systems meet without becoming the same thing**

That is perhaps the most important lesson.

**Data is not graphics.**

**Geometry is not terrain.**

**Terrain is not relief.**

**IndexedDB is not Dexie.**

**The Ocean record is not the Ocean SVG.**

Instead, the application connects these smaller concepts together.

That separation is what allows Civilization 8 — World Builder to grow without every new feature having to be crammed into one enormous file or one enormous concept.

