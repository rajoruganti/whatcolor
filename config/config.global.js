var config = module.exports = {};

/*
var config ={};

module.exports = config;
module.exports = function(){
    switch(process.env.NODE_ENV){
        case 'development':
            return {"host":"127.0.0.1:8080"};

        case 'production':
            return {"host":"whatcolor-cod3.rhcloud.com"};

        default:
            return {"host":"127.0.0.1:8080"};
    }
	
};

*/

config.env = 'development';
config.host = '127.0.0.1:8080';
config.moodUrls={};
config.moodUrls.abc="https://twitter.com/abc/media/grid";
config.moodUrls.reuters = "https://twitter.com/reuters/media/grid";
config.moodUrls.ap="https://twitter.com/AP/media/grid";
config.moodUrls.hindu="https://twitter.com/the_hindu/media/grid";
config.moodUrls.jazeera="https://twitter.com/AlJazeera/media/grid";
config.moodUrls.khabor="https://assamiyakhabor.com";
//config.moodUrls.google = "http://google.com";
//config.moodUrls.g2 = "http://google.com";

//["https://twitter.com/abc/media/grid","https://twitter.com/reuters/media/grid","https://twitter.com/AP/media/grid"];

//mongo database
//config.mongo = {};
//config.mongo.uri = process.env.MONGO_URI || 'localhost';
//config.mongo.db = 'example_dev';