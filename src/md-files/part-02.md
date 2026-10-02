## **Part II — From the Browser to Our TypeScript Application**

---

# **🌐 Chapter 1 — `index.html`: The Door Into the Application**

Every browser application needs somewhere to begin.

Our World Builder contains many TypeScript classes, SVG graphics, an IndexedDB database, a hexagonal-grid library, and hundreds of dynamically created HTML and SVG elements.

Yet when the browser first loads the application, none of those things exist on the page.

The starting point is a tiny file:

**`index.html`**

It contains only 15 lines. index

That small size is intentional. Most of our application is created dynamically by TypeScript rather than being written directly into HTML.

---

## **🧱 1.1 What HTML Does in Our Application**

HTML describes the basic structure of a web page.

Traditional websites can contain enormous HTML files with headings, menus, forms, paragraphs and images already written into them.

Our application takes a different approach.

The HTML essentially says:

**“Browser, establish a page for me, give my application an empty place to live, and then start my TypeScript application.”**

TypeScript does almost everything else.

This is common in modern web applications.

---

## **📄 1.2 The Document Begins**

The first line is:

`<!doctype html>`

This tells the browser that this document uses modern HTML.

Then comes:

`<html lang="en">`

The `<html>` element is the root of the entire HTML document.

The attribute `lang="en"` tells browsers and assistive technologies that the page's primary language is English. index

Inside `<html>` are the two traditional major sections of an HTML document:

**`<head>`**

and

**`<body>`**

The head contains information *about* the page.

The body contains what belongs to the actual page.

---

# **🧠 1.3 The `<head>`: Information About the Application**

Inside the head we have several pieces of metadata.

The character encoding is:

`UTF-8`

This allows the page to correctly represent an enormous range of characters. index

We also link to:

`/favicon.svg`

The favicon is the little graphical symbol the browser can display for the page, for example in a browser tab. index

Then we have the viewport declaration:

`width=device-width, initial-scale=1.0`

This tells the browser to treat the viewport width sensibly relative to the device instead of pretending that the page has some older fixed desktop-style width. index

There is also:

`color-scheme="dark"`

This informs the browser that the application uses a dark colour scheme. index

That matches the World Builder's dark blue interface.

Finally, the page title is:

**Civilization 8 — World Builder** index

This is the document title the browser can show in its tab or window.

---

# **🕳️ 1.4 The Most Important Empty Element**

The body contains something that looks almost disappointingly small:

`<div id="app"></div>`

But this is one of the most important elements in the entire application. index

At the moment the HTML is loaded, this `<div>` is empty.

There is no header inside it.

There are no tool panels.

There is no minimap.

There are no 1,174 hexagons.

There are no Ocean graphics.

It is simply an empty container with the ID:

`app`

Think of it as an **empty stage**.

TypeScript is about to build the World Builder and place it onto that stage.

---

# **🚀 1.5 Starting `main.ts`**

Immediately after the empty application element comes:

`<script type="module" src="/src/main.ts"></script>` index

This is where HTML hands control to our program.

The `src` tells the application which source module to start with:

`/src/main.ts`

The important word here is:

`module`

Our application is divided into many TypeScript modules.

A module can import things from another module and export things for other modules to use.

We will see this constantly:

`main.ts` imports `WorldBuilder`.

`WorldBuilder` imports `MapArea`.

`MapArea` imports `worldDatabase`.

`worldDatabase.ts` imports Dexie.

And so forth.

This creates a network of cooperating modules rather than one gigantic program file.

---

# **⚙️ Chapter 2 — `main.ts`: Starting Civilization 8**

Now execution reaches:

**`src/main.ts`**

This file is even smaller than `index.html`: only eleven lines. main

But its job is extremely important.

It is the **entry point of our TypeScript application**.

---

# **🎨 2.1 Loading the CSS**

The first statement is:

`import './style.css'` main

This may initially look strange.

Normally we think of `import` as importing a class or function.

But here we are importing a stylesheet.

The purpose is not to create a TypeScript variable called `style`.

Instead, it tells our build system that `style.css` belongs to the application.

That stylesheet contains the visual rules for things such as:

the header,

the side panels,

the tool buttons,

the map area,

the minimap,

the zoom buttons,

colours,

spacing,

borders,

and sizing.

We will give `style.css` its own chapter later because it is a substantial file.

---

# **🏗️ 2.2 Importing `WorldBuilder`**

Next:

`import { WorldBuilder } from './editor/world-builder.ts'` main

This is a normal TypeScript module import.

We are saying:

**“I need the exported `WorldBuilder` class from this other file.”**

Notice the direction of responsibility.

`main.ts` does not import Ocean.

It does not import Dexie.

It does not import the minimap.

It does not import every tool button.

It imports one high-level class:

**`WorldBuilder`**

That class will take responsibility for assembling the rest.

This keeps our starting file extremely simple.

---

# **🔎 2.3 Finding `#app`**

Next we encounter:

`document.querySelector('#app')`

This connects us back to the HTML file.

Remember that `index.html` created:

`<div id="app"></div>`

Now TypeScript asks the browser's DOM:

**“Find the element whose ID is `app`.”**

The result is stored in:

`root` main

So we have crossed an important boundary:

**HTML created the element.**

**TypeScript found the element.**

Soon TypeScript will put the application inside it.

---

# **🌳 2.4 What Is the DOM?**

This is a useful place to introduce a term we will use constantly:

**DOM — Document Object Model**

When the browser reads HTML, it doesn't merely display the text of the HTML file.

It creates objects representing the document.

An HTML `<div>` becomes an object that TypeScript can work with.

A `<button>` becomes an object.

A `<header>` becomes an object.

And our SVG elements will also become objects.

That is why our TypeScript can do things such as:

`document.createElement(...)`

`element.append(...)`

`element.setAttribute(...)`

`element.classList.add(...)`

The browser page is programmable because its structure is represented as objects.

---

# **🛡️ 2.5 Checking That `#app` Really Exists**

Our query might theoretically fail.

Perhaps somebody accidentally removed:

`<div id="app"></div>`

from `index.html`.

Then `document.querySelector('#app')` would not return the HTMLElement our application expects.

So the code checks:

`if (!(root instanceof HTMLElement))`

and throws an error if the expected element cannot be found. main

This is useful both for runtime safety and for TypeScript.

Before the check, TypeScript cannot simply assume that `root` is definitely an `HTMLElement`.

After the check has eliminated the invalid possibility, TypeScript knows that execution can only continue with a valid HTML element.

This is an example of **type narrowing**.

We begin with uncertainty.

The `if` statement checks reality.

Afterward, the type is more specific.

---

# **💥 2.6 `throw new Error(...)`**

If the root element does not exist, the code executes:

`throw new Error(...)`

Throwing an error means:

**“The application cannot correctly continue from this state.”**

That is appropriate here.

There is no useful World Builder we can construct if its root HTML element does not exist.

Rather than letting the program fail later in a confusing way, we stop with a meaningful message:

**Could not find the \#app element.** main

---

# **🏗️ 2.7 The Line That Starts Everything**

Finally:

`new WorldBuilder(root)` main

This single line launches the actual editor.

`new` means we are creating an **instance** of the `WorldBuilder` class.

And we pass it:

`root`

which is our `<div id="app">`.

Conceptually we are saying:

**“Create a World Builder and place it in this part of the page.”**

That is all `main.ts` needs to know.

---

# **🧩 2.8 A Beautiful Separation of Responsibilities**

Look at how little `main.ts` knows.

It knows:

**where the application should live**

and:

**which high-level class starts the application.**

It does **not** know:

how many hexagons there are,

how IndexedDB works,

how Ocean is drawn,

how zoom levels work,

how the minimap converts mouse coordinates,

how tool buttons are selected,

or how a hexagonal grid is calculated.

That is good object-oriented design.

The entry point does not need to understand the entire program.

Its job is simply to start it.

---

# **🏛️ Chapter 3 — `world-builder.ts`: The Application Composer**

We now follow:

`new WorldBuilder(root)`

into:

**`src/editor/world-builder.ts`**

This file is where the major pieces of the editor first meet.

The imports tell us a lot about its role. It imports the tool catalog, editor layout, header, map area, minimap and tool panel. world-builder

That is a clue that `WorldBuilder` is an **orchestrating object**.

It doesn't specialize in one graphical detail.

It assembles larger pieces.

---

# **🧱 3.1 Constructing the Main Parts**

The constructor first creates:

`EditorLayout`

`MapArea`

and:

`Minimap` world-builder

The sequence is interesting.

The `MapArea` is created before the minimap.

Why?

Because the minimap needs information about the world.

The code constructs it using:

`mapArea.mapGrid.getWorldFrame()`

So the minimap receives the dimensions of the world created by `MapGrid`. world-builder

This means the minimap does not invent its own world dimensions.

It gets them from the map.

That prevents two separate parts of the program from maintaining competing ideas of how large the world is.

---

# **🧱 3.2 Building the Editor Layout**

Next, `WorldBuilder` calls:

`layout.mount(...)`

and gives it four major pieces:

**Header**

**Left tool panel**

**Map area**

**Right tool panel**

The minimap is supplied as the footer of the right tool panel. world-builder

Visually, this corresponds closely to what we see:

**Header**

then below it:

**Left tools | World map | Right tools**

with the minimap attached to the right-side area.

The visual structure of the application is therefore reflected directly in the object structure of the code.

---

# **🔄 3.3 `replaceChildren`**

After constructing the layout:

`root.replaceChildren(layout.element)` world-builder

Remember our empty stage:

`<div id="app"></div>`

Now we finally put something inside it.

`layout.element` is the complete editor element assembled from our TypeScript components.

`replaceChildren` means that whatever children `root` currently has are replaced with the supplied element.

Because our root begins empty, this effectively mounts the entire editor into the page.

Our journey has now been:

**HTML creates `#app`**

↓

**main.ts finds `#app`**

↓

**main.ts creates `WorldBuilder`**

↓

**WorldBuilder creates the editor components**

↓

**WorldBuilder puts the assembled editor into `#app`**

At this point, the application has become visible.

---

# **🧭 3.4 Connecting the Minimap to the Map**

Next:

`minimap.connect(mapArea.mapGrid)` world-builder

This is an important architectural step.

Creating two objects does not automatically make them communicate.

We have:

**MapGrid**

and:

**Minimap**

The minimap needs to be able to tell the map:

**“Zoom to level 4.”**

or:

**“Center the map here.”**

The map also needs to tell the minimap:

**“My visible viewport has changed.”**

The `connect()` call establishes this relationship.

Later, in the Minimap chapter, we will see exactly how this works.

---

# **🗄️ 3.5 The Moment IndexedDB Enters the Running Application**

Finally, `WorldBuilder` executes:

`void mapArea.initialize()` world-builder

This line deserves special attention because it leads us toward the database.

The `MapArea` constructor creates the visible map container and the `MapGrid`.

But database initialization is asynchronous.

So the database-dependent work is separated into:

`initialize()`

That method will eventually execute:

`await worldDatabase.initializeWorld(...)`

and then:

`await worldDatabase.hexes.toArray()` map-area

### **🗄️ Here IndexedDB becomes part of application startup.**

The map geometry can be constructed synchronously.

But persistent world data must be initialized/read asynchronously.

This is our first glimpse of an important pattern:

**construct the object first**

then:

**perform asynchronous initialization**

We will examine this much more closely when we reach `MapArea` and especially `world-database.ts`.

---

# **⏳ 3.6 Why `void mapArea.initialize()`?**

The method `initialize()` returns a `Promise` because it is asynchronous.

But the `WorldBuilder` constructor itself is not declared `async`.

Instead, it starts the initialization with:

`void mapArea.initialize()`

Here `void` communicates that we intentionally start the asynchronous operation without using its returned Promise in this location.

This does **not** mean the initialization is synchronous.

Quite the opposite.

The database work can continue asynchronously after it has been started.

This is one reason it is useful to separate construction from initialization.

---

# **🧠 3.7 The Startup Sequence So Far**

We can now trace the actual startup quite precisely.

🌐 Browser opens `index.html`

↓

🕳️ HTML creates `#app`

↓

⚙️ Browser loads `main.ts`

↓

🎨 `main.ts` imports the stylesheet

↓

🔎 `main.ts` finds `#app`

↓

🏗️ `main.ts` creates `WorldBuilder`

↓

🧱 `WorldBuilder` creates `EditorLayout`

↓

🗺️ `WorldBuilder` creates `MapArea`

↓

⬡ `MapArea` creates `MapGrid`

↓

🧭 `WorldBuilder` creates `Minimap`

↓

🛠️ Left and right tool panels are created

↓

🏗️ Everything is mounted into the editor layout

↓

🌳 The editor is inserted into `#app`

↓

🧭 Minimap and map are connected

↓

🗄️ Asynchronous world/database initialization begins

That last arrow is where our persistent world starts becoming involved.

---

# **🌟 3.8 What These Three Files Teach Us**

Although `index.html`, `main.ts`, and `world-builder.ts` contain very little code compared with some of our other files, together they teach an important architectural lesson.

There are levels of responsibility.

**`index.html`** says:

*Here is the web page and the place where the application belongs.*

**`main.ts`** says:

*Find that place and start the application.*

**`WorldBuilder`** says:

*These are the major components from which the application is assembled.*

None of them needs to know how an Ocean wave is drawn.

None of them needs to know how a Dexie migration modifies 1,174 records.

That detail belongs deeper in the application.

And that is exactly where we are heading.

---

