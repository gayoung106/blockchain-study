const { WebSocketServer, WebSocket } = require("ws");
const MessageType = require("./msg");
class P2PServer {
  constructor(chain) {
    this.chain = chain;
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
      this.connectSocket(socket, "server");
      //연결된 소켓을 sockets안에 배열에 넣어둠
    });
  }

  connectToPeer(newPeer) {
    const socket = new WebSocket(newPeer);
    socket.on("open", () => {
      console.log("open");
      this.connectSocket(socket, "client");
    });
  }

  connectSocket(socket, name) {
    console.log(name);
    this.sockets.push(socket);
    this.messageHandler(socket);
    const data = {
      type: MessageType.latest_block,
      payload: name,
    };
    this.send(socket, data);
  }

  getSockets() {
    return this.sockets;
  }

  messageHandler(socket) {
    const cb = (message) => {
      const result = JSON.parse(message.toString());
      switch (result.type) {
        case MessageType.latest_block:
          const msg1 = {
            type: MessageType.all_block,
            payload: this.chain.getLastBlock(),
          };
          this.send(socket, msg1);
          break;
        case MessageType.all_block:
          const msg2 = {
            type: MessageType.receivedChain,
            payload: this.chain.blockchain,
          };
          const receivedBlock = result.payload;
          const isSuccess = this.chain.addBlock(receivedBlock);
          if (isSuccess) break;
          this.send(socket, msg2);
          break;
        case MessageType.receivedChain:
          const receivedChain = result.payload;
          // this.chain.hanleChainResponse(receivedChain, this);
          break;
        case MessageType.receivedTx:
          break;
      }
    };
    socket.on("message", cb);
  }

  send(socket, message) {
    socket.send(JSON.stringify(message));
  }
  //sockets안에 있는 배열은
  //나와 연결된 모든 노드들에게 내용을 전파하기 위함
  broadcast(data) {
    this.sockets.forEach((socket) => socket.send(JSON.stringify(data)));
  }
}

module.exports = P2PServer;
