#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

if(require.main == module) {
    program
        .option('-c, --checks [json-file] ', 'Path to checks json file; [checks.json]', assertFileExists, CHECKSFILE_DEFAULT)
        .option('-f, --file [file]', 'Path to file; [index.html]', assertFileExists, HTMLFILE_DEFAULT)
        .option('-u, --url [url] ', 'URL to index.html; [http://example.com/index.html]','')
        .parse(process.argv);

      var rest = require('restler');
      var url = program.url.toString();
      rest.get(url).on('complete', function(result) {
	if (result instanceof Error) {
	  var checkJson = checkHtmlFile(program.file, program.checks);
	  var outJson = JSON.stringify(checkJson, null, 4);
	} else {
	  console.log("Retriving " + url);
	  var file = "/tmp/grader.tmp";
	  fs.writeFileSync(file,result,'utf-8');
	  var checkJson = checkHtmlFile(file, program.checks);
	  fs.unlink(file);
	  var outJson = JSON.stringify(checkJson, null, 4);
	}
      	console.log(outJson);
      });
//    process.exit(1);
//    var checkJson = checkHtmlFile(program.file, program.checks);
//    var outJson = JSON.stringify(checkJson, null, 4);
//    console.log(outJson);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
