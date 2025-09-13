# Name Styler – Web Tools

This repo contains embeddable tools for `namestyler.site`.

## Wheel of Choice (widget)

A lightweight, dependency-free spinning wheel you can embed anywhere.

- Open `wheel-of-choice/index.html` to try it locally.
- Include `wheel-of-choice/wheel-of-choice.css` and `wheel-of-choice/wheel-of-choice.js` on your page.
- Initialize with:

```html
<link rel="stylesheet" href="/path/to/wheel-of-choice.css" />
<div id="wheel"></div>
<script src="/path/to/wheel-of-choice.js"></script>
<script>
  const wheel = new WheelOfChoice(document.getElementById('wheel'), {
    items: ['Alice', 'Bob', 'Charlie'],
    removeChosenItem: false,
    spinDurationMs: 4500,
    size: 420
  });
  // wheel.spin();
  wheel.on('spinend', ({ winner }) => console.log('Winner:', winner));
  // To update items: wheel.setItems(['X','Y']);
  // To start: wheel.spin();
  // To read history: wheel.getHistory();
  // To check if spinning: wheel.isSpinning();
  // To subscribe: wheel.on('spinstart' | 'spinend', handler)
  // To unsubscribe: off(event, handler)
  // To read items: wheel.getItems();
  // removeChosenItem can be toggled: wheel.removeChosenItem = true/false
  // Colors can be customized via `colors: ['#hex', ...]` in constructor
  // Size can be 180–800 pixels
  // Duration can be 1200–12000 ms
</script>
```

## Spinner (site page)

An out-of-the-box spinner page suitable for hosting at `namestyler.site/spinner/`.

- Open `spinner/index.html` to try it locally.
- It reuses the wheel widget and adds options + URL params.

URL parameters supported by `spinner/index.html`:

- `items`: Comma-separated list of items (e.g. `?items=Alice,Bob,Charlie`)
- `autospin`: `1` or `true` to auto spin on load
- `remove`: `1` or `true` to remove the chosen item after each spin
- `size`: Canvas size in px (200–800)
- `duration`: Spin duration in ms (1200–12000)

Examples:

```text
/spinner/?items=Alice,Bob,Charlie&autospin=1&remove=1
/spinner/?items=Task1,Task2,Task3&size=520&duration=6000
```

### Embed

Copy `wheel-of-choice/wheel-of-choice.js` and the `spinner/` folder to your site. Ensure the script path in `spinner/index.html` points to the correct location of `wheel-of-choice/wheel-of-choice.js`.

### Deploy

- Upload the `spinner/` directory to your web host at the `/spinner/` path.
- Optionally, compress into `spinner.zip` for transfer and then extract on the server.
