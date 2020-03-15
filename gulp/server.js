var gulp = require('gulp')
const pug2html = require('./pug2html.js')
const styles = require('./styles.js')
const script = require('./scripts.js')

var browsersync = require('browser-sync').create()

module.exports = function server(cb) {
	browsersync.init({
		server: 'build',
		open: true
	})

	gulp.watch(
		'src/styles/*.scss',
		gulp.series(styles, cb =>
			gulp
				.src('build/css')
				.pipe(browsersync.stream())
				.on('end', cb)
		)
	)
	gulp.watch('src/js/*.js', gulp.series(script))
	gulp.watch('build/js/*.js').on('change', browsersync.reload)
	gulp.watch('src/*.pug', gulp.series(pug2html))
	gulp.watch('build/*.html').on('change', browsersync.reload)
	return cb()
}
