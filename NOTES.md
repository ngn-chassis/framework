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

  @state initial {
    @reset inline-block;
    background: orange;
  }

  @state hover {
    background: lightorange;
  }
}

@component graham-button extends corey-button {
  @selector .graham-button;

  @state active {
    background: darkorange;
  }
}
```

## Module system

main.css
```css
main {
  @import '/components.css';
}
```

components.css
```css
@export {
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

  @state initial {
    $(selector) {
      background: blue;
      color: white;
    }
  }

  @state hover {
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
  constraints {
    width {
      min: 320px;
      max: 1200px;
    }

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

## `function` mixin

```css
@function functionName (args) {
  --JavaScript--
}
```

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
