'use strict'
/* global describe, it */

const expect = require('expect.js')
const pathogen = require('../index')

describe('constructor', function () {
  it('should normalize paths', function () {
    expect(pathogen()).to.be('.')
    expect(pathogen('')).to.be('.')
    expect(pathogen('.')).to.be('.')
    expect(pathogen('./')).to.be('.')
    expect(pathogen('./a')).to.be('./a')
    expect(pathogen('./a/')).to.be('./a')

    expect(pathogen('../.././././////////some/path')).to.be('../../some/path')
  })

  it('should join paths', function () {
    expect(pathogen('a', 'b', 'c')).to.be('./a/b/c')
    expect(pathogen('./', 'b', 'c')).to.be('./b/c')
    expect(pathogen('', 'b', 'c')).to.be('./b/c')
    expect(pathogen('', 'b', 'c', '../', '')).to.be('./b')
  })

  it('should mess with trailing slashes', function () {
    expect(pathogen('../.././some/path/')).to.be('../../some/path')
  })

  it('should not mess with leading slashes', function () {
    expect(pathogen('/some/path/')).to.be('/some/path')
    expect(pathogen('/../.././some/path/')).to.be('/some/path')
  })

  it('should always normalize . or ./ for relative paths', function () {
    expect(pathogen('./')).to.be('.')
    expect(pathogen('././')).to.be('.')
    expect(pathogen('././../')).to.be('..')
    expect(pathogen('.')).to.be('.')
    expect(pathogen('')).to.be('.')
    expect(pathogen('/')).to.be('/')
    expect(pathogen('/.')).to.be('/')
    expect(pathogen('/./')).to.be('/')
    expect(pathogen('some/path')).to.be('./some/path')
    expect(pathogen('some/path/')).to.be('./some/path')
    expect(pathogen('./some/path/')).to.be('./some/path')
    expect(pathogen('./some/path')).to.be('./some/path')
  })

  it('should normalize above when it doesnt have a trailing slash', function () {
    expect(pathogen('/some/path/../')).to.be('/some')
    expect(pathogen('/some/path/..')).to.be('/some')
    expect(pathogen('/../.././some/path/../../../../../../')).to.be('/')
  })
})

describe('resolve', function () {
  it('should resolve to the first absolute path', function () {
    expect(pathogen.resolve('/')).to.be('/')
    expect(pathogen.resolve('abc/def/ghi', '/abc')).to.be('/abc')
    expect(pathogen.resolve('abc/def/ghi', '/abc')).to.be('/abc')
    expect(pathogen.resolve('abc/def/ghi', '/abc/')).to.be('/abc')
    expect(pathogen.resolve('abc/def/ghi', '/abc/')).to.be('/abc')
    expect(pathogen.win.resolve('f:\\windows\\system32', 'e:')).to.be('e:\\')
  })
})

describe('relative', function () {
  it('should relativize paths', function () {
    expect(pathogen.relative('/a/b/c', '/a/b/f')).to.be('../f')
    expect(pathogen.relative('/a/b/c/', '/a/b/f/')).to.be('../f')
    expect(pathogen.relative('a/b/c', 'a/b/c')).to.be('.')
    expect(pathogen.win.relative('c:\\windows\\system32', 'e:\\windows\\')).to.be('e:\\windows')
    expect(pathogen.win.relative('c:\\windows\\system32\\', 'c:\\windows\\drivers\\')).to.be('..\\drivers')
    expect(pathogen.relative('/users/kamicane/file.txt', '/users/kamicane/')).to.be('..')
    expect(pathogen.relative('/users/kamicane/file.txt', '/users/kamicane/')).to.be('..')
    expect(pathogen.relative('/users/kamicane/', '/users/kamicane/file.txt')).to.be('./file.txt')
  })
})

describe('extname', function () {
  it('should compute the extension name with the dot, or empty string', function () {
    expect(pathogen.extname('/')).to.be('')
    expect(pathogen.extname('./file.js/')).to.be('.js')
    expect(pathogen.extname('./file.js')).to.be('.js')
  })
})

describe('dirname', function () {
  it('should compute the directory name', function () {
    expect(pathogen.dirname('/')).to.be('/')
    expect(pathogen.dirname('/')).to.be('/')
    expect(pathogen.dirname('a/b/')).to.be('./a')
    expect(pathogen.dirname('a/b')).to.be('./a')
    expect(pathogen.dirname('a/b/c')).to.be('./a/b')
  })
})

describe('basename', function () {
  it('should compute the basename', function () {
    expect(pathogen.basename('/')).to.be('')
    expect(pathogen.basename('a/b')).to.be('b')
    expect(pathogen.basename('a/b/')).to.be('b')
    expect(pathogen.basename('a/b.x')).to.be('b.x')
  })
})

describe('toWindows', function () {
  it('should properly convert to windows style paths', function () {
    expect(pathogen('f:')).to.be('f:/')
    expect(pathogen.win('f:')).to.be('f:\\')
    expect(pathogen.win('some\\folder')).to.be('.\\some\\folder')
    expect(pathogen('c:\\windows\\\\system32\\.\\\\\\drivers')).to.be('c:/windows/system32/drivers')
    expect(pathogen.win('c:\\windows\\\\system32\\.\\\\\\drivers')).to.be('c:\\windows\\system32\\drivers')
    expect(pathogen('\\windows\\\\\\system32\\.\\\\\\drivers')).to.be('/windows/system32/drivers')
    expect(pathogen.win('\\windows\\\\\\system32\\.\\\\\\drivers')).to.be('\\windows\\system32\\drivers')
  })
})
