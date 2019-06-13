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
const port = process.env.PORT || 7070;
const publ = path.join(__dirname, '/public');
const koaStatic = require('koa-static');

const wsServer = new WS.Server({ server });
const router = new Router();

app.use(async (ctx, next) => {
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
  
   // const { file } = msg.files;
   ws.send(msg);
     const  file = msg;
    //  ws.send(msg);

      console.log(msg);
      
      const link = await new Promise((resolve, reject) => {
        const oldPath = file.path;
        console.log(oldPath);
        const filename = uuid.v4();
        const newPath = path.join(publ, filename);
        const callback = error => reject(error);
        const readStream = fs.createReadStream(oldPath);
        const writeStream = fs.createWriteStream(newPath);
        readStream.on('error', callback);
        writeStream.on('error', callback);
        readStream.on('close', () => {
          console.log('close');
        //  fs.unlink(oldPath, callback);
          resolve(filename);
        });
        readStream.pipe(writeStream);
      });
    //  ctx.response.body = link;
    //  catalog = fs.readdirSync(publ);
    











   // const message = JSON.parse(msg);
  //  console.log(msg);
/*     if (message.type === 'input') {
      if (names.indexOf(message.name) > -1) {
        ws.send(JSON.stringify({
          type: 'input',
          name: true,
        }));
      } else {
        ws.send(JSON.stringify({
          type: 'input',
          name: false,
        }));
      }
    } else if (message.type === 'registration') {
      names.push(message.name);
      console.log(names);
      ws.send(JSON.stringify({
        type: 'input',
        name: true,
      }));
    } else if (message.type === 'message') {
      const time = moment().format('hh:mm:ss DD.MM.YY');
      message.time = String(time);
      messages.push(message);

      Array.from(wsServer.clients)
        .filter(o => o.readyState === WS.OPEN)
        .forEach(o => o.send(JSON.stringify(message)));
    } else if (message.type === 'messageAll') {
      ws.send(JSON.stringify({
        type: 'messageAll',
        message: messages,
      }));
    } else if (message.type === 'online') {
      online.push(message.name);
    } */
    console.log(msg);
   //console.log(msg.name);

    /*  Array.from(wsServer.clients)
  .filter(o => o.readyState === WS.OPEN)
  .forEach(o => o.send('some message')); */


    // ws.send('response', errCallback);
  });
  ws.send('welcome', errCallback);
});


/* app.use(koaBody({
  urlencoded: true,
  multipart: true,
})); */

/* app.use(koaStatic(publ));

let catalog = fs.readdirSync(publ);

app.use(async (ctx) => {
  ctx.response.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': ['DELETE', 'PUT', 'PATCH'],
  });
  if (ctx.request.method === 'OPTIONS') {
    ctx.response.body = '';
  }

  if (ctx.request.method === 'DELETE') {
    const name = ctx.request.querystring;
    fs.unlinkSync(`./public/${name}`);
    catalog = fs.readdirSync(publ);
    ctx.response.status = 200;
  } else if (ctx.request.method === 'GET') {
    ctx.response.body = JSON.stringify(catalog);
  } else if (ctx.request.method === 'POST') {
    const { file } = ctx.request.files;
    console.log(ctx.request.files);
    const link = await new Promise((resolve, reject) => {
      const oldPath = file.path;
      const filename = uuid.v4();
      const newPath = path.join(publ, filename);
      const callback = error => reject(error);
      const readStream = fs.createReadStream(oldPath);
      const writeStream = fs.createWriteStream(newPath);
      readStream.on('error', callback);
      writeStream.on('error', callback);
      readStream.on('close', () => {
        console.log('close');
        fs.unlink(oldPath, callback);
        resolve(filename);
      });
      readStream.pipe(writeStream);
    });
    ctx.response.body = link;
    catalog = fs.readdirSync(publ);
  }
}); */

server.listen(port);
