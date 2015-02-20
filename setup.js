#!/usr/bin/env node


// include required modules
var os        = require('os'),
    exec      = require('child_process').exec,
    spawn     = require('child_process').spawn,
    spawnSync = require('child_process').spawnSync,
    sudo      = require('sudo'),
    fs        = require('fs'),
    mv        = require('mv'),
    rimraf    = require('rimraf'),
    merge     = require('node-merge'),
    targz     = require('tar.gz'),
    http      = require('http'),
    https     = require('https'),
    url       = require('url'),
    printf    = require('util').format,
    extend    = require("xtend");




var projectName       = process.argv[2],                                                              // project name - used for directory name
    projectPathParent = process.argv[3] || process.cwd().replace(new RegExp(projectName + '$'), '');  // path to the parent directory of the project
    projectPath       = projectPathParent + '/' + projectName;                                        // path to the project directory


const LOG_DIVIDER             = '====================================';


const SCRIPT_PATH             = __dirname;  // path to this script

const LARAVEL_PUBLIC_DIR      = 'public';

const FOUNDATION_FILE_EXT     = 'tar.gz';
const FOUNDATION_FILENAME     = 'master';
const FOUNDATION_INT_FILENAME = 'foundation-libsass-template-master';
const FOUNDATION_REPO_URL     = 'https://codeload.github.com/zurb/foundation-libsass-template/' + FOUNDATION_FILE_EXT + '/' + FOUNDATION_FILENAME;

const COMPOSER_URL            = 'https://getcomposer.org/installer';



var errorHandler          = function(errors){
      var i;

      if(!errors){
        // no errors defined - create a default
        errors = ['An error has occurred, please check the output above'];
      }else if(!Array.isArray(errors)){
        // ensure that the errors is an array
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
      exec(str, function(error, stdout, stderr){
        if(error !== null){
          (errorCallback || errorHandler).call(this, [printf('Code: %s', error.code), stderr]);
        }else if(successCallback){
          successCallback.call(this, stdout);
        }
      });
    },
    /**
     * Handles `spawn` commands
     *
     * @param {string} command
     * @param {Array=} arguments
     * @param {object=} options
     * @param {function=} successCallback
     * @param {function=} errorCallback
     * @returns {*}
     */
    spawnHandler          = function(command, arguments, options, successCallback, errorCallback){
      var cmd,
          useRoot = options && options.sudo,
          sudoOps = {
            cachePassword: true
          };

      options = extend({}, options);

      if(useRoot){
        // store the spawn options
        sudoOps.spawnOptions = options;

        // sudo requires the command to be the first in the arguments list
        (arguments || []).unshift(command);

        // run as sudo
        cmd = sudo(arguments, sudoOps);
      }else if(options.sync){
        // run synchronously
        cmd = spawnSync(command, arguments || [], options);
      }else{
        // run as user
        /**
         * Setting `stdio` to 'inherit', to preserve output colours.
         *
         * @link http://stackoverflow.com/a/14231570
         */
        options.stdio = 'inherit';
        cmd = spawn(command, arguments || [], options);
      }

      // assign any callbacks
      if(useRoot || !options.sync){
        cmd.on('close', function(code){
          if(code === 0){
            // success
            if(successCallback){
              successCallback();
            }
          }else if(errorCallback){
            errorCallback();
          }
        });
      }else{
        if(cmd.stderr){
          if(errorCallback){
            errorCallback();
          }
        }else if(successCallback){
          successCallback();
        }
      }

      return cmd;
    },
    isWindows             = function(){
      return os.platform === 'win32';
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
     * Writes data to a file
     *
     * @param {string} file
     * @param {string} data
     * @param {function} successCallback
     * @param {function} errorCallback
     */
    writeFile             = function(file, data, successCallback, errorCallback){
      fs.writeFile(file, data, function(err){
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
        console.log('Deleting file: %s', file);

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
        console.log('Moving file: %s -> %s', file.src, file.dest);

        if(options && options.sudo){
          spawnHandler(
            'mv',
            [
              file.src,
              file.dest
            ],
            options,
            successCallback,
            errorCallback
          );
        }else{
          mv(file.src, file.dest, options || {}, function(err){
            if(err){
              errorCallback(err);
            }else{
              successCallback();
            }
          });
        }
      }
    },
    copyFile              = function(src, dest, successCallback, errorCallback){
      console.log('Copying file: %s -> %s', src, dest);

      var cbCalled = false;

      var rd = fs.createReadStream(src);
      rd.on('error', done);

      var wr = fs.createWriteStream(dest);
      wr.on('error', done);
      wr.on('close', function(ex){
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
    },
    getExecPath           = function(exec, callback){
      execHandler(
        printf('which %s', exec),
        function(stdout){
          callback(stdout.split('\n')[0]);
        },
        errorHandler
      );
    },
    isNodeRoot            = function(callback){
      // determine the path to node, so we can check permissions
      // TODO - check this functionality on Windows
      getExecPath('node', function(path){
        // get the file stats
        fs.stat(path, function(err, stats){
          if(err){
            errorHandler(err);
          }else{
            // return result
            callback(stats.uid != process.getuid());
          }
        });
      });
    },
    /**
     * Checks if the given NPM module is installed
     *
     * @link http://stackoverflow.com/a/20801918
     * @param {string} module   The module name
     * @param {boolean=} global Whether to check global or local. Defaults to true
     * @returns {boolean}
     */
    isNPMModuleInstalled  = function(module, global){
      // npm [-g] list --depth=0 | grep {module}
      var args = ['list', '--depth=0', '|', 'grep', module],
          cmd;

      // add global flag
      if(global !== false){
        args.unshift('-g');
      }

      // run the commans
      cmd = spawnHandler('npm', args, {sync: true});

      // return true if no error and output exists (Output is empty if module ot installed)
      return !cmd.stderr.toString() && cmd.stdout.toString();
    },
    installNPMModules     = function(modules, options, callback){
      if(!modules){
        if(callback){
          callback();
        }else{
          return;
        }
      }

      // check if modules is an object
      if(typeof modules === 'object'){
        // if modules in not an array, it must be a name -> version key pair list
        if(!Array.isArray(modules)){
          // loop through and convert the object to an array
          var moduleArray = [];
          for(var module in modules){
            if(modules.hasOwnProperty(module)){
              moduleArray.push(module + '@' + modules[module]);
            }
          }

          modules = moduleArray;
        }
      }else{
        // modules is not an object - convert to an array
        modules = [modules];
      }

      // ensure that `modules` is an array
      modules = Array.isArray(modules) ? modules : [modules];

      console.log('Installing Node modules:');
      console.log(modules.join(' '));

      // check if Node needs to be run as root to install dependencies
      isNodeRoot(function(isRoot){
        // build the arguments
        var args = [
          'install'
        ];

        // check global flag
        if(options.global){
          args.push('-g');
        }

        // add the modules
        args.push.apply(args, modules);

        if(options.saveDev){
          args.push('--save-dev');
        }else if(options.save){
          args.push('--save');
        }

        // install the modules
        spawnHandler(
          'npm',
          args,
          {
            sudo: isRoot
          },
          function(){
            console.log('Node modules installed');

            if(callback){
              callback();
            }
          },
          errorHandler
        );
      });
    };



var init  = {
  /**
   * Checks if the given software dependency
   * is installed.
   * `dependency` can be an array of
   * dependencies to check.
   * If no dependency is specified, all
   * dependencies are checked.
   *
   * @param {string=} dependency
   */
  checkDependency: function(dependency){
    var checks  = {
      bower: function(){
        return isNPMModuleInstalled('bower');
      },
      grunt: function(){
        return isNPMModuleInstalled('grunt-cli');
      },
      php: function(){
        var cmd = spawnHandler('php', ['-v'], {sync: true});
        return !cmd.stderr.toString() && cmd.stdout.toString();
      },
      composer: function(){
        var cmd = spawnHandler('composer', ['-V'], {sync: true});
        return !cmd.stderr.toString() && cmd.stdout.toString();
      }
    },
        failed  = [];


    if(dependency){
      // dependency defined - ensure that it is an array
      dependency = Array.isArray(dependency) ? dependency : [dependency];
    }else{
      // no dependency defined - get all the dependency names
      dependency = Object.keys(checks);
    }

    // loop through and check all of the dependencies
    for(var prop in dependency){
      if(dependency.hasOwnProperty(prop)){
        // check the dependency
        console.log('Checking dependency `%s`', dependency[prop]);

        if(!checks[dependency[prop]] || !checks[dependency[prop]]()){
          // dependency check doesn't exist or it failed
          failed.push(dependency[prop]);
        }
      }
    }

    if(failed.length){
      console.log('Dependencies not found: %s', failed.join(' '));
      return false;
    }else{
      console.log('Dependencies met');
      return true;
    }
  },
  /**
   * Installs the dependencies required
   * so that a project can be created.
   *
   * If dependencies aren't installed,
   * the general init functions will fail!
   *
   * @param {boolean=} global
   * @param {function=} callback
   */
  dependencies: function(callback){
    console.log(LOG_DIVIDER);
    console.log('# Installing Dependency software');

    var software  = {
      grunt: function(callback){
        console.log('# Installing Grunt (May require Root privileges)');

        installNPMModules(
          'grunt-cli',
          {
            global: true
          },
          function(){
            console.log('Grunt installed');

            if(callback){
              callback();
            }
          }
        );
      },
      bower: function(callback){
        console.log('# Installing Bower (May require Root privileges)');

        installNPMModules(
          'bower',
          {
            global: true
          },
          function(){
            console.log('Bower installed');

            if(callback){
              callback();
            }
          }
        );
      },
      composer: function(callback){
        console.log('# Installing Composer');

        execHandler(
          printf('php -r "readfile(\'%s\');" | php', COMPOSER_URL),
          function(stdout){
            console.log('Composer downloaded');

            // move the composer phar file to a globally accessible directory
            moveFile(
              {
                src: process.cwd() + '/composer.phar',
                dest: isWindows() ? '/bin' : '/usr/local/bin/composer'
              },
              {
                mkdirp: true,
                sudo: !isWindows()
              },
              function(){
                if(isWindows()){
                  // on Windows we need to make a bat file
                  /*
                  @ECHO OFF
                  php "%~dp0composer.phar" %*
                  */
                  writeFile(
                    '/bin/composer.bat',
                    'echo @php "%~dp0composer.phar" %*',
                    function(){
                      console.log('Composer installed');

                      if(callback){
                        callback();
                      }
                    },
                    errorHandler
                  );
                }else{
                  console.log('Composer installed');

                  if(callback){
                    callback();
                  }
                }
              },
              errorHandler
            );
          },
          errorHandler
        );
      }
    };

    // TODO - this should be an automated loop
    software.grunt(function(){
      software.bower(function(){
        software.composer(callback);
      });
    });
  },
  /**
   * Installs a Laravel project
   *
   * @link http://laravel.com/docs/quick
   * @param {function=} callback
   */
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
    spawnHandler(
      'composer',
      ['create-project', 'laravel/laravel', projectName, '--prefer-dist'],
      null,
      function(){
        // rename the Laravel readme
        moveFile(
          {
            src: projectPath + '/readme.md',
            dest: projectPath + '/readme-laravel.md'
          },
          null,
          function(){
            console.log('Laravel installed');

            if(callback){
              callback();
            }
          },
          errorHandler
        );
      },
      errorHandler
    );
  },
  /**
   * Adds Foundation (libsass) to the project
   *
   * @link http://foundation.zurb.com/docs/sass.html
   * @param {function=} callback
   */
  foundation: function(callback){
    console.log(LOG_DIVIDER);
    console.log('# Setting up Foundation');

    var downloadPath  = projectPath + '/' + FOUNDATION_FILENAME,  // path to download foundation
        extractPath   = projectPath + '/' + FOUNDATION_FILENAME,  // path to extract the download
        publicPath    = projectPath + '/' + LARAVEL_PUBLIC_DIR;   // path to the Laravel public directory

    // ensure that we're in the project directory
    goToProjectDir();

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
            console.log('\nMerging Foundation into Laravel');

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
              },
              // move the readme file
              {
                src: publicPath + '/README.md',
                dest: projectPath + '/readme-foundation.md'
              }
            ];
            moveFile(
              fileList,
              {mkdirp: true},
              function(){
                count++;

                if(count >= fileList.length){
                  // all files moved

                  // install any npm dependencies
                  var fPckg  = require(publicPath + '/package.json');
                  installNPMModules(
                    fPckg.devDependencies,
                    {
                      saveDev: true
                    },
                    function(){
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
                        // Foundations Package file
                        publicPath + '/package.json'
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
  /**
   * Creates .bowerrc and
   * installs bower modules
   *
   * @link http://bower.io/#getting-started
   * @param {function=} callback
   */
  bower: function(callback){
    console.log(LOG_DIVIDER);
    console.log('# Setting up Bower');

    // copy `.bowerrc` file into project root
    copyFile(
      SCRIPT_PATH + '/files/.bowerrc',
      projectPath + '/.bowerrc',
      function(){
        // ensure that we're in the project directory
        goToProjectDir();

        // install the bower modules
        console.log('Installing Bower modules');
        spawnHandler(
          'bower',
          ['install'],
          null,
          function(){
            console.log('Bower setup complete');

            if(callback){
              callback();
            }
          },
          errorHandler
        );
      },
      errorHandler
    );
  },
  /**
   * Installs Grunt dependencies
   * and creates Gruntfile.js
   *
   * @param {function=} callback
   */
  grunt: function(callback){
    console.log(LOG_DIVIDER);
    console.log('# Setting up Grunt');

    // copy `Gruntfile.js` file into project root
    copyFile(
      SCRIPT_PATH + '/files/Gruntfile.js',
      projectPath + '/Gruntfile.js',
      function(){
        // ensure that we're in the project directory
        goToProjectDir();

        console.log('Installing Grunt dependencies (May require Root privileges)');

        // install the extra Grunt dependencies
        installNPMModules(
          'grunt-contrib-uglify',
          {
            saveDev: true
          },
          callback
        );
      },
      errorHandler
    );
  },
  all: function(){
    // check required dependencies that we don't/can't install
    if(!init.checkDependency('php')){
      errorHandler('PHP is not installed. Please install PHP before continuing: http://php.net/manual/en/install.php');
      return false;
    }

    // pre-requisites met - continue with the setup
    init.dependencies(function(){
      // install Laravel
      init.laravel(function(){
        // install Foundation
        init.foundation(function(){
          // install bower
          init.bower(function(){
            // intstall grunt
            init.grunt(function(){
              console.log(LOG_DIVIDER);
              console.log('# Setup complete, happy coding :)');
            });
          });
        });

        // set up NPM
        //spawnHandler('npm', ['init', '-f'], null, function(){}, errorHandler);
      });
    });
  }
};




if(!projectName){
  // no project name defined
  errorHandler('No project name defined');
}


console.log(LOG_DIVIDER);
console.log('Setting up Laravel-Foundation project');
console.log('Project directory: %s', projectPath);
console.log('');

// run the initialisation scripts
init.all();
