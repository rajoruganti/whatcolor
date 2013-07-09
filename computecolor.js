var async = require('async');
var path = require('path');
var imgDir = path.join(__dirname,  'public/data/');
var mongo = require('mongodb');

var fs = require('fs');
var config = require('./config');
var request= require('request');
var palette = require('palette')
  , Canvas = require('canvas')
  , Image = Canvas.Image;
 
var theColors={};

/*
Added mongodb-2.2 to application whatcolor
MongoDB 2.2 database added.  Please make note of these credentials:
   Root User:     admin
   Root Password: C-apTvaM76an
   Database Name: whatcolor
Connection URL: mongodb://$OPENSHIFT_MONGODB_DB_HOST:$OPENSHIFT_MONGODB_DB_PORT/
*/
var Server = mongo.Server,
	Db = mongo.Db,
	BSON = mongo.BSONPure;
	console.log("env.node_env="+process.env.NODE_ENV);
	var dbUser = process.env.OPENSHIFT_MONGODB_DB_USERNAME;
	var dbPass = process.env.OPENSHIFT_MONGODB_DB_PASSWORD;	
	console.log(dbUser, dbPass);
	server = new Server(process.env.OPENSHIFT_MONGODB_DB_HOST||'localhost', process.env.OPENSHIFT_MONGODB_DB_PORT||27017, {auto_reconnect: true});
	db = new Db('whatcolor', server,{w:1});
	db.open(function(err, db) {
	    if(!err) {
	        console.log("Connected to 'whatcolor' database");
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
			console.log("error connecting to mongo - returning:"+err);
			//res.send("No db");
		}
	});


    
	//var conf = new config();
	console.log(config.host);
	var imgUrl,imgPaths=[];
	var timestamp = new Date().getTime();

	var imgUrls ={};
	var imgPaths = {};
	

	console.log(config.moodUrls);
	var request = require('request');
	var ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36";
	var u = "http://urlshot.toyroute.com/shoot"
	//var moodUrl = "http://cnn.com";
	var moodUrls = config.moodUrls;
	async.forEach(Object.keys(moodUrls), function(name, callback) { 
		//The second argument (callback) is the "task callback" for a specific moodUrl
		var moodUrl = moodUrls[name];
		
//		console.log("fetching shot for:"+moodUrl);
			request({ method: 'POST' ,uri: u, body:"url="+moodUrl,headers: {'User-Agent': ua, 'content-type' : 'application/x-www-form-urlencoded'}}, function (error, response, body) {
				if (error) return next(error);
				 //console.log(body);
					//store the retreived text in a var
					var obj = JSON.parse(body);
					imgUrl = obj.shot;	
					//console.log(response);
//					console.log("got shot url:"+imgUrl+" for moodUrl:"+moodUrl);
					imgUrls[name]=imgUrl;
		
					// fetch the image and store it locally
					
					
					
					imgPaths[name] = imgDir+name+"_"+timestamp+".png";
					console.log("fetching image:"+imgUrl+" - and saving to:"+imgPaths[name]);
					var r = request(imgUrl).pipe(fs.createWriteStream(imgPaths[name]));
					r.on('close', function(){
						
						callback();
					});


			});
			//callback();

	    }, function(err) {
	        if (err) {
			console.log(err);
				return next(err);
			}
			async.forEach(Object.keys(imgPaths), function(name, callback) { 
				var canvas = new Canvas
				  , ctx = canvas.getContext('2d')
				  , out = '/tmp/out1.png'
				  , n=3;
				var imgPath = imgPaths[name];
				console.log(imgPath);
//				console.log("trying to palette:"+imgPath);
				// canvas - cairo - openshift - crazy - see install script


				var img = new Image;
				img.onload = function(){
				  canvas.width = img.width;
				  canvas.height = img.height + 50;
				  ctx.fillStyle = 'white';
				  ctx.fillRect(0, 0, canvas.width, canvas.height);
				  ctx.drawImage(img, 0, 0);
				  colors = paintPalette(canvas,n);
				  //console.log(colors);
				  theColors[name]=addColors(colors);
					//callback();

				};
				img.src=imgPath;
				
				callback();
			},function(err){
				 if (err) {
					console.log(err);
					return next(err);
					}
				
				//var Chromath = require('chromath');
				//theColor = Chromath.additive(colorStr).toString();
				//theColor=Chromath.additive('#F00', '#0F0').toString();
				var colorSet=theColors;
				//console.log("before:"+theColors);
				var pageColors=["#ffffff"];
				for(var key in theColors) {
					console.log("key " + key + " has value " + theColors[key]);
				    pageColors.push(theColors[key]);
				}
				//console.log("after:"+colorSet);
				console.log(theColors);
				//theColor = Chromath.additive(theColors[0],theColors[1],theColors[2]).toString();
				theColor = addColors(pageColors);
				console.log("and finally:"+theColor+" from:"+colorSet);
				// delete the files
				for(var name in imgPaths){
					fs.unlink(imgPaths[name], function (err) {
					  if (err) throw err;
					  console.log('successfully deleted:'+imgPaths[name]);
					});
				}
				
				var xset = [
					{"colors":theColors, "color":theColor, "timestamp":timestamp},
				];
				db.collection('colors', function(err, collection) {
					collection.insert(xset, {safe:true}, function(err, result) {
						if(err){
							console.log("error saving to mongo:"+err);
							process.exit();
						}
						else{
							console.log("saved request to db:"+result[0]._id);
							requestId = result[0]._id;
							console.log("got _id:"+requestId);
							console.log("done");
							process.exit();
						}
					});
					
				});

			});
   
	    });

			
	
	
function paintPalette(canvas,n) {
//	console.log("in paint:"+canvas);
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

function addColors(colors) {

//	console.log("adding colors");
	var Chromath = require('chromath');
	//theColor = Chromath.additive(colorStr).toString();
	//theColor=Chromath.additive('#F00', '#0F0').toString();
	//theColor = Chromath.additive(colors[0],colors[1],colors[2]).toString();
	var colorStr="'" + colors.join("','") + "'";
//	console.log(colorStr);
	//colorStr="'#fbfbfb','#2d3541','#d63f37','#eda51d'";
	theColor = Chromath.additive.apply(null,colors).toString();
//	console.log("added and got:"+theColor);
	
	return(theColor);
}