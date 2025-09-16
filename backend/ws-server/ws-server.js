// ws-server.js
const http = require('http');
const WebSocket = require('ws');
const { spawn } = require('child_process');
const fs = require('fs/promises');
const os = require('os');
const path = require('path');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  let currentJob = null;

  ws.on('message', async (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      if (msg.type === 'edit' && typeof msg.tex === 'string') {
        if (currentJob && currentJob.child) {
          try { currentJob.child.kill('SIGKILL'); } catch (e) { /* ignore */ }
        }

        const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'tex-'));
        await fs.writeFile(path.join(tmp, 'main.tex'), msg.tex, 'utf8');

        const child = spawn('latexmk', ['-pdf', '-interaction=nonstopmode', '-halt-on-error', 'main.tex'], { cwd: tmp });
        currentJob = { child, tmp };

        child.stdout.on('data', d => {
          try { ws.send(JSON.stringify({ type: 'progress', text: d.toString() })); } catch (e) { /* ignore send errors */ }
        });
        child.stderr.on('data', d => {
          try { ws.send(JSON.stringify({ type: 'progress', text: d.toString() })); } catch (e) { /* ignore send errors */ }
        });

        const timeout = setTimeout(() => {
          try { child.kill('SIGKILL'); } catch (e) {}
          try { ws.send(JSON.stringify({ type: 'error', message: 'compile timeout' })); } catch (e) {}
        }, 30_000);

        child.on('close', async (code) => {
          clearTimeout(timeout);
          if (code !== 0) {
            try { ws.send(JSON.stringify({ type: 'error', message: 'compile failed (exit ' + code + ')' })); } catch (e) {}
            await fs.rm(tmp, { recursive: true, force: true });
            currentJob = null;
            return;
          }
          try {
            const pdfPath = path.join(tmp, 'main.pdf');
            const pdf = await fs.readFile(pdfPath);
            try {
              ws.send(JSON.stringify({ type: 'pdf', base64: pdf.toString('base64') }));
            } catch (e) {
      
              try { ws.send(JSON.stringify({ type: 'error', message: 'failed to send pdf over websocket' })); } catch (e) {}
            }
          } catch (e) {
            try { ws.send(JSON.stringify({ type: 'error', message: 'could not read output PDF: ' + String(e) })); } catch (err) {}
          } finally {
            try { await fs.rm(tmp, { recursive: true, force: true }); } catch (e) { /* ignore cleanup errors */ }
            currentJob = null;
          }
        });
      }
    } catch (e) {
      try { ws.send(JSON.stringify({ type: 'error', message: String(e) })); } catch (err) {}
    }
  });

  ws.on('close', () => {
    if (currentJob && currentJob.child) {
      try { currentJob.child.kill('SIGKILL'); } catch (e) {}
    }
  });

  ws.on('error', (err) => {
   
    console.error('WebSocket error:', err);
    if (currentJob && currentJob.child) {
      try { currentJob.child.kill('SIGKILL'); } catch (e) {}
    }
  });
});

const PORT = process.env.PORT || 58404;
server.listen(PORT, '0.0.0.0', () => console.log(`ws compile server listening on ${PORT}`));
