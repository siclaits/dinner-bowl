# Dinner Bowl Picker

A one-click picker for dinner bowls. One spin chooses a base, a protein, a produce, two toppings and a sauce from the foods you have on hand.

**Try it:** https://siclaits.github.io/dinner-bowl/

## How to use it

- **Spin:** click **Spin my bowl** to pick a full bowl. Click **Spin again** for a new one.
- **Re-roll one pick:** tap any single pick to swap just that item.
- **Update your kitchen:** under **Your kitchen**, type a food into a list and press Enter or click **Add**. Click the × on an item when you run out.
- **Undo:** the **Undo** button at the top reverses your most recent action (a spin, a re-roll, adding or removing an item, or a reset). Hover over it to see what it will undo. It remembers up to 50 steps until you reload the page.
- **Start over:** **Reset to sample list** brings back the original example foods.

Your lists are saved in your own browser, so they're still there when you come back. Each person's lists are separate, and changing yours doesn't affect anyone else's.

**On iPhone:** open the link in Safari, tap Share, then **Add to Home Screen** to get an app-style icon.

## Food icons

Each pick shows a small food icon chosen from words in its name, for example a fish for salmon or a leaf for kale. Anything with "mayo" or "aioli" in its name shows an egg. Foods it doesn't recognize show their group's general icon:

| Group | Icon |
| --- | --- |
| Base | Bowl of food |
| Protein | Fork and knife |
| Produce | Plant |
| Topping | Sparkle |
| Sauce | Drop |

The word list lives in `ICONS` in `docs/app.js`. Potato, onion and pasta are custom drawings in `DRAWN` in the same file.

## Changing the settings

These values are at the top of `docs/app.js`:

- `TOPPING_COUNT`: how many toppings each bowl gets (1 to 4, default 2)
- `SPIN_MS`: how long the spin lasts, in milliseconds (default 1400)
- `DEFAULTS`: the sample foods used the first time someone opens the page, or after a reset

## Files

Everything is a plain static site in `docs/`, with no build step:

- `index.html`: the page
- `app.js`: picking, saving, undo and icons
- `app.css`: page layout
- `broadsheet.css`: the Broadsheet design system styles (colors, type and buttons)
- `icons.js`: the food icons, built in so they work offline
- `favicon.svg`: the browser tab and home screen icon

To run it locally, open `docs/index.html` in a browser.

## Publishing

The site is published with GitHub Pages from the `docs` folder on the `main` branch (**Settings → Pages**). Changes pushed to `main` go live within a few minutes.

## Credits

- Icons from [Phosphor Icons](https://phosphoricons.com) (MIT license), duotone weight
- Type set in [Source Serif 4](https://fonts.google.com/specimen/Source+Serif+4), loaded from Google Fonts
