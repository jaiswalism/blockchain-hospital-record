import initWeb3 from './web3'; // Adjust the path if necessary
import Record from './build/Record.json';

let contractInstance;

const getContractInstance = async () => {
  if (!contractInstance) {
    const web3 = await initWeb3(); // Ensure web3 is initialized
    contractInstance = new web3.eth.Contract(
      JSON.parse(Record.interface),
      '0x876a8101E934d032EAB97aA800f03159A60b327E'
    );
  }
  return contractInstance;
};

export default getContractInstance;


//Whenever there is a change in Solidity code, use this few commands
//Step 1: cd ethereum
//Step 2: node compile.js
//Step 3: node deploy.js
//Step 4: Paste the contract deployed address above