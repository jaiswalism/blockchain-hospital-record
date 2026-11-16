const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledRecord = require('../ethereum/build/Record.json');

let accounts;
let record;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    record = await new web3.eth.Contract(JSON.parse(compiledRecord.interface))
        .deploy({ data: compiledRecord.bytecode })
        .send({ from: accounts[0], gas: '5000000' });
});

describe('MediBlock Smart Contract Tests', () => {
    it('can deploy record contract and assign owner as verified', async () => {
        assert.ok(record.options.address);
        const owner = await record.methods.owner().call();
        assert.equal(owner, accounts[0]);
        const isOwnerVerified = await record.methods.isDoctorVerified(accounts[0]).call();
        assert.equal(isOwnerVerified, true);
    });

    it('can register a patient record', async () => {
        await record.methods.setDetails(
            '001107020345', 'John Doe', '0123456789', 'Male', '07/22/1995',
            '183', '75', '1234, Main St, Kampar, Perak.', 'O', 'Food',
            'Antidepressants', 'Taylor Smith', '0128993344'
        ).send({ from: accounts[0], gas: '5000000' });

        const isPt = await record.methods.isPatient(accounts[0]).call();
        assert.equal(isPt, true);
    });

    it('prevents duplicate patient registration', async () => {
        await record.methods.setDetails(
            '001107020345', 'John Doe', '0123456789', 'Male', '07/22/1995',
            '183', '75', '1234, Main St, Kampar, Perak.', 'O', 'Food',
            'Antidepressants', 'Taylor Smith', '0128993344'
        ).send({ from: accounts[0], gas: '5000000' });

        try {
            await record.methods.setDetails(
                '001107020345', 'John Doe', '0123456789', 'Male', '07/22/1995',
                '183', '75', '1234, Main St, Kampar, Perak.', 'O', 'Food',
                'Antidepressants', 'Taylor Smith', '0128993344'
            ).send({ from: accounts[0], gas: '5000000' });
            assert.fail('Should have reverted on duplicate patient');
        } catch (err) {
            assert.ok(err);
        }
    });

    it('can register a doctor and only admin can verify them', async () => {
        await record.methods.setDoctor(
            '880102030405', 'Dr. Alice', '0198765432', 'Female', '01/02/1988',
            'MD Neurology', 'Neurology'
        ).send({ from: accounts[1], gas: '5000000' });

        const isDoc = await record.methods.isDoctor(accounts[1]).call();
        assert.equal(isDoc, true);

        // Initially not verified
        let isVerified = await record.methods.isDoctorVerified(accounts[1]).call();
        assert.equal(isVerified, false);

        // Non-admin trying to verify reverts
        try {
            await record.methods.verifyDoctor(accounts[1]).send({ from: accounts[2], gas: '5000000' });
            assert.fail('Non-admin should not be able to verify doctor');
        } catch (err) {
            assert.ok(err);
        }

        // Admin verifies doctor
        await record.methods.verifyDoctor(accounts[1]).send({ from: accounts[0], gas: '5000000' });
        isVerified = await record.methods.isDoctorVerified(accounts[1]).call();
        assert.equal(isVerified, true);
    });

    it('enforces patient consent and doctor verification for appointment creation', async () => {
        // Register patient (accounts[0])
        await record.methods.setDetails(
            '001107020345', 'Bane Gateson', '0123456789', 'Male', '07/22/1992',
            '183', '75', '1234, Main St', 'O', 'None', 'None', 'Taylor', '0128993344'
        ).send({ from: accounts[0], gas: '5000000' });

        // Register doctor (accounts[1])
        await record.methods.setDoctor(
            '990102030405', 'Dr. Watson', '0123456789', 'Male', '05/12/1980',
            'MBBS', 'Cardiology'
        ).send({ from: accounts[1], gas: '5000000' });

        // 1. Unverified doctor cannot create appointment even if consent is given
        await record.methods.givePermission(accounts[1]).send({ from: accounts[0], gas: '5000000' });
        try {
            await record.methods.setAppointment(
                accounts[0], '07/07/2026', '11:50am', 'Arrhythmia', 'Beta-blockers', 'Observation', 'Confirmed'
            ).send({ from: accounts[1], gas: '5000000' });
            assert.fail('Unverified doctor should not be able to create appointment');
        } catch (err) {
            assert.ok(err);
        }

        // Admin verifies doctor
        await record.methods.verifyDoctor(accounts[1]).send({ from: accounts[0], gas: '5000000' });

        // 2. Patient revokes consent -> verified doctor cannot create appointment
        await record.methods.RevokePermission(accounts[1]).send({ from: accounts[0], gas: '5000000' });
        try {
            await record.methods.setAppointment(
                accounts[0], '07/07/2026', '11:50am', 'Arrhythmia', 'Beta-blockers', 'Observation', 'Confirmed'
            ).send({ from: accounts[1], gas: '5000000' });
            assert.fail('Doctor without consent should not be able to create appointment');
        } catch (err) {
            assert.ok(err);
        }

        // 3. Patient grants consent -> appointment succeeds
        await record.methods.givePermission(accounts[1]).send({ from: accounts[0], gas: '5000000' });
        await record.methods.setAppointment(
            accounts[0], '07/07/2026', '11:50am', 'Arrhythmia', 'Beta-blockers', 'Observation', 'Confirmed'
        ).send({ from: accounts[1], gas: '5000000' });

        const appt = await record.methods.searchAppointment(accounts[0]).call({ from: accounts[1] });
        assert.equal(appt[0], accounts[1]);
        assert.equal(appt[4], 'Arrhythmia');
    });

    it('stores multiple appointments without overwriting history', async () => {
        // Patient & Doctor setup
        await record.methods.setDetails(
            '001107020345', 'Alice', '0123456789', 'Female', '07/22/1992',
            '165', '55', 'Address 1', 'A+', 'None', 'None', 'Bob', '0128993344'
        ).send({ from: accounts[0], gas: '5000000' });

        await record.methods.setDoctor(
            '990102030405', 'Dr. Watson', '0123456789', 'Male', '05/12/1980',
            'MBBS', 'General Medicine'
        ).send({ from: accounts[1], gas: '5000000' });

        await record.methods.verifyDoctor(accounts[1]).send({ from: accounts[0], gas: '5000000' });
        await record.methods.givePermission(accounts[1]).send({ from: accounts[0], gas: '5000000' });

        // Appointment 1
        await record.methods.setAppointment(
            accounts[0], '01/01/2026', '10:00am', 'Flu', 'Paracetamol', 'Rest', 'Completed'
        ).send({ from: accounts[1], gas: '5000000' });

        // Appointment 2
        await record.methods.setAppointment(
            accounts[0], '02/01/2026', '11:00am', 'Checkup', 'Vitamins', 'Healthy', 'Completed'
        ).send({ from: accounts[1], gas: '5000000' });

        const totalAppts = await record.methods.getTotalAppointments().call();
        assert.equal(totalAppts, 2);

        const patientAppts = await record.methods.getPatientAppointments(accounts[0]).call({ from: accounts[0] });
        assert.equal(patientAppts.length, 2);
    });

    it('correctly tracks permissionGrantedCount upon grants and revokes', async () => {
        await record.methods.setDetails(
            '001107020345', 'Charlie', '0123456789', 'Male', '07/22/1990',
            '175', '70', 'Address', 'B+', 'None', 'None', 'Dave', '0128993344'
        ).send({ from: accounts[0], gas: '5000000' });

        let count = await record.methods.getPermissionGrantedCount().call();
        assert.equal(count, 0);

        // Grant permission
        await record.methods.givePermission(accounts[1]).send({ from: accounts[0], gas: '5000000' });
        count = await record.methods.getPermissionGrantedCount().call();
        assert.equal(count, 1);

        // Repeated grant should not inflate count
        await record.methods.givePermission(accounts[1]).send({ from: accounts[0], gas: '5000000' });
        count = await record.methods.getPermissionGrantedCount().call();
        assert.equal(count, 1);

        // Revoke decreases count
        await record.methods.RevokePermission(accounts[1]).send({ from: accounts[0], gas: '5000000' });
        count = await record.methods.getPermissionGrantedCount().call();
        assert.equal(count, 0);

        // Repeated revoke does not go below zero
        await record.methods.RevokePermission(accounts[1]).send({ from: accounts[0], gas: '5000000' });
        count = await record.methods.getPermissionGrantedCount().call();
        assert.equal(count, 0);
    });

    it('revoked doctor loses access to search patient details', async () => {
        await record.methods.setDetails(
            '001107020345', 'David', '0123456789', 'Male', '07/22/1990',
            '175', '70', 'Secret St 55', 'O+', 'Penicillin', 'Inhaler', 'Eva', '0128993344'
        ).send({ from: accounts[0], gas: '5000000' });

        // Grant permission to accounts[1]
        await record.methods.givePermission(accounts[1]).send({ from: accounts[0], gas: '5000000' });

        // Can access
        const demo = await record.methods.searchPatientDemographic(accounts[0]).call({ from: accounts[1] });
        assert.equal(demo[1], 'David');

        // Revoke
        await record.methods.RevokePermission(accounts[1]).send({ from: accounts[0], gas: '5000000' });

        // Search now reverts
        try {
            await record.methods.searchPatientDemographic(accounts[0]).call({ from: accounts[1] });
            assert.fail('Revoked doctor should not be able to read patient demographics');
        } catch (err) {
            assert.ok(err);
        }
    });
});
