import React, { Component } from 'react';
import { Divider, Form, Input, Button, Segment, Message, Select } from 'semantic-ui-react';
import Layout from '../components/Layout';
import record from '../ethereum/record';
import web3 from '../ethereum/web3';
import { Router } from '../routes';

const options = [
  { key: 'm', text: 'Male', value: 'Male' },
  { key: 'f', text: 'Female', value: 'Female' },
  { key: 'o', text: 'Other', value: 'Other' },
];

const allergyOptions = [
  { key: 'n', text: 'None', value: 'None' },
  { key: 'f', text: 'Food', value: 'Food' },
  { key: 'm', text: 'Medical', value: 'Medical' },
  { key: 'e', text: 'Environmental', value: 'Environmental' },
  { key: 'o', text: 'Others', value: 'Others' },
];

class RegisterPatient extends Component {
  state = {
    ic: '',
    name: '',
    phone: '',
    gender: 'Male',
    dob: '',
    height: '',
    weight: '',
    houseaddr: '',
    bloodgroup: '',
    allergies: 'None',
    medication: '',
    emergencyName: '',
    emergencyContact: '',
    loading: false,
    errorMessage: '',
    successMessage: '',
    account: '',
  };

  async componentDidMount() {
    try {
      const accounts = await web3.eth.getAccounts();
      if (accounts && accounts[0]) {
        this.setState({ account: accounts[0] });
        const isRegistered = await record.methods.isPatient(accounts[0]).call();
        if (isRegistered) {
          this.setState({
            errorMessage: 'This Ethereum account is already registered as a patient in MediBlock.',
          });
        }
      }
    } catch (e) {
      console.warn('Could not check patient status:', e);
    }
  }

  handleGender = (e, { value }) => this.setState({ gender: value });
  handleAllergies = (e, { value }) => this.setState({ allergies: value });

  onSubmit = async (event) => {
    event.preventDefault();

    const {
      ic, name, phone, gender, dob, height, weight,
      houseaddr, bloodgroup, allergies, medication,
      emergencyName, emergencyContact
    } = this.state;

    // Field Validation
    if (!ic.trim() || !name.trim()) {
      this.setState({ errorMessage: 'National IC and Full Name are strictly required.' });
      return;
    }

    this.setState({ loading: true, errorMessage: '', successMessage: '' });

    try {
      const accounts = await web3.eth.getAccounts();
      if (!accounts || accounts.length === 0) {
        throw new Error('No Ethereum account found. Please connect your MetaMask wallet.');
      }

      await record.methods
        .setDetails(
          ic.trim(), name.trim(), phone.trim(), gender, dob.trim(),
          height.trim(), weight.trim(), houseaddr.trim(), bloodgroup.trim(),
          allergies, medication.trim(), emergencyName.trim(), emergencyContact.trim()
        )
        .send({ from: accounts[0] });

      this.setState({
        successMessage: 'Patient record created and cryptographically sealed on Ethereum Sepolia!',
      });

      setTimeout(() => {
        Router.pushRoute(`/record/${accounts[0]}`);
      }, 1500);
    } catch (err) {
      let friendlyError = err.message;
      if (err.message && err.message.includes('User denied')) {
        friendlyError = 'Transaction was rejected in MetaMask.';
      } else if (err.message && err.message.includes('revert')) {
        friendlyError = 'Smart contract reverted: This account may already be registered or inputs failed validation.';
      }
      this.setState({ errorMessage: friendlyError });
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { account, loading, errorMessage, successMessage } = this.state;

    return (
      <Layout>
        <div style={{ maxWidth: '880px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <div className="web3-badge">
              <span className="dot" />
              <span>Sovereign Patient Onboarding</span>
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
              Create Patient Medical Record
            </h1>
            <p style={{ color: '#94A3B8', fontSize: '1.05rem' }}>
              Your medical baseline data will be cryptographically linked to your Ethereum wallet address{' '}
              <span style={{ color: '#FF7354', fontFamily: 'monospace' }}>
                {account ? `${account.substring(0, 10)}...${account.substring(account.length - 6)}` : '(Connect MetaMask)'}
              </span>
              . Only authorized doctors can access it.
            </p>
          </div>

          <div className="web3-card" style={{ padding: '2.5rem' }}>
            <Form onSubmit={this.onSubmit} error={!!errorMessage} success={!!successMessage}>
              <h3 style={{ color: '#FFFFFF', fontSize: '1.25rem', marginBottom: '1.25rem' }}>
                1. General Demographic Information
              </h3>
              <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.08)', marginBottom: '1.5rem' }} />

              <Form.Group widths="equal">
                <Form.Field required>
                  <label>National IC / Health ID</label>
                  <Input
                    placeholder="Eg. 001234010234"
                    value={this.state.ic}
                    onChange={(e) => this.setState({ ic: e.target.value })}
                  />
                </Form.Field>

                <Form.Field required>
                  <label>Full Legal Name</label>
                  <Input
                    placeholder="Eg. Sarah Connor"
                    value={this.state.name}
                    onChange={(e) => this.setState({ name: e.target.value })}
                  />
                </Form.Field>

                <Form.Field>
                  <label>Contact Phone</label>
                  <Input
                    placeholder="Eg. +1 555-0199"
                    value={this.state.phone}
                    onChange={(e) => this.setState({ phone: e.target.value })}
                  />
                </Form.Field>
              </Form.Group>

              <Form.Group widths="equal">
                <Form.Field
                  label="Gender"
                  control={Select}
                  options={options}
                  defaultValue="Male"
                  onChange={this.handleGender}
                />

                <Form.Field>
                  <label>Date of Birth</label>
                  <Input
                    placeholder="DD/MM/YYYY"
                    value={this.state.dob}
                    onChange={(e) => this.setState({ dob: e.target.value })}
                  />
                </Form.Field>

                <Form.Field>
                  <label>Height (cm)</label>
                  <Input
                    placeholder="175"
                    value={this.state.height}
                    onChange={(e) => this.setState({ height: e.target.value })}
                  />
                </Form.Field>

                <Form.Field>
                  <label>Weight (kg)</label>
                  <Input
                    placeholder="68"
                    value={this.state.weight}
                    onChange={(e) => this.setState({ weight: e.target.value })}
                  />
                </Form.Field>
              </Form.Group>

              <Form.Field style={{ marginTop: '1rem' }}>
                <label>Residential Address</label>
                <Form.TextArea
                  placeholder="Eg. 104 Main Street, New York, NY"
                  value={this.state.houseaddr}
                  onChange={(e) => this.setState({ houseaddr: e.target.value })}
                />
              </Form.Field>

              <h3 style={{ color: '#FFFFFF', fontSize: '1.25rem', marginTop: '2.5rem', marginBottom: '1.25rem' }}>
                2. Baseline Clinical & Medical Details
              </h3>
              <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.08)', marginBottom: '1.5rem' }} />

              <Form.Group widths="equal">
                <Form.Field>
                  <label>Blood Group</label>
                  <Input
                    placeholder="Eg. O+, A-, B+"
                    value={this.state.bloodgroup}
                    onChange={(e) => this.setState({ bloodgroup: e.target.value })}
                  />
                </Form.Field>

                <Form.Field
                  label="Known Allergies"
                  control={Select}
                  options={allergyOptions}
                  defaultValue="None"
                  onChange={this.handleAllergies}
                />
              </Form.Group>

              <Form.Field style={{ marginTop: '1rem' }}>
                <label>Current Medications</label>
                <Form.TextArea
                  placeholder="Eg. Metformin 500mg daily, Inhaler as needed"
                  value={this.state.medication}
                  onChange={(e) => this.setState({ medication: e.target.value })}
                />
              </Form.Field>

              <h3 style={{ color: '#FFFFFF', fontSize: '1.25rem', marginTop: '2.5rem', marginBottom: '1.25rem' }}>
                3. Emergency Contact
              </h3>
              <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.08)', marginBottom: '1.5rem' }} />

              <Form.Group widths="equal">
                <Form.Field>
                  <label>Emergency Contact Name</label>
                  <Input
                    placeholder="Eg. John Smith (Spouse)"
                    value={this.state.emergencyName}
                    onChange={(e) => this.setState({ emergencyName: e.target.value })}
                  />
                </Form.Field>

                <Form.Field>
                  <label>Emergency Contact Phone</label>
                  <Input
                    placeholder="Eg. +1 555-0144"
                    value={this.state.emergencyContact}
                    onChange={(e) => this.setState({ emergencyContact: e.target.value })}
                  />
                </Form.Field>
              </Form.Group>

              <div style={{ marginTop: '2rem' }}>
                <Message error header="Transaction Failed" content={errorMessage} />
                <Message success header="Record Registered!" content={successMessage} />

                <button
                  type="submit"
                  className="web3-btn-primary"
                  style={{ width: '100%', padding: '0.95rem', fontSize: '1.05rem', marginTop: '1rem' }}
                  disabled={loading}
                >
                  {loading ? 'Confirming on Ethereum...' : 'SIGN & REGISTER RECORD ➔'}
                </button>
              </div>
            </Form>
          </div>
        </div>
      </Layout>
    );
  }
}

export default RegisterPatient;
