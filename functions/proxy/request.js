import http from 'http';
import { Buffer } from 'buffer';

export default class {
  constructor(event = {}) {
    this.event = event;
  }

  get body() {
    return this.event.body || '';
  }

  get method() {
    return (this.event.headers['X-Request-Method'] || 'GET');
  }

  get path() {
    return (this.event.headers['X-Request-Path'] || '/');
  }

  get hostname() {
    const host = this.event.headers['X-Request-Host'];
    if (!host) throw new Error('integration missing X-Request-Host header');
    return host;
  }

  get port() {
    return parseInt(this.event.headers['X-Request-Port'] || 80, 10);
  }

  get contentType() {
    return this.event.headers['Content-Type'] || 'application/json';
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
        'Content-Length': Buffer.byteLength(body, 'utf8'),
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
        req.write(body);
        req.end();
      } catch (err) {
        console.error(`[Error] "${err.toString()}"\n${JSON.stringify(this.event)}`);
        console.trace(err);
        reject(err);
      }
    });
  }
}
