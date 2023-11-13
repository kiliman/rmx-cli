# CHANGELOG

## 🚀 v0.4.15

- ✨ Add components-template option (#22)
-

## 🚀 v0.4.14

- 🐛 Fix svg-sprite component generation (#18)
- 🐛 Fix svg-sprite's sprite option (#20)

## 🚀 v0.4.13

- 🔨 Allow outputFolder to be an absolute path (#15)

## 🚀 v0.4.12

- 🔨 Update CLI to specify sprite and types filenames

## 🚀 v0.4.11

- 🔨 Do not generate files or log to console if files are same as existing

## 🚀 v0.4.10

- 🔨 Export string array of icon names and generate type union from it (#13)

## 🚀 v0.4.9

- 🐛 Fix broken publish

## 🚀 v0.4.8

- 🔨 Export IconName in default svg template #12

## 🚀 v0.4.7

- 🐛 Fix hardcoded sprite import (#11)

## 🚀 v0.4.6

- 🔨 Add --template argument for custom generation
- 🔨 Strip width and height from SVG

## 🚀 v0.4.5

- 🔨 Update component generation with --components flag for named exports

## 🚀 v0.4.4

- 🔨 Update React sprite component import

## 🚀 v0.4.3

- 🔨 Export components for each icon instead of using sprite id

## 🚀 v0.4.2

- 🔨 Update handling of solid vs outline icons to be automatic

## 🚀 v0.4.1

- 🔨 Add support for using `currentColor` for `stroke` and `fill` icons

## 🚀 v0.4.1

- 🔨 Add support for using `currentColor` for `stroke` and `fill` icons

## 🚀 v0.4.0

- ✨ Add new `svg-sprite` command

## 🚀 v0.3.6

- ✨ Add new `version` command
- 🐛 Check if command exists before attempting to load

## 🚀 v0.3.5

- 🔨 Check for `module` property as well as `type === module` for ESM packages

## 🚀 v0.3.4

- 🔨 Add @ts-ignore and eslint-disable to generated file to ignore "errors"

## 🚀 v0.3.3

- 🔨 Remove timestamp on generated file `gen-remix` due to spurious diffs

## 🚀 v0.3.2

- 🐛 Fix override exports [#5](https://github.com/kiliman/rmx-cli/issues/5)
- 🐛 Ensure exports for overrides use the correct export type [#6](https://github.com/kiliman/rmx-cli/issues/6)

## 🚀 v0.3.1

- 🐛 Fix argument parsing

## 🚀 v0.3.0

- ✨ Add `gen-remix` command

## 🚀 v0.2.3

- 🔨 Update `rmx-cli` usage

## 🚀 v0.2.2

- 🐛 Update `get-esm-packages` to check for _package.json_ before loading

## 🚀 v0.2.1

- 🐛 Fix commandPath for Windows [#2](https://github.com/kiliman/rmx-cli/issues/2)

## 🚀 v0.2.0

- ✨ Command `get-esm-packages` to scan for ESM package to add to
  _remix.config.js_ `serverDependenciesToBundle`

## 🚀 v0.1.4

- 🐛 Fix files path for dist folder
- 🔨 Use realpath to resolve symlink
- 🐛 Fix backup copy and use timestamp

## 🚀 v0.1.1

- 🐛 Fix shebang

## 🚀 v0.1.0

- 🎉 Intial version
- ✨ Command to eject a Remix app from Remix App Server to Express
