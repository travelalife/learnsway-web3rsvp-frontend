import React, { useEffect, useState } from "react";
import { Wallet } from "fuels";
import "./App.css";
// Import the contract factory -- you can find the name in index.ts.
// You can also do command + space and the compiler will suggest the correct name.
import { EventPlatformAbi__factory } from "./contracts";
// The address of the contract deployed the Fuel testnet
// const CONTRACT_ID = "0x32f10d6f296fbd07e16f24867a11aab9d979ad95f54b223efc0d5532360ef5e4";
const CONTRACT_ID = "0xedacd262125f908ae1ea946759f2523b4ac8738140a2925ec55c87ce095ae478";
//the private key from createWallet.js
const WALLET_SECRET = "<private-key>"
// Create a Wallet from given secretKey in this case
// The one we configured at the chainConfig.json
// const wallet = new Wallet(WALLET_SECRET, "https://node-beta-2.fuel.network/graphql");
const wallet = Wallet.fromPrivateKey(WALLET_SECRET, 'https://node-beta-2.fuel.network/graphql');
// Connects out Contract instance to the deployed contract
// address using the given wallet.
const contract = EventPlatformAbi__factory.connect(CONTRACT_ID, wallet);
// const contract = {functions: {rsvp: {}}};


export default function App(){
  const [loading, setLoading] = useState(false);
  //-----------------------------------------------//
  //state variables to capture the selection of an existing event to RSVP to
  const [eventName, setEventName] = useState('');
  const [maxCap, setMaxCap] = useState(0);
  const [deposit, setDeposit] = useState(0);
  const [eventCreation, setEventCreation] = useState(false);
  const [rsvpConfirmed, setRSVPConfirmed] = useState(false);
  const [numOfRSVPs, setNumOfRSVPs] = useState(0);
  const [eventId, setEventId] = useState('');
  //-------------------------------------------------//
  //state variables to capture the creation of an event
  const [newEventName, setNewEventName] = useState('');
  const [newEventMax, setNewEventMax] = useState(0);
  const [newEventDeposit, setNewEventDeposit] = useState(0);
  const [newEventID, setNewEventID] = useState('')
  const [newEventRSVP, setNewEventRSVP] = useState(0);

  useEffect(() => {
    console.log('Wallet address', wallet.address.toString());
    wallet.getBalances().then(balances => {
      const balancesFormatted = balances.map(balance => {
        return [balance.assetId, balance.amount.format()];
      });
      console.log('Wallet balances', balancesFormatted);
    });
  }, []);

  useEffect(() => {
    console.log("eventName", eventName);
    console.log("deposit", deposit);
    console.log("max cap", maxCap);
  },[eventName, maxCap, deposit]);

  async function rsvpToEvent(){
    setLoading(true);
    try {
      console.log('amount deposit', deposit);
      const { value, transactionResponse, transactionResult } = await contract.functions.rsvp(eventId).callParams({
        forward: [deposit]
        //variable outputs is when a transaction creates a new dynamic UTXO
        //for each transaction you do, you'll need another variable output
        //for now, you have to set it manually, but the TS team is working on an issue to set this automatically
      }).txParams({gasPrice: 1, variableOutputs: 1}).call();
      console.log(transactionResult);
      console.log(transactionResponse);
      console.log("RSVP'd to the following event", value);
      console.log("deposit value", value.deposit.toString());
      console.log("# of RSVPs", value.num_of_rsvps.toString());
      setNumOfRSVPs(value.num_of_rsvps.toNumber());
      setEventName(value.name.toString());
      setEventId(value.unique_id.toString());
      setMaxCap(value.max_capacity.toNumber());
      setDeposit(value.deposit.toNumber());
      //value.deposit.format()
      console.log("event name", value.name);
      console.log("event capacity", value.max_capacity.toString());
      console.log("eventID", value.unique_id.toString())
      setRSVPConfirmed(true);
      alert("rsvp successful")
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false)
    }
  }

  async function createEvent(e: any){
    e.preventDefault();
    setLoading(true);
    try {
      console.log("creating event")
      const { value } = await contract.functions.create_event(newEventMax, newEventDeposit, newEventName).txParams({gasPrice: 1}).call();

      console.log("return of create event", value);
      console.log("deposit value", value.deposit.toString());
      console.log("event name", value.name);
      console.log("event capacity", value.max_capacity.toString());
      console.log("eventID", value.unique_id.toString())
      setNewEventID(value.unique_id.toString())
      //setEventId(value.uniqueId.toString())
      setEventCreation(true);
      alert('Event created');
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false);
    }
  }
  return (
      <div className="main">
        <div className="header">Building on Fuel with Sway - Web3RSVP</div>
        <div className="author"><img src={require('./logo.png')} alt="fuel"/>By @Leon</div>
        <div className="op-div">
          <div className="form">
            <h2>Create Your Event Today!</h2>
            <form id="createEventForm" onSubmit={createEvent}>
              <label className="label">Event Name</label>
              <input className="input" value = {newEventName} onChange={e => setNewEventName(e.target.value) } name="eventName" type="text" placeholder="Enter event name" />
              <label className="label">Max Cap</label>
              <input className="input" value = {newEventMax} onChange={e => setNewEventMax(+e.target.value)} name="maxCapacity" type="text" placeholder="Enter max capacity" />
              <label className="label">Deposit</label>
              <input className="input" value = {newEventDeposit} onChange={e => setNewEventDeposit(+e.target.value)} name="price" type="number" placeholder="Enter price" />
              <button className="button" disabled={loading}>
                {loading ? "creating..." : "create"}
              </button>
            </form>
          </div>
          <div className="form">
            <h2>RSVP to an Event</h2>
            <label className="label">Event Id</label>
            <input className="input" name="eventId" onChange={e => setEventId(e.target.value)} placeholder="pass in the eventID"/>
            <button className="button" onClick={rsvpToEvent}>RSVP</button>
          </div>
        </div>
        <div className="results">
          <div className="card">
            {eventCreation &&
                <>
                  <h1> New event created</h1>
                  <h2> Event Name: {newEventName} </h2>
                  <h2> Event ID: {newEventID}</h2>
                  <h2>Max capacity: {newEventMax}</h2>
                  <h2>Deposit: {newEventDeposit}</h2>
                  <h2>Num of RSVPs: {newEventRSVP}</h2>
                </>
            }
          </div>
          {rsvpConfirmed && <>
            <div className="card">
              <h1>RSVP Confirmed to the following event: {eventName}</h1>
              <p>Num of RSVPs: {numOfRSVPs}</p>
            </div>
          </>}
        </div>
      </div>

  );
}
