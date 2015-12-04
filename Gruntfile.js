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

		uglify : {
			dist : {
				files : {
					'dist/sdk/paymaya-sdk.min.js' : ['assets/sdk/paymaya-sdk.js']
				}
			}
		},

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
				tasks : ['concat:dist'],
				options : {
					atBegin : true
				}
			},
			min : {
				files : ['Gruntfile.js', '<%= meta.sdkAssetsPath %>*.js', '<%= meta.sdkDistPath %>*.js', '*.html'],
				tasks : ['concat:dist', 'uglify:dist'],
				options : {
					atBegin : true
				}
			}
		},

	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-cssmin')
	grunt.registerTask('default', ['uglify', 'cssmin']);
};
