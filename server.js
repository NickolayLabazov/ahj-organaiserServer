const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const path = require('path');
const fs = require('fs');
const uuid = require('uuid');
const { streamEvents } = require('http-event-stream');
const Router = require('koa-router');
const moment = require('moment');
const WS = require('ws');

const app = new Koa();
const server = http.createServer(app.callback());
const port = process.env.PORT || 7075;
const publ = path.join(__dirname, '/public');
const koaStatic = require('koa-static');

const wsServer = new WS.Server({ server });
const router = new Router();

app.use(koaBody({
  urlencoded: true,
  multipart: true,
}));

app.use(koaStatic(publ));


app.use(async (ctx, next) => {

  ctx.response.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': ['DELETE', 'PUT', 'PATCH'],
  });

  const origin = ctx.request.get('Origin');
  if (!origin) {
    return await next();
  }
  const headers = { 'Access-Control-Allow-Origin': '*' };
  if (ctx.request.method !== 'OPTIONS') {
    ctx.response.set({ ...headers });
    try {
      return await next();
    } catch (e) {
      e.headers = { ...e.headers, ...headers };
      throw e;
    }
  }
  if (ctx.request.get('Access-Control-Request-Method')) {
    ctx.response.set({
      ...headers,
      'Access-Control-Allow-Methods': 'GET, POST, PUD, DELETE, PATCH',
    });
    if (ctx.request.get('Access-Control-Request-Headers')) {
      ctx.response.set('Access-Control-Allow-Headers', ctx.request.get('Access-Control-Request-Headers'));
    }
    ctx.response.status = 204;
  }
});



const messages = [];
const names = [];
let online = [];

wsServer.on('connection', (ws, req) => {
  const errCallback = (err) => {
    if (err) {
      // TODO: handle error
    }
  };

  
  ws.on('message', async (msg) => {


    let load = false;
    let loadFile = {name: '', blobType: '', type: 'loadEnd'};
    let file = null;

    
    let message = {type: null};
    try{
      message = JSON.parse(msg);
    } catch(e){
      file = msg;
      
    }
    
     console.log(msg);
   
   
   
   
    if (message.type === 'message') {
      const time = moment().format('hh:mm:ss DD.MM.YY');
      message.time = String(time);
      messages.push(message);
      Array.from(wsServer.clients)
        .filter(o => o.readyState === WS.OPEN)
        .forEach(o => o.send(JSON.stringify(message)));
    } else if(message.type === 'loadStart'){
      loadFile.blobType = message.blobType;
      loadFile.name = uuid.v4();
      load = true;
      ws.send(JSON.stringify({type: 'loadStart', status: 'ok'}));
    }


if(load){
  try {
    const link = await new Promise((resolve, reject) => {
    //  const filename = uuid.v4();
    const filename =  loadFile.name;
      const newPath = path.join(publ, filename);
      console.log(newPath);
      fs.writeFile(newPath, file, (err) => {
        if (err) {
          console.log(err);
          reject(err);
          return;
        }

        resolve(filename);
      });
      ws.send(JSON.stringify(loadFile));
    });
  } catch (e) {
    console.log(e);
  } 
}


  
 
/*  const  file = msg;
 
  try {
    const link = await new Promise((resolve, reject) => {
      const filename = uuid.v4();
      const newPath = path.join(publ, filename);
      console.log(newPath);
      fs.writeFile(newPath, file, (err) => {
        if (err) {
          console.log(err);
          reject(err);
          return;
        }

        resolve(filename);
      });
      ws.send(filename);
    });
  } catch (e) {
    console.log(e);
  } */

    // ws.send('response', errCallback);
  });
//  ws.send('welcome', errCallback);
});



server.listen(port);
