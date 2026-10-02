## **Part III — Building the Editor Interface from Small Objects**

---

# **🧱 Chapter 4 — `editor-layout.ts`: The Skeleton of the Editor**

We have already seen that `WorldBuilder` creates the major parts of the application: the header, left panel, map, right panel and minimap.

But somebody still needs to arrange those major pieces into one editor.

That is the responsibility of **`editor-layout.ts`**.

The entire class is deliberately small. It creates two HTML elements: the outer editor and the workspace inside it. Its `mount()` method then places the header above the workspace and puts the supplied columns inside that workspace. icons

---

## **🏠 4.1 Two Containers**

`EditorLayout` has two public properties:

`element`

and:

`workspace`

Both are `HTMLDivElement` objects.

The first represents the complete editor.

It receives the CSS class:

`editor`

The second represents the area below the header.

It receives:

`editor__workspace`

So conceptually the DOM becomes:

**editor**

↳ header

↳ **workspace**

 ↳ left panel

 ↳ map

 ↳ right panel

This is a good example of how TypeScript and CSS divide responsibilities.

TypeScript says:

**“These elements exist, and this one belongs inside that one.”**

CSS says:

**“This is how those elements should be arranged and styled.”**

---

## **🧩 4.2 The Interesting `...columns`**

The method is declared with a header followed by:

`...columns`

The three dots are JavaScript/TypeScript **rest syntax**.

It means that after the first `header` argument, the method can accept any number of additional `HTMLElement` arguments.

Our `WorldBuilder` currently supplies three columns:

**left tool panel**

**map area**

**right tool panel**

But `EditorLayout` itself does not say:

**“There must be exactly three columns.”**

It simply receives an array of columns and appends them.

That makes `EditorLayout` pleasantly generic.

---

## **🧠 4.3 `append(...columns)`**

The three dots appear again when the columns are appended.

Here they mean something slightly different.

The array is being **spread** into individual arguments.

Conceptually, if `columns` contains:

`[left, map, right]`

then:

`append(...columns)`

behaves like supplying:

`append(left, map, right)`

So the same `...` syntax participates in two complementary operations:

**Rest:** collect several arguments into an array.

**Spread:** expand an array into several arguments.

This is a common JavaScript and TypeScript pattern.

---

# **🎨 Chapter 5 — `style.css`: Turning Structure Into a World Builder**

`style.css` is much larger than `editor-layout.ts`, but its responsibility is very different.

The TypeScript creates elements.

The CSS determines how they look and how they occupy the screen.

At the top of the stylesheet we define reusable CSS custom properties such as `--sidebar-width`, `--header-height`, `--tool-size`, colours for panels and brass borders, and the UI font. style

These variables give the interface a shared visual vocabulary.

For example:

`--sidebar-width: 600px`

means that both side panels can use the same definition rather than independently hard-coding 600 pixels.

Likewise:

`--brass`

`--brass-bright`

`--panel`

`--map-deep`

become named pieces of the visual design.

This is similar in spirit to using constants in TypeScript.

---

## **🧱 5.1 Flexbox Creates the Major Layout**

The `.editor` rule uses:

`display: flex`

and:

`flex-direction: column`

This causes the editor's major children to be arranged vertically.

The header therefore appears above the workspace. style

The workspace itself also uses Flexbox, but without changing the direction from its horizontal default. style

So we get:

**vertical outer arrangement**

⬇

Header

Workspace

and inside the workspace:

**horizontal inner arrangement**

➡️ Left panel | Map | Right panel

This is a nice example of nested layouts.

---

## **🗺️ 5.2 Why the Map Takes the Remaining Space**

The tool panels have a fixed width based on:

`--sidebar-width`

while `.map-area` uses flexible sizing. style style

That gives us the behaviour we wanted:

**600 px panel \+ flexible map \+ 600 px panel**

The map occupies whatever horizontal space remains.

The map SVG itself then receives:

`width: 100%`

and:

`height: 100%` style

This becomes important later when `MapGrid` calculates zoom. The SVG's actual displayed size can change, so the map observes its viewport and adjusts its `viewBox`.

CSS and SVG therefore cooperate.

---

# **🧾 Chapter 6 — `types.ts`: Describing What a Tool Is**

Before creating tool panels and buttons, the application defines the **shape of their data**.

That is the purpose of `types.ts`.

This file does not create any visible HTML.

It contains TypeScript types.

---

## **🧩 6.1 `ToolItem`**

A `ToolItem` contains:

**`id`** — the programmatic identity of the tool

**`label`** — the human-readable name

**`icon`** — which SVG icon should represent it

and optionally:

**`group`** — which selection group it belongs to. types

For example, a conceptual terrain item might be:

🌱 ID: grass  
🏷️ Label: Grass  
🎨 Icon: grass  
🧩 Group: terrain

The important point is that this is **data describing a tool**, not the button itself.

Later, `ToolButton` takes that data and constructs an actual HTML button.

---

## **❓ 6.2 What Does the `?` Mean?**

The property is written as:

`group?: string`

The question mark means the property is **optional**.

A tool item is allowed to have a group, but it doesn't have to.

That matters because the interface contains two kinds of buttons.

A terrain choice such as Grass belongs to a selection group.

But an action such as Undo does not behave like a mutually exclusive selection.

The comment in the file explicitly describes this distinction: buttons sharing a group behave as a single choice, while buttons without a group, such as Undo, only show their ordinary hover/press behaviour. types

---

## **🗂️ 6.3 Larger Types Are Built From Smaller Types**

`ToolSectionConfig` contains:

an ID,

a title,

an array of `ToolItem` objects,

and an optional default selected ID. types

Then `ToolPanelConfig` contains:

an ID,

a label,

and an array of `ToolSectionConfig` objects. types

Notice the hierarchy:

**ToolPanelConfig**

↳ **ToolSectionConfig\[\]**

 ↳ **ToolItem\[\]**

This mirrors what appears visually:

**Tool panel**

↳ **Terrain section**

 ↳ Grass button

 ↳ Plains button

 ↳ Desert button

 ↳ …

The data structure and UI structure correspond.

---

# **📚 Chapter 7 — `catalog.ts`: Describing All the Available Tools**

If `types.ts` tells us what a tool *can look like as data*, `catalog.ts` contains the actual catalogue of tools.

This is another important separation.

The panel does not contain hard-coded knowledge such as:

**“I must contain Grass, Plains and Desert.”**

Instead, it receives configuration data.

The catalogue currently defines terrain choices including Grass, Plains, Desert, Tundra, Snow, Coast and Ocean, along with features such as Woods, Rainforest, Marsh, Oasis, Floodplains, Ice, Reef and Volcano. world-builder(1)

It also describes Rivers, brush sizes, Wonders, Continents, Resources and Improvements. catalog

---

## **⚠️ 7.1 UI Choices Are Not Yet the Same as Database Support**

This is particularly important at our current stage of development.

The catalogue already contains buttons for:

**Plains**

**Tundra**

**Snow**

and many other things.

But our database's `Terrain` type currently contains only:

`ocean | coast | grass | desert`

So a button existing in the editor does **not** mean that the complete behaviour behind it has already been implemented.

At the moment, much of the catalogue describes the interface we are building toward.

This is normal during incremental development.

---

## **🧠 7.2 The `choices()` Helper**

The catalogue uses a small helper called `choices()`.

It receives:

a group name,

and an array of items.

It then maps over those items and adds the same `group` value to each one. world-builder(1)

So instead of repeatedly writing the equivalent of:

Grass belongs to terrain.

Plains belongs to terrain.

Desert belongs to terrain.

Tundra belongs to terrain.

the helper says:

**“These are all choices in the terrain group.”**

This reduces repetition.

---

## **🗺️ 7.3 Left and Right Panels Are Just Configuration**

At the bottom, the catalogue defines:

`leftTools`

and:

`rightTools`

The left side receives:

🌱 Terrain  
🌳 Features  
🌊 Rivers  
🖌️ Brush

The right side receives:

🏛️ Wonders  
🌍 Continents  
🌾 Resources  
🔨 Improvements

The source comment makes an important architectural point: moving a section between those arrays changes which panel displays it; the panel itself does not hard-code a category. catalog

That is a good separation between:

**what content exists**

and:

**the component that knows how to display content.**

---

# **🔘 Chapter 8 — `tool-button.ts`: Turning Tool Data Into a Real Button**

Now we finally turn a `ToolItem` into something visible.

`ToolButton` receives a `ToolItem` in its constructor. tool-button

It then creates:

`document.createElement('button')`

This is ordinary HTML DOM creation.

Notice the difference from our SVG code.

For HTML we use:

`document.createElement(...)`

Later, for SVG, we will use:

`document.createElementNS(...)`

That difference will become important.

---

## **🎨 8.1 The Button Gets an SVG Icon**

The button calls:

`createIcon(item.icon)`

and appends the returned graphic. tool-button

So the button itself does not know how to draw Grass, a Pyramid, a Fish or a Mine.

It knows only:

**“My `ToolItem` tells me which icon name to request.”**

The icon system handles the drawing.

This is another recurring architectural pattern in the project:

**ask another component to do the thing it specializes in.**

---

## **♿ 8.2 Accessibility Attributes**

The button receives:

`title`

and:

`aria-label`

using the item's human-readable label. tool-button

If the button belongs to a selection group, it also gets:

`aria-pressed="false"` tool-button

Later, when selected, this changes.

This means selection isn't represented only visually by colour.

The element also communicates its pressed state semantically.

---

## **🔄 8.3 `setSelected()`**

`ToolButton` contains a method:

`setSelected(selected: boolean)`

It performs two related operations.

First, it toggles the CSS class:

`is-selected`

Second, if this is a grouped button, it updates `aria-pressed`. tool-button

So one method synchronizes:

🎨 **visual state**

and:

♿ **semantic accessibility state**

That is cleaner than having different parts of the application independently manipulate those details.

---

# **📦 Chapter 9 — `tool-section.ts`: Managing a Group of Buttons**

`ToolSection` represents something larger than one button.

Examples include:

**Terrain**

**Features**

**Brush**

**Resources**

The class stores its created `ToolButton` objects in an array. tool-section

It then builds a section containing a heading, a body and button grids.

---

## **🧱 9.1 Palette Choices and Actions**

Interestingly, `ToolSection` creates two containers:

`palette`

and:

`actions` tool-section

Buttons with a group go into the palette.

Buttons without a group go into actions. tool-section

This is why something like:

🖌️ Small brush  
🖌️ Medium brush  
🖌️ Large brush

can behave as selectable choices, while:

↩️ Undo  
↪️ Redo

can behave as actions rather than persistent selections.

---

## **🖱️ 9.2 Event Listeners**

For each button, the section registers:

`addEventListener('click', ...)`

When the user clicks the button, `ToolSection` calls its private `select()` method. tool-section

This introduces one of the foundations of browser programming:

**events**.

The program does not continuously ask:

**“Did the user click yet? Did the user click yet?”**

Instead, it registers a function to be called **when** a click occurs.

This is event-driven programming.

---

## **🎯 9.3 Exclusive Selection**

The private `select()` method first checks whether the button has a group.

If it does not, selection stops there.

If it does, the method loops over all buttons and finds those belonging to the same group. It selects the clicked button and deselects its group companions. tool-section

So clicking Grass can conceptually produce:

🌱 **Grass — selected**

🌾 Plains — not selected

🏜️ Desert — not selected

❄️ Tundra — not selected

Only one choice in that group is highlighted.

This behaviour is implemented by objects working together:

**ToolSection decides which button should be selected.**

**ToolButton knows how to display itself as selected.**

That division is worth noticing.

---

## **⭐ 9.4 Default Selection**

A section can specify:

`defaultSelectedId`

After creating its buttons, `ToolSection` searches for the matching one and selects it. tool-section

Our catalogue uses this, for example, to make Grass the initial terrain selection and Medium the initial brush selection. world-builder(1)

So initial UI state is data-driven too.

---

# **🗄️ 9.5 An Important Warning: This Is Not IndexedDB Yet**

Because this book emphasizes IndexedDB, it is worth being very explicit here.

When `ToolSection` changes the selected button, **nothing in this file is currently written to IndexedDB**.

The class is managing **UI selection state**.

That is different from persistent world state.

At this stage:

**clicking/highlighting a button**

and:

**changing a hex record in IndexedDB**

are separate concerns.

Later, when painting is implemented, some part of the application will need to connect those two worlds:

🖱️ selected terrain tool

* 

⬡ clicked hex

↓

🗄️ update that hex's persistent terrain

↓

🎨 redraw the hex

But `ToolSection` itself does not currently perform that database operation.

That distinction prevents us from attributing behaviour to the current code that it does not yet contain.

---

# **🧰 Chapter 10 — `tool-panel.ts`: Building an Entire Side Panel**

Now we move one level higher again.

We had:

**ToolItem data**

↓

**ToolButton**

↓

**ToolSection**

and now:

**ToolPanel**

The constructor receives:

a `ToolPanelConfig`,

a side,

and optionally a footer. tool-panel

The side is constrained by TypeScript to:

`'left' | 'right'` types

This is a **union type**.

It means arbitrary strings are not acceptable.

For this type, TypeScript recognizes only those two values.

---

## **🧱 10.1 Building Sections From Configuration**

The panel creates an `<aside>` and a scrollable `<div>`.

Then it loops over:

`config.sections`

For every section configuration it creates:

`new ToolSection(section)`

and appends that section's element. tool-panel

This completes our chain:

**catalogue data**

↓

**ToolPanel**

↓

**ToolSection**

↓

**ToolButton**

↓

**SVG icon**

A surprisingly large interface can therefore emerge from a relatively small set of reusable classes.

---

## **🧭 10.2 The Optional Footer**

`ToolPanel` can also receive:

`footer?: HTMLElement`

Again, `?` means optional.

If a footer exists, the panel appends it after the scrolling tool area. tool-panel

In our application, `WorldBuilder` uses this feature to put the **Minimap** into the right panel.

The left panel receives no footer.

The right panel receives `minimap.element`.

So `ToolPanel` does not contain any special statement saying:

**“The right panel must have a minimap.”**

It merely supports an optional footer.

`WorldBuilder` decides what that footer happens to be.

That makes the component more reusable.

---

# **🎨 Chapter 11 — `icons.ts`: SVG Before the Big SVG Chapters**

Our `icons.ts` file deserves a detailed chapter of its own because it contains many drawing functions.

For now, there is one architectural idea worth understanding.

At the end of the file is a collection called:

`drawers`

It associates names such as:

`grass`

`ocean`

`river`

`pyramid`

`wheat`

`mine`

and many others with functions capable of drawing those icons. catalog

From the keys of that object, TypeScript derives:

`IconName`

Then `createIcon(name)` creates an SVG with a `24 × 24` `viewBox`, looks up the appropriate drawing function, asks it to draw into the SVG, and returns the completed SVG. icons

So:

**ToolButton**

asks:

**“Give me the Grass icon.”**

and `icons.ts` knows how to produce it.

---

# **🖼️ 11.1 Icon SVG and Terrain SVG Are Not the Same Thing**

This is worth emphasizing because both use SVG.

The small Grass icon in the toolbar is **not** the Grass terrain tile.

Likewise, the Ocean toolbar icon is **not** our full Ocean hex graphic.

They serve different purposes.

The toolbar icon is a tiny symbolic representation designed for the interface.

Our terrain graphics such as `ocean.ts` and `coast.ts` are full graphical tiles designed to occupy an actual world hex.

So even though both use SVG:

**UI SVG icon ≠ world terrain SVG**

This distinction will become very clear when we study the terrain graphics in detail.

---

# **🧠 12\. The Pattern We Have Discovered**

We can now see a repeating hierarchy throughout the application:

**WorldBuilder**

assembles:

➡️ **EditorLayout**

which contains:

➡️ **ToolPanel**

which contains:

➡️ **ToolSection**

which contains:

➡️ **ToolButton**

which contains:

➡️ **SVG Icon**

Each class works at a different level.

This is a much more manageable architecture than having one enormous `WorldBuilder` class containing hundreds of lines that manually creates every button.

---

# **🗄️ 13\. Where Is IndexedDB in All of This?**

Almost nowhere — **and that is good.**

`EditorLayout` does not know about IndexedDB.

`ToolPanel` does not know about IndexedDB.

`ToolButton` does not know about IndexedDB.

The icon drawing functions do not know about IndexedDB.

These files are concerned primarily with the **user interface**.

Our persistent world belongs elsewhere.

We are now ready to enter the part of the application where those two worlds meet:

**the visible map**

and:

**the persistent database**.

