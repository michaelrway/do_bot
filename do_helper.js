var https = require('https');

function doApi(config){
  /// GENERAL API REQUEST
  function doRequest(method, api, postdata, cb){
    if (arguments.length == 3) {
      if (Object.prototype.toString.call(postdata) == "[object Function]") {
        cb = postdata;
      }
    }
    var options = {
      hostname: 'api.digitalocean.com',
      port: 443,
      path: api,
      method: method,
      headers: {
          'Authorization': 'Bearer ' + config.token,
          'Content-Type': 'application/json'
      },
    };
    var req = https.request(options, function(response) {
      var str = '';
      response.on('data', function(d) {
        str += d;
      });
      response.on('end', function () {
        cb(null, JSON.parse(str));
      });
    });
    req.on('error', function(e) {
      cb(e);
    });
    if(method !== 'GET'){
      req.write(postdata);
    }
    req.end();
  };

  /// GET REQUEST
  function doGet(api, cb){
    doRequest('GET', api, function(err, resp){
      if(err){
        cb(err);
      } else {
        cb(null, resp);
      }
    });
  }
  /// POST REQUEST
  function doPost(api, postdata, cb){
    doRequest('POST', api, postdata, function(err, resp){
      if(err){
        cb(err);
      } else {
        cb(null, resp);
      }
    });
  }
  /// DELETE REQUEST
  function doDelete(api, cb){
    doRequest('DELETE', api, '', function(err, resp){
      if(err){
        cb(err);
      } else {
        cb(null, resp);
      }
    });
  };
  /// DROPLET CHECK AND PARSE
  function dropCheck(id, cb){
    doGet('/v2/droplets/'+id, function(err, callback){
      if(callback.droplet){
        if(callback.droplet.networks){
          if(callback.droplet.networks.v4[0]){
            if(callback.droplet.networks.v4[0].ip_address){
              cb(null, callback);
            }else{
              dropCheck(id, cb);
            }
          }else{
            dropCheck(id, cb);
          }
        }else{
          dropCheck(id, cb);
        }
      }else{
        dropCheck(id, cb);
      }
    });
  };

  this.dropletList = function(cb){
    doGet('/v2/droplets?per_page=1000', function(err, resp) {
      if(err){
        cb(err);
      }else{
        cb(null, resp);
      }
    });
  };
  this.imageList = function(cb){
    doGet('/v2/images?per_page=1000', function(err, resp){
      if(err){
        cb(err);
      }else{
        cb(null, resp);
      }
    });
  };
  this.userImages = function(cb){
    doGet('/v2/images?private=true&per_page=1000', function(err, resp){
      if(err){
        cb(err);
      }else{
        cb(null, resp);
      }
    });
  };
  this.dropById = function(id, cb){
    dropCheck(id, function(err, resp){
      if(err){
        cb(err);
      }else{
        cb(null, resp);
      }
    });
  };
  this.getKeys = function(id){
    doGet('/v2/account/keys', function(resp){
      console.log(resp);
    });
  };
  this.newDroplet = function(droplet, callback){
    var postdata = {
      "name": droplet.name,
      "region": droplet.region,
      "size": droplet.size,
      "image": droplet.image
    };

    if(droplet.keys){
      postdata.ssh_keys = droplet.keys;
    }

    postdata = JSON.stringify(postdata);
    doPost('/v2/droplets', postdata, function(err, data){
      console.log('new server:', data);
      dropCheck(data.droplet.id, function(cb){
        callback(cb);
      });
    });
  };
  this.deleteDroplet = function(id, cb){
    var api = '/v2/droplets/'+id;
    doDelete(api, function(err, data){
      if(err){
        cb(err);
      }else{
        cb(null, data);
      }
    });
  };

};

module.exports = doApi;
