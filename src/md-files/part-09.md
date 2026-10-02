## **Part IX — `minimap.ts`: A Second View of the Same World**

The main map and the minimap show the **same world**, but they have very different jobs.

The main map is where we inspect and eventually edit individual hexes.

The minimap gives us an overview and lets us quickly navigate.

This makes `minimap.ts` especially interesting because it brings together several ideas we have already encountered:

🌍 world coordinates  
🖥️ screen coordinates  
🖼️ SVG `viewBox`  
🎯 centering  
🔎 zoom  
🔄 coordinate transformation  
👀 viewport updates

---

# **🧭 Chapter 99 — What the Minimap Actually Is**

The `Minimap` class creates a small interface containing its own SVG representation of the world.

It also creates a rectangle representing the part of the world currently visible in the main map.

Most importantly, it can later be connected to a `MapGrid`, allowing navigation in one component to affect the other. minimap

So conceptually we have:

### **🗺️ Main map**

**The detailed camera view**

and:

### **🧭 Minimap**

**The overview**

The minimap is not another IndexedDB database and not another independent Civilization world.

It is another **view** of the same world geometry.

---

# **🧱 99.1 The Minimap Is an HTML Component Containing SVG**

This is a useful example of HTML and SVG working together.

The outer structure is ordinary HTML.

Inside that structure sits an SVG.

So conceptually:

**HTML minimap component**

↳ heading / controls

↳ **SVG overview**

 ↳ map representation

 ↳ viewport rectangle

This is the same general browser DOM, but different element families can coexist inside it.

---

# **🌍 Chapter 100 — The Minimap Receives the World Frame**

When `WorldBuilder` creates the minimap, it gives it:

`this.mapArea.mapGrid.getWorldFrame()`

as we saw earlier in the application composition.

This is important.

The minimap does not independently calculate how large the Civilization world should be.

It asks the real map:

> **“What are the bounds of our world?”**

That keeps `MapGrid` authoritative for world geometry.

---

# **📦 100.1 What Is a Frame?**

A frame is essentially a rectangle describing:

**x**

**y**

**width**

**height**

For example, conceptually:

**world starts at X \= some value**

**world starts at Y \= some value**

**world extends this far horizontally**

**world extends this far vertically**

The minimap can use this information to create an SVG coordinate system encompassing the complete world.

---

# **🖼️ Chapter 101 — The Minimap Has Its Own `viewBox`**

Here we encounter `viewBox` again.

But notice how many different jobs the same SVG concept can perform.

### **🗺️ Main map `viewBox`**

Acts like a movable camera.

It changes as we pan and zoom.

### **🧭 Minimap `viewBox`**

Represents the complete world overview.

The minimap wants to keep showing the world as a whole.

### **🌊 Terrain tile `viewBox`**

Represents the local coordinate system of one individual hex graphic.

So we now have `viewBox` operating at **three different scales**.

---

# **🔬 101.1 Three SVG Worlds**

It helps to picture them like this:

**Civilization world**

🗺️ Main map SVG  
Thousands of world units

↓

**Overview of that same world**

🧭 Minimap SVG  
Same world coordinates, displayed in a tiny physical area

↓

**One individual tile**

🌊 Ocean SVG  
Approximately 260 × 300 local units

The physical size on the monitor does not determine the coordinate system.

That is one of the great strengths of SVG.

---

# **🧠 Chapter 102 — A Tiny Minimap Can Still Use Large World Coordinates**

Suppose the minimap is only a few hundred CSS pixels wide.

Its `viewBox` can still represent a world spanning many thousands of world units.

SVG automatically maps:

**large internal coordinate space**

onto:

**small physical display area**.

That means we do not need to invent a separate miniature coordinate system such as:

0–200.

We can continue speaking the language of the actual world.

This greatly simplifies communication with `MapGrid`.

---

# **👁️ Chapter 103 — The Viewport Rectangle**

The minimap creates an SVG rectangle representing the main map's current viewport.

Think of it as the familiar box found in strategy-game minimaps:

🌍 complete world

with:

▭ **you are currently looking here**

When the main map is zoomed out, this rectangle is large.

When the main map is zoomed in, the rectangle becomes smaller.

When the main map moves, the rectangle moves.

The rectangle therefore gives us a visual summary of the main map's camera.

---

# **🎥 103.1 The Viewport Is a Camera Rectangle**

Remember our earlier mental model:

**`viewBox` \= camera**

The minimap's viewport rectangle is essentially a graphical representation of that camera.

If the main map currently sees a world rectangle described by:

x

y

width

height

then the minimap can draw an SVG `<rect>` with those same values.

Because both are speaking in world coordinates, the rectangle naturally appears in the correct place.

---

# **🔗 Chapter 104 — `connectMap()`: Connecting the Two Components**

The minimap is created as its own component first.

Then it can be connected to the actual `MapGrid`.

This is an important design detail.

Instead of constructing `Minimap` so that it permanently owns or creates a `MapGrid`, the connection is established deliberately.

Conceptually:

**Minimap**

🤝

**MapGrid**

Once connected, the minimap can influence the map and react to map changes.

---

# **🔎 104.1 Zoom Controls**

The minimap provides controls for our map zoom levels.

When the user chooses a zoom level, the minimap tells `MapGrid` to use that level.

So the minimap does not perform the actual main-map zoom mathematics itself.

It says conceptually:

> **“MapGrid, switch to Zoom 4.”**

`MapGrid` remains responsible for interpreting what Zoom 4 means for the main map's `viewBox`.

This is good responsibility separation.

---

# **🧭 104.2 Navigation Works in Both Directions**

Once connected, information flows both ways.

### **🧭 Minimap → Main map**

The user clicks somewhere in the minimap.

The main map centers there.

Or the user changes zoom.

The main map changes its viewport.

### **🗺️ Main map → Minimap**

The main map's viewport changes.

The minimap updates its viewport rectangle.

So the components form a synchronized relationship without becoming the same object.

---

# **🖱️ Chapter 105 — Clicking the Minimap**

This is one of the most technically interesting parts of the file.

Imagine the user clicks a point in the minimap.

The browser's mouse event gives us values based on the displayed page.

But `MapGrid` wants to know:

**Which world position did the user click?**

These are different coordinate systems.

So we need a transformation.

---

# **🖥️ 105.1 The Browser Starts With Screen Coordinates**

A pointer event can give us:

`clientX`

and:

`clientY`.

These describe the click relative to the browser's viewport.

For example:

**clientX \= 1420**

**clientY \= 780**

Those numbers say where the mouse was on the browser display.

They do **not** directly tell us where the user clicked in Civilization world coordinates.

---

# **🌍 105.2 Why We Cannot Simply Use `clientX` and `clientY`**

Imagine the minimap SVG is physically:

300 pixels wide.

But its SVG `viewBox` represents a world:

10,000 world units wide.

A click 150 physical pixels across the minimap is approximately halfway across the displayed SVG.

It certainly does not mean:

**world X \= 150\.**

The corresponding world coordinate could be around:

5,000.

The browser therefore needs to transform between:

🖥️ display coordinates

and:

🌍 SVG coordinates.

---

# **📍 Chapter 106 — `createSVGPoint()`**

The minimap uses:

`createSVGPoint()`.

This gives us an SVG point object.

We assign the mouse event's:

`clientX`

and:

`clientY`

to that point.

At this stage, the point still represents the browser/screen-side click position.

We have simply placed those coordinates into an SVG object that supports transformations.

---

# **🧮 Chapter 107 — `getScreenCTM()`**

Next we encounter:

`getScreenCTM()`.

`CTM` stands for:

**Current Transformation Matrix**.

This sounds mathematically intimidating, but its purpose is understandable.

The browser knows all the transformations required to get from the SVG's internal coordinate system to its displayed position on the screen.

Those transformations can include:

position,

scaling,

and other coordinate changes.

The transformation matrix represents that relationship.

---

# **🗺️ 107.1 The Direction We Actually Need Is the Opposite**

`getScreenCTM()` describes the relationship toward screen space.

But our mouse event already gives us screen coordinates.

We want to go backwards:

**screen**

↓

**SVG/world coordinates**

So we need the **inverse** transformation.

---

# **🔄 Chapter 108 — `.inverse()`**

The code takes the transformation matrix and calls:

`inverse()`.

Conceptually, if the normal transformation says:

🌍 **world → screen**

the inverse says:

🖥️ **screen → world**

This is exactly what we need.

Then the SVG point can be transformed using that inverse matrix. minimap

The result is a point expressed in the minimap SVG's own coordinate system.

And because that SVG uses the world's frame, those coordinates correspond to the Civilization world.

---

# **🎯 108.1 A Concrete Mental Example**

Suppose the complete world is conceptually:

10,000 world units wide.

The minimap displays it in:

250 CSS pixels.

The user clicks halfway across the minimap.

The browser initially gives a physical click position.

After applying the inverse SVG transformation, the resulting SVG coordinate might be approximately:

**world X \= 5,000**

That is the value useful to `MapGrid`.

We have transformed:

**where did the user click on the monitor?**

into:

**where did the user click in the world?**

---

# **🎯 Chapter 109 — Centering the Main Map**

Once the minimap has obtained the world position, it can ask `MapGrid` to center the main view there.

Conceptually:

🖱️ click minimap

↓

🖥️ receive screen position

↓

🔄 transform screen → SVG/world position

↓

🎯 tell `MapGrid` to center there

↓

🗺️ main `viewBox` moves

↓

👁️ user sees that part of the world.

This is the essence of minimap navigation.

---

# **🧠 109.1 The Minimap Does Not Need to Find a Hex**

Notice that this kind of navigation can work with continuous world coordinates.

We are not necessarily asking:

**“Which logical hex coordinate was clicked?”**

We can simply say:

**“Center the camera around this world X/Y position.”**

That is different from a future terrain-painting interaction, where we really do care which specific hex was clicked.

Again, different interactions can use different levels of coordinate information.

---

# **👀 Chapter 110 — Listening for View Changes**

After connecting to `MapGrid`, the minimap registers a viewport listener.

This allows `MapGrid` to notify the minimap when the visible world rectangle changes.

The minimap then updates its own display accordingly. minimap

This is important because not every map change necessarily originates from clicking the minimap.

The main map can change through zoom controls or other navigation behaviour.

The minimap must remain synchronized regardless of the cause.

---

# **📣 110.1 Don't Ask Constantly — Be Notified**

A poor design might have the minimap repeatedly ask:

**“Has the map changed?”**

**“Has the map changed?”**

**“Has the map changed?”**

Instead, `MapGrid` can notify registered listeners when something relevant happens.

This is event-oriented communication.

Conceptually:

**MapGrid**

📣 “My viewport changed\!”

↓

**Minimap listener**

👀 “Then I should redraw my viewport rectangle.”

This is cleaner and more efficient.

---

# **▭ Chapter 111 — Updating the Viewport Rectangle**

When the minimap receives the new viewport information, it changes the rectangle's:

`x`

`y`

`width`

and:

`height`.

The rectangle is therefore not recreated from scratch every time.

The existing SVG element can simply receive new attributes.

This is a common DOM technique.

Create the element once.

Then update its properties as application state changes.

---

# **🔎 111.1 Zoom In → Rectangle Shrinks**

Suppose Zoom 1 shows almost the entire world.

The viewport rectangle covers most of the minimap.

Now we switch to Zoom 5\.

The main map sees only a relatively small region.

Therefore:

**viewport width decreases**

and:

**viewport height decreases**

On the minimap, the rectangle becomes much smaller.

That visually tells us:

🔬 **we are looking closely at this small part of the world.**

---

# **🌍 111.2 Zoom Out → Rectangle Grows**

The opposite happens when zooming out.

The main map sees more world.

Therefore the viewport rectangle covers more of the minimap.

At the whole-world view, it approaches the dimensions of the complete world frame.

---

# **🧭 Chapter 112 — Moving Without Changing Zoom**

Suppose we keep Zoom 5 but navigate from the western side of the world to the eastern side.

The viewport rectangle's:

**width and height remain essentially the same**

because zoom has not changed.

But its:

**x and y change.**

So the rectangle moves across the minimap.

This illustrates something important about a camera:

### **Zoom**

changes how much world the camera sees.

### **Pan / center**

changes which part of the world it sees.

Both are ultimately expressed through the main map's viewport.

---

# **🔘 Chapter 113 — Zoom Buttons and Selected State**

The minimap also manages the visible state of its zoom controls.

When a particular zoom level is active, the corresponding control can be represented as selected.

This is similar in spirit to our `ToolButton` selection system.

Again, we have:

**application state**

and:

**visual representation of that state.**

The zoom level itself belongs to the map's navigation state.

The button appearance communicates that state to the user.

---

# **🔄 Chapter 114 — Why the Minimap Needs Initial Synchronization**

When `connectMap()` establishes the relationship, we do not want to wait until the user performs the first navigation action before the minimap becomes correct.

The minimap needs to reflect the map's current state immediately.

That means the connection process establishes the current zoom/view information and then keeps it synchronized afterward.

This is a common pattern:

**connect**

↓

**synchronize initial state**

↓

**listen for future changes**

---

# **🗄️ Chapter 115 — Does the Minimap Read IndexedDB?**

No.

This distinction is important.

`minimap.ts` is concerned with:

🌍 world frame

🎥 viewport

🔎 zoom

🎯 center position

🖱️ navigation.

It does not need to know whether a particular hex is:

Ocean,

Coast,

Grass,

or:

Desert.

It therefore has no reason to query our `hexes` table.

---

# **🧠 115.1 Geometry and Terrain Are Different Questions**

The minimap's job asks:

> **“Where in the world is the camera?”**

IndexedDB answers questions such as:

> **“What terrain exists at coordinate `(12,4)`?”**

Those are different domains.

This separation means changing our database schema does not automatically require rewriting the minimap.

Likewise, changing minimap navigation does not require a database migration.

That is exactly the kind of independence we want between components.

---

# **📐 Chapter 116 — The Transformation Matrix Is Not Hex Mathematics**

There are now two kinds of mathematics in the project that are easy to confuse.

### **⬡ Hex geometry**

Handled primarily by:

`midgard-hex-grid`

This determines:

hex points,

centers,

neighbours,

grid positions.

### **🔄 SVG transformation mathematics**

Handled largely by the browser's SVG system.

This determines relationships between:

SVG coordinates

and:

screen coordinates.

`getScreenCTM().inverse()` belongs to the second category.

We are not calculating hexagon geometry there.

We are converting coordinate spaces.

---

# **🪟 Chapter 117 — A Useful Camera Analogy**

The complete map-navigation system becomes much easier to understand if we imagine a huge paper map lying on a table.

The Civilization world is the paper.

Now imagine placing a rectangular frame over it.

That frame represents the main map's viewport.

### **🎯 Pan**

Slide the frame across the paper.

### **🔎 Zoom in**

Make the frame represent a smaller region of the paper, but enlarge that region on the monitor.

### **🔭 Zoom out**

Make the frame represent a larger region.

### **🧭 Minimap**

Look at the entire sheet of paper and draw a small rectangle showing where the frame currently sits.

That is essentially what our SVG system is doing mathematically.

---

# **🌊 Chapter 118 — What Happens to Terrain When We Navigate?**

Nothing happens to the terrain data itself.

Suppose `(6,4)` is Coast.

We zoom in.

It remains Coast.

We zoom out.

It remains Coast.

We pan to another area.

It remains Coast.

The camera has changed.

The world has not.

This is another useful distinction between:

🎥 **view state**

and:

🗄️ **world state**.

---

# **🗄️ 118.1 World State**

Stored persistently:

`terrain = coast`

`relief = flat`

### **🎥 View State**

Things such as:

current zoom

current center

current viewport.

These are different categories of state.

Understanding that difference will become increasingly useful as the editor grows.

---

# **🔄 Chapter 119 — The Full Minimap Interaction**

We can now follow one minimap click from beginning to end.

### **1️⃣ User clicks the minimap**

The browser creates a pointer/mouse event.

↓

### **2️⃣ Browser provides screen coordinates**

`clientX`

`clientY`

↓

### **3️⃣ Minimap creates an SVG point**

The click position is placed into an SVG-compatible point object.

↓

### **4️⃣ Minimap obtains the screen transformation matrix**

`getScreenCTM()`

↓

### **5️⃣ The matrix is inverted**

Now we can transform:

screen → SVG.

↓

### **6️⃣ The point is transformed**

We obtain world-space coordinates.

↓

### **7️⃣ Minimap tells `MapGrid`**

**Center the main map here.**

↓

### **8️⃣ `MapGrid` changes its viewport**

The main SVG `viewBox` moves.

↓

### **9️⃣ `MapGrid` notifies viewport listeners**

The minimap receives the updated viewport.

↓

### **🔟 The minimap rectangle moves**

The overview now reflects the new main-map camera.

That is a complete feedback loop.

---

# **♻️ Chapter 120 — Two Views, One Source of Geometric Truth**

A particularly good design choice is that the minimap does not maintain an independent competing version of world geometry.

The world frame comes from `MapGrid`.

Navigation ultimately changes `MapGrid`.

Viewport information comes back from `MapGrid`.

So although we have two visible components:

🗺️ main map

and:

🧭 minimap

we do not have two unrelated models of where the world is.

This reduces the possibility of them drifting out of synchronization.

---

# **🧩 Chapter 121 — Responsibilities of `minimap.ts`**

We can now describe the file very precisely.

`minimap.ts` is responsible for:

🧭 presenting a world overview

🔎 presenting zoom controls

▭ displaying the current viewport

🖱️ interpreting minimap clicks

🔄 converting screen coordinates into SVG/world coordinates

🎯 requesting that the main map center on a position

👀 reacting when the main map viewport changes.

It is **not** responsible for:

❌ creating hex geometry

❌ deciding terrain

❌ querying IndexedDB

❌ creating Ocean graphics

❌ migrating database records

❌ calculating the six points of a hexagon.

That boundary is just as important as what the class actually does.

---

# **⭐ 122\. What to Remember From `minimap.ts`**

### **🧭 The minimap is another view of the same world**

It does not create a second world.

### **🖼️ Its SVG can use the actual world coordinate system**

SVG scales that large coordinate space into a small visual component.

### **▭ The viewport rectangle represents the main map's camera**

Its position shows where we are.

Its size reflects how much world we can currently see.

### **🖥️ `clientX` and `clientY` are screen coordinates**

They cannot directly be treated as world coordinates.

### **🔄 `getScreenCTM().inverse()` lets us go from screen space back into SVG space**

This is the key to clicking a tiny minimap and obtaining the corresponding world position.

### **🎯 The minimap asks `MapGrid` to navigate**

It does not duplicate the main map's camera logic.

### **👀 Viewport listeners keep the minimap synchronized**

Changes in the main map can be reflected automatically.

### **🗄️ The minimap does not need IndexedDB**

Navigation state and persistent terrain state are separate concerns.

---

# **🧠 123\. The Application Now Has Several Different Kinds of State**

At this point in the book, we can identify at least three useful categories.

### **🗄️ Persistent world state**

Examples:

terrain

relief

Stored in IndexedDB.

---

### **🎥 View state**

Examples:

zoom level

camera center

visible viewport

Managed by the map/navigation system.

---

### **🔘 Interface state**

Examples:

which terrain tool is highlighted

which brush size is selected.

Managed by UI components such as `ToolSection` and `ToolButton`.

These categories may interact later, but they should not be confused.

For example:

**Grass button selected**

does not mean:

**a hex has already become Grass.**

And:

**camera centered on a Coast hex**

does not change:

**that hex's database record.**

This separation will be very important when we implement actual painting.

---

# **🌟 124\. Where We Have Arrived**

We now understand nearly the entire journey through the current World Builder:

🧱 HTML starts the application.

⚙️ TypeScript constructs the editor.

🧰 reusable UI components construct the panels.

⬡ `midgard-hex-grid` constructs the geometry.

🗄️ IndexedDB remembers what each hex means.

🧠 `MapArea` interprets that data.

🎨 SVG factories construct terrain artwork.

🗺️ `MapGrid` positions it.

🎥 `viewBox` gives us a camera.

🧭 `Minimap` gives us a second synchronized view of that camera.

The pieces are becoming much less mysterious because each one has a fairly specific responsibility.

