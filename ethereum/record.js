import web3 from './web3';
import Record from './build/Record.json';

const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  '0xB1Af58d43fDf8e5a637BcdeBB52DfE1E32AF0f2D';

const contractInstance = new web3.eth.Contract(
  JSON.parse(Record.interface),
  CONTRACT_ADDRESS
);

export default contractInstance;
