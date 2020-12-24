const gulp = require('gulp'),
    zip = require('gulp-zip'),
    jeditor = require('gulp-json-editor'),
    del = require('del'),
    fs = require('fs'),
    files = ['*icon/**/*', 'background.*', 'termly.io.*', 'manifest.json', '*_locales/**/*', 'policies.css'];

let version

function clean() {
    return del(['./dist/']);
}

function copyAllFiles() {
    return gulp.src(files).pipe(gulp.dest('./dist/'));
}

function updateManifest() {
    version = JSON.parse(fs.readFileSync('package.json')).version

    return gulp.src('manifest.json')
        .pipe(jeditor({
            'version': version,
            'version_name': version
        }))
        .pipe(gulp.dest('./dist/'))
}

function zipup() {
    return gulp.src('dist/**/*')
    .pipe(zip(`archive-${version.replace(/\./g, '_')}.zip`))
    .pipe(gulp.dest('dist'))
}

function watch() {
    return gulp.watch(files, gulp.series(copyAllFiles, updateManifest, zipup));
}

exports.default = gulp.series(clean, copyAllFiles, updateManifest, zipup);
exports.watch = gulp.series(clean, copyAllFiles, updateManifest, zipup, watch);