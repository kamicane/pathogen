# Pathogen

Pathogen is a path utility library for node.js and browsers.
It works similarly to (and copies some of the code from) node's own [path](https://nodejs.org/api/path.html).

I created this package specifically for [QuickStart](https://github.com/spotify/quickstart), but it proved very useful in other programs as well, so I decided to publish it separately.

# How

1. Create a pathogen object, using a path string in windows or unix format.
2. Work with the pathogen object using methods (or string concatenation).
3. Choose to print the pathogen object as a path in either windows or unix formats (or automatic, based on system).

# Why

The reason why this package exists is that node [path](https://nodejs.org/api/path.html) works differently between systems. This is problematic when using paths as identifiers in your programs.

In pathogen, you provide an input path (be it windows or unix) and you work with the parts of the path (including drive, if present).
When using the path for io, you can call the `toSystem()` method to convert it into a system path. When using the path as an object key, for instance, you can call the `toUnix()` method, if you want your objects to have unix paths as keys in every system.

Now enjoy not worrying about what system you're on when working with paths.

## Example

```
var fs = require("fs");
var Pathogen = require("pathogen").Pathogen;

var basePath = "/some/folder/";
var relPath = "./src/files/file.txt";

var joined = new Pathogen(basePath + relPath);

fs.readFile(joined.toSystem(), function() {});
```

## API

Class:
```
Pathogen:cwd() // current working directory
Pathogen:basepath() // basepath, string
Pathogen:extname() // extension name, string
Pathogen:dirname() // dirname, new Pathogen object
Pathogen:resolve(path, path, [...path]) // resolved path, new Pathogen object
Pathogen:relative(path) // path relative to path, new Pathogen object

Pathogen:toUnix() // unix path string
Pathogen:toWindows() // windows path string
Pathogen:toSystem() // system path string
Pathogen:toString() // toUnix alias
```

The shortcut is similar to how you use path in node.js, except everything is an unix path unless otherwise specified:
```
pathogen.cwd(path) // current working directory, unix path string
pathogen.basepath(path) // basepath, string
pathogen.extname(path) // extension name, string
pathogen.dirname(path) // dirname, unix path string
pathogen.resolve(path, path, [...path]) // resolved path, unix path string
pathogen.relative(path, path) // path relative to path, unix path string

pathogen(path) // cleans up the path as an unix path string.
pathogen.nix(path) // alias for above
pathogen.win(path) // windows path string
pathogen.sys(path) // system path string
```

## Differences from path

path does not care about trailing slashes:
```
> path.dirname('/a/s/d')
'/a/s'
> path.dirname('/a/s/d/')
'/a/s'
```

pathogen does:
```
> pathogen.dirname("/a/s/d")
'/a/s/'
> pathogen.dirname("/a/s/d/")
'/a/s/d/'
```

This little change makes working with paths ten times easier.

## Basic API Usage

```js
var Pathogen = require('pathogen').Pathogen;

// class
var path = new Pathogen('some/file.txt');
path.dirname().toUnix(); // './some/'
path.resolve().toUnix(); // '/process/cwd/some/file.txt'
path.resolve('/other/folder').toUnix(); // '/other/folder/some/file.txt'
path.toWindows(); // '.\\some\\file.txt'
path.relative('some/otherfile.txt').toUnix(); // './otherfile.txt'
path.basename(); // 'file.txt'
```

Note: `toString` is an alias to `toUnix`.

For convenience, the default exported function is the pathogen shortcut.

```js
var pathogen = require('pathogen');

// shortcuts
pathogen.dirname('some/file.txt'); // './some/'
pathogen.extname('some/file.txt'); // '.txt'
pathogen.nix('\\windows\\system32\\'); // '/windows/system32/'
pathogen.win('c:\\windows\\system32\\'); // 'c:\\windows\\system32\\'
pathogen.sys('./some/path/'); // unix: './some/path/' windows: '.\\some\\path\\'
pathogen.cwd() // unix: '/process/cwd/some/path/' windows: 'c:\\process\\cwd\\some\\path\\'
```
