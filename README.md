<p align="center">
  <img src="logo.svg" alt="Description" width="300">
</p>

# Comments How I Want Them

[**Visit the website.**](https://github.com/dougluce/chiwt)<br>
[**Get it for Chrome.**](https://chrome.google.com/webstore/detail/eventually)<br>
[**File an issue.**](https://github.com/dougluce/chiwt/issues)<br>

*Comments How I Want Them* is a Google Chrome, Firefox, Opera, and
Thunderbird extension that selects the "All comments" drop down on
Facebook posts automatically for you.

I'm tired of having to do that myself, hence this extension.

### Table of Contents
**[Installation Instructions](#installation-instructions)**<br>
**[Building the Extension Bundles](#building-the-extension-bundles)**<br>
**[Next Steps, Credits, Feedback, License](#next-steps)**<br>

## Installation Instructions

### Chrome

#### Manual/Development

1. Clone this repo.
2. run `pnpm install && pnpm build --browser chrome`
2. In Chrome, open the Extensions settings. (Wrench button, Tools, Extensions.)
3. On the Extensions settings page, click the "Developer Mode" checkbox.
4. Click the now-visible "Load unpacked extension…" button. Navigate
   to the directory where you cloned the repo, then the `dist/chrome`
   directory under that.
5. The *Comments How I Want Them* extension should now be visible in
   your extensions list.
6. Go to a Facebok page and check to make sure all comments is loaded
   (can take a second).

## Building the Extension Bundles

```
pnpm build --browser chrome,chromium,edge,firefox,chromium-based,gecko-based
```

## Credits

* The README format: cribbed from [adam-p](https://github.com/adam-p)'s
  [Markdown Here](https://github.com/adam-p/markdown-here) extension
* Code: (semi-)vibe-coded w/[Claude](https://claude.ai/).

Check [package.json](package.json) for other things this depends on.
