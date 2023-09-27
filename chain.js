//npm install bn.js
const { BN } = require("bn.js");
const Block = require("./block");

class Chain {
  //난이도, 타겟, 마이닝
  constructor() {
    this.blocks = [Block.getGenesis()]; // 블럭들이 모이는 곳
    this.mempool = []; // 트랜잭션들이 모이는 곳
  }
  //멤풀에 트랜잭션 추가
  /**
   *
   * @param {object} tx
   */
  addTx(tx) {
    this.mempool.push(tx);
  }
  /**
   * 체인에 블록추가
   * @param {block} block
   */
  addBlock(block) {
    //TODO: 블록 유효성 검증을 진행해야함

    this.blocks.push(block);
  }
  //채굴
  mining() {
    console.log("채굴시작");
    //코인베이스 트랜잭션
    const coinbaseTx = { from: "COINBASE", to: "MINER", value: 50 };
    // 트랜잭션 리스트 생성 - body
    const txList = [coinbaseTx, ...this.mempool];
    // 멤풀을 비워줌
    this.mempool = [];
    // 마지막 블록을 가져옴
    const lastBlock = this.getLastBlock();
    // 새로운 블록 생성
    const newBlock = new Block(lastBlock, txList);
    // 새로운 블록 난이도 셋팅
    newBlock.difficulty = this.getDifficulty(lastBlock.difficulty);
    // 타겟값 조회
    const target = this.getTarget(newBlock.difficulty);

    // 목표값과 해시값을 비교하여 해시퍼즐 정답을 생성
    while (!(Block.createBlockHash(newBlock) <= target)) {
      newBlock.nonce++;

      console.log(newBlock.nonce, Block.createBlockHash(newBlock));
    }
    //해시퍼즐 정답을 만든 해시를 기존 블록에 셋팅
    newBlock.hash = Block.createBlockHash(newBlock);
    //새로만든 블록 출력
    console.log(newBlock);
    console.log("채굴성공!");
    //- 체인에 블록을 연결함
    this.addBlock(newBlock);
  }

  /**
   * 난이도 구하기 -> 자가제한 시스템
   * @param {number} difficulty 난이도
   * @returns 자가제한 시스템이 적용 된 난이도
   */
  getDifficulty(difficulty) {
    const lastBlock = this.getLastBlock();
    /** 일관된 블록 채굴 시간을 유지하기 위해 수행 */
    //라스트블락의 인덱스가 만약에 11이면 모듈러 값은 1이 됨, 그러니깐 11, 21, 31 ...단위는 if문안에 들어가서 동작하게 됨
    //따라서 1-10은 바깥으로 나감 = 기존의 난이도를 주면됨
    //즉, 나머지가 1인 경우 난이도를 체크해서 변경해줌
    if (lastBlock.index > 1 && lastBlock.index % 10 === 1) {
      console.log("난이도 조절 시작");
      //이전타임이 필요함
      let prevTime = this.blocks[this.blocks.length - 11].timestamp;
      //마지막(최근)타임
      let lastTime = lastBlock.timestamp;
      //마지막 10개 블록을 채굴하는 데 걸린 평균 시간(평균시간은 채굴 난이도 조정 여부를 결정)
      let avgTime = (lastTime - prevTime) / 11 / 1000;
      //20초 미만이면 4로 설정되어 난이도가 높아지고, 20이상이면 1/4로 설정되어 난이도를 감소
      let multiple = avgTime < 20 ? 4 : 1 / 4;
      difficulty = multiple * difficulty;
      console.log("변경된 난이도", difficulty);
      console.log("난이도 조절 끝");
    }
    return difficulty;
  }

  /**
   * 타켓구하기
   * @param {number} difficulty 난이도
   * @returns 목표값
   */
  getTarget(difficulty) {
    let bits = this.difficultyToBits(difficulty);
    let bits16 = parseInt("0x" + bits.toString(16), 16);
    let exponents = bits16 >> 24;
    let mantissa = bits16 & 0xffffff;
    let target = mantissa * 2 ** (8 * (exponents - 3));
    let target16 = target.toString(16);
    let k = Buffer.from("0".repeat(64 - target16.length) + target16, "hex");
    return k.toString("hex");
  }

  /**
   * 난이도를 통해서 비트구하기(타겟=목표값을 구하기 위함이 목적)
   * @param {*} difficulty
   * @returns
   */
  difficultyToBits(difficulty) {
    const maximumTarget = "0x0ffff000000" + "0".repeat(64 - 12);
    const difficulty16 = difficulty.toString(16);
    let target = parseInt(maximumTarget, 16) / parseInt(difficulty16, 16);
    let num = new BN(target.toString(16), "hex");
    let compact, nSize, bits;
    nSize = num.byteLength();
    if (nSize <= 3) {
      compact = num.toNumber();
      compact <<= 8 * (3 - nSize);
    } else {
      compact = num.ushrn(8 * (nSize - 3)).toNumber();
    }

    if (compact & 0x800000) {
      compact >>= 8;
      nSize++;
    }
    bits = (nSize << 24) | compact;
    if (num.isNeg()) {
      bits |= 0x800000;
    }
    bits >>>= 0;
    return parseInt(bits.toString(10));
  }

  //마지막 블록(=최신블록)

  getLastBlock() {
    return this.blocks[this.blocks.length - 1];
  }

  //유효성검증-블록검증
  isValidBlock() {}

  //유효성검증-블록체인검증
  isValidBlockchain() {}
}

module.exports = Chain;
