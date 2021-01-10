import React from 'react';
import Button from 'react-bootstrap-button-loader';
import {Navbar, Image} from 'react-bootstrap';
import ERC20 from "./ERC20.json";
import Web3Modal from "web3modal";

const Web3 = require('web3');


class App extends React.Component {
    state = {
        account: '',
        web3: '',
        tokenAddress: '',
        loadingGenerateLicense: false,
        loadingVerifyLicense: false,
        license: '',
        verifyTokenAddress: '',
        verifyLicense: '',
        tokenHolderAddress: '',
        licenseResult: ''

    };

    web3Modal = new Web3Modal({
        network: "rinkeby", // optional
        cacheProvider: true, // optional
        providerOptions: {}
    });

    async login() {
        const provider = await this.web3Modal.connect();
        await this.subscribeProvider(provider);
        const web3 = new Web3(provider);
        const accounts = await web3.eth.getAccounts();
        const address = accounts[0];
        const networkId = await web3.eth.net.getId();
        if (networkId !== 4) {
            alert('App works only for Rinkeby testnet');
            return;
        }
        this.setState({
            web3: web3,
            account: address
        });
    }

    async logout() {
        this.resetApp();
    }

    async subscribeProvider(provider) {
        if (!provider.on) {
            return;
        }
        provider.on("close", () => this.resetApp());
        provider.on("accountsChanged", async (accounts) => {
            await this.setState({account: accounts[0]});
        });
        provider.on("chainChanged", async (chainId) => {
            const {web3} = this.state;
            const networkId = await web3.eth.net.getId();
            if (networkId !== 4) {
                alert('App works only for Rinkeby testnet');
            }
        });

        provider.on("networkChanged", async (networkId) => {
            if (networkId !== 4) {
                alert('App works only for Rinkeby testnet');
            }
        });
    };

    async resetApp() {
        const {web3} = this.state;
        if (web3 && web3.currentProvider && web3.currentProvider.close) {
            await web3.currentProvider.close();
        }
        await this.web3Modal.clearCachedProvider();
        this.setState({account: '', web3: ''});
    };

    async componentWillMount() {
        if (this.web3Modal.cachedProvider) {
            this.login();
        }
    }

    render() {
        if (this.state.account === '') {
            return (
                <div>
                    <Navbar bg="primary" variant="dark">
                        <div style={{width: "90%"}}>
                            <Navbar.Brand href="/">
                                <b>Decentralized License Generator</b>
                            </Navbar.Brand>
                        </div>
                        <Button variant="default btn-sm" onClick={this.login.bind(this)} style={{float: "right"}}>
                            Connect
                        </Button>
                    </Navbar>
                    <div className="panel-landing  h-100 d-flex" id="section-1">
                        <div className="container row" style={{marginTop: "50px"}}>
                            <div className="col l8 m12">

                                <p className="h2">
                                    Generate or verify license for Ocean Protocol Datatokens
                                </p>
                                <Image src="/data_tokens.png"
                                       style={{height: "320px", width: "650px", marginTop: "10px"}} fluid/>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
        return (
            <div className="App">
                <div>
                    <Navbar bg="primary" variant="dark" style={{position: "sticky"}} fixed="top">
                        <div style={{width: "90%"}}>
                            <Navbar.Brand href="/">
                                <b>Decentralized License Generator</b>
                            </Navbar.Brand>
                        </div>
                        <Button variant="default btn-sm" onClick={this.logout.bind(this)} style={{float: "right"}}>
                            Logout
                        </Button>
                    </Navbar>
                    <div style={{margin: "20px"}}>
                        <div>
                            <div style={{wordWrap: "break-word"}}><b>Account:</b> {this.state.account}</div>
                            <br/>
                            <h5>Generate License For Data Token</h5>
                            <div>
                                <input className="form-control" type="text" placeholder="Token Address" style={{marginBottom: "10px"}}
                                        value={this.state.tokenAddress}
                                        onChange={e => this.updateTokenAddress(e.target.value)}/>

                            </div>
                            <div>
                                <Button variant="primary btn" onClick={this.generateLicense.bind(this)}
                                        loading={this.state.loadingGenerateLicense}
                                >Generate License</Button>
                            </div>
                            <div>
                                {this.state.license && <p style={{marginTop: "10px"}}><b>License Code:</b> {this.state.license}</p>}
                            </div>
                            <br/>
                            <h5>Verify License For Data Token</h5>
                            <div>
                                <input className="form-control" type="text" placeholder="Token Address" style={{marginBottom: "10px"}}
                                       value={this.state.verifyTokenAddress}
                                       onChange={e => this.updateVerifyTokenAddress(e.target.value)}/>

                            </div>
                            <div>
                                <input className="form-control" type="text" placeholder="Token Holder Address" style={{marginBottom: "10px"}}
                                       value={this.state.tokenHolderAddress}
                                       onChange={e => this.updateTokenHolderAddress(e.target.value)}/>

                            </div>
                            <div>
                                <input className="form-control" type="text" placeholder="License Code" style={{marginBottom: "10px"}}
                                       value={this.state.verifyLicense}
                                       onChange={e => this.updateVerifyLicense(e.target.value)}/>

                            </div>
                            <div>
                                <Button variant="primary btn" onClick={this.verifyLicense.bind(this)}
                                        loading={this.state.loadingVerifyLicense}
                                >Verify License</Button>
                            </div>
                            <div>
                                {this.state.licenseResult && <p style={{marginTop: "10px"}}><b>Result:</b> {this.state.licenseResult}</p>}
                            </div>



                        </div>
                        <br/>
                    </div>
                </div>
            </div>
        )
    }

    updateTokenAddress(value) {
        this.setState({tokenAddress: value})
    }

    updateVerifyTokenAddress(value) {
        this.setState({verifyTokenAddress: value})
    }

    updateVerifyLicense(value) {
        this.setState({verifyLicense: value})
    }

    updateTokenHolderAddress(value) {
        this.setState({tokenHolderAddress: value})
    }

    async generateLicense() {
        if(!this.state.tokenAddress){
            alert('Data Token Address is required');
            return
        }
        const signature = await this.state.web3.eth.personal.sign(this.state.tokenAddress, this.state.account);
        console.log(signature);
        this.setState({license: signature})
    }

    async verifyLicense(){
        if(!this.state.verifyTokenAddress || !this.state.verifyLicense || !this.state.tokenHolderAddress){
            alert('All details are required');
            return
        }
        let address;
        try {
            address = await this.state.web3.eth.personal.ecRecover(this.state.verifyTokenAddress, this.state.verifyLicense);
        } catch (e) {
            this.setState({licenseResult: "Invalid License Code"});
            return
        }
        console.log(address);
        if(address.toLowerCase() === this.state.tokenHolderAddress.toLowerCase()){
            let contract = new this.state.web3.eth.Contract(ERC20, this.state.verifyTokenAddress);
            let balance = await contract.methods.balanceOf(this.state.tokenHolderAddress).call();
            balance = this.state.web3.utils.fromWei(balance);
            console.log(balance);
            let isSufficientBalance = balance >= 1;
            console.log(isSufficientBalance);
            if(isSufficientBalance){
                this.setState({licenseResult: "Valid License Code i.e. Data Token Ownership verified"});
            }
            else{
                this.setState({licenseResult: "Invalid License Code"});
            }
        }
        else{
            this.setState({licenseResult: "Invalid License Code"});
        }
    }

}

export default App
