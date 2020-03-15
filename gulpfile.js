const gulp = require('gulp')
const pug2html = require('./gulp/pug2html.js')
const scsstocss = require('./gulp/styles.js')
const server = require('./gulp/server.js')
const scripts = require('./gulp/scripts.js')

module.exports.start = gulp.series(pug2html, scsstocss, scripts, server)
