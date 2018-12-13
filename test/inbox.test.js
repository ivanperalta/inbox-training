const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const { interface, bytecode } = require('../compile');

// We are connecting with a local network
// When we want to move to other networks we will need
// to use another provider
const provider = ganache.provider();
const web3 = new Web3(provider);

let accounts;
let inbox;
const INITIAL_MESSAGE = 'Hi there!';

beforeEach(async () => {
	// Get a list of all accounts
	accounts = await web3.eth.getAccounts();

	// Use one of those accounts to deploy 
	// the contract
	inbox = await new web3.eth.Contract(JSON.parse(interface))
		.deploy({ data: bytecode, arguments: [INITIAL_MESSAGE] })
		.send({ from: accounts[0], gas: '1000000' });

	inbox.setProvider(provider);
});

describe('Inbox', () => {
	it ('contract has deployed', () => {
		assert.ok(inbox.options.address);
		// assert.equal(inbox.options.address, accounts[0]);
	});

	it ('contract has default message', async () => {
		const message = await inbox.methods.message().call();
		assert.equal(message, INITIAL_MESSAGE);
	});

	it ('contract allow to set the message without gas', async () => {
		const newMessage = 'Hola manola!!!'; 
		await inbox.methods.setMessage(newMessage).call();
		const message = await inbox.methods.message().call();
		assert.equal(message, INITIAL_MESSAGE);
	});

	it ('contract allow to set the message with gas', async () => {
		const newMessage = 'Hola manola!!!'; 
		await inbox.methods.setMessage(newMessage)
			.send({ from: accounts[0] }); // , gas: '1000000'
		const message = await inbox.methods.message().call();
		assert.equal(message, newMessage);
	});

});