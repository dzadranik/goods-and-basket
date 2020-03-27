const gulp = require('gulp');
const clean = require('./gulp/clean.js');
const pug2html = require('./gulp/pug2html.js');
const scsstocss = require('./gulp/styles.js');
const server = require('./gulp/server.js');
const scripts = require('./gulp/scripts.js');

module.exports.start = gulp.series(clean, gulp.parallel(pug2html, scsstocss, scripts), server);
