import tls from 'tls';

export function sendMail({ from, to, subject, text, user, pass }) {
  return new Promise((resolve, reject) => {
    const socket = tls.connect(465, 'smtp.gmail.com', { rejectUnauthorized: false });
    let buffer = '';
    let expectedCode = 220;
    let step = 0;
    let closed = false;

    function write(cmd) {
      socket.write(cmd + '\r\n');
    }

    function fail(err) {
      if (!closed) { closed = true; socket.end(); }
      reject(err);
    }

    function nextStep() {
      step++;
      switch (step) {
        case 1: expectedCode = 250; write('EHLO localhost'); break;
        case 2: expectedCode = 334; write('AUTH LOGIN'); break;
        case 3: expectedCode = 334; write(Buffer.from(user, 'utf-8').toString('base64')); break;
        case 4: expectedCode = 235; write(Buffer.from(pass, 'utf-8').toString('base64')); break;
        case 5: expectedCode = 250; write(`MAIL FROM:<${from}>`); break;
        case 6: expectedCode = 250; write(`RCPT TO:<${to}>`); break;
        case 7: expectedCode = 354; write('DATA'); break;
        case 8: expectedCode = 250;
          write([
            `From: ${from}`,
            `To: ${to}`,
            `Subject: ${subject}`,
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=UTF-8',
            'Content-Transfer-Encoding: 7bit',
            '',
            text,
          ].join('\r\n') + '\r\n.');
          break;
        case 9: expectedCode = 221; write('QUIT'); break;
        case 10:
          if (!closed) { closed = true; socket.end(); }
          resolve();
          break;
      }
    }

    socket.on('data', (data) => {
      buffer += data.toString();
      while (buffer.includes('\r\n')) {
        const idx = buffer.indexOf('\r\n');
        const line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        const code = parseInt(line.slice(0, 3), 10);
        if (line[3] === ' ') {
          if (code !== expectedCode) {
            fail(new Error(`SMTP error ${code}: ${line.slice(4)}`));
            return;
          }
          nextStep();
        }
      }
    });

    socket.on('error', fail);
    socket.on('close', () => {
      if (step < 10) fail(new Error('SMTP connection closed unexpectedly'));
    });
  });
}
