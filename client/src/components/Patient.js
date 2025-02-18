import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table'
import Modal from 'react-bootstrap/Modal'
import { Link } from 'react-router-dom'
import Web3 from 'web3'

const Patient = ({mediWox, account, ethValue}) => {
  const [patient, setPatient] = useState(null);
  const [docEmail, setDocEmail] = useState("");
  const [docList, setDocList] = useState([]);
  const [insurer, setInsurer] = useState(null);
  const [insurerList, setInsurerList] = useState([]);
  const [buyFromInsurer, setBuyFromInsurer] = useState(null);
  const [policyList, setPolicyList] = useState([]);
  const [buyPolicyIndex, setBuyPolicyIndex] = useState(null);
  const [transactionsList, setTransactionsList] = useState([]);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [patientRecord, setPatientRecord] = useState(null);

  const getPatientData = async () => {
      var patient = await mediWox.methods.patientInfo(account).call();
      setPatient(patient);
  }

  const giveAccess = (e) => {
    e.preventDefault();
    mediWox.methods.permitAccess(docEmail).send({from: account}).on('transactionHash', (hash) => {
      return window.location.href = '/login'
    })
  }

  const revokeAccess = async (email) => {
    var addr = await mediWox.methods.emailToAddress(email).call();
    mediWox.methods.revokeAccess(addr).send({from: account}).on('transactionHash', (hash) => {
      return window.location.href = '/login';
    });
  }

  const getDoctorAccessList = async () => {
    var doc = await mediWox.methods.getPatientDoctorList(account).call();
    let dt = [];
    for(let i=0; i<doc.length; i++){
      let doctor = await mediWox.methods.doctorInfo(doc[i]).call();
      dt = [...dt, doctor]
    }
    setDocList(dt)
  }

  const getInsurer = async () => {
    var insurer = await mediWox.methods.insurerInfo(patient.policy.insurer).call();
    setInsurer(insurer)
  }

  const getInsurerList = async () => {
    var ins = await mediWox.methods.getAllInsurersAddress().call();
    let it = [];
    for(let i=0; i<ins.length; i++){
      let insurer = await mediWox.methods.insurerInfo(ins[i]).call();
      insurer = {...insurer, account: ins[i]};
      it = [...it, insurer]
    }
    setInsurerList(it)
  }

  const getPolicyList = async () => {
    if (buyFromInsurer === "Choose" || !buyFromInsurer) {
      console.log("No insurer selected");
      setPolicyList([]);
      return;
    }
    try {
      var policyList = await mediWox.methods.getInsurerPolicyList(buyFromInsurer).call()
      setPolicyList(policyList);
    } catch (error) {
      console.error("Error fetching policy list:", error);
      setPolicyList([]);
    }
  }
  

  const purchasePolicy = async (e) => {
    e.preventDefault();
    var value = policyList[buyPolicyIndex].premium/ethValue;
    mediWox.methods.buyPolicy(parseInt(policyList[buyPolicyIndex].id)).send({from: account, value: Web3.utils.toWei(value.toString(), 'Ether')}).on('transactionHash', (hash) => {
      return window.location.href = '/login'
    })
  }

  const getTransactionsList = async () => {
    try {
      console.log("Fetching transactions for account:", account);
    var transactionsIdList = await mediWox.methods.getPatientTransactions(account).call();

    console.log("Transactions ID list:", transactionsIdList);

    let tr = [];
    for(let i=transactionsIdList.length-1; i>=0; i--){
        let transaction = await mediWox.methods.transactions(transactionsIdList[i]).call();
        console.log("Transaction details:", transaction);

        let doctor = await mediWox.methods.doctorInfo(transaction.receiver).call();

        console.log("Doctor:", doctor);
        transaction = {...transaction, id: transactionsIdList[i], doctorEmail: doctor.email}
        tr = [...tr, transaction];
    }

    console.log("Final transactions list:", tr);
    setTransactionsList(tr);
  }catch (error) {
    console.error("Error loading transactions:", error);
}
  }
  // console.log("Transactions list123:", transactionsList);
  // const getTransactionsList = async () => {
  //   console.log("Fetching transactions...");
  //   var transactionsIdList = await mediWox.methods.getPatientTransactions(account).call();
  //   console.log("Transaction IDs:", transactionsIdList);
  //   let tr = [];
  //   for(let i=transactionsIdList.length-1; i>=0; i--){
  //     let transaction = await mediWox.methods.transactions(transactionsIdList[i]).call();
  //     console.log("Transaction details:", transaction);
  //     let doctor = await mediWox.methods.doctorInfo(transaction.receiver).call();
  //     transaction = {...transaction, id: transactionsIdList[i], doctorEmail: doctor.email}
  //     tr = [...tr, transaction];
  //   }
  //   console.log("Processed transactions:", tr);
  //   setTransactionsList(tr);
  // }
  

  const settlePayment = async (e, transaction) => {
    let value = transaction.value/ethValue;
    value = parseFloat(value.toFixed(18));
      mediWox.methods.settleTransactionsByPatient(transaction.id).send({from: account, value: Web3.utils.toWei(value.toString(), 'Ether')}).on('transactionHash', (hash) => {
        return window.location.href = '/login'
    })
  }

  const handleCloseRecordModal = () => setShowRecordModal(false);

  const handleShowRecordModal = async () => {
    var record = {};
    await fetch(`${process.env.REACT_APP_PINATA_DEDICATED_GATEWAY}/ipfs/${patient.record}`)
      .then(res => res.json())
      .then(data => record = data);
    await setPatientRecord(record);
    await setShowRecordModal(true);
  }
  
 
  useEffect(() => {
    const fetchData = async () => {
    if(account === "") return window.location.href = '/login'
    if(!patient) getPatientData()
    if(docList.length === 0) getDoctorAccessList();
    if(patient?.policyActive) getInsurer();
    if(insurerList.length === 0) getInsurerList();
    if(buyFromInsurer && buyFromInsurer !== "Choose") getPolicyList();
    await getTransactionsList(); // Remove length check to always fetch
    //if(transactionsList.length === 0) getTransactionsList();
  }
  fetchData();
  }, [patient, docList, insurerList, buyFromInsurer])

  // console.log("Current transactionsList:", transactionsList);
  // console.log("Current patient:", docList);
  // console.log("Current patient record:", patientRecord);
  

  return (
    <div>
      { patient ?
        <>
          <div className='box'>
            <h2>Patient's Profile</h2>
            <Form>
              <Form.Group>
                <Form.Label>Name: {patient.name}</Form.Label>
              </Form.Group>
              <Form.Group>
                <Form.Label>Email address: {patient.email}</Form.Label>
              </Form.Group>
              <Form.Group>
                <Form.Label>Age: {patient.age}</Form.Label>
              </Form.Group>
              <Form.Group>
                <Form.Label>Address: {account}</Form.Label>
              </Form.Group>
            </Form>
            <div>
              <span>Your records are stored here: &nbsp; &nbsp;</span>
              <Button variant="coolColor" style={{width: "20%", height: "4vh"}} onClick={handleShowRecordModal}>View Records</Button>
            </div>
          </div>
          <div className='box'>
            <h2>Share Your Medical Record with Doctor</h2>
            <Form onSubmit={giveAccess}>
              <Form.Group className="mb-3">
                <Form.Label>Email:</Form.Label>
                <Form.Control required type="email" value={docEmail} onChange={(e) => setDocEmail(e.target.value)} placeholder="Enter doctor's email"></Form.Control>
              </Form.Group>
              <Button variant="coolColor" type="submit">
                  Submit
              </Button>
            </Form>
            <br />
            <h4>List of Doctor's you have given access to your medical records</h4>
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>Sr.&nbsp;No.</th>
                  <th>Doctor&nbsp;Name</th>
                  <th>Doctor&nbsp;Email</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                { docList.length > 0 ? 
                  docList.map((doc, idx) => {
                    return (
                      <tr key={idx}>
                        <td>{idx+1}</td>
                        <td>Dr. {doc.name}</td>
                        <td>{doc.email}</td>
                        <td><Button className='btn-danger' onClick={() => revokeAccess(doc.email)}>Revoke</Button></td>
                      </tr>
                    )
                  })
                  : <></>
                }
              </tbody>
            </Table>
          </div>
          <div className='box'>
            { patient.policyActive && insurer
              ?
              <>
                <h2>Insurance Policy Details</h2>
                <Form>
                  <Form.Group>
                    <Form.Label>Insurance Provider Name: {insurer.name}</Form.Label>
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Email address: {insurer.email}</Form.Label>
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Insurance Policy Name: {patient.policy.name}</Form.Label>
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Insurance Duration: {patient.policy.timePeriod} Year{patient.policy.timePeriod >1 ? 's': ''}</Form.Label>
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Remaining Cover Value: INR {patient.policy.coverValue}</Form.Label>
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Premium: INR {patient.policy.premium}/year</Form.Label>
                  </Form.Group>
                </Form>
              </>
              :
              <>
                <h2>Buy Insurance Policy</h2>
                <Form onSubmit={purchasePolicy}>
                  <Form.Group className='mb-3'>
                    <Form.Label>Select Insurance Provider:</Form.Label>
                    <Form.Select onChange={(e) => {
                      setBuyFromInsurer(e.target.value)
                      getPolicyList()
                    }}>
                      <option>Choose</option>
                      {
                        insurerList.length > 0
                        ? insurerList.map((ins, idx) => {
                          return <option key={idx} value={ins.account}>{ins.name}</option>
                        })
                        : <></>
                      }
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className='mb-3'>
                    <Form.Label>Select Insurance Policy:</Form.Label>
                    <Form.Select onChange={(e) => setBuyPolicyIndex(e.target.value)}>
                      <option>Choose</option>
                      {
                        policyList.length > 0
                        ? policyList.map((policy, idx) => {
                          return <option key={idx} value={idx}>{policy.name}</option>
                        })
                        : <></>
                      }
                    </Form.Select>
                  </Form.Group>
                  <Button variant="coolColor" type="submit">
                    Buy Insurance
                  </Button>
                </Form>
              </>
            }
          </div>
          <div className='box'>
            <h2>Payment Details</h2>
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>Sr.&nbsp;No.</th>
                  <th>Doctor&nbsp;Email</th>
                  <th>Date</th>
                  <th>Disease</th>
                  <th>Value</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {
                  transactionsList.length > 0
                  ? transactionsList.map((transaction, idx) => {
                    return (
                      <tr key={idx}>
                        <td>{idx+1}</td>
                        <td>{transaction.doctorEmail}</td>
                        <td>{transaction.date}</td>
                        <td>{transaction.disease}</td>
                        <td>INR {transaction.value}</td>
                        <td>{!transaction?.settled ? 'Pending' : 'Paid'}</td>
                        <td>{!transaction?.settled  ? <Button variant="coolColor" onClick={(e) => settlePayment(e, transaction)}>Pay Now</Button> : 'Settled'}</td>
                      </tr>
                    )
                  })
                  : <></>
                }
              </tbody>
            </Table>
          </div>
        </>
      : <></>
      }

      {/* Modal for displaying medical record */}
      {
        patientRecord ? (
          <Modal id="modal" size="lg" centered show={showRecordModal} onHide={handleCloseRecordModal}>
            <Modal.Header closeButton>
              <Modal.Title id="modalTitle">Medical Record:</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group>
                  <Form.Label>Patient Name: {patientRecord.name}</Form.Label>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Patient Email: {patientRecord.email}</Form.Label>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Patient Age: {patientRecord.age}</Form.Label>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Address: {patientRecord.address}</Form.Label>
                </Form.Group>
                <Table id='records' striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>Sr.&nbsp;No.</th>
                      <th>Doctor&nbsp;Email</th>
                      <th>Date</th>
                      <th>Disease</th>
                      <th>Treatment</th>
                      <th>Prescription</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientRecord.treatments.length > 0 ?
                      patientRecord.treatments.map((treatment, idx) => {
                        return (
                          <tr key={idx + 1}>
                            <td>{idx + 1}</td>
                            <td>{treatment.doctorEmail}</td>
                            <td>{treatment.date}</td>
                            <td>{treatment.disease}</td>
                            <td>{treatment.treatment}</td>
                            <td>
                              {treatment.prescription ?
                                <Link to={`${process.env.REACT_APP_PINATA_DEDICATED_GATEWAY}/ipfs/${treatment.prescription}`} target="_blank">
                                  <Button variant="coolColor">View</Button>
                                </Link>
                                : "No document uploaded"
                              }
                            </td>
                          </tr>
                        )
                      })
                      : <></>
                    }
                  </tbody>
                </Table>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseRecordModal}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        ) : <></>
      }
    </div>
  )
}

export default Patient;
