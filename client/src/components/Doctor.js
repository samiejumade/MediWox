import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table'
import Modal from 'react-bootstrap/Modal';
import { Buffer } from 'buffer';
import { Link } from 'react-router-dom'


const Doctor = ({ipfs, mediWox, account}) => {
  const [doctor, setDoctor] = useState(null);
  const [patient, setPatient] = useState(null);
  const [patientRecord, setPatientRecord] = useState(null);
  const [disease, setDisease] = useState('');
  const [treatment, setTreatment] = useState('');
  const [charges, setCharges] = useState('');
  const [fileBuffer, setFileBuffer] = useState(null);
  const [patList, setPatList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [transactionsList, setTransactionsList] = useState([]);

  const getDoctorData = async () => {
    var doctor = await mediWox.methods.doctorInfo(account).call();
    setDoctor(doctor);
  }
  const getPatientAccessList = async () => {
    var pat = await mediWox.methods.getDoctorPatientList(account).call();
    let pt = []
    for(let i=0; i<pat.length; i++){
      let patient = await mediWox.methods.patientInfo(pat[i]).call();
      patient = { ...patient, account:pat[i] }
      pt = [...pt, patient]
    }
    setPatList(pt);
  }
  const getTransactionsList = async () => {
    var transactionsIdList = await mediWox.methods.getDoctorTransactions(account).call();
    let tr = [];
    for(let i=transactionsIdList.length-1; i>=0; i--){
        let transaction = await mediWox.methods.transactions(transactionsIdList[i]).call();
        let sender = await mediWox.methods.patientInfo(transaction.sender).call();
        if(!sender.exists) sender = await mediWox.methods.insurerInfo(transaction.sender).call();
        transaction = {...transaction, id: transactionsIdList[i], senderEmail: sender.email}
        tr = [...tr, transaction];
    }
    setTransactionsList(tr);
  }
  const captureFile = async (e) => {
    e.preventDefault()
    const file = e.target.files[0];
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      setFileBuffer(Buffer(reader.result))
    }
  }


  const handleCloseModal = () => setShowModal(false);
  const handleCloseRecordModal = () => setShowRecordModal(false);
  const handleShowModal = async (patient) => {
    await setPatient(patient);
    await setShowModal(true);
  }
  // const handleShowRecordModal = async (patient) => {
  //   var record = {}
  //   await fetch(`${process.env.REACT_APP_INFURA_DEDICATED_GATEWAY}/ipfs/${patient.record}`)
  //     .then(res => res.json())
  //     .then(data => record = data)
  //   await setPatientRecord(record);
  //   await setShowRecordModal(true);
  // }

  const handleShowRecordModal = async (patient) => {
    var record = {};
    await fetch(`https://gateway.pinata.cloud/ipfs/${patient.record}`)
      .then(res => res.json())
      .then(data => record = data);
    await setPatientRecord(record);
    await setShowRecordModal(true);
  }


  // const submitDiagnosis = async (e) => {
  //   e.preventDefault()
  //   let file = "";
  //   if(fileBuffer) {
  //     await ipfs.add(fileBuffer).then((res, error) => {
  //       if(error){
  //         console.log(error)
  //       }else{
  //         file = res.path
  //       }
  //     })
  //   }
  //   var record = {}
  //   // await fetch(`${process.env.REACT_APP_INFURA_DEDICATED_GATEWAY}/ipfs/${patient.record}`)
  //   await fetch(`https://gateway.pinata.cloud/ipfs/${patient.record}`)
  //     .then(res => res.json())
  //     .then(data => {
  //       record = data;
  //     })
  //   const date = new Date();

  //   const formattedDate = date.toLocaleString("en-GB", {
  //     day: "numeric",
  //     month: "short",
  //     year: "numeric",
  //     hour: "numeric",
  //     minute: "2-digit"
  //   });
  //   record.treatments = [ {disease, treatment, charges, prescription: file, date: formattedDate, doctorEmail: doctor.email}, ...record.treatments ]
  //   record = Buffer(JSON.stringify(record))
  //   ipfs.add(record).then((result, error) => {
  //     if(error){
  //       console.log(error);
  //       return;
  //     }else{
  //       mediWox.methods.insuranceClaimRequest(patient.account, result.path, charges).send({from: account}).on('transactionHash', (hash) => {
  //         return window.location.href = '/login'
  //       })
  //     }
  //   })
  // }

  const submitDiagnosis = async (e) => {
    console.log('privatekey', process.env.REACT_APP_PINATA_API_KEY)

    e.preventDefault()
    let file = "";
    if(fileBuffer) {
      const formData = new FormData();
      formData.append('file', new Blob([fileBuffer]));

      try {
        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
          method: 'POST',
          headers: {
            'pinata_api_key': `${process.env.REACT_APP_PINATA_API_KEY}`,
            'pinata_secret_api_key': `${process.env.REACT_APP_PINATA_API_SECRET}`
          },
          body: formData
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        file = result.IpfsHash;
      } catch (error) {
        console.error('Error uploading to Pinata:', error);
        return;
      }
    }

    var record = {}
    await fetch(`${process.env.REACT_APP_PINATA_DEDICATED_GATEWAY}/ipfs/${patient.record}`)
      .then(res => res.json())
      .then(data => {
        record = data;
      })

    const date = new Date();
    const formattedDate = date.toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });

    record.treatments = [ {disease, treatment, charges, prescription: file, date: formattedDate, doctorEmail: doctor.email}, ...record.treatments ]
    
    const updatedRecord = new Blob([JSON.stringify(record)], { type: 'application/json' });
    const formData = new FormData();
    formData.append('file', updatedRecord);

    try {
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'pinata_api_key': `${process.env.REACT_APP_PINATA_API_KEY}`,
          'pinata_secret_api_key': `${process.env.REACT_APP_PINATA_API_SECRET}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      mediWox.methods.insuranceClaimRequest(patient.account, result.IpfsHash, charges).send({from: account}).on('transactionHash', (hash) => {
        return window.location.href = '/login'
      })
    } catch (error) {
      console.error('Error uploading to Pinata:', error);
    }
  }


 
  useEffect(() => {
    if(account === "") return window.location.href = '/login'
    if(!doctor) getDoctorData()
    if(patList.length === 0) getPatientAccessList();
    if(transactionsList.length === 0) getTransactionsList();
  }, [doctor, patList, transactionsList])


  return (
    <div>
      { doctor ?
        <>
          <div className='box'>
            <h2>Doctor's Profile</h2>
            <Form>
              <Form.Group>
                <Form.Label>Name: Dr. {doctor.name}</Form.Label>
              </Form.Group>
              <Form.Group>
                <Form.Label>Email: {doctor.email}</Form.Label>
              </Form.Group>
              <Form.Group>
                <Form.Label>Address: {account}</Form.Label>
              </Form.Group>
            </Form>
          </div>
          <div className='box'>
            <h2>List of Patient's Medical Records</h2>
            <Table id='records' striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>Sr.&nbsp;No.</th>
                  <th>Patient&nbsp;Name</th>
                  <th>Patient&nbsp;Email</th>
                  <th>Action</th>
                  <th>Records</th>
                </tr>
              </thead>
              <tbody>
                { patList.length > 0 ?
                  patList.map((pat, idx) => {
                    return (
                      <tr key={idx+1}>
                        <td>{idx+1}</td>
                        <td>{pat.name}</td>
                        <td>{pat.email}</td>
                        <td><Button variant='coolColor' onClick={(e) => handleShowModal(pat)} >Diagnose</Button></td>
                        <td><Button variant="coolColor" onClick={(e) => handleShowRecordModal(pat)} >View</Button></td>
                      </tr>
                    )
                  })
                  : <></>
                }
              </tbody>
            </Table>
          </div>
          <div className='box'>
            <h2>List of Transactions</h2>
              <Table striped bordered hover size="sm">
                <thead>
                    <tr>
                      <th>Sr.&nbsp;No.</th>
                      <th>Sender&nbsp;Email</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                  { transactionsList.length > 0 ? 
                    transactionsList.map((transaction, idx) => {
                      return (
                        <tr key={idx+1}>
                          <td>{idx+1}</td>
                          <td>{transaction.senderEmail}</td>
                          <td>{transaction.value}</td>
                          <td>{transaction.settled ? <span className='badge rounded-pill bg-success'>Settled</span> : <span className='badge rounded-pill bg-warning'>Pending</span>}</td>
                        </tr>
                      )
                    })
                    : <></>
                  }
                </tbody>
              </Table>
          </div>
          { patient ? <Modal id="modal" size="lg" centered show={showModal} onHide={handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title id="modalTitle">Enter diagnosis for: {patient.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                  <Form.Group className='mb-3'>
                    <Form.Label>Disease: </Form.Label>
                    <Form.Control required type="text" value={disease} onChange={(e) => setDisease(e.target.value)} placeholder='Enter disease'></Form.Control>
                  </Form.Group>
                  <Form.Group className='mb-3'>
                    <Form.Label>Treatment: </Form.Label>
                    <Form.Control required as="textarea" value={treatment} onChange={(e) => setTreatment(e.target.value)} placeholder='Enter the treatment in details'></Form.Control>
                  </Form.Group>
                  <Form.Group className='mb-3'>
                    <Form.Label>Medical Charges: </Form.Label>
                    <Form.Control required type="number" value={charges} onChange={(e) => setCharges(e.target.value)} placeholder='Enter medical charges incurred'></Form.Control>
                  </Form.Group>
                  <Form.Group className='mb-3'>
                    <Form.Label>Upload Prescription</Form.Label>
                    <Form.Control onChange={captureFile} accept=".jpg, .jpeg, .png, .pdf" type="file" />
                  </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Close
              </Button>
              <Button type="submit" variant="coolColor" onClick={submitDiagnosis}>
                Submit Diagnosis
              </Button>
            </Modal.Footer>
          </Modal> : <></>
          }
          { patientRecord ? <Modal id="modal" size="lg" centered show={showRecordModal} onHide={handleCloseRecordModal}>
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
                      { patientRecord.treatments.length > 0 ?
                          patientRecord.treatments.map((treatment, idx) => {
                            return (
                              <tr key={idx+1}>
                                <td>{idx+1}</td>
                                <td>{treatment.doctorEmail}</td>
                                <td>{treatment.date}</td>
                                <td>{treatment.disease}</td>
                                <td>{treatment.treatment}</td>
                                <td>
                                  { treatment.prescription ? 
                                    <Link to={`${process.env.REACT_APP_PINATA_DEDICATED_GATEWAY}/ipfs/${treatment.prescription}`} target="_blank"><Button variant="coolColor">View</Button></Link>
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
          </Modal> : <></>
          }
        </>
        : <div>Loading...</div>
      }
    </div>
  )
}


export default Doctor


