import React, { Component } from 'react';
import { Divider, Form, Input, Message, Select } from 'semantic-ui-react';
import Layout from '../components/Layout';
import record from '../ethereum/record';
import web3 from '../ethereum/web3';
import { Router } from '../routes';

const statusOptions = [
  { key: 'p', text: 'Pending', value: 'Pending' },
  { key: 'c', text: 'Confirmed', value: 'Confirmed' },
  { key: 'cmp', text: 'Completed', value: 'Completed' },
];

class EditAppointment extends Component {
  state = {
    patientaddr: '',
    date: '',
    time: '',
    prescription: '',
    description: '',
    diagnosis: '',
    status: 'Completed',
    loading: false,
    fetchingExisting: false,
    errorMessage: '',
    successMessage: '',
    account: '',
  };

  async componentDidMount() {
    try {
      const accounts = await web3.eth.getAccounts();
      if (accounts && accounts[0]) {
        this.setState({ account: accounts[0] });
      }
    } catch (e) {
      console.warn(e);
    }
  }

  handleStatus = (e, { value }) => this.setState({ status: value });

  loadExistingAppointment = async () => {
    const { patientaddr, account } = this.state;
    if (!patientaddr || !web3.utils.isAddress(patientaddr)) {
      this.setState({ errorMessage: 'Please enter a valid patient address to fetch current details.' });
      return;
    }

    this.setState({ fetchingExisting: true, errorMessage: '', successMessage: '' });

    try {
      const appt = await record.methods.searchAppointment(patientaddr).call({ from: account });
      this.setState({
        date: appt[2] || '',
        time: appt[3] || '',
        diagnosis: appt[4] || '',
        prescription: appt[5] || '',
        description: appt[6] || '',
        status: appt[7] || 'Completed',
        successMessage: 'Existing consultation details populated.',
      });
    } catch (err) {
      this.setState({
        errorMessage: 'Could not fetch appointment for this patient. Ensure you have permission or an existing consultation exists.',
      });
    } finally {
      this.setState({ fetchingExisting: false });
    }
  };

  onSubmit = async (event) => {
    event.preventDefault();
    const { patientaddr, date, time, diagnosis, prescription, description, status } = this.state;

    if (!patientaddr.trim() || !web3.utils.isAddress(patientaddr.trim())) {
      this.setState({ errorMessage: 'Valid Patient Ethereum Address is required.' });
      return;
    }

    this.setState({ loading: true, errorMessage: '', successMessage: '' });

    try {
      const accounts = await web3.eth.getAccounts();
      await record.methods
        .updateAppointment(
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
        successMessage: 'Appointment & prescription updated successfully on-chain!',
      });

      setTimeout(() => {
        Router.pushRoute(`/record/${patientaddr.trim()}`);
      }, 1500);
    } catch (err) {
      let friendly = err.message;
      if (err.message && err.message.includes('User denied')) {
        friendly = 'Transaction signature rejected in MetaMask.';
      } else if (err.message && err.message.includes('revert')) {
        friendly = 'Smart contract reverted: Only the doctor who created this consultation (or admin) can update it.';
      }
      this.setState({ errorMessage: friendly });
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const {
      patientaddr, date, time, diagnosis, prescription, description,
      status, loading, fetchingExisting, errorMessage, successMessage
    } = this.state;

    return (
      <Layout>
        <div style={{ maxWidth: '880px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <div className="web3-badge">
              <span className="dot" />
              <span>Clinical Follow-Up & Consultation Update</span>
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
              Update Consultation Record
            </h1>
            <p style={{ color: '#94A3B8', fontSize: '1.05rem' }}>
              Update clinical notes, status, and prescriptions for existing patient consultations.
            </p>
          </div>

          <div className="web3-card" style={{ padding: '2.5rem' }}>
            <Form onSubmit={this.onSubmit} error={!!errorMessage} success={!!successMessage}>
              <h3 style={{ color: '#FFFFFF', fontSize: '1.25rem', marginBottom: '1.25rem' }}>
                Patient Consultation Lookup
              </h3>
              <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.08)', marginBottom: '1.5rem' }} />

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <Form.Field required>
                    <label>Patient Ethereum Address</label>
                    <Input
                      placeholder="0x... (Patient Address)"
                      value={patientaddr}
                      onChange={(e) => this.setState({ patientaddr: e.target.value })}
                    />
                  </Form.Field>
                </div>
                <div style={{ paddingTop: '24px' }}>
                  <button
                    type="button"
                    onClick={this.loadExistingAppointment}
                    className="web3-btn-secondary"
                    style={{ padding: '0.75rem 1.25rem' }}
                    disabled={fetchingExisting}
                  >
                    {fetchingExisting ? 'Loading...' : 'Fetch Existing Data'}
                  </button>
                </div>
              </div>

              <h3 style={{ color: '#FFFFFF', fontSize: '1.25rem', marginTop: '2rem', marginBottom: '1.25rem' }}>
                Updated Findings & Prescriptions
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
                  label="Status"
                  control={Select}
                  options={statusOptions}
                  value={status}
                  onChange={this.handleStatus}
                />
              </Form.Group>

              <Form.Field required style={{ marginTop: '1rem' }}>
                <label>Diagnosis</label>
                <Input
                  value={diagnosis}
                  onChange={(e) => this.setState({ diagnosis: e.target.value })}
                />
              </Form.Field>

              <Form.Field required style={{ marginTop: '1rem' }}>
                <label>Prescription & Dosage Details</label>
                <Form.TextArea
                  value={prescription}
                  onChange={(e) => this.setState({ prescription: e.target.value })}
                />
              </Form.Field>

              <Form.Field style={{ marginTop: '1rem' }}>
                <label>Observations & Clinical Description</label>
                <Form.TextArea
                  value={description}
                  onChange={(e) => this.setState({ description: e.target.value })}
                />
              </Form.Field>

              <div style={{ marginTop: '2.5rem' }}>
                <Message error header="Update Failed" content={errorMessage} />
                <Message success header="Success" content={successMessage} />

                <button
                  type="submit"
                  className="web3-btn-primary"
                  style={{ width: '100%', padding: '0.95rem', fontSize: '1.05rem', marginTop: '1rem' }}
                  disabled={loading}
                >
                  {loading ? 'Updating On Ethereum...' : 'SIGN & UPDATE CONSULTATION ➔'}
                </button>
              </div>
            </Form>
          </div>
        </div>
      </Layout>
    );
  }
}

export default EditAppointment;
