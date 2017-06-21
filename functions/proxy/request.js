import http from 'http';
import { Buffer } from 'buffer';

export default class {
  constructor({ body = {}, method = 'GET', path = '/',
    hostname, port = 80, contentType = 'application/json' }) {
    this.method = method;
    this.body = body;
    this.path = path;
    this.hostname = hostname;
    this.port = parseInt(port, 10);
    this.contentType = contentType;
  }

  get options() {
    const { hostname, port, path, method, contentType, body } = this;
    return {
      port,
      path,
      method,
      hostname,
      headers: {
        'Content-Type': contentType,
        'Content-Length': Buffer.byteLength(JSON.stringify(body), 'utf8'),
      },
    };
  }

  send() {
    return new Promise((resolve, reject) => {
      try {
        const { options, body } = this;
        const req = http.request(options, (res) => {
          const { statusCode, headers } = res;
          let chunks = '';
          res.setEncoding('utf8');
          res.on('data', (chunk) => { chunks += chunk; });
          res.on('end', () => { resolve({ statusCode, headers, body: chunks }); });
        });
        req.on('error', (err) => { reject(err); });
        req.write(JSON.stringify(body));
        req.end();
      } catch (err) {
        console.error(`[Error] "${err.toString()}"\n${JSON.stringify(this.options)}`);
        console.trace(err);
        reject(err);
      }
    });
  }
}
