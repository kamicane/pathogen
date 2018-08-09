/*
Pathogen
*/'use strict'
// Part of the code is derived from node's own path.js
// Copyright Joyent, Inc. and other Node contributors

// regular expressions

const drvRe = /^(.+):/
const winRe = /\\+/g
const nixRe = /\/+/g
const extRe = /\.\w+$/

function split (path) {
  const parts = (path || '.').split(nixRe)
  if (parts.length > 1 && parts[parts.length - 1] === '') parts.pop()

  let p0 = parts[0]
  if (p0 === '') parts.shift()
  let up = 0

  for (let i = parts.length; i--; i) {
    const curr = parts[i]

    if (curr === '.') {
      parts.splice(i, 1)
    } else if (curr === '..') {
      parts.splice(i, 1)
      up++
    } else if (up) {
      parts.splice(i, 1)
      up--
    }
  }

  if (p0 === '') {
    if (parts.length) parts.unshift('')
    else parts.push('', '')
  } else {
    for (; up--; up) parts.unshift('..')
  }

  p0 = parts[0]
  if (p0 !== '..' && p0 !== '.' && (p0 !== '' || parts.length === 1)) parts.unshift('.')

  return parts
}

function reSplit (parts) {
  return split(parts.join('/'))
}

function fromPaths (...paths) {
  if (!paths.length) return new Pathogen('', [])

  const driveMatch = paths[0].match(drvRe)
  const drive = driveMatch ? `${driveMatch[1]}:` : ''

  let combined = []

  for (let path of paths) {
    path = path.replace(drvRe, '').replace(winRe, '/')
    if (!path) path = '.'
    combined.push(path)
  }

  if (drive) combined.unshift('')
  return new Pathogen(drive, combined)
}

class Pathogen {
  constructor (drive, parts) {
    this.drive = drive
    this.parts = reSplit(parts)
  }

  basename () {
    return this.parts.slice(-1)[0]
  }

  dirname () {
    if (!this.basename()) return new Pathogen(this.drive, this.parts)
    return new Pathogen(this.drive, this.parts.slice(0, -1))
  }

  extname () {
    const m = this.basename().match(extRe)
    return m ? m[0] : ''
  }

  resolve (...paths) {
    const pathList = [new Pathogen(this.drive, this.parts), ...paths.map((path) => fromPaths(path))]

    let absolutePath
    const parts = []

    for (let i = pathList.length; i--; i) {
      const path = pathList[i]
      if (path.parts[0] === '') { // absolutePath
        absolutePath = path
        break
      } else {
        parts.unshift(path.parts.join('/'))
      }
    }

    if (!absolutePath) absolutePath = fromPaths(process.cwd())
    return new Pathogen(absolutePath.drive, [...absolutePath.parts, ...parts])
  }

  relative (toPath) {
    toPath = fromPaths(toPath).resolve()
    const fromPath = this.resolve()

    if (fromPath.drive !== toPath.drive) return toPath

    const fromParts = fromPath.parts
    const toParts = toPath.parts

    const length = Math.min(fromParts.length, toParts.length)
    let samePartsLength = length

    for (let i = 0; i < length; i++) {
      if (fromParts[i] !== toParts[i]) {
        samePartsLength = i
        break
      }
    }

    const output = []
    for (let i = samePartsLength; i < fromParts.length; i++) output.push('..')

    output.push(...toParts.slice(samePartsLength))

    return new Pathogen(output[0] === '' ? this.drive : '', output)
  }

  // to*

  toUnix () {
    return this.drive + this.parts.join('/')
  }

  toSystem () {
    return process.platform === 'win32' ? this.toWindows() : this.toUnix()
  }

  toWindows () {
    return this.drive + this.parts.join('\\')
  }

  toString () {
    return this.toUnix()
  }
}

// shortcuts

function getImplementation (stringType) {
  const pathogen = (...paths) => fromPaths(...paths)[stringType]()

  pathogen.cwd = () => fromPaths(process.cwd())[stringType]()

  // toString

  pathogen.dirname = (path) => fromPaths(path).dirname()[stringType]()

  pathogen.basename = (path) => fromPaths(path).basename()

  pathogen.extname = (path) => fromPaths(path).extname()

  pathogen.resolve = (path, ...paths) => fromPaths(path).resolve(...paths)[stringType]()

  pathogen.relative = (path, to) => fromPaths(path).relative(to)[stringType]()

  return pathogen
}

const pathogen = getImplementation('toUnix')

pathogen.nix = pathogen
pathogen.sys = getImplementation('toSystem')
pathogen.win = getImplementation('toWindows')

module.exports = pathogen
