/*jslint node: true */
"use strict";

module.exports = function(grunt) {

	grunt.initConfig({
		pkg : grunt.file.readJSON('package.json'),

		// Metadata.
		meta : {
			cssDistPath : 'dist/css/',
			sdkDistPath : 'dist/sdk/',
			cssAssetsPath : 'assets/css/',
			sdkAssetsPath : 'assets/sdk/'
		},

		concat : {
			options : {
				separator : ';'
			},
			dist : {
				//src : ['<%= meta.sdkAssetsPath %>paymaya.js', '<%= meta.sdkAssetsPath %>validation.js'],
				src : ['<%= meta.sdkAssetsPath %>paymaya.js'],
				dest : 'dist/sdk/paymaya-sdk.js'
			}
		},

		uglify : {
			dist : {
				files : {
					'dist/sdk/paymaya-sdk.min.js' : ['dist/sdk/paymaya-sdk.js']
				}
			}
		},

		//jshint : {
		//all : ['Gruntfile.js', '<%= meta.sdkPath %>*.js', '<%= meta.sdkPath %>**/*.js']
		//},

		cssmin : {
			target : {
				files : [{
					expand : true,
					cwd : '<%= meta.cssAssetsPath %>',
					src : ['*.css', '!*.min.css'],
					dest : '<%= meta.cssDistPath %>',
					ext : '.min.css'
				}]
			}
		},
		watch : {
			dev : {
				files : ['Gruntfile.js', '<%= meta.sdkAssetsPath %>*.js', '<%= meta.sdkDistPath %>*.js', '*.html'],
				//tasks : ['jshint', 'concat:dist'],
				tasks : ['concat:dist'],
				options : {
					atBegin : true
				}
			},
			min : {
				files : ['Gruntfile.js', '<%= meta.sdkAssetsPath %>*.js', '<%= meta.sdkDistPath %>*.js', '*.html'],
				//tasks : ['jshint', 'concat:dist', 'uglify:dist'],
				tasks : ['concat:dist', 'uglify:dist'],
				options : {
					atBegin : true
				}
			}
		},

	});

	//grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-cssmin');

	//grunt.registerTask('default', ['jshint', 'concat', 'uglify']);
	grunt.registerTask('default', ['concat', 'uglify', 'cssmin']);
};
