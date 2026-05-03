# @wheelfor/wheel-picker

A lightweight, canvas-based spinning wheel picker with smooth animations, 8 built-in color themes, and a simple event-driven API. Zero runtime dependencies — everything is bundled.

**[Live demo → wheelfor.com](https://wheelfor.com)**

## Installation

```bash
npm install @wheelfor/wheel-picker
```

## Usage

```html
<canvas id="wheel" width="500" height="500"></canvas>
```

```js
import { WheelPicker } from '@wheelfor/wheel-picker';

const canvas = document.getElementById('wheel');

const wheel = new WheelPicker(canvas, {
  choices: ['Pizza', 'Sushi', 'Tacos', 'Burgers', 'Salad'],
  theme: 'Fresh Air',
});

wheel.addEventListener('spinend', (e) => {
  console.log('Winner:', e.detail.result);
});
```

Click the pointer on the wheel to spin, or call `wheel.spin()` programmatically.

## API

### `new WheelPicker(canvas, options)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `choices` | `string[]` | required | List of items to display on the wheel |
| `theme` | `string` | required | Color theme name (see [Themes](#themes)) |
| `interactive` | `boolean` | `true` | Enable click-to-spin on the pointer |
| `showResult` | `boolean` | `true` | Show result label after spin |
| `spinDuration` | `number` | `4000` | Spin animation duration in ms |
| `spinJitter` | `number` | `0.02` | Random angle variation added to each spin |
| `minFontSize` | `number` | `10` | Minimum font size for segment labels |
| `maxFontSize` | `number` | `100` | Maximum font size for segment labels |
| `wheelColor` | `string` | `'#f5f5f5'` | Center hub color |
| `textColor` | `string` | `'#000000'` | Segment label color |
| `fontFamily` | `string` | `'Arial Black, Arial, sans-serif'` | Font for segment labels |

### Methods

| Method | Description |
|--------|-------------|
| `spin(targetIndex?)` | Spin the wheel. Pass an index to land on a specific segment. |
| `updateChoices(choices)` | Replace the current choices and redraw. |
| `destroy()` | Remove event listeners and clean up. |

### Events

```js
wheel.addEventListener('spinend', (e) => {
  const { result, index, angle } = e.detail;
  // result: winning label string
  // index: winning segment index
  // angle: final wheel rotation in radians
});
```

## Themes

8 built-in color palettes:

| Name | Description |
|------|-------------|
| `Fresh Air` | Soft muted tones |
| `Popcorn` | Warm and vibrant |
| `Playground` | Bold primary colors |
| `Sprinkles` | Pastel variety |
| `Chalkboard` | Deep saturated |
| `Buddy System` | Paired complementary colors |
| `Garden Party` | Light and airy pastels |
| `Marshmallow` | Soft pinks and blues |

You can import the theme palette directly:

```js
import { themes } from '@wheelfor/wheel-picker';

console.log(themes['Fresh Air']); // array of rgb() strings
```

## TypeScript

Full TypeScript support is included. Import option types directly:

```ts
import { WheelPicker, WheelPickerOptions, SpinEndEvent } from '@wheelfor/wheel-picker';

const options: Partial<WheelPickerOptions> = {
  choices: ['Option A', 'Option B'],
  theme: 'Playground',
  spinDuration: 3000,
};
```

## License

MIT
