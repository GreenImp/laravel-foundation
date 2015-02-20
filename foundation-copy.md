* **index.html    -> public/index.html**
* **bower.json    -> bower.json**
* **package.json  -> package.json (Merge and add dependency `grunt-contrib-uglify`)**
* **Gruntfile.js  -> REMOVE**
* **humans.txt    -> public/humans.txt**
* **README.md     -> readme-foundation.md**
* **robots.txt    -> public/robots.txt (optional, almost identical to Laravel's)**
* **js            -> public/assets/js**
* **scss          -> public/assets/scss**

Once Foundation is installed, via bower, we need to copy the `_settings.scss` file to `public/assets/scss`

* cp public/assets/vendor/foundation/scss/foundation/_settings.scss -> public/assets/scss/_settings.scss
