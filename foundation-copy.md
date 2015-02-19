* index.html    -> public/index.html
* bower.json    -> bower.json
* !>package.json  -> package.json (add dependency `"grunt-contrib-uglify": "^0.7.0"`)
* !Gruntfile.js
* humans.txt    -> public/humans.txt
* !README.md
* robots.txt    -> public/robots.txt (optional, almost identical to Laravel's)
* js            -> public/assets/js
* scss          -> public/assets/scss

Once Foundation is installed, via bower, we need to copy the `_settings.scss` file to public/assets/scss

public/assets/vendor/foundation/scss/foundation/_settings.scss -> public/assets/scss/_settings.scss