const { WebSocketServer } = require("ws");

class P2PServer {
  constructor() {
    this.sockets = [];
  }
  //계속해서 듣고 있는 상태
  listen() {
    const server = new WebSocketServer({ port: 7545 });
    server.on("connection", (socket, req) => {
      //콜백함수의 첫번재 인자는, 연결하고자 하는 다른 노드임
      const address = req.socket.remoteAddress;
      const port = req.socket.remotePort;
      console.log(`Success connection!! ${address}:${port}`);
      this.sockets.push(socket);
      //연결된 소켓을 sockets안에 배열에 넣어둠
    });
  }
  //sockets안에 있는 배열은
  //나와 연결된 모든 노드들에게 내용을 전파하기 위함
  broadcast(data) {
    this.sockets.forEach((socket) => socket.send(JSON.stringify(data)));
  }
}

module.exports = P2PServer;
