- Make h1-h6 into components




@apply {
  @typeset {
    size: 3;
    relative: false;
  }

  @font-size {}
  @line-height {}

  @margin {
    display: inline-block;
    x: true;
    typeset: 2;
  }

  @padding {
    display: inline-block;
    x: margin-x;
  }
}

Add ability to create and extend components from right in a theme.

```css
@theme {
  components {
    button {
      ...
    }

    fancy-button extends button {
      ...
    }
  }
}
```

@config

```css
@config {
  make {
    default: "main.css";
    dark: "main.dark.css";
    light: "main.light.css";
  }

  minify: true;
  sourcemaps: true;

  /* cssnano */
  /* autoprefixr */
  /* perfectionist */

}
```

Chassis should have an option to generate a report/dev guide.
It will be an html file which contains information like available
media queries, typography constraints, layout constraints,
custom properties, etc.

Later it could include info about the components as well.

Chassis should also provide the option to save a theme as a json file.


```css
@media viewport()


@media (width < 768, height > 320) {}

21:9
16:10 l/p
16:9  l/p
5:4
4:3

@media landscape width < 1920 {

}

ranges:
phone
tablet/laptop
laptop

width  (x)
height (y)
landscape
portrait
3:2
4:3
5:3
5:4
8:5
16:9
16:10
17:9
21:9



HD	≈16:9	1366	768	11.39	24.55
FHD	16:9	1920	1080	64.50	19.70
WXGA+	16:10	1440	900	3.15	7.15
other	16:9	1536	864	n/a	6.08
HD+	16:9	1600	900	3.19	5.03
XGA	4:3	1024	768	0.50	3.76
WXGA	16:9	1280	720	0.37	3.71
WXGA	16:10	1280	800	0.62	3.69
SXGA	5:4	1280	1024	1.78	3.52
WSXGA+	16:10	1680	1050	2.32	2.56
QHD	16:9	2560	1440	4.71	1.82
HD	≈16:9	1360	768	1.70	1.69
nHD	16:9	640	360	n/a	1.23
WUXGA	16:10	1920	1200	0.85	1.16
SVGA	4:3	800	600	n/a	0.64
QWXGA	16:9	2048	1152	n/a	0.42
other	≈21:9	2560	1080	1.02	n/a
WQHD	≈21:9	3440	1440	0.59	n/a
4K UHD	16:9	3840	2160	1.61	n/a
Other				1.69	13.31
```



## components

```css
button {
  @initial {
    ... Get rid of the "state" at-rule
  }
}
```

## @media

```CSS
@media large +-200 {
  ... Chassis will intercept this and produce the proper media query ...
}
```

## @apply mixin

Add ability to specify which font-size by which padding and margin should be calculated

```css
button {
  @apply inline-block margin(small) padding(large);
}
```

## @reset mixin

```css
button {
  @reset inline-block;
}
```

Add an option to output a CSS3 or CSS4 compatible stylesheet without any chassis functionality

## Concentrate mixins into the @apply rule

```
@apply font-size small;
@apply block padding;
@apply z-index front;
@apply ellipsis;
```

```
@constrain width;
@constrain height;

@constrain font-size min() max();
or
@constrain font-size from 10px to 20px;

@constrain line-height min() max();
or
@constrain line-height from 1.2 to 1.6;
```

## Additional Custom Properties

```css
--inline-block-padding: var(--inline-block-padding-y) var(--inline-block-padding-x);
--inline-block-margin: var(--inline-block-margin-y) var(--inline-block-margin-x);
```

## Syntax for theme import

```css
@make '../themes/{light|dark|neutral}.css';
@make '../themes/light.css';
@make '../themes/dark.css';
@make '../themes/*';
```

Check into
node-glob and globby

## Syntax for custom components

```css
@component corey-button {
  @selector .corey-button;

  @initial {
    @reset inline-block;
    background: orange;
  }

  @hover {
    background: lightorange;
  }
}

@component graham-button extends corey-button {
  @selector .graham-button;

  @active {
    background: darkorange;
  }
}
```

## Module system

main.css
```css
main {
  @import bits from '/components.css';
}
```

components.css
```css
@export bits {
  & .button {
    background: green
  }

  & .tag {
    background: blue
  }
}
```

The above would output the following:

```css
main .button {
  background: green;
}

main .tag {
  background: blue;
}
```

You can also export components and mixins:

```css
@export component fancy-button {
  @selector button.fancy;

  @initial {
    $(selector) {
      background: blue;
      color: white;
    }
  }

  @hover {
    $(selector):hover {
      background: lightblue;
    }
  }
}
```

Then import it

## `config` mixin

Do all configuration in the CSS instead of in the build

```css
@config {
  layout {
    width {
      min: 320px;
      max: 1200px;
    }
  }

  typography {
    font-size {
      min: 14px;
      max: 22px;
    }
  }
}
```

## `mixin` mixin

```css
@mixin mixin-name (args) {
  --css--
}

.something {
  @apply mixin-name(...);
}
```

/* ## `function` mixin

```css
@function functionName (args) {
  --JavaScript--
}
``` */

^ Alternatively, both of these could just be done through the config file


calc(#{$min_font}px + (#{$max_font} - #{$min_font}) * ( (100vw - #{$min_width}px) / ( #{$max_width} - #{$min_width})));

// calculate the difference between our max and min font size
$fontSizeDifference: $max_font - $min_font;

// now we can use $fontSizeDifference * (some factor between 0 and 1)
// to move between the minimum and the maximum font size
// e.g.
//     $min_font + $fontSizeDifference * 0.0 = $min_font
//     $min_font + $fontSizeDifference * 1.0 = $max_font
//     $min_font + $fontSizeDifference * 0.5 = perfectly half way

// calculate the difference between our max and min screen size
$screenSizeDifference: $max_width - $min_width;

// we can now use $screenSizeDifference in the same way described above
// of course, we can also reverse the equation, and solve for the factor
// e.g.
//
//     // we want to isolate factor
//     $min_size + $screenSizeDifference * factor = $screenSize
//
//     // move min_size to other side of the equation
//     $screenSizeDifference * factor = $screenSize - $min_size
//
//     // move screenSizeDifference to other side of the equation
//     factor = ($screenSize - $min_size) / $screenSizeDifference

// finally, to put it all together, we can calculate the factor based on
// the screen size, then use it to interpolate between the minimum font size
// and maximum font size
// e.g.
//     screenSize = 100vw // screen size is always 100 view units
//     factor = (screenSize - min_size) / screenSizeDifference
//     fontSize = min_font + fontSizeDifference * factor

// obviously, we need all of that to be inside a calc() statement

// here we go...
font-size: calc(
    // start with the minimum font size
    #{$min_font} +

    // and interpolate using the font size difference by...
    #{$fontSizeDifference} *

    // ...calculating the factor based on the current screen size
    (100vw - #{$min_width}) / #{$screenSizeDifference}
);

// I removed unnecessary parenthesis and made the assumption that the variables would hold the units
