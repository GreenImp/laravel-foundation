#!/usr/bin/env node


// include required modules
var exec    = require('child_process').exec,
    fs      = require('fs'),
    mv      = require('mv'),
    rimraf  = require('rimraf'),
    merge   = require('node-merge'),
    targz   = require('tar.gz'),
    http    = require('http'),
    https   = require('https'),
    url     = require('url');




var projectName       = process.argv[2] || 'laravel-foundation',                                      // project name - used for directory name
    projectPathParent = process.argv[3] || process.cwd().replace(new RegExp(projectName + '$'), '');  // path to the parent directory of the project
    projectPath       = projectPathParent + '/' + projectName;                                        // path to the project directory


const LOG_DIVIDER             = '====================================';


const SCRIPT_PATH             = __dirname;  // path to this script

const LARAVEL_PUBLIC_DIR      = 'public';

const FOUNDATION_FILE_EXT     = 'tar.gz';
const FOUNDATION_FILENAME     = 'master';
const FOUNDATION_INT_FILENAME = 'foundation-libsass-template-master';
const FOUNDATION_REPO_URL     = 'https://codeload.github.com/zurb/foundation-libsass-template/' + FOUNDATION_FILE_EXT + '/' + FOUNDATION_FILENAME;



var errorHandler          = function(errors){
      var i;

      // ensure `errors` is an array
      if(!Array.isArray(errors)){
        errors = [errors];
      }

      console.error('ERROR:');

      // loop through and output each error
      for(i = 0; i < errors.length; i++){
        console.error(errors[i]);
      }

      process.exit(1);
    },
    /**
     * Handles `exec` commands and detects
     * success/failure status
     *
     * @param {string} str
     * @param {function=} successCallback
     * @param {function=} errorCallback
     */
    execHandler           = function(str, successCallback, errorCallback){
      exec(str, function(error, out, code){
        if(error || code){
          (errorCallback || errorHandler).call(this, [code, error, out]);
        }else if(successCallback){
          successCallback.call(this, out);
        }
      });
    },
    /**
     * Determines which request handler (http | https)
     * to use for the given URL, and returns the
     * appropriate one
     *
     * @param {string} location
     */
    getRequestHandler     = function(location){
      return (url.parse(location).protocol == 'https:') ? https : http;
    },
    /**
     * Downloads a file
     *
     * @param {string} src
     * @param {string} dest
     * @param {function=} successCallback
     * @param {function=} errorCallback
     */
    download              = function(src, dest, successCallback, errorCallback){
      console.log('Downloading file: %s', src);

      // open a file write stream
      var file  = fs.createWriteStream(dest);

      file.on('error', function(error){
        // delete the file
        fs.unlink(dest, null);

        if(errorCallback){
          errorCallback(error);
        }
      });


      // get the file and save it
      return getRequestHandler(src)
          .get(src, function(response){
            // write the file
            response.pipe(file);

            file.on('finish', function(){
              // close the file and trigger the callback
              file.close(successCallback);
            })
          })
          .on('error', function(error){
            // delete the file
            fs.unlink(dest, null);

            if(errorCallback){
              errorCallback(error);
            }
          });
    },
    /**
     * Extracts a zipped file
     *
     * @param {string} src
     * @param {string} dest
     * @param {function=} successCallback
     * @param {function=} errorCallback
     */
    extract               = function(src, dest, successCallback, errorCallback){
      console.log('Extracting file: %s', src);

      return new targz().extract(src, dest, function(err){
        if(err){
          errorCallback(err);
        }else{
          successCallback();
        }
      });
    },
    /**
     * Deletes a file or directory.
     * `file` can be an array of files/directories.
     *
     * @param {string|Array} file
     * @param {function} successCallback
     * @param {function} errorCallback
     */
    deleteFile            = function(file, successCallback, errorCallback){
      if(Array.isArray(file)){
        file.forEach(function(f){
          deleteFile(f, successCallback, errorCallback);
        });
      }else{
        rimraf(file, function(err){
          if(err){
            errorCallback(err);
          }else{
            successCallback();
          }
        });
      }
    },
    /**
     * Moves a file or directory.
     * `file` can be an array of files/directories.
     *
     * @param {object|Array} file
     * @param {object=} options
     * @param {function} successCallback
     * @param {function} errorCallback
     */
    moveFile              = function(file, options, successCallback, errorCallback){
      if(Array.isArray(file)){
        file.forEach(function(f){
          moveFile(f, options, successCallback, errorCallback);
        })
      }else{
        console.log('Moving file', file.src + ' -> ' + file.dest);

        mv(file.src, file.dest, options || {}, function(err){
          if(err){
            errorCallback(err);
          }else{
            successCallback();
          }
        });
      }
    },
    copyFile              = function(src, dest, successCallback, errorCallback){
      var cbCalled = false;

      var rd = fs.createReadStream(src);
      rd.on("error", done);

      var wr = fs.createWriteStream(dest);
      wr.on("error", done);
      wr.on("close", function(ex){
        done();
      });
      rd.pipe(wr);

      function done(err){
        if(!cbCalled){
          cbCalled = true;

          if(err){
            errorCallback(err);
          }else{
            successCallback();
          }
        }
      }
    },
    /**
     * Checks if the project directory
     * already exists or not
     *
     * @returns {boolean}
     */
    doesProjectExist      = function(){
      return !!fs.existsSync(projectPath);
    },
    /**
     * Changes the current working directory
     *
     * @param {string} location
     */
    goToDir               = function(location){
      try{
        process.chdir(location);
      }catch(error){
        errorHandler(error);
      }
    },
    /**
     * Changes the project directory
     */
    goToProjectDir        = function(){
      goToDir(projectPath);
    };



var init  = {
  laravel: function(callback){
    // check if the project directory already exists
    if(doesProjectExist()){
      // project directory already exists
      errorHandler(['The project directory already exists', 'Delete the directory or use a different project name to continue']);
    }

    console.log(LOG_DIVIDER);
    console.log('# Installing Laravel');

    // ensure that we're in the project parent
    goToDir(projectPathParent);

    // run the Laravel install command
    // TODO - should we use Composer, so that Laravel doesn't need to be installed?
    execHandler('laravel new ' + projectName, function(){
      console.log('Laravel installed');

      if(callback){
        callback();
      }
    });
  },
  foundation: function(callback){
    console.log(LOG_DIVIDER);
    console.log('# Setting up Foundation');

    var downloadPath  = projectPath + '/' + FOUNDATION_FILENAME,  // path to download foundation
        extractPath   = projectPath + '/' + FOUNDATION_FILENAME,  // path to extract the download
        publicPath    = projectPath + '/' + LARAVEL_PUBLIC_DIR;   // path to the Laravel public directory

    // download foundation and copy across any required files
    download(
      FOUNDATION_REPO_URL,
      downloadPath + '.' + FOUNDATION_FILE_EXT,
      function(){
        console.log('Download complete');

        // extract the files
        extract(
          downloadPath + '.' + FOUNDATION_FILE_EXT,
          projectPath + '/' + FOUNDATION_FILENAME,
          function(){
            console.log('Merging Foundation into Laravel');

            var count, fileList;


            // copy the Foundation files into the Laravel public directory
            // mergeTo is Synchronous!
            merge.mergeTo(extractPath + '/' + FOUNDATION_INT_FILENAME, publicPath);

            // move the files into the correct locations
            count     = 0;
            fileList  = [
              // move the JS into the assets directory
              {
                src: publicPath + '/js',
                dest: publicPath + '/assets/js'
              },
              // move the SCSS into the assets directory
              {
                src: publicPath + '/scss',
                dest: publicPath + '/assets/scss'
              },
              // move the bower file into the project root
              {
                src: publicPath + '/bower.json',
                dest: projectPath + '/bower.json'
              }
            ];
            moveFile(
              fileList,
              {mkdirp: true},
              function(){
                count++;

                if(count >= fileList.length){
                  // all files moved

                  console.log('Removing old files');
                  // remove the unnecessary Foundation files
                  count     = 0;
                  fileList  = [
                    // zipped Foundation folder
                    downloadPath + '.' + FOUNDATION_FILE_EXT,
                    // extracted Foundation folder
                    extractPath,
                    // Foundation's Gruntfile
                    publicPath + '/Gruntfile.js',
                    // Foundation's Readme (Not relevant)
                    publicPath + '/README.md'
                  ];
                  deleteFile(
                    fileList,
                    function(){
                      count++;

                      if(count >= fileList.length){
                        // all files deleted
                        console.log('Foundation installed');

                        if(callback){
                          callback();
                        }
                      }
                    },
                    errorHandler
                  );
                }
              },
              errorHandler
            );
          },
          errorHandler
        );
      },
      errorHandler
    );
  },
  bower: function(callback){
    console.log(LOG_DIVIDER);
    console.log('# Setting up Bower');

    // copy `.bowerrc` file into project root
    copyFile(
      SCRIPT_PATH + '/files/.bowerrc', projectPath + '/.bowerrc',
      function(){
        // ensure that we're in the project directory
        goToProjectDir();

        // install the bower modules
        execHandler('bower install', function(){
          console.log('Bower modules installed');

          if(callback){
            callback();
          }
        });
      },
      errorHandler
    );
  },
  all: function(){
    // install Laravel
    init.laravel(function(){
      // install Foundation
      init.foundation(function(){
        init.bower();
      });

      // set up NPM
      //execHandler('npm init -f', function(){});
    });
  }
};




console.log('Project directory: %s', projectPath);

// run the initialisation scripts
init.all();
