# Chassis TODO

## BUGS
- Tags need help at scale ratios other than default
- Errors are thrown if you set default vwrs to a wider range than your min/max layout width.

- Nesting in theme does not behave correctly when using comma-separated selectors:

```
& .element-1,
& .element-2 {...}
```

The above does not work, while the following does:

```
& .element-1,
.element-2 {...}
```

## Configuration
- Add ability to specify left and right gutter separately in build config

## Media Queries
- this format does not work correctly:
  ```
    @chassis vp-width to _____ from _____ {}
  ```
  there is no handling for "to" as the first operator.

## Error Handling
- Errors need to be thrown if the user attempts to style an
unsupported component state

## Themes
- Theme files still don't fully support nesting. Now, you can target nested children, but you can't target in different contexts.

- Elements in reset need to be themeable, ie ol and ul, blockquote, etc.

- Themes need to support @-rules

- Add the following objects:

```
  headings {
    h1 {}
    h2 {}
    h3 {}
    h4 {}
    h5 {}
    h6 {}
    legend {}
  }

  global {
    ...any style overrides that the user wants to apply globally. These should be injected at the top of the stylesheet.
  }
```

## Mixins
- Consider adding `padding-base(fontSizeAlias)` and `margin-base(fontSizeAlias)` to inline-block-layout mixin. For example, if the font-size of author-selected-option is set to root but author-option is set to small, the padding on either side of each option won't line up with the title

  Another possible solution is to simply take the horizontal padding off author-option and put it on author-select .options

### Additions
- Image replacement mixin
- Some flexbox mixins if they can be done elegantly
- Some helper mixins for responsive embeds

- Add `@chassis new component {}` feature for custom components
  Custom components would be extendable, like chassis built-in components

- Add `@custom-state` to components

## Components

- Spec Sheet nesting doesn't work beyond one level. Maybe add unnesting operation in spec sheets, or simply disallow nesting inside spec sheets.

- Consider ways of combining rulesets to shrink the size of the css

- Maybe allow extension of component states as well as full components:

  ```
  @chassis extend button @ initial {
  	...
  }
  ```

### author-control

- Add support for inputs without type attribute

## Auto-Typography System
- Tags do not look right at small type scale ratios. The math used to calculate the position of icons in the tags outputs a negative number at small ratios like 1.2. The math for padding seems to break down on inline elements at those small ratios as well. In addition, the vertical alignment starts behaving very strangely at those small sizes.

- Possible solution is to make sure the scale ratio value is utilized in all calculations- right now, some values are just using Math.sin or log or something without respect to the actual scale ratio value.

## IE11

- Links have permanent underlines
- Form controls need a height rule
- Textareas have the wrong font and display the wrong number of lines

MISC
- screenreader helpers
- Animated loaders
- Maybe add ui-gutter-x and ui-gutter-y values
