Use special units/properties for margin/padding/font-size problem

```
margin-left: 2chip; // Chassis Inline Padding units
padding: 1chbm; // Chassis Block Margin units
// chip, chbp, chim, chbm work on any property
// chrip, chrbp, chrim, chrbm may be useful also
// These may not even be necessary with the new lh and rlh units, functions may work:

padding: padding(inline, 2); // axis, multiplier, relative

OUTPUTS:

padding: calc(1rem * <calculated>rlh); // em & lh if relative === true

// Maybe ditch the box-models and use a standard padding amount. This could be better for vertical rhythm anyway.

typeset: -1; // This will apply both calculated font-size and line-height values.
```



Write generic nesting processor that checks for @set and @media rules, and any other rules that will need to be applied across viewports.

When found, add to a data structure that manages all settings.

If a matching rule is found, overwrite it.

If an @media rule contains an @set rule, only apply to that viewport.

If the @media rule has custom bounds (ie different from any of the specified breakpoints, calculate @set rules based on the custom bounds)

Try to combine rulesets where possible. Group rulesets inside media queries by each of the @set attributes, margin, padding and type.

For example:

```
.test {
  @set margin x;
}

.test2 {
  @set margin x bottom;
}

.test3 {
  @set margin x(2);
}
```

add these to a data structure like:

margin: {
  x: new Map([
    ['default', ['.test', '.test2']],
    [2, ['.test3']]
  ]),

  bottom: new Map([
    [default, ['.test2']]
  ])
}

- Need a set of functions to allow calculated values to be applied to properties other than margin, padding or typography. This may actually be a better approach overall than the `@set` rule.

Input:
```
.thing {
  display: grid;
  margin: getMargin(bottom);
  gap: getMargin(bottom, 2);
  font-size: getFontSize(-1);
}
```

Output:
```
@media (...) {
  .thing {
    margin: <calculated>rem;
    gap: <calculated>rem;
    font-size: <calculated>rem;
  }
}

@media (...) {
  .thing {
    margin: <calculated>rem;
    gap: <calculated>rem;
    font-size: <calculated>rem;
  }
}

.thing {
  display: grid;
  margin: <calculated>rem;
  font-size: 1em;
  gap: 2em;
}
```


- Media Queries

```scss
@media vp(tablet) {}

@media (width < vp(tablet, min)) {}

// From tablet max - 100 to desktop min + 100
@media (vp(tablet, max, 100) < width < vp(desktop, min, 0, 100)) {}

// Equivalent to:
@media (min-width: vap(tablet, max, 100)) and (max-width: vp(desktop, min, 0, 100)) {}
```