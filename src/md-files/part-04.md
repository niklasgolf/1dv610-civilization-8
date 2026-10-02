## **Part IV — The Persistent World: `map-area.ts` and `world-database.ts`**

This is one of the most important parts of the entire application.

Until now, most of what we have studied has concerned **things the user can see**: panels, buttons, layouts, icons and the map interface.

Now we reach something different.

The world needs to **remember what it is**.

If a particular hex is Ocean, Coast or Grass, that information must exist somewhere independently of the SVG artwork currently visible on the screen.

That responsibility belongs to our database layer.

---

# **🗄️ Chapter 12 — What IndexedDB Is Doing for Civilization 8**

Before reading `world-database.ts` line by line, we need a clear mental model of the technology.

There are actually **three layers** involved:

### **⚙️ Our TypeScript code**

This is the code we write.

### **📦 Dexie**

Dexie is a library that gives us a convenient TypeScript/JavaScript interface for working with IndexedDB.

### **🗄️ IndexedDB**

IndexedDB is the actual persistent database provided by the browser.

So when our code says something pleasant and compact such as:

`worldDatabase.hexes.toArray()`

we should mentally picture:

**our TypeScript**

↓

**Dexie receives the request**

↓

**Dexie communicates with IndexedDB**

↓

**the browser reads the stored records**

↓

**Dexie gives the results back to our TypeScript**

This distinction is going to matter throughout this chapter.

---

# **💾 12.1 Why We Need a Database at All**

Imagine that our map existed only as SVG.

Perhaps we colour one polygon green.

Visually, we would see Grass.

But what does that actually tell our program?

Potentially very little.

The browser knows:

**“This polygon happens to have a green fill.”**

But our game needs semantic information:

**“The hex at coordinate `(12,4)` has Grass terrain.”**

Those are very different statements.

A colour is a visual property.

Grass is world data.

This becomes even more obvious later.

A hex might eventually contain:

🌱 Grass terrain

⛰️ Hills relief

🌳 Woods feature

🐎 Horses resource

🚜 Pasture improvement

🏛️ perhaps some additional object or ownership information

We do not want to determine those facts by examining colours and SVG paths.

The database should know them explicitly.

---

# **🧠 12.2 The Database Is the Model; SVG Is a Representation**

A useful way to think about the architecture is:

### **🗄️ Database**

**What exists?**

### **🎨 SVG**

**How should it look?**

For example:

🗄️ IndexedDB:

`terrain = ocean`

Then:

🎨 Renderer:

**Ocean should look dark blue with waves.**

If we later completely redesign the Ocean artwork, the database does not need to change.

The record can still say:

`ocean`

Perhaps version 1 of our artwork has six simple waves.

Perhaps version 10 has beautiful complex water.

The semantic fact remains the same:

**this hex is Ocean.**

This separation is extremely valuable.

---

# **🗄️ Chapter 13 — `world-database.ts`: The Heart of Persistence**

Now we enter the file that defines our persistent world.

It begins by importing:

`Dexie`

and:

`Table`

from the Dexie package.

It also imports the `Coordinate` type from our hex-grid library. world-database

Already we can see two different worlds meeting:

**Dexie → persistence**

**Coordinate → hex geometry**

---

# **🌱 13.1 The `Terrain` Type**

Our current terrain type is:

`'ocean' | 'coast' | 'grass' | 'desert'` world-database

This is a TypeScript **union type**.

It says:

> A value of type `Terrain` must be one of these four strings.

So TypeScript should accept:

`'grass'`

but reject something such as:

`'banana'`

when a `Terrain` is required.

This protects our program from a whole category of accidental invalid values.

Remember, though, that the UI catalogue already contains Plains, Tundra and Snow.

Those are future terrain choices from the perspective of the database model. They are not yet included in this `Terrain` type.

---

# **⛰️ 13.2 The `Relief` Type**

Next comes:

`'flat' | 'hills' | 'mountain'` world-database

This is a separate dimension.

That separation is significant.

Instead of creating terrain values such as:

`grass-flat`

`grass-hills`

`grass-mountain`

`desert-flat`

`desert-hills`

`desert-mountain`

we can combine two simpler pieces of data.

For example:

**terrain:** Grass  
**relief:** Hills

This is composition.

It will also eventually make our graphics architecture cleaner because the terrain artwork and relief artwork can become separate layers.

---

# **🗃️ 13.3 `HexRecord`: What One Database Record Looks Like**

Next comes one of the most important interfaces in the application:

`HexRecord`.

It contains:

`x: number`

`y: number`

`terrain: Terrain`

`relief: Relief` world-database

This describes the structure of one hex record.

Conceptually, one record could be:

**x:** 12  
**y:** 4  
**terrain:** grass  
**relief:** flat

Another:

**x:** 6  
**y:** 4  
**terrain:** coast  
**relief:** flat

And hundreds more:

**terrain:** ocean  
**relief:** flat

These are the objects we saw when inspecting IndexedDB in Chrome DevTools.

---

# **⚠️ 13.4 TypeScript Interfaces Are Not Database Tables**

This distinction is important for a beginner.

Writing:

`interface HexRecord`

does **not** itself create an IndexedDB table.

The interface belongs to TypeScript.

It tells TypeScript:

**“Objects of this kind should have these properties and types.”**

IndexedDB itself does not read our TypeScript interface and automatically construct a database from it.

The actual database configuration comes later through Dexie.

So:

**`HexRecord` \= TypeScript's understanding of a record**

while:

**Dexie's schema configuration \= database structure/index configuration**

They work together, but they are not the same thing.

---

# **🌊 13.5 Default Values**

The file defines:

**default terrain:** Ocean

and:

**default relief:** Flat. world-database

These constants express our new-world policy.

If we create a world and nothing special has been assigned to a hex, it becomes:

🌊 Ocean

➕

➖ Flat relief

So the blank World Builder world is not actually empty.

It is a complete Ocean world.

---

# **📍 13.6 Our Two Special Starting Coordinates**

The file currently contains two specially defined coordinates.

One is the initial Coast coordinate:

**x \= 6**

**y \= 4**

The other is the initial Grass coordinate:

**x \= 12**

**y \= 4**. world-database

These are currently useful development/test data.

They allow us to have a mostly Ocean world while confirming that the database and renderer correctly distinguish other terrain values.

---

# **🏦 13.7 `WorldDatabase extends Dexie`**

Now we reach the actual database class:

`WorldDatabase extends Dexie` world-database

This is object-oriented inheritance.

Our class:

**WorldDatabase**

is a specialized kind of:

**Dexie**

That gives `WorldDatabase` access to Dexie's database functionality while allowing us to add Civilization-specific concepts such as:

`hexes`

and:

`initializeWorld()`.

---

# **🗄️ 13.8 Here IndexedDB Becomes Concrete**

Inside the class we declare:

`hexes`

as a Dexie `Table`.

The table stores:

`HexRecord`

objects.

Its key is typed as:

`[number, number]` world-database

That pair corresponds to:

`[x, y]`

So instead of assigning every hex an unrelated database ID such as:

1

2

3

4

we identify a hex using something that already naturally identifies it in our world:

**its coordinate.**

That is an elegant choice.

---

# **🔑 13.9 What Is a Database Key?**

A database needs a way to identify records.

Imagine we ask:

**“Give me the record for hex `(12,4)`.”**

IndexedDB needs to know which record that means.

Our key is a **compound key**:

`[x+y]`

This means the key consists of two fields together:

**x \+ y**

Not mathematical addition.

It means the pair:

**x and y**

So:

`(12,4)`

identifies one particular record.

`(12,6)`

identifies another.

`(14,4)`

identifies another.

The coordinate pair acts as the identity of the hex.

---

# **🏷️ 13.10 The Database Name**

Inside the constructor we call Dexie's constructor with:

`civilization-8-world` world-database

### **🗄️ Here IndexedDB is being configured.**

This becomes the name of the IndexedDB database.

That is why Chrome DevTools shows:

**civilization-8-world**

under IndexedDB.

This is a nice moment where something in our source code becomes something directly visible in the browser's database inspector.

---

# **🔢 Chapter 14 — Database Versions: One of the Most Important IndexedDB Concepts**

Now we reach:

`this.version(1)`

then:

`this.version(2)`

then:

`this.version(3)`.

This deserves careful explanation.

Databases evolve.

Our application did not originally have every field and feature it has today.

Suppose version 1 of the application has already been used.

The user's browser contains stored records.

Then we change our application.

We cannot simply behave as though those existing records were created using the new structure.

We need a controlled way to move old persistent data forward.

That is what **database versions and migrations** are for.

---

# **🗄️ 14.1 Version 1**

Version 1 declares:

`hexes: '[x+y], terrain'` world-database

Let's decode this.

### **`hexes`**

This is the store/table name.

### **`[x+y]`**

This is the compound primary key.

The combination of `x` and `y` identifies a record.

### **`terrain`**

This tells Dexie that `terrain` should have an index.

So we could efficiently query records according to terrain if needed.

Conceptually:

**Database**

↳ **hexes**

 ↳ key: `[x,y]`

 ↳ indexed field: `terrain`

---

# **🔍 14.2 What Is an Index?**

An index is a database structure designed to make certain lookups more efficient.

Without an index, imagine asking:

**“Find all Grass hexes.”**

A database might have to inspect record after record.

An index on `terrain` gives the database a structure organized around terrain values.

This is analogous to the index at the back of a book.

If you want every place where “IndexedDB” appears, you do not necessarily read every page from beginning to end.

You use the index.

That is the basic idea.

---

# **🧬 14.3 Version 2: Existing Data Must Evolve**

Version 2 still declares:

`hexes: '[x+y], terrain'`

but now it also contains an:

`upgrade(...)`

operation. world-database

### **🗄️ Here IndexedDB is being migrated.**

This is different from merely declaring what a fresh database should look like.

The upgrade code handles data that **already exists**.

It obtains the `hexes` table inside the upgrade transaction and updates the record at our special Coast coordinate.

The new terrain value becomes:

`coast`. world-database

This is why database migrations are so important.

Users can already have persistent data.

A new version of the application must sometimes transform that old data rather than deleting everything and starting over.

---

# **🔒 14.4 What Is a Transaction?**

The upgrade receives something called:

`transaction`.

A **database transaction** groups database operations into a controlled unit of work.

This matters because database changes should not be left in an unpredictable halfway state if something goes wrong.

For our purposes, the important beginner-level idea is:

> A transaction provides a controlled context in which related database work is performed.

Dexie gives the migration access to the appropriate table through that transaction.

---

# **⏳ 14.5 Why `async` and `await` Appear Here**

The upgrade callback is declared:

`async`

and the update uses:

`await`. world-database

Database operations are asynchronous.

Why?

Because reading or writing persistent storage is not treated like reading a normal local variable.

The operation can take time.

JavaScript should not freeze the entire browser while waiting for storage.

Instead, the operation returns a Promise.

`await` essentially means:

**“This function needs the result of this asynchronous operation before proceeding beyond this point.”**

We will see the same pattern when initializing and reading the world.

---

# **⛰️ 14.6 Version 3: Adding Relief**

Version 3 changes the store declaration to:

`hexes: '[x+y], terrain, relief'` world-database

Now `relief` is also indexed.

But there is a problem.

Our existing records were created before `relief` existed.

They might have:

`x`

`y`

`terrain`

but no:

`relief`

So merely changing the TypeScript interface is not enough.

Merely changing the Dexie schema string is not enough either.

We must actually update the existing stored records.

---

# **🗄️ 14.7 Here IndexedDB Is Being Migrated Again**

Version 3 performs:

`toCollection()`

followed by:

`modify(...)`

and gives every existing record:

`relief: DEFAULT_RELIEF` world-database

And `DEFAULT_RELIEF` is:

`flat`

So conceptually the migration says:

**For every existing hex record in IndexedDB, add relief \= flat.**

Before migration:

🌊 `(4,4)` → Ocean

After migration:

🌊 `(4,4)` → Ocean \+ Flat

Before:

🌱 `(12,4)` → Grass

After:

🌱 `(12,4)` → Grass \+ Flat

This is exactly why, after the migration, we could inspect Chrome DevTools and see `relief: "flat"` on the existing records.

---

# **💡 14.8 A Crucial Beginner Lesson: Changing an Interface Does Not Change Stored Data**

Suppose we only changed:

`interface HexRecord`

and added:

`relief: Relief`

Would all the old IndexedDB records magically acquire a `relief` property?

**No.**

The TypeScript interface disappears as a runtime type description when the code is compiled.

It does not travel through the browser's database and rewrite old records.

This is precisely why migration code exists.

We had to explicitly say:

**modify the existing collection and give every record `relief: flat`.**

This distinction between:

**TypeScript's model of the data**

and:

**the actual persistent data already stored in IndexedDB**

is one of the most important concepts in this entire chapter.

---

# **🌍 Chapter 15 — `initializeWorld()`: Creating the Persistent World**

Now we reach:

`initializeWorld(coordinates)`.

This method receives:

`readonly Coordinate[]` world-database

Where do those coordinates come from?

Not from IndexedDB.

They come from our hexagonal geometry.

`MapGrid` asks `midgard-hex-grid` to create the world and keeps its coordinates.

Then `MapArea` passes those coordinates into:

`worldDatabase.initializeWorld(...)`. map-area

This is where geometry and persistence meet.

---

# **🔢 15.1 First: Count Existing Records**

The first operation is:

`await this.hexes.count()` world-database

### **🗄️ Here IndexedDB is being read.**

Through Dexie, we ask the browser database:

**“How many records already exist in the `hexes` store?”**

This determines whether the persistent world has already been initialized.

---

# **🛑 15.2 If the World Already Exists, Leave It Alone**

The code checks whether the count is greater than zero.

If it is, the method returns immediately. world-database

This is extremely important.

Imagine that later the user has spent hours building a world.

They reload the page.

`initializeWorld()` runs again.

If initialization blindly recreated all 1,174 default records every time, we could destroy or overwrite the user's world.

Instead we ask:

**“Does the world already contain records?”**

If yes:

**do not initialize it again.**

This is one of the key differences between **initial data creation** and **normal application startup**.

---

# **🏗️ 15.3 Creating the Initial Records**

If there are no existing records, we map over all coordinates.

For every coordinate we create a `HexRecord` containing:

its `x` coordinate,

its `y` coordinate,

its initial terrain,

and:

`relief: DEFAULT_RELIEF`. world-database

So the geometry supplies the list of valid world positions.

The database layer transforms those positions into persistent world records.

Conceptually:

⬡ coordinate `(0,2)`

becomes:

🗄️ `(0,2), ocean, flat`

⬡ coordinate `(2,2)`

becomes:

🗄️ `(2,2), ocean, flat`

and so forth.

---

# **📦 15.4 Why Build an Array First?**

The `map()` operation creates an array of `HexRecord` objects.

At this point these are ordinary JavaScript objects in memory.

This is important:

### **Before `bulkAdd()`**

They are just objects in runtime memory.

### **After `bulkAdd()`**

They have been inserted into persistent IndexedDB storage.

That boundary is worth recognizing.

---

# **🗄️ 15.5 Here the World Is Actually Written to IndexedDB**

Finally:

`await this.hexes.bulkAdd(hexRecords)` world-database

This is the big moment.

Through Dexie, all of our newly constructed records are inserted into the IndexedDB `hexes` store.

`bulkAdd` is appropriate because we have many records to insert.

Instead of conceptually issuing 1,174 independent high-level additions ourselves, we hand Dexie the complete collection.

After this succeeds, the world is no longer merely an array in memory.

It is persistent browser data.

That is why it remains available after reloading the application.

---

# **🌊 Chapter 16 — `initialTerrainFor()`: Deciding the Starting Terrain**

Most coordinates should initially be Ocean.

But we currently have two development exceptions.

The method checks whether a coordinate matches the special Coast coordinate.

If it does:

`return 'coast'` world-database

Then it checks the special Grass coordinate.

If that matches:

`return 'grass'` world-database

Otherwise:

`return DEFAULT_TERRAIN`

which means:

🌊 Ocean. world-database

This explains why our newly initialized world is almost entirely Ocean but contains the special Coast and Grass test hexes.

---

# **🏦 16.1 Creating the Database Object**

At the bottom of the file:

`new WorldDatabase()`

creates one database object and exports it as:

`worldDatabase`. world-database

Other parts of the application can import this shared object.

For example, `MapArea` imports:

`worldDatabase`

along with the `HexRecord` and `Terrain` types. map-area

This gives the map layer access to our persistent world.

---

# **🗺️ Chapter 17 — `map-area.ts`: Where Database Data Becomes Visible**

Now we move to the other half of this architecture.

`world-database.ts` knows how the world is stored.

`map-area.ts` begins turning that stored world into something the user can see.

This file imports:

🗄️ `worldDatabase`

📋 `HexRecord`

🌍 `Terrain`

🌊 `createOcean`

🏝️ `createCoast`

⬡ `MapGrid`. map-area

That import list is very revealing.

This file sits between:

**database**

and:

**graphics**.

---

# **🎨 17.1 Temporary Flat Terrain Colours**

The file contains `TERRAIN_FILL`, which maps terrain values to colours:

Ocean → dark blue

Coast → lighter blue

Grass → green

Desert → sandy colour. map-area

Ocean and Coast now have proper terrain graphics as well.

Grass and Desert currently still rely on simple fills.

This reflects the current stage of development rather than the final intended graphical system.

---

# **🧱 17.2 Constructing the Map Area**

The `MapArea` constructor creates a `<main>` element.

It gives it:

`className = 'map-area'`

and an accessibility label:

`Map`. map-area

Then it creates:

`new MapGrid()`

and appends the map grid's SVG element into the `<main>`.

Notice what has **not** happened yet.

We have not read IndexedDB.

The constructor establishes the map area's basic structure.

Database-dependent work happens separately in:

`initialize()`.

---

# **🗄️ Chapter 18 — `MapArea.initialize()`: Reading the Persistent World**

Now we arrive at the key method:

`async initialize()`.

The first line is:

`await worldDatabase.initializeWorld(this.mapGrid.getCoordinates())` map-area

There are two possible situations.

---

## **🌱 Situation A — First Ever Run**

IndexedDB contains no hex records.

`initializeWorld()` discovers:

**count \= 0**

It creates the records and writes them using `bulkAdd()`.

The browser now contains our persistent world.

---

## **🔄 Situation B — Later Run**

IndexedDB already contains the world.

`initializeWorld()` discovers:

**count \> 0**

It returns without rebuilding the database.

The stored world survives.

That is the persistence behaviour we want.

---

# **🗄️ 18.1 Here We Read the Entire World From IndexedDB**

Next:

`worldDatabase.hexes.toArray()` map-area

This is another crucial IndexedDB operation.

Through Dexie we are saying:

**“Read the records in the `hexes` table and give them to me as a JavaScript array.”**

The result is stored in:

`hexRecords`

Now we have crossed from persistent storage back into runtime memory.

Think of the direction:

🗄️ **IndexedDB**

↓

📦 **Dexie**

↓

📋 **JavaScript array of `HexRecord` objects**

The database remains persistent, but we now also have an in-memory representation that TypeScript can iterate over.

---

# **🔄 18.2 Rendering Every Database Record**

Next:

`for (const hexRecord of hexRecords)`

The application loops over the records and calls:

`this.renderHexTerrain(hexRecord)` map-area

If the database contains 1,174 records, this method is called for each record.

This is where database semantics start turning into visible graphics.

---

# **🎨 Chapter 19 — `renderHexTerrain()`: From Data to Pixels**

The method receives one:

`HexRecord`

It first reconstructs a coordinate from:

`hexRecord.x`

and:

`hexRecord.y`. map-area

It can then tell `MapGrid` which geometric hex we are talking about.

---

# **🎨 19.1 First Apply the Terrain Fill**

The method calls:

`setHexFill(...)`

using the colour associated with:

`hexRecord.terrain`. map-area

Notice the chain.

The database says:

`terrain: 'grass'`

Then:

`TERRAIN_FILL['grass']`

produces:

`green`

Then:

`MapGrid`

applies that colour to the correct polygon.

Already the database is controlling something visible.

---

# **🌊 19.2 Ocean Becomes an Ocean Graphic**

Then we test:

`hexRecord.terrain === 'ocean'`

If true, we create:

`createOcean()`

and give that graphic to the corresponding hex through `setHexGraphic()`. map-area

This is one of the clearest examples in the project of **semantic data driving presentation**.

The database does not contain waves.

It contains:

`ocean`

The renderer interprets that meaning and chooses:

`createOcean()`.

---

# **🏝️ 19.3 Coast Becomes a Coast Graphic**

Likewise:

`hexRecord.terrain === 'coast'`

causes:

`createCoast()` map-area

Again:

🗄️ database value

↓

🧠 TypeScript decision

↓

🎨 SVG factory

↓

🗺️ visible terrain

---

# **🧠 19.4 Why This Architecture Is So Important**

Imagine instead that IndexedDB stored:

hundreds of SVG paths,

gradient colours,

ellipse positions,

wave coordinates,

clip paths,

and all the other details required to draw Ocean.

That would tightly bind our persistent world to one particular visual design.

Instead our database contains a simple semantic statement:

**Ocean.**

This means we can later completely redesign `ocean.ts` without migrating every Ocean record in IndexedDB.

The database still says:

`ocean`

The renderer simply produces a different representation of Ocean.

That is a much cleaner architecture.

---

# **🔄 Chapter 20 — The Complete IndexedDB Lifecycle**

We can now follow the entire database lifecycle from application startup.

### **1️⃣ The geometric world exists**

`MapGrid` obtains valid coordinates from `midgard-hex-grid`.

⬇️

### **2️⃣ `MapArea.initialize()` begins**

It sends those coordinates to `WorldDatabase`.

⬇️

### **3️⃣ 🗄️ IndexedDB is checked**

Dexie asks how many records exist.

⬇️

### **4️⃣ If necessary, records are created**

Every coordinate becomes a `HexRecord`.

⬇️

### **5️⃣ 🗄️ The records are persisted**

Dexie's `bulkAdd()` writes them into IndexedDB.

⬇️

### **6️⃣ 🗄️ The records are read**

Dexie's `toArray()` retrieves the world.

⬇️

### **7️⃣ TypeScript examines each record**

`MapArea` looks at `terrain`.

⬇️

### **8️⃣ SVG artwork is selected**

Ocean → `createOcean()`

Coast → `createCoast()`

⬇️

### **9️⃣ `MapGrid` places the artwork**

The correct graphic is positioned on the correct coordinate.

⬇️

### **🔟 The browser displays the world**

The user sees the persistent data as a graphical map.

---

# **💾 20.1 What Survives a Reload?**

This is a crucial distinction.

When the page reloads, runtime objects such as:

`MapArea`

`MapGrid`

the `hexRecords` array,

the SVG elements,

and the current JavaScript objects

are recreated.

They do not simply remain alive forever.

But the IndexedDB database persists.

So after reload:

**old runtime objects disappear**

but:

🗄️ **persistent database records remain**

Then the new application instance reads those records and reconstructs the visible world.

This is the essence of persistence.

---

# **🧪 20.2 Why Chrome DevTools Was So Useful**

When we inspected:

**Application → IndexedDB → civilization-8-world → hexes**

we were looking beneath the graphical application.

Instead of seeing waves and green polygons, we saw records.

That lets us verify the separation directly.

On the screen:

🌊 🌊 🌊 🌱 🌊 🌊

In IndexedDB:

`{ x, y, terrain, relief }`

The first is the **representation**.

The second is the **stored world state**.

---

# **🧭 20.3 What IndexedDB Does Not Currently Store**

It is equally important to understand what is *not* currently stored there.

Our `HexRecord` contains only:

`x`

`y`

`terrain`

`relief`. world-database

Therefore the provided current database file does **not** define persistent fields for:

features,

resources,

improvements,

wonders,

rivers,

continents,

or the selected toolbar button.

Those ideas appear elsewhere in the UI, but they are not fields of the current `HexRecord`.

This book should always distinguish between:

**what the project may eventually support**

and:

**what the supplied code actually stores today.**

---

# **🌳 20.4 How the Data Model Can Grow**

The current structure gives us a natural direction.

Today:

**coordinate | terrain | relief**

Later, if we decide to extend `HexRecord`, it could gain additional semantic properties.

But that will create the same question we encountered with Relief:

> What happens to the 1,174 records already stored in users' browsers?

And now we know the answer.

We do not merely change a TypeScript interface.

We may need another database version.

Perhaps:

**version 4**

with an appropriate migration.

That is why learning the version 3 Relief migration now is so valuable. It establishes the pattern we can reuse as the world model grows.

---

# **⭐ 21\. The Most Important IndexedDB Lessons So Far**

There are several concepts worth remembering.

### **🗄️ IndexedDB is the actual persistent browser database**

It survives ordinary page reloads.

### **📦 Dexie is the library we use to communicate with IndexedDB**

Methods such as `count()`, `bulkAdd()`, `toArray()`, `update()` and `modify()` are part of the convenient programming layer we are using.

### **📋 `HexRecord` describes our data in TypeScript**

It does not itself create or migrate the persistent database.

### **🔑 `[x+y]` is our compound key**

Together, the X and Y coordinates identify a hex record.

### **🔍 `terrain` and `relief` are indexed**

That prepares those properties for efficient database queries.

### **🔢 Database versions let persistent data evolve**

Version 1 established the store.

Version 2 migrated the special Coast record.

Version 3 introduced Relief and migrated existing records to Flat.

### **🌊 Initialization happens only when necessary**

If records already exist, we do not recreate the world.

### **🎨 Graphics do not belong in the database**

IndexedDB remembers that a hex is Ocean.

`ocean.ts` decides what Ocean looks like.

---

# **🧩 22\. The Architecture We Now Have**

We can finally draw a more complete mental picture:

⬡ **midgard-hex-grid**

*Which coordinates and shapes exist?*

↓

🗺️ **MapGrid**

*Where are those hexes physically located?*

↓

🗄️ **WorldDatabase / Dexie / IndexedDB**

*What does each coordinate represent persistently?*

↓

🧠 **MapArea**

*How should that semantic information be rendered?*

↓

🎨 **Terrain graphics**

*What does Ocean or Coast actually look like?*

↓

👁️ **Browser**

*Display the resulting world.*

This is the foundation on which the rest of the World Builder can grow.

And now that we understand **what the world knows**, we can examine in detail **how the hexagonal world itself is constructed and displayed**.

---

