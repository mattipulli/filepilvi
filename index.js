var encryptor = require('./lib/file-encryptor.js');
var fs = require('fs');
var formidable = require('./lib/formidable'),
    http = require('http'),
    util = require('util');
	
var file_file;
var key_file;

var index;
fs.readFile('html/etu.html', function (err, data) {
    if (err) {
        throw err;
    }
    index = data;
});


server = http.createServer(function(req, res) {
  if (req.url == '/') {
    res.writeHead(200, {'content-type': 'text/html'});
	res.end(index);
	
	/*res.write(
      '<form action="./encrypt" enctype="multipart/form-data" method="post">'+
      '<input type="text" name="key"><br>'+
      '<input type="file" name="upload" multiple="multiple"><br>'+
      '<input type="submit" value="Encrypt">'+
      '</form><br/><br/>'
    );
    res.end(
      '<form action="./decrypt" enctype="multipart/form-data" method="post">'+
      '<input type="text" name="key"><br>'+
      '<input type="file" name="upload" multiple="multiple"><br>'+
      '<input type="submit" value="Decrypt">'+
      '</form>'
    );*/
  } else if (req.url == '/encrypt') {
		encryptFile(res, req);
  }else if (req.url == '/decrypt') {
		decryptFile(res, req);
  }else if(req.url=='/uploads'){
		res.end();
  }else {
		res.writeHead(404, {'content-type': 'text/plain'});
		res.end('404');
  }
  
	process.on('uncaughtException', function (err) {
		res.end("Wrong key?");
	});
});
server.listen(3333);

function encryptFile(res, req){
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
			fs.chmodSync("uploads/encrypt_"+r, 0755);
			pushFile(res, req, "uploads/encrypt_"+r);
		});
      });
    form.parse(req);
}

function decryptFile(res, req){
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
		encryptor.decryptFile(file_file, "uploads/decrypt_"+r, key_file, function(err) {
			fs.unlink(file_file, function(){});
			fs.chmodSync("uploads/decrypt_"+r, 0755);
			pushFile(res, req, "uploads/decrypt_"+r);
		});
      });
    form.parse(req);
}

function pushFile(res, req, file){
	var filePath = file;
    var stat = fs.statSync(filePath);
    
    res.writeHead(200, {
        'Content-Type': 'application/octet-stream', 
        'Content-Length': stat.size
    });
    
    var readStream = fs.createReadStream(filePath);
    readStream.on('data', function(data) {
        res.write(data);
    });
    
    readStream.on('end', function() {
        res.end();        
    });
}
