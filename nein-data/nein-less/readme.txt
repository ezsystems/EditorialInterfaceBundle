Hi. If we want to keep our styling code reusable and easy-to-maintain, please consider following this rules / tips.

# I. Namespaces

All selectors for the styles of the editorial interface should begin with html.ezp-user-logged-in .ezp-nein



# II. Folders & Files Structure

All styles of editorial interface will be compiled from .less files into just 2 .css files: nein-reset and nein-composition, which are included into the html page' head.

The nein-less folder holds following files:
- nein-reset.less
- nein-composition.less
- nein-variables.less

and folders:
- general
- large
- medium
- small

The styles placed in general folder are of the universal kind and for all cases, the others are targeting specific media types. Each folder has one layout file and can have multiple widget files gathered in the subfolder.

## II.1 Reset

As there is no reliable way to provide a completely separated styling for the HTML tags used in the CMS interface next to the customer's website, we will have to keep our tags unaffected from styles, provided by the user's site. In order to do so, we use reset file, loaded before other styles.

## II.2 Variables

All variables, mix-ins and utility classes and fixes (like clearfix, e.t.c.) are stored here. Please, consider using variables for colors - it'll be much easier to change skins and stay consistent if the list of colors with unique names exists. Color variables can be used in modifying functions (for example to make color lighter or half-transparent, e.t.c.). See http://lesscss.org/#-color-functions for reference.

## II.3 Composition

Composition is used to gather all styles used in one file: it provides benefits by reducing the loading time; the file will be cached ones and reused later in all views. Also, Composition provides differentiation between different media types and breakpoints (for responsive layouts).

First of all the variables are included. Then, there is a section for layout files and for widgets styles. Each section consists of General, Large, Medium and Small sub-sections. In General will be included the styles for all situations, in other three - specific versions adapted for the corresponding mode.

If the amount selectors in composition file exceeds 4.000 - in this case, in order to overcome limitations of IE, the composition file could be considered to be divided into multiple parts.

## II.4 Layout files

Layout files are responsible for positioning of the widgets on the page, but don't describe how a widget looks like.

## II.5 Widget files

Widget files describe how a widget looks like, but don't position it.



# III Code Style and Conventions

## III.1 Layouts & Widgets

Generally, a typical interface element should have a wrapping container, to specify it's position on the screen. Styles that describe this wrapper belong to the layout files. A wrapper has usually no styling beside width, height, position relative to the other elements, floating, and visibility. In some cases a wrapper could have some decorative styles like borders or backgrounds. It is possible though, that an element, due to its unique role or specific properties has no separate wrapper and positions itself. A good example of it could be a working bench - which is a widget, but it has a very clear and straightforward role and needs no extra helpers to position itself on the screen. In the case a widget should be hidden in a special media type (for example, on mobile), consider hiding the wrapper of the widget in the layout file of unused mode.

## III.2 Selectors

There are several aspects, that must be taken into account by nesting and building selectors:

### III.2.1 Namespaces consideration

As we try to escape influence from customer's website, we should not only use specific class names, but also build complex selectors with parental references. For example: declaring "html.ezp-user-logged-in > body" in the beginning of every style is a must, while declaring lower-level parents considered to be nice to stay consistent with HTML structure and easiness of understanding the nesting, but is not obligatory.

### III.2.3 Performance issues

CSS preprocessors, by they nature, lead to the creation of lengthy CSS selectors, which are compiled from nested rules. Those selectors have some impact on the speed of the page rendering in browser. This is not a critical issue (because impact is rather light and advantages of preprocessed rules lead to the better user experience, then dropping of them in favor of slight speed improvement). Anyways, it's better to use direct child selector (li > a) instead of simple descendant structures (li a) where it's possible. It is also preferable to use class name selectors instead of tag names.

## III.3 Resources

## III.4 Usability