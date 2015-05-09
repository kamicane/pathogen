/*
Pathogen
*/'use strict';
// Part of the code is derived from node's own path.js
// Copyright Joyent, Inc. and other Node contributors

var map = Array.prototype.map;
var slice = Array.prototype.slice;

// regular expressions

var drvRe = /^(.+):/;
var winRe = /\\+/g;
var nixRe = /\/+/g;
var absRe = /^\//;
var extRe = /\.\w+$/;

var split = function(path) {
  var parts = (path || '.').split(nixRe);

  var p0 = parts[0];
  if (p0 === '') parts.shift();
  // return parts;
  var up = 0;

  for (var i = parts.length; i--;) {
    var curr = parts[i];

    if (curr === '.') {
      parts.splice(i, 1);
    } else if (curr === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  if (p0 !== '') {
    for (; up--; up) parts.unshift('..');
  } else {
    if (parts.length) parts.unshift('');
    else parts.push('', '');
  }

  p0 = parts[0];
  if (p0 !== '..' && p0 !== '.' && (p0 !== '' || parts.length === 1)) parts.unshift('.');

  return parts;
};

function Pathogen(path) {
  path = (path || '') + '';
  var drive;
  path = path.replace(drvRe, function(m) {
    drive = m;
    return '';
  });
  path = path.replace(winRe, '/');
  this.drive = drive || '';
  if (this.drive && !path) path = '/';
  this.parts = split(path);
}

Pathogen.prototype = {

  constructor: Pathogen,

  basename: function() {
    return this.parts.slice(-1)[0];
  },

  dirname: function() {
    if (!this.basename()) return new Pathogen(this);
    return new Pathogen(this.drive + this.parts.slice(0, -1).join('/') + '/');
  },

  extname: function() {
    var m = this.basename().match(extRe);
    return m ? m[0] : '';
  },

  resolve: function() {
    var absolute;

    var paths = [new Pathogen(this)].concat(map.call(arguments, function(path) {
      return new Pathogen(path);
    }));

    var parts = [];

    for (var i = paths.length; i--;) {
      var path = paths[i];
      if (path.parts[0] === '') { // absolute path
        absolute = path;
        break;
      } else {
        parts.unshift(path.parts.join('/'));
      }
    }

    if (!absolute) absolute = new Pathogen(process.cwd() + '/');
    return new Pathogen(absolute.drive + absolute.parts.concat(parts).join('/'));
  },

  relative: function(to) {
    var from = this.resolve().dirname();
    to = new Pathogen(to).resolve();

    if (from.drive !== to.drive) return to;

    var base = to.basename();
    to = to.dirname();

    var fromParts = from.parts.slice(0, -1);
    var toParts = to.parts.slice(0, -1);

    var i;

    var length = Math.min(fromParts.length, toParts.length);
    var samePartsLength = length;

    for (i = 0; i < length; i++) {
      if (fromParts[i] !== toParts[i]) {
        samePartsLength = i;
        break;
      }
    }

    var output = [];
    for (i = samePartsLength; i < fromParts.length; i++) output.push('..');

    output = output.concat(toParts.slice(samePartsLength));
    var joined = output.concat(base).join('/');
    return new Pathogen(!!joined.match(absRe) ? this.drive + joined : joined);
  },

  // to*

  toUnix: function() {
    return this.drive + this.parts.join('/');
  },

  toSystem: function() {
    return process.platform === 'win32' ? this.toWindows() : this.toUnix();
  },

  toWindows: function() {
    return this.drive + this.parts.join('\\');
  },

  toString: function() {
    return this.toUnix();
  }

};

// shortcuts

var pathogen = function(path) {
  return new Pathogen(path).toUnix();
};

pathogen.cwd = function() {
  return new Pathogen(process.cwd() + '/').toString();
};

// toString

pathogen.dirname = function(path) {
  return new Pathogen(path).dirname().toString();
};

pathogen.basename = function(path) {
  return new Pathogen(path).basename();
};

pathogen.extname = function(path) {
  return new Pathogen(path).extname();
};

pathogen.resolve = function(path) {
  return Pathogen.prototype.resolve.apply(path, slice.call(arguments, 1)).toString();
};

pathogen.relative = function(path, to) {
  return new Pathogen(path).relative(to).toString();
};

// conversion utils

pathogen.nix = pathogen;

pathogen.sys = function(path) {
  return new Pathogen(path).toSystem();
};

pathogen.win = function(path) {
  return new Pathogen(path).toWindows();
};

pathogen.Pathogen = Pathogen; // export the class as well

module.exports = pathogen;
