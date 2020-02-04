## Syntax for theme import

```css
@chassis make '../themes/{light|dark|neutral}';
@chassis make '../themes/light';
@chassis make '../themes/dark';
@chassis make '../themes/*';
```

Check into
node-glob and globby

## Syntax for custom components

```css
@chassis component corey-button {
  @selector .corey-button;

  @state initial {
    background: orange;
  }

  @state hover {
    background: lightorange;
  }
}

@chassis component graham-button extends corey-button {
  @selector .graham-button;

  @state active {
    background: darkorange;
  }
}
```

## `config` mixin

```css
@chassis config {
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
@chassis mixin mixin-name {
  ...
}
```
