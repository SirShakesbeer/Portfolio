const minify = require('@node-minify/core');
const csso = require('@node-minify/csso');

minify({
  compressor: csso,
  input: 'style.css',
  output: 'style.min.css',
  callback: function(err, min) {}
});

const uglifyJS = require('@node-minify/uglify-js');

minify({
  compressor: uglifyJS,
  input: 'script.js',
  output: 'script.min.js',
  callback: function(err, min) {}
});
minify({
    compressor: uglifyJS,
    input: 'modules/scene.js',
    output: 'modules/scene.min.js',
    callback: function(err, min) {}
  });
  minify({
    compressor: uglifyJS,
    input: 'modules/animations.js',
    output: 'modules/animations.min.js',
    callback: function(err, min) {}
  });