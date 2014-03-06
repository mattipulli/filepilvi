var encryptor = require('./lib/file-encryptor.js');
var fs = require('fs');
var formidable = require('./lib/formidable'),
    http = require('http'),
    util = require('util');
	
var file_file;
var key_file;

server = http.createServer(function(req, res) {
  if (req.url == '/') {
    res.writeHead(200, {'content-type': 'text/html'});
    res.end(
      '<form action="./upload" enctype="multipart/form-data" method="post">'+
      '<input type="text" name="key"><br>'+
      '<input type="file" name="upload" multiple="multiple"><br>'+
      '<input type="submit" value="Upload">'+
      '</form>'
    );
  } else if (req.url == '/upload') {
		uploadFile(res, req);
  } else {
    res.writeHead(404, {'content-type': 'text/plain'});
    res.end('404');
  }
});
server.listen(3333);

function uploadFile(res, req){
	var form = new formidable.IncomingForm(),
        files = [],
        fields = [];

    form.uploadDir = "./uploads";

    form
      .on('field', function(field, value) {
		if(field === 'key'){
			key_file=value;
		}
        fields.push([field, value]);
      })
      .on('file', function(field, file) {
		file_file=file.path;
        files.push([field, file]);
      })
      .on('end', function() {
		var r=Math.floor((Math.random()*1000000)+1); ;
		encryptor.encryptFile(file_file, "uploads/encrypt_"+r, key_file, function(err) {
			fs.unlink(file_file, function(){});
			res.writeHead(200, {'content-type': 'text/html'});
			res.end("<span>File:"+r+"</span>");
		});
      });
    form.parse(req);
}

function downloadFile(){

}
