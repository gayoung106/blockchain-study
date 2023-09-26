const { SHA256 } = require("crypto-js");
const merkle = require("merkle");

// npm install crypto-js merkle 라이브러리 설치
class Block {
  constructor(previoushBlock, transactions) {
    this.index = (previoushBlock?.index || 0) + 1; //블록넘버링 : 이전블락의 +1
    // this.version = "1.0.0"; //블록버전
    this.timestamp = new Date().getTime(); //타임스탬프
    this.previousHash = previoushBlock?.hash; // 이전블록해시
    this.nonce = 0; // 해시퍼즐-정답
    this.difficulty = 0; // 해시퍼즐
    // this.data; //일반 데이터
    this.hash; //현재블록의 해시값
    this.merkleRoot = Block.getMerkleRoot(transactions);
    this.transactions = transactions; // 트랜잭션 모음
  }
  //함수만들기
  //데이터에 따라서 머클루트를 가져오는 함수
  static getMerkleRoot(data) {
    const merkleTree = merkle("sha256").sync(data);
    return merkleTree.root();
  }

  //머클루트와 해시에 대한 내용을 가져오는 함수
  static createBlockHash(block) {
    const { index, timestamp, merkleRoot, previousHash, nonce } = block;
    const values = `${index}${timestamp}${merkleRoot}${previousHash}${nonce}`;
    return SHA256(values).toString();
  }

  static getGenesis() {
    const transactions = ["2차 구제금융"];
    return new Block({ index: 0, hash: 0x0 }, transactions);
    genesisBlock.hash = Block.createBlockHash(genesisBlock);
    return genesisBlock;
  }
}
//블럭을 하나 생성

console.log(Block.getGenesis());

module.exports = Block;
