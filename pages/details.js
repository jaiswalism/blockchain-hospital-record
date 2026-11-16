import React, { Component } from 'react';
import { Grid, Loader, Message, Icon } from 'semantic-ui-react';
import Layout from '../components/Layout';
import record from '../ethereum/record';
import web3 from '../ethereum/web3';
import { Link } from '../routes';

class RecordDetails extends Component {
  static async getInitialProps(props) {
    return { targetAddress: props.query.address };
  }

  state = {
    loading: true,
    hasAccess: false,
    errorMessage: '',
    account: '',
    demographic: null,
    medical: null,
    appointment: null,
  };

  async componentDidMount() {
    await this.loadRecordData();
  }

  loadRecordData = async () => {
    const { targetAddress } = this.props;

    if (!targetAddress || !web3.utils.isAddress(targetAddress)) {
      this.setState({
        loading: false,
        hasAccess: false,
        errorMessage: 'Invalid or missing patient Ethereum wallet address in URL.',
      });
      return;
    }

    this.setState({ loading: true, errorMessage: '' });

    try {
      const accounts = await web3.eth.getAccounts();
      const caller = accounts && accounts[0] ? accounts[0] : '';
      this.setState({ account: caller });

      if (!caller) {
        this.setState({
          loading: false,
          hasAccess: false,
          errorMessage: 'Please connect your MetaMask wallet to query this medical record.',
        });
        return;
      }

      // Check access through smart contract call
      const records = await record.methods.searchPatientDemographic(targetAddress).call({ from: caller });
      const records2 = await record.methods.searchPatientMedical(targetAddress).call({ from: caller });

      let appt = null;
      try {
        const rawAppt = await record.methods.searchAppointment(targetAddress).call({ from: caller });
        if (rawAppt && rawAppt[0] && !rawAppt[0].includes('0x0000000000000000000000000000000000000000')) {
          appt = {
            doctoraddr: rawAppt[0],
            doctorname: rawAppt[1],
            date: rawAppt[2],
            time: rawAppt[3],
            diagnosis: rawAppt[4],
            prescription: rawAppt[5],
            description: rawAppt[6],
            status: rawAppt[7],
          };
        }
      } catch (e) {
        console.log('No appointment or restricted:', e.message);
      }

      this.setState({
        loading: false,
        hasAccess: true,
        demographic: {
          ic: records[0],
          name: records[1],
          phone: records[2],
          gender: records[3],
          dob: records[4],
          height: records[5],
          weight: records[6],
        },
        medical: {
          houseaddr: records2[0],
          bloodgroup: records2[1],
          allergies: records2[2],
          medication: records2[3],
          emergencyName: records2[4],
          emergencyContact: records2[5],
        },
        appointment: appt,
      });
    } catch (err) {
      console.warn('Access denied or record error:', err);
      this.setState({
        loading: false,
        hasAccess: false,
        errorMessage: 'Cryptographic Consent Required: You do not have permission to view this patient record. The patient must explicitly grant permission from the "Allow Access" page.',
      });
    }
  };

  render() {
    const { targetAddress } = this.props;
    const { loading, hasAccess, errorMessage, demographic, medical, appointment, account } = this.state;
    const isOwnerOfRecord = account && targetAddress && account.toLowerCase() === targetAddress.toLowerCase();

    return (
      <Layout>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <div className="web3-badge">
              <span className="dot" />
              <span>Patient Medical History & Audit Record</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ fontSize: '2.25rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
                  {demographic ? demographic.name : 'Patient Record Profile'}
                </h1>
                <div style={{ fontFamily: 'monospace', color: '#94A3B8', fontSize: '0.95rem' }}>
                  Address: <span style={{ color: '#FF7354' }}>{targetAddress}</span>
                </div>
              </div>

              {isOwnerOfRecord && (
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Link route="/edit-patient">
                    <a className="web3-btn-secondary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                      Edit Details
                    </a>
                  </Link>
                  <Link route="/approve-doctor">
                    <a className="web3-btn-primary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                      Manage Doctor Permissions
                    </a>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '5rem 0' }}>
              <Loader active inline="centered" inverted content="Verifying cryptographic consent on-chain..." />
            </div>
          ) : !hasAccess ? (
            <div
              className="web3-card"
              style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                border: '1px solid rgba(255, 77, 45, 0.4)',
                boxShadow: '0 0 30px rgba(255, 77, 45, 0.15)',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1rem' }}>
                Access Restricted by Smart Contract
              </h2>
              <p style={{ color: '#CBD5E1', maxWidth: '600px', margin: '0 auto 2rem auto', fontSize: '1rem', lineHeight: 1.6 }}>
                {errorMessage}
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <Link route="/approve-doctor">
                  <a className="web3-btn-primary">Grant Permission to Doctor</a>
                </Link>
                <Link route="/list">
                  <a className="web3-btn-secondary">Back to Records List</a>
                </Link>
              </div>
            </div>
          ) : (
            <Grid stackable columns={2}>
              {/* Left Column: Demographics & Emergency Contact */}
              <Grid.Column width={6}>
                <div className="web3-card" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                  <div
                    style={{
                      width: '84px',
                      height: '84px',
                      borderRadius: '50%',
                      background: 'rgba(255, 77, 45, 0.15)',
                      border: '2px solid #FF4D2D',
                      margin: '0 auto 1.25rem auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2.5rem',
                    }}
                  >
                    {demographic.gender === 'Female' ? '👩' : '👨'}
                  </div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                    {demographic.name}
                  </h2>
                  <div style={{ color: '#10B981', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.5rem' }}>
                    ✓ Authorized On-Chain Record
                  </div>

                  <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748B' }}>National IC:</span>
                      <span style={{ fontWeight: 600, color: '#FFFFFF' }}>{demographic.ic}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748B' }}>Phone:</span>
                      <span style={{ fontWeight: 600, color: '#FFFFFF' }}>{demographic.phone || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748B' }}>Gender:</span>
                      <span style={{ fontWeight: 600, color: '#FFFFFF' }}>{demographic.gender}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748B' }}>Date of Birth:</span>
                      <span style={{ fontWeight: 600, color: '#FFFFFF' }}>{demographic.dob || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748B' }}>Height:</span>
                      <span style={{ fontWeight: 600, color: '#FFFFFF' }}>{demographic.height} cm</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748B' }}>Weight:</span>
                      <span style={{ fontWeight: 600, color: '#FFFFFF' }}>{demographic.weight} kg</span>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="web3-card">
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FF7354', marginBottom: '1rem', textTransform: 'uppercase' }}>
                    🚨 Emergency Contact
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Contact Person</div>
                      <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '1rem' }}>
                        {medical.emergencyName || 'Not specified'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Contact Phone</div>
                      <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '1rem' }}>
                        {medical.emergencyContact || 'Not specified'}
                      </div>
                    </div>
                  </div>
                </div>
              </Grid.Column>

              {/* Right Column: Medical Data & Appointments */}
              <Grid.Column width={10}>
                {/* Clinical History */}
                <div className="web3-card" style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1.25rem' }}>
                    Clinical Baseline & Allergies
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div style={{ background: '#0D0F15', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <div style={{ color: '#64748B', fontSize: '0.8rem' }}>Blood Group</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FF4D2D', marginTop: '2px' }}>
                        {medical.bloodgroup || 'Unknown'}
                      </div>
                    </div>

                    <div style={{ background: '#0D0F15', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <div style={{ color: '#64748B', fontSize: '0.8rem' }}>Known Allergies</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#FFFFFF', marginTop: '2px' }}>
                        {medical.allergies || 'None'}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '4px' }}>Current Medications</div>
                    <div style={{ background: '#0D0F15', padding: '1rem', borderRadius: '8px', color: '#E2E8F0', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      {medical.medication || 'No ongoing medications recorded.'}
                    </div>
                  </div>

                  <div>
                    <div style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '4px' }}>Residential Address</div>
                    <div style={{ background: '#0D0F15', padding: '1rem', borderRadius: '8px', color: '#CBD5E1', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      {medical.houseaddr || 'Address not listed.'}
                    </div>
                  </div>
                </div>

                {/* Latest Appointment / Consultation History */}
                <div className="web3-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                      Latest Consultation Record
                    </h3>
                    <Link route="/make-appointment">
                      <a className="web3-btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}>
                        + Add Consultation
                      </a>
                    </Link>
                  </div>

                  {appointment ? (
                    <div style={{ background: '#0D0F15', borderRadius: '10px', padding: '1.5rem', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF' }}>
                            {appointment.diagnosis}
                          </div>
                          <div style={{ color: '#64748B', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                            Attending Doctor: {appointment.doctorname} ({appointment.doctoraddr.substring(0, 8)}...)
                          </div>
                        </div>
                        <span
                          style={{
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: '#10B981',
                            border: '1px solid #10B981',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        >
                          {appointment.status || 'Completed'}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                          <span style={{ color: '#64748B', fontSize: '0.8rem' }}>Date: </span>
                          <span style={{ color: '#E2E8F0', fontWeight: 600 }}>{appointment.date}</span>
                        </div>
                        <div>
                          <span style={{ color: '#64748B', fontSize: '0.8rem' }}>Time: </span>
                          <span style={{ color: '#E2E8F0', fontWeight: 600 }}>{appointment.time}</span>
                        </div>
                      </div>

                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ color: '#FF7354', fontWeight: 600, fontSize: '0.85rem', marginBottom: '2px' }}>Prescription:</div>
                        <div style={{ color: '#FFFFFF', fontSize: '0.95rem' }}>{appointment.prescription}</div>
                      </div>

                      <div>
                        <div style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '2px' }}>Clinical Observations / Remarks:</div>
                        <div style={{ color: '#CBD5E1', fontSize: '0.9rem' }}>{appointment.description}</div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748B' }}>
                      No clinical consultations or prescriptions logged for this patient yet.
                    </div>
                  )}
                </div>
              </Grid.Column>
            </Grid>
          )}
        </div>
      </Layout>
    );
  }
}

export default RecordDetails;
