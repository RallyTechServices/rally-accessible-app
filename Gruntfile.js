module.exports = function(grunt) {
  require('grunt');
  
  var config = grunt.file.readJSON('config.json');
  config.js_files = grunt.file.expand( 'src/javascript/*.js' );
  config.css_files = grunt.file.expand( 'src/style/*.css' );
  
  config.js_contents = " ";
  for (var i=0;i<config.js_files.length;i++) {
    grunt.log.writeln( config.js_files[i]);
    config.js_contents = config.js_contents + "\n" + grunt.file.read(config.js_files[i]);
  }
  // grunt.log.writeln( config.js_contents );
  
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    template: {
        dev: {
            src: 'templates/App-debug-tpl.html',
            dest: 'App-debug.html',
            engine: 'underscore',
            variables: config
        },
        prod: {
            src: 'templates/App-tpl.html',
            dest: 'deploy/App.html',
            engine: 'underscore',
            variables: config
        }
    }
  });

  //load
  grunt.loadNpmTasks('grunt-templater');

  // default creates an html file that can be copied and pasted into a Rally app 
  grunt.registerTask('default', ['template:prod']);
  // debug creates an html file that can be loaded on its own without copying and pasting into Rally
  grunt.registerTask('debug', ['template:dev']);
};
