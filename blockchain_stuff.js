const NETWORK_ID = 137
const CONTRACT_ADDRESS = "0xD844a6F31eBD1813f3F132B45E3311C4c1b2ea8E"
const JSON_CONTRACT_ABI_PATH = "./ContractABI.json"
var contract
var accounts
var web3
var balance
var SUPPLY
var MAX_SUPPLY
var nft_ids = []
var token_colors = []
var price

function metamaskReloadCallback()
{
  window.ethereum.on('accountsChanged', (accounts) => {
    document.getElementById("web3_message").textContent="Se cambió el account, refrescando...";
    window.location.reload()
  })
  window.ethereum.on('networkChanged', (accounts) => {
    document.getElementById("web3_message").textContent="Se el network, refrescando...";
    window.location.reload()
  })
}

const getWeb3 = async () => {
  return new Promise((resolve, reject) => {
    if(document.readyState=="complete")
    {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum)
        window.location.reload()
        resolve(web3)
      } else {
        reject("must install MetaMask")
        document.getElementById("web3_message").textContent="Error: Porfavor conéctate a Metamask";
      }
    }else
    {
      window.addEventListener("load", async () => {
        if (window.ethereum) {
          const web3 = new Web3(window.ethereum)
          resolve(web3)
        } else {
          reject("must install MetaMask")
          document.getElementById("web3_message").textContent="Error: Please install Metamask";
        }
      });
    }
  });
};

const getContract = async (web3) => {
  const response = await fetch(JSON_CONTRACT_ABI_PATH);
  const data = await response.json();
  
  const netId = await web3.eth.net.getId();
  contract = new web3.eth.Contract(
    data,
    CONTRACT_ADDRESS
    );
  return contract
}

async function loadDapp() {
  metamaskReloadCallback()
  document.getElementById("web3_message").textContent="Por favor conéctate a Metamask"
  var awaitWeb3 = async function () {
    web3 = await getWeb3()
    web3.eth.net.getId((err, netId) => {
      if (netId == NETWORK_ID) {
        var awaitContract = async function () {
          contract = await getContract(web3);
          await window.ethereum.request({ method: "eth_requestAccounts" })
          accounts = await web3.eth.getAccounts()
          balance = await contract.methods.balanceOf(accounts[0]).call()
          MAX_SUPPLY = await contract.methods.MAX_SUPPLY().call()
          SUPPLY = await contract.methods.SUPPLY().call()
          for(i=0; i<balance; i++)
          {
            nft_ids.push(await contract.methods.tokenOfOwnerByIndex(accounts[0],i).call())
          }
          console.log(nft_ids)
          for(i=0; i<nft_ids.length; i++)
          {
            token_color = await contract.methods.token_color(nft_ids[i]).call()
            token_colors.push(token_color)
            addColorSelector(token_color, nft_ids[i])
          }
          console.log(token_colors)
          price = await contract.methods.PRICE().call()
          document.getElementById("web3_message").textContent="Tienes " + balance + " tokens"
          document.getElementById("available_message").textContent="" + (MAX_SUPPLY-SUPPLY) + "/" + MAX_SUPPLY + " disponibles"
        };
        awaitContract();
      } else {
        document.getElementById("web3_message").textContent="Por favor conectate a Polygon";
      }
    });
  };
  awaitWeb3();
}

function getTokenUrl(token_color)
{
  if(token_color==0)
    return "https://raw.githubusercontent.com/FilosofiaCodigo/OGToken/master/assets/Black.png"
  if(token_color==1)
    return "https://raw.githubusercontent.com/FilosofiaCodigo/OGToken/master/assets/White.png"
  if(token_color==2)
    return "https://raw.githubusercontent.com/FilosofiaCodigo/OGToken/master/assets/Purple.png"
  if(token_color==3)
    return "https://raw.githubusercontent.com/FilosofiaCodigo/OGToken/master/assets/Cyan.png"
  if(token_color==4)
    return "https://raw.githubusercontent.com/FilosofiaCodigo/OGToken/master/assets/Yellow.png"
  if(token_color==5)
    return "https://raw.githubusercontent.com/FilosofiaCodigo/OGToken/master/assets/Orange.png"
}

function addColorSelector(token_color, token_id)
{
  var parent = document.getElementById("color_selectors");

  //Img
  var img = document.createElement("img");
  img.src = getTokenUrl(token_color);
  img.width = "150"
  parent.appendChild(img);

  //Select
  var array = ["Black", "White", "Purple", "Cyan", "Yellow", "Orange"];
  var selectList = document.createElement("select");
  selectList.id = "color_select_" + token_id;
  parent.appendChild(selectList);  
  for (var i = 0; i < array.length; i++) {
      var option = document.createElement("option");
      option.value = ""+i;
      option.text = array[i];
      selectList.appendChild(option);
  }

  //Button
  var btn = document.createElement("button");
  btn.innerHTML = "Cambiar color";
  btn.onclick = function () {
    var color_select_element = document.getElementById("color_select_" + token_id);
    var selected_color = color_select_element.options[color_select_element.selectedIndex].value;
    setColor(token_id, selected_color)
  };
  parent.appendChild(btn);
}

const mint = async () => {
  const result = await contract.methods.mint()
    .send({ from: accounts[0], gas: 0, value: price })
    .on('transactionHash', function(hash){
      document.getElementById("web3_message").textContent="Minteando...";
    })
    .on('receipt', function(receipt){
      document.getElementById("web3_message").textContent="Éxito! El minteo se ha completado.";    })
    .catch((revertReason) => {
      console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
    });
}

const setColor = async (token_id, color) => {
  const result = await contract.methods.setTokenColor(token_id, color)
    .send({ from: accounts[0], gas: 0, value: 0 })
    .on('transactionHash', function(hash){
      document.getElementById("web3_message").textContent="Minteando...";
    })
    .on('receipt', function(receipt){
      document.getElementById("web3_message").textContent="Éxito! Has cambiado el color.";    })
    .catch((revertReason) => {
      console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
    });
}

/*
await setTokenURIs(
  ["https://raw.githubusercontent.com/FilosofiaCodigo/OGToken/master/assets/Black.json",
   "https://raw.githubusercontent.com/FilosofiaCodigo/OGToken/master/assets/White.json",
   "https://raw.githubusercontent.com/FilosofiaCodigo/OGToken/master/assets/Purple.json",
   "https://raw.githubusercontent.com/FilosofiaCodigo/OGToken/master/assets/Cyan.json",
   "https://raw.githubusercontent.com/FilosofiaCodigo/OGToken/master/assets/Yellow.json",
   "https://raw.githubusercontent.com/FilosofiaCodigo/OGToken/master/assets/Orange.json"])
*/
const setTokenURIs = async (uris) => {
  const result = await contract.methods.setTokenURIs(uris)
    .send({ from: accounts[0], gas: 0, value: 0 })
    .on('transactionHash', function(hash){
      document.getElementById("web3_message").textContent="Estableciendo los URIs...";
    })
    .on('receipt', function(receipt){
      document.getElementById("web3_message").textContent="Éxito! Has cambiado los URIs.";    })
    .catch((revertReason) => {
      console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
    });
}

loadDapp()