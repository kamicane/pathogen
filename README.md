# Pathogen

Pathogen is a path utility library for node.js and browsers.
It works similarly to (and borrows some code from) node's own [path](https://nodejs.org/api/path.html).

## Why

The reason why this package exists is that node [path](https://nodejs.org/api/path.html) works differently between systems. This is problematic when using paths as identifiers or object keys in your programs. You could use `path.win32` / `path.posix` but that is usually not available in browserified versions of `path`.

Pathogen also solves a few gripes I always had with node.js path.

But most of all, this is a pointless exercise in futility.

## How

Pathogen always normalizes the input paths to be in unix style, and can optionally convert back to windows style, or automatically based on system.

You can always pass a mix of windows and unix paths to any method, they will all be converted to unix paths internally.

## Example

```js
const fs = require('fs')
const pathogen = require('pathogen')

const basePath = '/some/folder/'
const relPath = './src/files/file.txt'

const joined = pathogen(basePath, relPath)

fs.readFile(joined, () => {})
```

## API

### Base (Unix)

```js
pathogen(path, ...path) // cleans up and joins the paths as an unix path string.

pathogen.cwd(path) // current working directory, unix
pathogen.basename(path) // basename
pathogen.extname(path) // extension
pathogen.dirname(path) // dirname, unix
pathogen.resolve(path, path, [...path]) // resolved path, unix
pathogen.relative(path, path) // path relative to path, unix
```

### Windows

```js
const pathogen = require('pathogen')

pathogen.win(path, ...path) // cleans up and joins the paths as a windows path string.

pathogen.win.cwd(path) // current working directory, windows
pathogen.win.basename(path) // basename
pathogen.win.extname(path) // extension
pathogen.win.dirname(path) // dirname, windows
pathogen.win.resolve(path, path, [...path]) // resolved path, windows
pathogen.win.relative(path, path) // path relative to path, windows
```

### System

```js
const pathogen = require('pathogen')

pathogen.sys(path, ...path) // cleans up and joins the paths as a system path string.

pathogen.sys.cwd(path) // current working directory, system
pathogen.sys.basename(path) // basename
pathogen.sys.extname(path) // extension
pathogen.sys.dirname(path) // dirname, system
pathogen.sys.resolve(path, path, [...path]) // resolved path, system
pathogen.sys.relative(path, path) // path relative to path, system
```

## Differences from path

Path fails to join with empty string:

```js
path.join('', '/a') // /a
pathogen('', '/a') // ./a
```

Path returns `./` when `./` is passed, forgetting to remove trailing slashes:

```js
path.normalize('./') // ./
pathogen('./') // .
```

Path can't normalize specifically to posix:

```js
path.posix.normalize('/./..//\\\\\\') // /\\\\\\
pathogen('/./..//\\\\\\') // /
```
