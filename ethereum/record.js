import web3 from './web3';
import Record from './build/Record.json';

const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  '0x876a8101E934d032EAB97aA800f03159A60b327E';

const contractInstance = new web3.eth.Contract(
  JSON.parse(Record.interface),
  CONTRACT_ADDRESS
);

export default contractInstance;
