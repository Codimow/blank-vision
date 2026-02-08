const http = require('http');
const { Server } = require('socket.io');
const pty = require('node-pty');
const os = require('os');

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

const shell = os.platform() === 'win32' ? 'powershell.exe' : (process.env.SHELL || '/bin/sh');

io.on('connection', (socket) => {
  console.log('User connected to PTY');

  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.env.HOME || process.cwd(),
    env: process.env
  });

  ptyProcess.on('data', (data) => {
    socket.emit('output', data);
  });

  socket.on('input', (data) => {
    ptyProcess.write(data);
  });

  socket.on('resize', ({ cols, rows }) => {
    ptyProcess.resize(cols, rows);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected, killing PTY');
    ptyProcess.kill();
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`PTY Server listening on port ${PORT}`);
});
