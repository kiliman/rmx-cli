# rmx-cli

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-4-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

A CLI tool for Remix applications. Future versions will support adding external
commands.

## 🛠 Installation

```bash
npm install -D rmx-cli
```

# Commands

## 🎁 svg-sprite ✨ NEW

Generate SVG sprites recursively from `ROOT_FOLDER`. It generates the sprite file,
as well as a React component that you can use to specify the sprite ID. A `sprite.d.ts`
file is also created to ensure that only valid IDs are used. It also exports the `href`
of the sprite file to use in the Remix `links` export.

```bash
npx rmx-cli svg-sprite <ROOT_FOLDER> <OUTPUT_FOLDER>
```

### Usage

```bash
npx rmx-cli svg-sprite assets/svg app/components/icons
```

```ts
// import icon component and href
import HeroIcons24Outline, {
  href as outline24Icons,
} from "~/components/icons/heroicons/24/outline";

// generate <link rel="preload"> for the sprite file
export const links: LinksFunction = () => [
  { rel: "preload", href: outline24Icons, as: "image" },
  { rel: "stylesheet", href: tailwindCss },
];

// only valid ids are allowed and className is available
<HeroIcons24Outline id="academic-cap" className="h-6 w-6" />
<HeroIcons24Outline id="home" className="h-6 w-6" />
<HeroIcons24Outline id="chat-bubble-left" className="h-6 w-6" />
```

## 🪂 eject-ras

Eject your Remix project from Remix App Server to Express

```bash
npx rmx-cli eject-ras
```

## 📦 get-esm-packages

Scan for ESM package to add to _remix.config.js_ `serverDependenciesToBundle`

```bash
npx rmx-cli get-esm-packages [package-name ...]
```

### Usage

```bash
  Example:
    npx rmx-cli get-esm-packages @remix-run/node @remix-run/react
```

## 🏷️ version

List all Remix package versions installed in node_modules

```bash
npx rmx-cli version
```

## 🚀 gen-remix

THis script will generate a _remix.ts_ file which re-exports all exports
from specified packages. This essentially works like the _magic_ `remix`
package from early Remix.

Why is this useful?

1. Go back to importing from one file instead of adapter specific packages. If you ever switch adapters, just re-generate the _remix.ts_ file.
2. Adds support for overrides. Now you can override a standard Remix export with your own function. Like replacing `json`, `useLoaderData`, etc. with the `remix-typedjson` functions.
3. Add `"postinstall": "rmx gen-remix"` to _package.json_ to ensure the file is regenerated when upgrading Remix packages.

### Usage

```bash
Usage:
    $ npx rmx gen-remix [options]

  Options:
    --config PATH       Config path (default: ./gen-remix.config.json)
    --packages PACKAGES List of packages to export
    --output PATH       Output path (default: ./app/remix.ts)

  Example:
    rmx gen-remix --packages @remix-run/node @remix-run/react
```

### Config

You can also include an optional config (defaults to _gen-remix.config.json_) where you can specify overrides.

```json
{
  "exports": ["packageA", "packageB"],
  "overrides": {
    "<source-package>": [
      "<original-package>": {
        "<original-export>": "<new-source-export>",
        ...
      },
      "<original-package>": {
        "<original-export>": "<new-source-export>",
        ...
      }
    ],
    ...
  }
}
```

### Example config:

This config replaces the Remix `json`, `redirect`, `useActionData`, etc. with the versions for [`remix-typedjson`](https://github.com/kiliman/remix-typedjson).

```json
{
  "exports": ["@remix-run/node", "@remix-run/react", "remix-typedjson"],
  "overrides": {
    "remix-typedjson": {
      "@remix-run/node": {
        "json": "typedjson",
        "redirect": "redirect"
      },
      "@remix-run/react": {
        "useActionData": "useTypedActionData",
        "useFetcher": "useTypedFetcher",
        "useLoaderData": "useTypedLoaderData"
      }
    }
  }
}
```

## 😍 Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://kiliman.dev/"><img src="https://avatars.githubusercontent.com/u/47168?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Kiliman</b></sub></a><br /><a href="https://github.com/Kiliman/rmx-cli/commits?author=kiliman" title="Code">💻</a> <a href="https://github.com/Kiliman/rmx-cli/commits?author=kiliman" title="Documentation">📖</a></td>
    <td align="center"><a href="https://codsen.com/os/"><img src="https://avatars.githubusercontent.com/u/8344688?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Roy Revelt</b></sub></a><br /><a href="https://github.com/Kiliman/rmx-cli/commits?author=revelt" title="Documentation">📖</a></td>
    <td align="center"><a href="https://kentcdodds.com/"><img src="https://avatars.githubusercontent.com/u/1500684?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Kent C. Dodds</b></sub></a><br /><a href="https://github.com/Kiliman/rmx-cli/commits?author=kentcdodds" title="Documentation">📖</a></td>
    <td align="center"><a href="http://bgwebagency.in/"><img src="https://avatars.githubusercontent.com/u/13310363?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Kiran Dash</b></sub></a><br /><a href="https://github.com/Kiliman/rmx-cli/commits?author=kirandash" title="Documentation">📖</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
