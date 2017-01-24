'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const shortID = require('shortid');
const axios = require('axios');
var app = express();
const regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

app.set('port', process.env.PORT || 3001);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true }));

// app.use(express.static(__dirname + '/public'));
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
}

app.locals.urls = [];

app.get('/api/urls', (request, response) => {
  response.send({ urls: app.locals.urls });
});

app.get('/api/:shortid', (request, response) => {
  const { shortid } = request.params;

  const url = app.locals.urls.filter(url => url.shortID === shortid)[0];
  if (url) {
    url.count++;
    return response.redirect(301, url.longUrl);
  }
  return response.status(404);
});


app.post('/api/post', (request, response) => {
  let { url } = request.body;
  if(!regexp.test(url)) {
    return response.status(422).send({
    error: "No URL was provided"
  });}
  let obj = {};
  obj.shortID = shortID();
  obj.createdAt = Date.now();
  obj.longUrl = url;
  obj.count = 0;

  app.locals.urls.push(obj);
  response.status(201).json(obj.shortID);
});

// for testing to work
if (!module.parent) {
  app.listen(app.get('port'), () => {
    console.log(`URLs listening on ${app.get('port')}`);
  });
}

module.exports = app;
