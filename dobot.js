var Botkit = require('botkit'),
    DoApi = require('./do_helper');

var controller = Botkit.slackbot({
  debug: false
});

controller.spawn({
  token: process.env.token,
}).startRTM()

var doApi = new DoApi(
  {
    token:process.env.doapi,
  }
);

controller.hears(['my servers'],'direct_message,direct_mention,mention',function(bot,message) {
    doApi.dropletList(function(err, resp){
      if(err){
        bot.reply(message, 'Could not get server list.');
      }else{
        var attachments = []
        var attachment = {
          fields: [],
        }

        for (var i = 0; i < resp.droplets.length; i++) {
          attachment.fields.push( {
              "title": resp.droplets[i].name,
              "value": resp.droplets[i].size.slug + ' | ' + resp.droplets[i].region.slug ,
              "short": true
          });
          attachment.fields.push( {
              "value": '<http://' + resp.droplets[i].networks.v4[0].ip_address + '|' + resp.droplets[i].networks.v4[0].ip_address + '>',
              "short": true
          });
        }
        attachments.push(attachment);
        bot.reply(message, {
          text: 'Here are your servers',
          attachments: attachments,
        })
      }
    });
});

controller.hears(['my images'],'direct_message,direct_mention,mention',function(bot,message) {
  doApi.userImages(function(err, resp){
    if(err){
      bot.reply(message, 'Could not get image list.');
    }else{
      if(!resp.images.length){
        bot.reply(message, 'You have no images.');
      }else{
        console.log(resp.images);
      }
    }
  });
});

controller.hears(['images list'],'direct_message,direct_mention,mention',function(bot,message) {
  doApi.imageList(function(err, resp){
    if(err){
      bot.reply(message, 'Could not get image list.');
    }else{
      if(!resp.images.length){
        bot.reply(message, 'You have no images.');
      }else{
        var attachments = []
        var attachment = {
          fields: [],
        }

        for (var i = 0; i < resp.images.length; i++) {
          attachment.fields.push( {
              "title": resp.images[i].name,
              "short": true
          });
          attachment.fields.push( {
              "value": resp.images[i].slug,
              "short": true
          });
        }
        attachments.push(attachment);
        bot.reply(message, {
          text: 'Server images:',
          attachments: attachments,
        })
      }
    }
  });
});

controller.hears(['new server'],'direct_message,direct_mention,mention',function(bot,message) {
  bot.startConversation(message,function(err,convo) {

   convo.ask('What would you like to call this server?',function(response,convo) {
     convo.next();
   },{key:'name'});

   convo.ask('What region would you like your server in?',function(response,convo) {
     convo.next();
   },{key:'region'});

   convo.ask('What size would you like your server to be?',function(response,convo) {
     convo.next();
   },{key:'size'});

   convo.ask('What image would you like loaded on your server?',function(response,convo) {
     convo.next();
   },{key:'image'});

    convo.on('end', function(convo){
      var res = convo.extractResponses();
      doApi.newDroplet(res, function(data){
        bot.reply(message, 'Server is being created...')
      });
    });

 })
});

controller.hears(['delete server'],'direct_message,direct_mention,mention',function(bot,message) {
  bot.startConversation(message,function(err,convo) {
      var droplets;
      doApi.dropletList(function(err, resp){
         droplets = resp.droplets;
        if(err){
          bot.reply(message, 'Could not get server list.');
        }else{
          var servers = ''
          for (var i = 0; i < droplets.length; i++) {
            servers += '`' + droplets[i].name + '` ';
          }
          convo.ask('What is the name of the server you would like to delete? \n ' + servers,function(response,convo) {
        convo.next();
          },{key:'name'});
        }
      });
      convo.on('end', function(convo){
        var res = convo.extractResponses();
        for (var i = 0; i < droplets.length; i++) {
          if(res.name === droplets[i].name){
            doApi.deleteDroplet(droplets[i].id, function(err, resp){
              if(err){
                bot.reply(message, 'Could not delete ' + droplets[i].name);
              } else {
                bot.reply(message, droplets[i].name + ' was deleted.');
              }
            });
          }
        }
      });
  });
});
