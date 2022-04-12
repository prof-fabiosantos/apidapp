var express = require('express');
var app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const cors = require('cors');
app.use(cors());

var Web3 = require('web3')

require("dotenv").config();

const CONTACT_ABI = require('./config');
const CONTACT_ADDRESS = require('./config');


app.get('/candidato', async function(req, res) {
              
  var web3 = new Web3('https://ropsten.infura.io/v3/e8c1376f04e245fc8286ae1cd76c6977');

  var contratoInteligente = new web3.eth.Contract(CONTACT_ABI.CONTACT_ABI, CONTACT_ADDRESS.CONTACT_ADDRESS);
  let nome = req.query.nome;
  let totalDeVotos = await contratoInteligente.methods.candidatos(nome).call();         
  res.json(totalDeVotos);

});


app.post('/votar', async function(req, res) {    
    
  let nomeCandidato = req.body.nome;       
  const network = process.env.ETHEREUM_NETWORK;

  const web3 = new Web3(
    new Web3.providers.HttpProvider(
      `https://ropsten.infura.io/v3/e8c1376f04e245fc8286ae1cd76c6977`
    )
  );    
  const signer = web3.eth.accounts.privateKeyToAccount(
    process.env.SIGNER_PRIVATE_KEY
  );
  web3.eth.accounts.wallet.add(signer);  
  var contratoInteligente = new web3.eth.Contract(CONTACT_ABI.CONTACT_ABI, CONTACT_ADDRESS.CONTACT_ADDRESS);  
  const tx = contratoInteligente.methods.votar(nomeCandidato);
  const receipt = await tx
    .send({
      from: signer.address,
      gas: await tx.estimateGas(),
    })
    .once("transactionHash", (txhash) => {
      console.log(`Mining transaction ...`);
      console.log(`https://${network}.etherscan.io/tx/${txhash}`);
    });
    console.log(`Mined in block ${receipt.blockNumber}`);     
  res.status(200).send(`Mined in block ${receipt.blockNumber}`);  
});



app.get('/saldo', async function(req, res) {
    
    var web3 = new Web3('https://ropsten.infura.io/v3/e8c1376f04e245fc8286ae1cd76c6977');

    let walletAddress = req.query.conta;
    let balance = await web3.eth.getBalance(walletAddress);
    let balanceEth = web3.utils.fromWei(balance, 'ether');
    
    res.status(200).send(balanceEth);

});

app.listen(3001, () => {
    console.log('Rodando meu servidor')
})


