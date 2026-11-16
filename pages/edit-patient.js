import React, { Component } from 'react';
import { Divider, Form, Input, Message, Select, Loader } from 'semantic-ui-react';
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

class EditPatient extends Component {
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
    fetching: true,
    errorMessage: '',
    successMessage: '',
    account: '',
  };

  async componentDidMount() {
    try {
      const accounts = await web3.eth.getAccounts();
      if (!accounts || !accounts[0]) {
        this.setState({ fetching: false, errorMessage: 'Please connect your MetaMask wallet.' });
        return;
      }

      const userAddr = accounts[0];
      this.setState({ account: userAddr });

      const isPt = await record.methods.isPatient(userAddr).call();
      if (!isPt) {
        this.setState({
          fetching: false,
          errorMessage: 'You have not registered a patient record yet. Please register first.',
        });
        return;
      }

      const records = await record.methods.searchPatientDemographic(userAddr).call({ from: userAddr });
      const records2 = await record.methods.searchPatientMedical(userAddr).call({ from: userAddr });

      this.setState({
        fetching: false,
        ic: records[0] || '',
        name: records[1] || '',
        phone: records[2] || '',
        gender: records[3] || 'Male',
        dob: records[4] || '',
        height: records[5] || '',
        weight: records[6] || '',
        houseaddr: records2[0] || '',
        bloodgroup: records2[1] || '',
        allergies: records2[2] || 'None',
        medication: records2[3] || '',
        emergencyName: records2[4] || '',
        emergencyContact: records2[5] || '',
      });
    } catch (err) {
      console.warn('Error loading patient data to edit:', err);
      this.setState({ fetching: false });
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

    this.setState({ loading: true, errorMessage: '', successMessage: '' });

    try {
      const accounts = await web3.eth.getAccounts();
      await record.methods
        .editDetails(
          ic, name, phone, gender, dob, height, weight,
          houseaddr, bloodgroup, allergies, medication,
          emergencyName, emergencyContact
        )
        .send({ from: accounts[0] });

      this.setState({
        successMessage: 'Patient medical record updated successfully on-chain!',
      });

      setTimeout(() => {
        Router.pushRoute(`/record/${accounts[0]}`);
      }, 1500);
    } catch (err) {
      let friendly = err.message;
      if (err.message && err.message.includes('User denied')) {
        friendly = 'Transaction signature rejected in MetaMask.';
      }
      this.setState({ errorMessage: friendly });
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { fetching, loading, errorMessage, successMessage, account } = this.state;

    return (
      <Layout>
        <div style={{ maxWidth: '880px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <div className="web3-badge">
              <span className="dot" />
              <span>Record Self-Management</span>
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
              Update Patient Record
            </h1>
            <p style={{ color: '#94A3B8', fontSize: '1.05rem' }}>
              Modify your demographic, contact, and clinical baseline information.
              Wallet address:{' '}
              <span style={{ color: '#FF7354', fontFamily: 'monospace' }}>
                {account ? `${account.substring(0, 10)}...${account.substring(account.length - 6)}` : '(Connect MetaMask)'}
              </span>
            </p>
          </div>

          {fetching ? (
            <div style={{ textAlign: 'center', padding: '5rem 0' }}>
              <Loader active inline="centered" inverted content="Loading your on-chain record..." />
            </div>
          ) : (
            <div className="web3-card" style={{ padding: '2.5rem' }}>
              <Form onSubmit={this.onSubmit} error={!!errorMessage} success={!!successMessage}>
                <h3 style={{ color: '#FFFFFF', fontSize: '1.25rem', marginBottom: '1.25rem' }}>
                  Demographic Details
                </h3>
                <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.08)', marginBottom: '1.5rem' }} />

                <Form.Group widths="equal">
                  <Form.Field required>
                    <label>National IC</label>
                    <Input
                      value={this.state.ic}
                      onChange={(e) => this.setState({ ic: e.target.value })}
                    />
                  </Form.Field>

                  <Form.Field required>
                    <label>Full Name</label>
                    <Input
                      value={this.state.name}
                      onChange={(e) => this.setState({ name: e.target.value })}
                    />
                  </Form.Field>

                  <Form.Field>
                    <label>Contact Phone</label>
                    <Input
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
                    value={this.state.gender}
                    onChange={this.handleGender}
                  />

                  <Form.Field>
                    <label>Date of Birth</label>
                    <Input
                      value={this.state.dob}
                      onChange={(e) => this.setState({ dob: e.target.value })}
                    />
                  </Form.Field>

                  <Form.Field>
                    <label>Height (cm)</label>
                    <Input
                      value={this.state.height}
                      onChange={(e) => this.setState({ height: e.target.value })}
                    />
                  </Form.Field>

                  <Form.Field>
                    <label>Weight (kg)</label>
                    <Input
                      value={this.state.weight}
                      onChange={(e) => this.setState({ weight: e.target.value })}
                    />
                  </Form.Field>
                </Form.Group>

                <Form.Field style={{ marginTop: '1rem' }}>
                  <label>Residential Address</label>
                  <Form.TextArea
                    value={this.state.houseaddr}
                    onChange={(e) => this.setState({ houseaddr: e.target.value })}
                  />
                </Form.Field>

                <h3 style={{ color: '#FFFFFF', fontSize: '1.25rem', marginTop: '2.5rem', marginBottom: '1.25rem' }}>
                  Clinical Baseline Details
                </h3>
                <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.08)', marginBottom: '1.5rem' }} />

                <Form.Group widths="equal">
                  <Form.Field>
                    <label>Blood Group</label>
                    <Input
                      value={this.state.bloodgroup}
                      onChange={(e) => this.setState({ bloodgroup: e.target.value })}
                    />
                  </Form.Field>

                  <Form.Field
                    label="Allergies"
                    control={Select}
                    options={allergyOptions}
                    value={this.state.allergies}
                    onChange={this.handleAllergies}
                  />
                </Form.Group>

                <Form.Field style={{ marginTop: '1rem' }}>
                  <label>Current Medications</label>
                  <Form.TextArea
                    value={this.state.medication}
                    onChange={(e) => this.setState({ medication: e.target.value })}
                  />
                </Form.Field>

                <h3 style={{ color: '#FFFFFF', fontSize: '1.25rem', marginTop: '2.5rem', marginBottom: '1.25rem' }}>
                  Emergency Contact
                </h3>
                <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.08)', marginBottom: '1.5rem' }} />

                <Form.Group widths="equal">
                  <Form.Field>
                    <label>Emergency Contact Name</label>
                    <Input
                      value={this.state.emergencyName}
                      onChange={(e) => this.setState({ emergencyName: e.target.value })}
                    />
                  </Form.Field>

                  <Form.Field>
                    <label>Emergency Contact Phone</label>
                    <Input
                      value={this.state.emergencyContact}
                      onChange={(e) => this.setState({ emergencyContact: e.target.value })}
                    />
                  </Form.Field>
                </Form.Group>

                <div style={{ marginTop: '2.5rem' }}>
                  <Message error header="Update Failed" content={errorMessage} />
                  <Message success header="Record Updated!" content={successMessage} />

                  <button
                    type="submit"
                    className="web3-btn-primary"
                    style={{ width: '100%', padding: '0.95rem', fontSize: '1.05rem', marginTop: '1rem' }}
                    disabled={loading}
                  >
                    {loading ? 'Updating on Blockchain...' : 'SAVE RECORD CHANGES ➔'}
                  </button>
                </div>
              </Form>
            </div>
          )}
        </div>
      </Layout>
    );
  }
}

export default EditPatient;
