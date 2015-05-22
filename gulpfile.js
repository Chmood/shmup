var gulp = require('gulp')
	, gutil = require('gulp-util')
	, clean = require('gulp-clean')
	, concat = require('gulp-concat')
	, sourcemaps = require('gulp-sourcemaps')
	, rename = require('gulp-rename')
	, minifycss = require('gulp-minify-css')
	, minifyhtml = require('gulp-minify-html')
	, processhtml = require('gulp-processhtml')
	, jshint = require('gulp-jshint')
	, uglify = require('gulp-uglify')
	, connect = require('gulp-connect')
	, paths;

paths = {
	assets: 'src/assets/**/*',
	css:    'src/css/*.css', 
	libs:   [
		'src/bower_components/phaser-official/build/phaser.min.js'
	],
	js:     ['src/js/**/*.js'],
	dist:   './dist/'
};

gulp.task('clean', function () {
	var stream = gulp.src(paths.dist, {read: false})
		.pipe(clean({force: true}))
		.on('error', gutil.log);
	return stream;
});

gulp.task('copy', ['clean'], function () {
	gulp.src(paths.assets)
		.pipe(gulp.dest(paths.dist + 'assets'))
		.on('error', gutil.log);
});

gulp.task('uglify', ['clean','lint'], function () {
	// var srcs = [paths.libs[0], paths.js[0]];
	var srcs = [paths.libs[0],
		'src/js/boot.js',
		'src/js/preloader.js',
		'src/js/menu.js',

		'src/js/class/spriter.js',
		'src/js/class/actor.js',
		'src/js/class/mob.js',
		'src/js/class/shoot.js',
		'src/js/class/enemy.js',
		'src/js/class/flying_mobs.js',
		'src/js/class/turret.js',
		'src/js/class/player.js',
		'src/js/class/bullet.js',
		'src/js/class/collectible.js',
		'src/js/class/cloud.js',

		'src/js/game.js',
		'src/js/main.js'
	 ];

	gulp.src(srcs)
		.pipe(sourcemaps.init())
		.pipe(concat('main.min.js'))
		.pipe(sourcemaps.write())
		.pipe(uglify({outSourceMaps: true}))
		.pipe(gulp.dest(paths.dist))
		.on('error', gutil.log);
});

gulp.task('minifycss', ['clean'], function () {
 gulp.src(paths.css)
		.pipe(minifycss({
			keepSpecialComments: false,
			removeEmpty: true
		}))
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest(paths.dist))
		.on('error', gutil.log);
});

gulp.task('processhtml', ['clean'], function() {
	gulp.src('src/index.html')
		.pipe(processhtml('index.html'))
		.pipe(gulp.dest(paths.dist))
		.on('error', gutil.log);
});

gulp.task('minifyhtml', ['clean'], function() {
	gulp.src('dist/index.html')
		.pipe(minifyhtml())
		.pipe(gulp.dest(paths.dist))
		.on('error', gutil.log);
});

gulp.task('lint', function() {
	gulp.src(paths.js)
		.pipe(jshint('.jshintrc'))
		.pipe(jshint.reporter('default'))
		.on('error', gutil.log);
});

gulp.task('html', function(){
	gulp.src('src/*.html')
		.pipe(connect.reload())
		.on('error', gutil.log);
});

gulp.task('connect', function () {
	connect.server({
		root: [__dirname + '/src'],
		port: 9000,
		livereload: true
	});
});

gulp.task('watch', function () {
	gulp.watch(paths.js, ['lint']);
	gulp.watch(['./src/index.html', paths.css, paths.js], ['html']);
});

gulp.task('default', ['connect', 'watch']);
gulp.task('build', ['copy', 'uglify', 'minifycss', 'processhtml', 'minifyhtml']);

