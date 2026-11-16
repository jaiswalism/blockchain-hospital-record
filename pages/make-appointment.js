import React, { Component } from 'react';
import { Divider, Form, Input, Message, Select, Dropdown } from 'semantic-ui-react';
import Layout from '../components/Layout';
import record from '../ethereum/record';
import web3 from '../ethereum/web3';
import { Router } from '../routes';

const statusOptions = [
  { key: 'p', text: 'Pending', value: 'Pending' },
  { key: 'c', text: 'Confirmed', value: 'Confirmed' },
  { key: 'cmp', text: 'Completed', value: 'Completed' },
];

class MakeAppointment extends Component {
  state = {
    patientaddr: '',
    date: '',
    time: '',
    prescription: '',
    description: '',
    diagnosis: '',
    status: 'Confirmed',
    loading: false,
    errorMessage: '',
    successMessage: '',
    account: '',
    isDoctor: false,
    isVerified: false,
    authorizedPatients: [],
    loadingPatients: true,
  };

  async componentDidMount() {
    try {
      const accounts = await web3.eth.getAccounts();
      if (!accounts || !accounts[0]) {
        this.setState({
          loadingPatients: false,
          errorMessage: 'Please connect your MetaMask wallet.',
        });
        return;
      }

      const currentDoc = accounts[0];
      const isDoc = await record.methods.isDoctor(currentDoc).call();
      const isVer = await record.methods.isDoctorVerified(currentDoc).call();

      this.setState({
        account: currentDoc,
        isDoctor: isDoc,
        isVerified: isVer,
      });

      if (!isDoc) {
        this.setState({
          errorMessage: 'You must be registered as a Doctor to create clinical appointments.',
          loadingPatients: false,
        });
        return;
      }

      if (!isVer) {
        this.setState({
          errorMessage: 'Your doctor account is pending administrator verification. You cannot issue appointments yet.',
          loadingPatients: false,
        });
        return;
      }

      // Find patients who have approved this doctor
      const rawPts = await record.methods.getPatients().call();
      const allPts = rawPts || [];
      const approvedPts = [];

      for (let i = 0; i < allPts.length; i++) {
        const pt = allPts[i];
        const isApp = await record.methods.isApproved(pt, currentDoc).call();
        if (isApp) {
          try {
            const demo = await record.methods.searchPatientDemographic(pt).call({ from: currentDoc });
            approvedPts.push({
              key: pt,
              text: `${demo[1]} (${pt.substring(0, 8)}...)`,
              value: pt,
            });
          } catch (e) {
            approvedPts.push({ key: pt, text: pt, value: pt });
          }
        }
      }

      this.setState({
        authorizedPatients: approvedPts,
        loadingPatients: false,
      });
    } catch (err) {
      console.warn('Error loading patient consent list for appointment:', err);
      this.setState({ loadingPatients: false });
    }
  }

  handleStatus = (e, { value }) => this.setState({ status: value });
  handlePatientSelect = (e, { value }) => this.setState({ patientaddr: value });

  onSubmit = async (event) => {
    event.preventDefault();
    const { patientaddr, date, time, diagnosis, prescription, description, status } = this.state;

    if (!patientaddr.trim()) {
      this.setState({ errorMessage: 'Please specify or select a patient Ethereum address.' });
      return;
    }

    if (!web3.utils.isAddress(patientaddr.trim())) {
      this.setState({ errorMessage: 'Invalid Ethereum address format.' });
      return;
    }

    if (!diagnosis.trim() || !prescription.trim()) {
      this.setState({ errorMessage: 'Diagnosis and Prescription details are required.' });
      return;
    }

    this.setState({ loading: true, errorMessage: '', successMessage: '' });

    try {
      const accounts = await web3.eth.getAccounts();
      await record.methods
        .setAppointment(
          patientaddr.trim(),
          date.trim() || new Date().toLocaleDateString(),
          time.trim() || new Date().toLocaleTimeString(),
          diagnosis.trim(),
          prescription.trim(),
          description.trim(),
          status
        )
        .send({ from: accounts[0] });

      this.setState({
        successMessage: `Clinical appointment & prescription recorded on-chain for patient ${patientaddr}!`,
      });

      setTimeout(() => {
        Router.pushRoute(`/record/${patientaddr.trim()}`);
      }, 1500);
    } catch (err) {
      let friendly = err.message;
      if (err.message && err.message.includes('User denied')) {
        friendly = 'Transaction signature rejected in MetaMask.';
      } else if (err.message && err.message.includes('revert')) {
        friendly = 'Smart contract reverted: Verify that this patient has granted you consent and your doctor profile is verified.';
      }
      this.setState({ errorMessage: friendly });
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const {
      patientaddr, date, time, diagnosis, prescription, description,
      status, loading, errorMessage, successMessage, authorizedPatients,
      isDoctor, isVerified, account
    } = this.state;

    return (
      <Layout>
        <div style={{ maxWidth: '880px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <div className="web3-badge">
              <span className="dot" />
              <span>Clinical Consultation Entry</span>
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
              Create Medical Consultation
            </h1>
            <p style={{ color: '#94A3B8', fontSize: '1.05rem' }}>
              Issue diagnoses, prescriptions, and follow-up consultation records on the Ethereum blockchain.
              Doctor address:{' '}
              <span style={{ color: '#FF7354', fontFamily: 'monospace' }}>
                {account ? `${account.substring(0, 10)}...${account.substring(account.length - 6)}` : '(Connect MetaMask)'}
              </span>
            </p>
          </div>

          <div className="web3-card" style={{ padding: '2.5rem' }}>
            <Form onSubmit={this.onSubmit} error={!!errorMessage} success={!!successMessage}>
              <h3 style={{ color: '#FFFFFF', fontSize: '1.25rem', marginBottom: '1.25rem' }}>
                1. Patient Selection
              </h3>
              <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.08)', marginBottom: '1.5rem' }} />

              {authorizedPatients.length > 0 && (
                <Form.Field style={{ marginBottom: '1.25rem' }}>
                  <label>Select From Patients Who Granted You Access</label>
                  <Dropdown
                    placeholder="Choose an authorized patient..."
                    fluid
                    selection
                    options={authorizedPatients}
                    onChange={this.handlePatientSelect}
                  />
                </Form.Field>
              )}

              <Form.Field required>
                <label>Patient Ethereum Wallet Address</label>
                <Input
                  placeholder="0x... (Patient Address)"
                  value={patientaddr}
                  onChange={(e) => this.setState({ patientaddr: e.target.value })}
                />
                <span style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '4px', display: 'block' }}>
                  * The patient must have authorized your address via their consent settings.
                </span>
              </Form.Field>

              <h3 style={{ color: '#FFFFFF', fontSize: '1.25rem', marginTop: '2.5rem', marginBottom: '1.25rem' }}>
                2. Clinical Findings & Consultation Details
              </h3>
              <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.08)', marginBottom: '1.5rem' }} />

              <Form.Group widths="equal">
                <Form.Field>
                  <label>Date</label>
                  <Input
                    placeholder="DD/MM/YYYY"
                    value={date}
                    onChange={(e) => this.setState({ date: e.target.value })}
                  />
                </Form.Field>

                <Form.Field>
                  <label>Time</label>
                  <Input
                    placeholder="HH:MM AM/PM"
                    value={time}
                    onChange={(e) => this.setState({ time: e.target.value })}
                  />
                </Form.Field>

                <Form.Field
                  label="Appointment Status"
                  control={Select}
                  options={statusOptions}
                  defaultValue="Confirmed"
                  onChange={this.handleStatus}
                />
              </Form.Group>

              <Form.Field required style={{ marginTop: '1rem' }}>
                <label>Clinical Diagnosis</label>
                <Input
                  placeholder="Eg. Type 2 Diabetes Mellitus, Acute Bronchitis"
                  value={diagnosis}
                  onChange={(e) => this.setState({ diagnosis: e.target.value })}
                />
              </Form.Field>

              <Form.Field required style={{ marginTop: '1rem' }}>
                <label>Prescription & Dosage Details</label>
                <Form.TextArea
                  placeholder="Eg. Amoxicillin 500mg, 1 tablet TID for 7 days. Paracetamol 500mg PRN for pain."
                  value={prescription}
                  onChange={(e) => this.setState({ prescription: e.target.value })}
                />
              </Form.Field>

              <Form.Field style={{ marginTop: '1rem' }}>
                <label>Doctor's Observations & Recommendations</label>
                <Form.TextArea
                  placeholder="Eg. Patient exhibits moderate wheezing. Advised to stay hydrated and return for checkup in 2 weeks."
                  value={description}
                  onChange={(e) => this.setState({ description: e.target.value })}
                />
              </Form.Field>

              <div style={{ marginTop: '2.5rem' }}>
                <Message error header="Action Failed" content={errorMessage} />
                <Message success header="Consultation Recorded!" content={successMessage} />

                <button
                  type="submit"
                  className="web3-btn-primary"
                  style={{ width: '100%', padding: '0.95rem', fontSize: '1.05rem', marginTop: '1rem' }}
                  disabled={loading}
                >
                  {loading ? 'Recording On Ethereum...' : 'SEAL APPOINTMENT ON-CHAIN ➔'}
                </button>
              </div>
            </Form>
          </div>
        </div>
      </Layout>
    );
  }
}

export default MakeAppointment;
