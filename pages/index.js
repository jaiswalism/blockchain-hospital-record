import React, { Component } from 'react';
import Layout from '../components/Layout';
import { Link, Router } from '../routes';
import web3 from '../ethereum/web3';
import { Container, Grid, Icon } from 'semantic-ui-react';

export default class IndexPage extends Component {
  state = {
    activeTab: 'patient',
    activeBlock: 0,
  };

  onGetStarted = async () => {
    try {
      const accounts = await web3.eth.getAccounts();
      if (accounts && accounts[0]) {
        Router.pushRoute('/dashboard');
      } else {
        Router.pushRoute('/register-patient');
      }
    } catch (e) {
      Router.pushRoute('/dashboard');
    }
  };

  render() {
    const { activeTab, activeBlock } = this.state;

    return (
      <Layout>
        {/* Hero Section */}
        <div style={{ textAlign: 'center', paddingTop: '2rem', paddingBottom: '3.5rem' }}>
          <div className="web3-badge">
            <span className="dot" />
            <span>Decentralized Web3 Healthcare Protocol ➔</span>
          </div>

          <h1
            style={{
              fontSize: '3.75rem',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              margin: '0 auto 1.25rem auto',
              maxWidth: '900px',
            }}
          >
            Secure and Manage Your <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #FFFFFF 30%, #FF6647 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Healthcare Records
            </span>{' '}
            in Minutes
          </h1>

          <p
            style={{
              fontSize: '1.25rem',
              color: '#94A3B8',
              maxWidth: '720px',
              margin: '0 auto 2.5rem auto',
              lineHeight: 1.6,
            }}
          >
            Launch patient records, verify doctor credentials, and log clinical consultations with
            patient-controlled cryptographic consent on the Ethereum blockchain.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link route="/dashboard">
              <a className="web3-btn-primary" style={{ fontSize: '1.05rem', padding: '0.9rem 2.2rem' }}>
                GET STARTED ➔
              </a>
            </Link>
            <Link route="/list">
              <a className="web3-btn-secondary" style={{ fontSize: '1.05rem', padding: '0.9rem 2.2rem' }}>
                EXPLORE DIRECTORY
              </a>
            </Link>
          </div>
        </div>

        {/* Interactive Web3 Architecture Showcase (Inspired by user image 1 & 2) */}
        <div
          style={{
            background: 'rgba(15, 17, 23, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '2.5rem',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(255, 77, 45, 0.1)',
            marginBottom: '5rem',
          }}
        >
          {/* Top Bar inside mockup */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              paddingBottom: '1.25rem',
              marginBottom: '2rem',
            }}
          >
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#EF4444' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F59E0B' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10B981' }} />
            </div>

            {/* Toggle Tabs */}
            <div
              style={{
                display: 'flex',
                background: '#0D0F14',
                padding: '4px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <button
                onClick={() => this.setState({ activeTab: 'patient' })}
                style={{
                  background: activeTab === 'patient' ? '#1E222D' : 'transparent',
                  color: activeTab === 'patient' ? '#FFFFFF' : '#64748B',
                  border: activeTab === 'patient' ? '1px solid rgba(255, 77, 45, 0.3)' : 'none',
                  borderRadius: '6px',
                  padding: '6px 16px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                Patient Flow
              </button>
              <button
                onClick={() => this.setState({ activeTab: 'doctor' })}
                style={{
                  background: activeTab === 'doctor' ? '#1E222D' : 'transparent',
                  color: activeTab === 'doctor' ? '#FFFFFF' : '#64748B',
                  border: activeTab === 'doctor' ? '1px solid rgba(255, 77, 45, 0.3)' : 'none',
                  borderRadius: '6px',
                  padding: '6px 16px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                Doctor Flow
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10B981', fontSize: '0.85rem' }}>
              <span className="web3-status-dot" />
              <span>Smart Contract Active</span>
            </div>
          </div>

          {/* Dual Panel Layout */}
          <Grid stackable columns={2}>
            {/* Left Panel: Workflow Steps */}
            <Grid.Column width={7}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Step 1 */}
                <div
                  onClick={() => this.setState({ activeBlock: 0 })}
                  style={{
                    background: activeBlock === 0 ? 'rgba(255, 77, 45, 0.08)' : '#13161F',
                    border: activeBlock === 0 ? '1px solid #FF4D2D' : '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: activeBlock === 0 ? '0 0 20px rgba(255, 77, 45, 0.2)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: '#1A1E29',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FF4D2D',
                        fontWeight: 700,
                      }}
                    >
                      1
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '1rem' }}>
                        {activeTab === 'patient' ? 'Register Patient Identity' : 'Register Medical Credentials'}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '2px' }}>
                        {activeTab === 'patient'
                          ? 'Link Ethereum wallet with personal & clinical baseline data'
                          : 'Submit qualification, specialization, and IC number'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div
                  onClick={() => this.setState({ activeBlock: 1 })}
                  style={{
                    background: activeBlock === 1 ? 'rgba(255, 77, 45, 0.08)' : '#13161F',
                    border: activeBlock === 1 ? '1px solid #FF4D2D' : '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: activeBlock === 1 ? '0 0 20px rgba(255, 77, 45, 0.2)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: '#1A1E29',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FF4D2D',
                        fontWeight: 700,
                      }}
                    >
                      2
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '1rem' }}>
                        {activeTab === 'patient' ? 'Cryptographic Doctor Consent' : 'Request & Verify Record Access'}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '2px' }}>
                        {activeTab === 'patient'
                          ? 'Grant or revoke access permissions to specific doctor addresses'
                          : 'Access patient records strictly upon cryptographic authorization'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div
                  onClick={() => this.setState({ activeBlock: 2 })}
                  style={{
                    background: activeBlock === 2 ? 'rgba(255, 77, 45, 0.08)' : '#13161F',
                    border: activeBlock === 2 ? '1px solid #FF4D2D' : '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: activeBlock === 2 ? '0 0 20px rgba(255, 77, 45, 0.2)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: '#1A1E29',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FF4D2D',
                        fontWeight: 700,
                      }}
                    >
                      3
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '1rem' }}>
                        {activeTab === 'patient' ? 'Immutable Consultation History' : 'Log Clinical Appointments'}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '2px' }}>
                        {activeTab === 'patient'
                          ? 'Review doctor remarks, prescriptions, and diagnoses permanently'
                          : 'Write diagnosis, prescriptions, and status to the blockchain'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Grid.Column>

            {/* Right Panel: Visual Mockup Screen */}
            <Grid.Column width={9}>
              <div
                style={{
                  background: '#0D0F15',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '14px',
                  padding: '2rem',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Ambient glow inside card */}
                <div
                  style={{
                    position: 'absolute',
                    top: '-30px',
                    right: '-30px',
                    width: '180px',
                    height: '180px',
                    background: 'radial-gradient(circle, rgba(255, 77, 45, 0.25), transparent 70%)',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                  }}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: 'rgba(255, 77, 45, 0.15)',
                      border: '1px solid rgba(255, 77, 45, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FF4D2D',
                      fontSize: '1.25rem',
                    }}
                  >
                    ⚡
                  </div>
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF' }}>
                      On-Chain Patient Record State
                    </div>
                    <div style={{ fontSize: '0.825rem', color: '#64748B', fontFamily: 'monospace' }}>
                      Contract: 0x876a81...b327E
                    </div>
                  </div>
                </div>

                {/* State preview rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div
                    style={{
                      background: '#141722',
                      padding: '0.85rem 1rem',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <span style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Access Permission</span>
                    <span style={{ color: '#10B981', fontWeight: 600, fontSize: '0.9rem' }}>
                      ✓ Granted to 0x4D2a...88F1
                    </span>
                  </div>

                  <div
                    style={{
                      background: '#141722',
                      padding: '0.85rem 1rem',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <span style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Consensus Network</span>
                    <span style={{ color: '#E2E8F0', fontSize: '0.9rem' }}>Ethereum Sepolia Testnet</span>
                  </div>

                  <div
                    style={{
                      background: '#141722',
                      padding: '0.85rem 1rem',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <span style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Record Immutability</span>
                    <span style={{ color: '#FF7354', fontWeight: 600, fontSize: '0.9rem' }}>
                      Cryptographically Sealed
                    </span>
                  </div>

                  <div
                    style={{
                      background: '#141722',
                      padding: '0.85rem 1rem',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <span style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Recent Appointment</span>
                    <span style={{ color: '#E2E8F0', fontSize: '0.9rem' }}>Prescription & Diagnosis Logged</span>
                  </div>
                </div>
              </div>
            </Grid.Column>
          </Grid>
        </div>

        {/* Trust Badges */}
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <div
            style={{
              textTransform: 'uppercase',
              fontSize: '0.8rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              color: '#64748B',
              marginBottom: '1.5rem',
            }}
          >
            Powered by Leading Web3 & Decentralized Technologies
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '2.5rem',
              flexWrap: 'wrap',
              color: '#94A3B8',
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#FF4D2D' }}>◆</span> Ethereum
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#FF4D2D' }}>◆</span> Sepolia Testnet
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#FF4D2D' }}>◆</span> MetaMask
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#FF4D2D' }}>◆</span> Smart Contracts (Solidity)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#FF4D2D' }}>◆</span> Web3.js
            </div>
          </div>
        </div>

        {/* 3-Tier Role Cards (Inspired by user image 3) */}
        <div style={{ marginBottom: '5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.5rem' }}>
              Role-Based Decentralized Architecture
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '1.1rem' }}>
              Select your role to access specialized portals tailored for patient privacy and clinical operations.
            </p>
          </div>

          <Grid stackable columns={3}>
            {/* Card 1: Patient */}
            <Grid.Column>
              <div
                style={{
                  background: 'rgba(18, 20, 27, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  backdropFilter: 'blur(12px)',
                  transition: 'all 0.25s ease',
                }}
              >
                <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.5rem' }}>
                  Patient Sovereign Portal
                </div>
                <div style={{ color: '#94A3B8', fontSize: '0.925rem', marginBottom: '1.5rem', minHeight: '40px' }}>
                  Own your medical history with fine-grained cryptographic doctor authorization.
                </div>

                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '1.5rem', marginBottom: '2rem', flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', marginBottom: '1rem' }}>
                    What's included:
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#CBD5E1', fontSize: '0.925rem' }}>
                    <li><span style={{ color: '#10B981', marginRight: '8px' }}>✓</span> Self-sovereign wallet identity</li>
                    <li><span style={{ color: '#10B981', marginRight: '8px' }}>✓</span> Emergency contacts & allergy log</li>
                    <li><span style={{ color: '#10B981', marginRight: '8px' }}>✓</span> One-click doctor consent grant</li>
                    <li><span style={{ color: '#10B981', marginRight: '8px' }}>✓</span> Instant permission revocation</li>
                    <li><span style={{ color: '#10B981', marginRight: '8px' }}>✓</span> Full consultation audit timeline</li>
                  </ul>
                </div>

                <Link route="/register-patient">
                  <a className="web3-btn-secondary" style={{ width: '100%' }}>
                    START AS PATIENT
                  </a>
                </Link>
              </div>
            </Grid.Column>

            {/* Card 2: Doctor (Featured with ember highlight) */}
            <Grid.Column>
              <div
                style={{
                  background: 'rgba(22, 25, 34, 0.95)',
                  border: '1px solid #FF4D2D',
                  borderRadius: '16px',
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 0 35px rgba(255, 77, 45, 0.25)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Glowing top line */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'linear-gradient(90deg, #FF4D2D, #FF7B59)',
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#FFFFFF' }}>
                    Doctor Clinical Suite
                  </div>
                  <span
                    style={{
                      background: 'rgba(255, 77, 45, 0.15)',
                      border: '1px solid rgba(255, 77, 45, 0.4)',
                      color: '#FF7354',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    ★ ACTIVE PRACTITIONER
                  </span>
                </div>
                <div style={{ color: '#94A3B8', fontSize: '0.925rem', marginBottom: '1.5rem', minHeight: '40px' }}>
                  Consult authorized patients, record diagnoses, and issue verified prescriptions.
                </div>

                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '1.5rem', marginBottom: '2rem', flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', marginBottom: '1rem' }}>
                    Everything in Patient, plus:
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#CBD5E1', fontSize: '0.925rem' }}>
                    <li><span style={{ color: '#FF4D2D', marginRight: '8px' }}>✓</span> Verified physician credential</li>
                    <li><span style={{ color: '#FF4D2D', marginRight: '8px' }}>✓</span> Access-gated patient record viewer</li>
                    <li><span style={{ color: '#FF4D2D', marginRight: '8px' }}>✓</span> Create diagnostic clinical entries</li>
                    <li><span style={{ color: '#FF4D2D', marginRight: '8px' }}>✓</span> Digital prescription recording</li>
                    <li><span style={{ color: '#FF4D2D', marginRight: '8px' }}>✓</span> Appointment follow-up lifecycle</li>
                  </ul>
                </div>

                <Link route="/register-doctor">
                  <a className="web3-btn-primary" style={{ width: '100%' }}>
                    START AS DOCTOR ➔
                  </a>
                </Link>
              </div>
            </Grid.Column>

            {/* Card 3: Dashboard / Hospital Analytics */}
            <Grid.Column>
              <div
                style={{
                  background: 'rgba(18, 20, 27, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  backdropFilter: 'blur(12px)',
                  transition: 'all 0.25s ease',
                }}
              >
                <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.5rem' }}>
                  Hospital & Analytics Hub
                </div>
                <div style={{ color: '#94A3B8', fontSize: '0.925rem', marginBottom: '1.5rem', minHeight: '40px' }}>
                  Ecosystem telemetry, verification metrics, and smart contract audit trail.
                </div>

                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '1.5rem', marginBottom: '2rem', flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', marginBottom: '1rem' }}>
                    Administrative features:
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#CBD5E1', fontSize: '0.925rem' }}>
                    <li><span style={{ color: '#10B981', marginRight: '8px' }}>✓</span> Live patient & doctor count statistics</li>
                    <li><span style={{ color: '#10B981', marginRight: '8px' }}>✓</span> Recharts growth area & pie graphs</li>
                    <li><span style={{ color: '#10B981', marginRight: '8px' }}>✓</span> Permission count analytics</li>
                    <li><span style={{ color: '#10B981', marginRight: '8px' }}>✓</span> Global patient record lookup</li>
                    <li><span style={{ color: '#10B981', marginRight: '8px' }}>✓</span> Sepolia blockchain verified state</li>
                  </ul>
                </div>

                <Link route="/dashboard">
                  <a className="web3-btn-secondary" style={{ width: '100%' }}>
                    VIEW DASHBOARD
                  </a>
                </Link>
              </div>
            </Grid.Column>
          </Grid>
        </div>
      </Layout>
    );
  }
}
