let http = {
  request: (options, cb) => {
    let events = {};

    let ctrl = {
      statusCode: http.__resp,
      headers: http.__headers,
      on: (ev, fn) => { events[ev] = fn },
      setEncoding: jest.fn(),
      write: jest.fn(),
      end: jest.fn(),
    };

    cb(ctrl);

    process.nextTick(() => {
      events.data(http.__body);
      if (http.__err) {
        events.error(http.__err);
      } else {
        events.end();
      }
    });

    return ctrl;
  }
}

http.__setHeaders = (headers) => {
  http.__headers = headers;
}

http.__setErr = (err) => {
  http.__err = err;
}

http.__setResp = (resp) => {
  http.__resp = resp;
}

http.__setBody = (body) => {
  http.__body = body;
}

export default http;
