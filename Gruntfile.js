module.exports = function(grunt) {

  // Load all files starting with `grunt-`
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  var pkg = grunt.file.readJSON('package.json');

  grunt.initConfig({
    pkg: pkg,

    meta: {
      imgAssetsPath: 'assets/img/',
      cssAssetsPath: 'assets/css/',
      sassAssetsPath: 'assets/sass/',
      sdkAssetsPath: 'assets/sdk/',
      imgDistPath: 'dist/img/',
      cssDistPath: 'dist/css/',
      sdkDistPath: 'dist/sdk/',
      htmlDistPath: 'dist/'
    },

    clean: {
      release: ["dist"]
    },

    // JsHint
    jshint: {
      options: {
        "-W032": true,
        noempty: true,
        noarg: true,
        eqeqeq: true,
        bitwise: false,
        curly: true,
        undef: true,
        validthis: true,
        nonew: true,
        forin: true,
        globals: {
          browser: true,
          "window": true,
          "document": true,
          "console": true,
	        "PayMaya": true
        }
      },
      files:{
        src: ['<%= meta.sdkAssetsPath %>*.js']
      }
    },
    
    // Watch
    watch: {
      options: {
        spawn: false,
        dateFormat: function(time) {
          grunt.log.writeln('The watch finished in ' + time + 'ms at' + (new Date()).toString());
          grunt.log.writeln('Waiting for more changes...');
        },
      },
      src: {
        files: ['Gruntfile.js', '<%= meta.sdkAssetsPath %>*.js', '<%= meta.cssAssetsPath %>*.css', '<%= meta.imgAssetsPath %>*.{png,gif,jpg,svg}', '<%= meta.sdkDistPath %>*.js', '<%= meta.cssDistPath %>*.css', '<%= meta.imgDistPath %>*.{png,gif,jpg,svg}'],
        tasks: ['default'],
      },

      min: {
        files: ['<%= meta.sdkDistPath %>*.js', '<%= meta.cssDistPath %>*.css'],
        tasks: ['uglify:dist', 'cssmin'],
        options: {
          atBegin: true
        }
      }

    },

    /// userminPrepare
    useminPrepare: {
      html: 'assets/index.html',
      //html: 'index.html',
      options: {
        dest: 'dist'
      },
    },

    // Usemin
    // Replaces all assets with their revved version in html and css files.
    // options.assetDirs contains the directories for finding the assets
    // according to their relative paths

    // usemin has access to the revved files mapping through grunt.filerev.summary

    usemin: {
      html: ['<%= meta.htmlDistPath %>index.html'],
      js: ['<%= meta.sdkDistPath %>*.js'],
      css: ['<%= meta.cssDistPath %>*.css']
    },

    // Concat
    concat: {
      options: {
        separator: ';'
      },
      // dist configuration is provided by useminPrepare
      dist: {},
      generated: {
        files: [{
          dest: '.tmp/concat/dist/sdk/paymaya.min.js',
          src: ['<%= meta.sdkAssetsPath %>paymaya.js']
        }]
      }
    },

    uglify: {
      dist: {},
      generated: {
        options: {
          sourceMap: true
        },
        files: [{
          dest: '<%= meta.sdkDistPath %>paymaya.min.js',
          src: ['.tmp/concat/dist/sdk/paymaya.min.js']
        }]
      },
      comments: {
        src: '.tmp/concat/dist/sdk/paymaya.min.js',
        dest: '<%= meta.sdkDistPath %>paymaya.min.js',
        options: {
          mangle: false,
          preserveComments: 'some'
        }
      }
    },

    sass: {
      options: {
        sourceMap: true
      },
      dist: {
        files: {
          '<%= meta.cssAssetsPath %>main.css': '<%= meta.sassAssetsPath %>main.scss'
        }
      }
    },

    cssmin: {
      /*generated: {
        files: [{
          expand: true,
          cwd: '<%= meta.cssAssetsPath %>',
          src: ['*.css', '!*.min.css'],
          dest: '<%= meta.cssDistPath %>',
          ext: '.min.css'
        }]
      }*/
      generated: {
        files: {
          '<%= meta.cssDistPath %>style.min.css': ['<%= meta.cssAssetsPath %>foundation.css', '<%= meta.cssAssetsPath %>main.css']
        }
      }
    },

    copy: {
      // copy:release copies all html and image files to dist
      // preserving the structure
      release: {
        files: [{
          expand: true,
          cwd: 'assets',
          src: [
            'img/*.{png,gif,jpg,svg}',
            //'css/*.css',
            //'sdk/*.js',
            'index.html',
            '*.html',
	          '*.json'
          ],
          dest: 'dist/',
          /*options: {
            process: function(content, srcpath) {
              return content.replace(/[dist/sdk/paymaya.min.*.js]/, "dist/sdk/paymaya.min.js");
            },
          },*/
        }]
      }
    },

    imagemin: {
      dist: {
        options: {
          optimizationLevel: 5
        },
        files: [{
          expand: true,
          cwd: '<%= meta.imgAssetsPath %>',
          src: ['**/*.{png,jpg,gif}'],
          dest: '<%= meta.imgDistPath %>'
        }]
      }
    },

    // Filerev
    filerev: {
      options: {
        encoding: 'utf8',
        algorithm: 'md5',
        length: 8
      },
      release: {
        // filerev:release hashes(md5) all assets (images, js and css )
        // in dist directory
        files: [{
          src: ['<%= meta.imgDistPath %>*.{png,gif,jpg,svg}',
                '<%= meta.sdkDistPath %>*.js',
                '<%= meta.cssDistPath %>*.min.css']
        }]
      }
    }
  });

  grunt.registerTask('default', ['clean:release', 'jshint', 'useminPrepare', 'concat:generated', 'sass', 'cssmin:generated', 'imagemin', 'uglify:generated', 'uglify:comments', 'copy:release', 'filerev', 'usemin']);
};
