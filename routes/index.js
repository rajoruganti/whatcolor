var async = require('async');
var path = require('path');
var imgDir = path.join(__dirname,  '../public/data/');
var tplPath = path.join(__dirname, '../public/tpl/');

var fs = require('fs');
var config = require('../config');
var request= require('request');
var palette = require('palette')
  , Canvas = require('canvas')
  , Image = Canvas.Image
  , canvas = new Canvas
  , ctx = canvas.getContext('2d')
  , out = '/tmp/out1.png'
  , n=3;
var colors,
theColor="#fff";

//db
/*
Added mongodb-2.2 to application whatcolor
MongoDB 2.2 database added.  Please make note of these credentials:
   Root User:     admin
   Root Password: b56RuQBlPeaw
   Database Name: whatcolor
Connection URL: mongodb://$OPENSHIFT_MONGODB_DB_HOST:$OPENSHIFT_MONGODB_DB_PORT/
*/
/*
rockmongo-1.1: URL: https://whatcolor-cod3.rhcloud.com/rockmongo/

rockmongo-1.1 added.  Please make note of these MongoDB credentials again:
   RockMongo User    : admin
   RockMongo Password: b56RuQBlPeaw
URL: https://whatcolor-cod3.rhcloud.com/rockmongo/
*/
var mongo = require('mongodb');
var Server = mongo.Server,
	Db = mongo.Db,
	BSON = mongo.BSONPure;
	var dbUser = process.env.OPENSHIFT_MONGODB_DB_USERNAME;
	var dbPass = process.env.OPENSHIFT_MONGODB_DB_PASSWORD;	
	server = new Server(process.env.OPENSHIFT_MONGODB_DB_HOST||'localhost', process.env.OPENSHIFT_MONGODB_DB_PORT||27017, {auto_reconnect: true});
	db = new Db('whatcolor', server);
	db.open(function(err, db) {
	    if(!err) {
	        console.log("Connected to 'whatcolor' database on:"+process.env.NODE_ENV);
			if(process.env.NODE_ENV == "production"){
				db.admin().authenticate(dbUser, dbPass, function(de , db){
				     if(de){
				         console.log("could not authenticate");
				     }else {
				    console.log('auth connected to database :: ' );
				     }
				     });
			}
			
	        db.collection('colors', {strict:true}, function(err, collection) {
	            if (err) {
	                console.log("The 'colors' collection doesn't exist. Creating it with sample data...");
	                //populateDB();
	            }
	        });
	    }
		else{
			console.log("error connecting to mongo - returning ");
			//res.send("No db");
		}
	});


exports.home = function(req,res){
	var template  = require('swig');
	template.init({
	  allowErrors: false,
	  autoescape: true,
	  cache: true,
	  encoding: 'utf8',
	  filters: {},
	  root: "public/tpl",
	  tags: {},
	  extensions: {},
	  tzOffset: 0
	});
	var colorNow;
	async.series([
		function(callback){
			db.collection('colors', function(err, collection) {
				collection.find().sort({timestamp:-1}).limit(1).toArray(function(err,items){
					if(err){
						console.log(err);
						res.send("error fetching color");
						callback();
					}
					colorNow=items[0];
					callback();
				});
			});
		}
	],function(err,result){
		console.log(colorNow);
		console.log(colorNow.color);
		var tmpl = template.compileFile(tplPath+'index.html');
		renderedHTML= tmpl.render({
			color:colorNow.color
		});
		res.send(renderedHTML);
	});
	
	
};


exports.getColor = function(req,res){
    var template  = require('swig');
	template.init({
	  allowErrors: false,
	  autoescape: true,
	  cache: true,
	  encoding: 'utf8',
	  filters: {},
	  root: "public/tpl",
	  tags: {},
	  extensions: {},
	  tzOffset: 0
	});
	var conf = new config();
	console.log(conf.host);
	var imgUrl,imgPath;
	var timestamp = new Date().getTime();
	var colors;
	
	//- output color in box
	async.series([
		// - fetch screenshot url from urlshot.toyroute.com 
		function(callback){
			var u = "http://urlshot.toyroute.com/shoot"
			var moodUrl = "http://www.reuters.com/news/pictures";
			var request = require('request');
			var ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36";
			request({ method: 'POST' ,uri: u, body:"url="+moodUrl,headers: {'User-Agent': ua, 'content-type' : 'application/x-www-form-urlencoded'}}, function (error, response, body) {
				if(error){
			        console.log(error);
				//	res.send({doc:orgText,xtext:"<html><body><div>"+error.stack+"</div></body</html>"});
					res.send("error");
					callback();
				} else {
					//store the retreived text in a var
					var obj = JSON.parse(body);
					imgUrl = obj.shot;	
					//console.log(response);
					console.log("got shot url:"+imgUrl);
					callback();
				}

			});
		},
		// fetch the image and store it locally
		function(callback){
			imgPath = imgDir+"_"+timestamp+".png";
			console.log("fetching image:"+imgUrl+" - and saving to:"+imgPath);
			var r = request(imgUrl).pipe(fs.createWriteStream(imgPath));
			r.on('close', function(){
				console.log("saved image");
				callback();
			});
			
		
		},
		function(callback){
			console.log("trying to palette:"+imgPath);
			// canvas - cairo - openshift - crazy - see install script
			

			var img = new Image;
			img.onload = function(){
			  canvas.width = img.width;
			  canvas.height = img.height + 50;
			  ctx.fillStyle = 'white';
			  ctx.fillRect(0, 0, canvas.width, canvas.height);
			  ctx.drawImage(img, 0, 0);
			  colors = paintPalette();
			  console.log(colors);
				//save();
				//callback();
				
			};
			img.src=imgPath;
			callback();
			
			
		},
		// add the colors
		function(callback){
			console.log("finding the color");
			var Chromath = require('chromath');
			//theColor = Chromath.additive(colorStr).toString();
			//theColor=Chromath.additive('#F00', '#0F0').toString();
			console.log("found");
			theColor = Chromath.additive(colors[0],colors[1],colors[2]).toString();
			callback();
		}
		
	], function(err,result){
		console.log("sending");
		var tmpl = template.compileFile(tplPath+'index.html');
		renderedHTML= tmpl.render({
		   color:theColor
		});
		res.send(renderedHTML);
	});
	
};
function paintPalette() {
	console.log("in paint:"+canvas);
  var x = 0;
  var colors = palette(canvas, n);
  var str="";
  var colorStr = [];
  colors.forEach(function(color){
    var r = color[0]
      , g = color[1]
      , b = color[2]
      , val = r << 16 | g << 8 | b;
      str = '#' + val.toString(16);
	colorStr.push(str);
	//console.log(str);
	
   // ctx.fillStyle = str;
   // ctx.fillRect(x += 31, canvas.height - 40, 30, 30);
  });
//console.log(str);
return(colorStr);
}

function save() {
	console.log("insave");
  fs.writeFile(out, canvas.toBuffer(), function(err){
    if (err) throw err;
    console.log('saved %s', out);
  });
return;
}