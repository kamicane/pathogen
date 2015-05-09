"use strict";
/* global describe, it */

var expect = require("expect.js");

var pathogen = require("../index");
var Pathogen = pathogen.Pathogen;

describe("constructor", function() {

  it("should normalize paths", function() {
    var path = pathogen("../.././././////////some/path");
    expect(path).to.be("../../some/path");
  });

  it("should mess with trailing slashes", function() {
    var path = pathogen("../.././some/path/");
    expect(path).to.be("../../some/path/");
  });

  it("should not mess with leading slashes", function() {
    var path;

    path = pathogen("/some/path/");
    expect(path).to.be("/some/path/");

    path = pathogen("/../.././some/path/");
    expect(path).to.be("/some/path/");
  });

  it("should always normalize . or ./ for relative paths", function() {
    var path;
    path = pathogen("./");
    expect(path).to.be("./");

    path = pathogen("././");
    expect(path).to.be("./");

    path = pathogen("././../");
    expect(path).to.be("../");

    path = pathogen(".");
    expect(path).to.be(".");

    path = pathogen("");
    expect(path).to.be(".");

    path = pathogen("/");
    expect(path).to.be("/");

    path = pathogen("/.");
    expect(path).to.be("/");

    path = pathogen("/./");
    expect(path).to.be("/");

    path = pathogen("some/path");
    expect(path).to.be("./some/path");

    path = pathogen("some/path/");
    expect(path).to.be("./some/path/");

    path = pathogen("./some/path/");
    expect(path).to.be("./some/path/");

    path = pathogen("./some/path");
    expect(path).to.be("./some/path");
  });

  it("should normalize above when it doesnt have a trailing slash", function() {
    var path;

    path = pathogen("/some/path/../");
    expect(path).to.be("/some/");

    path = pathogen("/some/path/..");
    expect(path).to.be("/some");

    path = pathogen("/../.././some/path/../../../../../../");
    expect(path).to.be("/");
  });

});

describe("resolve", function() {
  it("should resolve to the first absolute path", function() {
    var path = new Pathogen("/");
    expect(path.resolve().toString()).to.be("/");

    path = pathogen.resolve("/");
    expect(path).to.be("/");

    path = new Pathogen("abc/def/ghi");
    expect(path.resolve("/abc").toString()).to.be("/abc");

    path = pathogen.resolve("abc/def/ghi", "/abc");
    expect(path).to.be("/abc");

    path = new Pathogen("abc/def/ghi");
    expect(path.resolve("/abc/").toString()).to.be("/abc/");

    path = pathogen.resolve("abc/def/ghi", "/abc/");
    expect(path).to.be("/abc/");

    path = new Pathogen("f:\\windows\\system32");
    expect(path.resolve("e:").toWindows()).to.be("e:\\");
  });
});

describe("relative", function() {
  it("should relativize paths directories, not files", function() {
    var path;

    path = new Pathogen("/a/b/c");
    expect(path.relative("/a/b/f").toString()).to.be("./f");

    path = new Pathogen("/a/b/c/");
    expect(path.relative("/a/b/f/").toString()).to.be("../f/");

    path = new Pathogen("a/b/c");
    expect(path.relative("a/b/c").toString()).to.be("./c");

    path = new Pathogen("c:\\windows\\system32");
    expect(path.relative("e:\\windows\\").toWindows()).to.be("e:\\windows\\");

    path = new Pathogen("c:\\windows\\system32\\");
    expect(path.relative("c:\\windows\\drivers\\").toWindows()).to.be("..\\drivers\\");

    path = new Pathogen("/users/kamicane/file.txt");
    expect(path.relative("/users/kamicane/").toString()).to.be(".");

    path = pathogen.relative("/users/kamicane/file.txt", "/users/kamicane/");
    expect(path).to.be(".");

    path = new Pathogen("/users/kamicane/");
    expect(path.relative("/users/kamicane/file.txt").toString()).to.be("./file.txt");

  });
});

describe("extname", function() {
  it("should compute the extension name with the dot, or empty string", function() {
    var path;

    path = new Pathogen("/");
    expect(path.extname()).to.be("");

    path = new Pathogen("./file.js/");
    expect(path.extname()).to.be("");

    path = new Pathogen("./file.js");
    expect(path.extname()).to.be(".js");

    var extname = pathogen.extname("./file.js");
    expect(extname).to.be(".js");
  });
});

describe("dirname", function() {
  it("should compute the directory name, not file name", function() {
    var path;

    path = new Pathogen("/");
    expect(path.dirname().toString()).to.be("/");

    path = pathogen.dirname("/");
    expect(path).to.be("/");

    path = new Pathogen("a/b/");
    expect(path.dirname().toString()).to.be("./a/b/");

    path = pathogen.dirname("a/b/");
    expect(path).to.be("./a/b/");

    path = new Pathogen("a/b");
    expect(path.dirname().toString()).to.be("./a/");

    path = new Pathogen("a/b/c");
    expect(path.dirname().toString()).to.be("./a/b/");
  });
});

describe("basename", function() {
  it("should compute the basename, not directory name", function() {
    var path;

    path = new Pathogen("/");
    expect(path.basename()).to.be("");

    path = pathogen.basename("/");
    expect(path).to.be("");

    path = new Pathogen("a/b");
    expect(path.basename()).to.be("b");

    path = pathogen.basename("a/b");
    expect(path).to.be("b");

    path = new Pathogen("a/b/");
    expect(path.basename()).to.be("");

    path = new Pathogen("a/b.x");
    expect(path.basename()).to.be("b.x");
  });
});

describe("toWindows", function() {

  it("should convert windows style paths back and forth", function() {
    var path;

    path = new Pathogen("f:");
    expect(path.toString()).to.be("f:/");
    expect(path.toWindows()).to.be("f:\\");

    path = new Pathogen("some\\folder");
    expect(path.toWindows()).to.be(".\\some\\folder");

    path = new Pathogen("c:\\windows\\\\system32\\.\\\\\\drivers");
    expect(path.toString()).to.be("c:/windows/system32/drivers");
    expect(path.toWindows()).to.be("c:\\windows\\system32\\drivers");

    path = new Pathogen("\\windows\\\\\\system32\\.\\\\\\drivers");
    expect(path.toString()).to.be("/windows/system32/drivers");
    expect(path.toWindows()).to.be("\\windows\\system32\\drivers");
  });

});
