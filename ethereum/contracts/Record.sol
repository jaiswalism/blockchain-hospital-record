pragma solidity ^0.4.17;

contract Record {
    
    struct Patients {
        string ic;
        string name;
        string phone;
        string gender;
        string dob;
        string height;
        string weight;
        string houseaddr;
        string bloodgroup;
        string allergies;
        string medication;
        string emergencyName;
        string emergencyContact;
        address addr;
        uint date;
    }

    struct Doctors {
        string ic;
        string name;
        string phone;
        string gender;
        string dob;
        string qualification;
        string major;
        address addr;
        uint date;
    }

    struct Appointments {
        address doctoraddr;
        address patientaddr;
        string date;
        string time;
        string prescription;
        string description;
        string diagnosis;
        string status;
        uint creationDate;
    }
    
    address public owner;
    address[] public patientList;
    address[] public doctorList;
    address[] public appointmentList;
    Appointments[] public appointmentsList;

    mapping(address => Patients) patients;
    mapping(address => Doctors) doctors;
    mapping(address => Appointments) appointments;
    mapping(address => uint[]) patientAppointments;

    mapping(address => mapping(address => bool)) public isApproved;
    mapping(address => bool) public isPatient;
    mapping(address => bool) public isDoctor;
    mapping(address => bool) public isDoctorVerified;
    mapping(address => uint) AppointmentPerPatient;

    uint256 public patientCount = 0;
    uint256 public doctorCount = 0;
    uint256 public appointmentCount = 0;
    uint256 public permissionGrantedCount = 0;

    // Events
    event PatientRegistered(address indexed patient, string name);
    event DoctorRegistered(address indexed doctor, string name);
    event DoctorVerified(address indexed doctor);
    event AccessGranted(address indexed patient, address indexed doctor);
    event AccessRevoked(address indexed patient, address indexed doctor);
    event AppointmentCreated(uint indexed id, address indexed patient, address indexed doctor);
    event AppointmentUpdated(address indexed patient, address indexed doctor);
    
    function Record() public {
        owner = msg.sender;
        isDoctorVerified[msg.sender] = true;
    }

    // Owner / Admin verifies registered doctors
    function verifyDoctor(address _doctor) public returns (bool) {
        require(msg.sender == owner);
        require(isDoctor[_doctor]);
        require(!isDoctorVerified[_doctor]);
        isDoctorVerified[_doctor] = true;
        emit DoctorVerified(_doctor);
        return true;
    }
    
    // Retrieve patient details from user sign up page and store the details into the blockchain
    function setDetails(
        string _ic, string _name, string _phone, string _gender, string _dob,
        string _height, string _weight, string _houseaddr, string _bloodgroup,
        string _allergies, string _medication, string _emergencyName, string _emergencyContact
    ) public {
        require(!isPatient[msg.sender]);
        require(bytes(_name).length > 0);
        require(bytes(_ic).length > 0);

        var p = patients[msg.sender];
        p.ic = _ic;
        p.name = _name;
        p.phone = _phone;
        p.gender = _gender;
        p.dob = _dob;
        p.height = _height; 
        p.weight = _weight;
        p.houseaddr = _houseaddr;
        p.bloodgroup = _bloodgroup;
        p.allergies = _allergies;
        p.medication = _medication;
        p.emergencyName = _emergencyName;
        p.emergencyContact = _emergencyContact;
        p.addr = msg.sender;
        p.date = block.timestamp;
        
        patientList.push(msg.sender);
        isPatient[msg.sender] = true;
        isApproved[msg.sender][msg.sender] = true;
        patientCount++;

        emit PatientRegistered(msg.sender, _name);
    }
    
    // Allows patient to edit their existing record
    function editDetails(
        string _ic, string _name, string _phone, string _gender, string _dob,
        string _height, string _weight, string _houseaddr, string _bloodgroup,
        string _allergies, string _medication, string _emergencyName, string _emergencyContact
    ) public {
        require(isPatient[msg.sender]);
        var p = patients[msg.sender];
        
        p.ic = _ic;
        p.name = _name;
        p.phone = _phone;
        p.gender = _gender;
        p.dob = _dob;
        p.height = _height; 
        p.weight = _weight;
        p.houseaddr = _houseaddr;
        p.bloodgroup = _bloodgroup;
        p.allergies = _allergies;
        p.medication = _medication;
        p.emergencyName = _emergencyName;
        p.emergencyContact = _emergencyContact;
        p.addr = msg.sender;    
    }

    // Retrieve doctor details from doctor registration page and store into the blockchain
    function setDoctor(
        string _ic, string _name, string _phone, string _gender, string _dob,
        string _qualification, string _major
    ) public {
        require(!isDoctor[msg.sender]);
        require(bytes(_name).length > 0);
        require(bytes(_ic).length > 0);

        var d = doctors[msg.sender];
        d.ic = _ic;
        d.name = _name;
        d.phone = _phone;
        d.gender = _gender;
        d.dob = _dob;
        d.qualification = _qualification;
        d.major = _major;
        d.addr = msg.sender;
        d.date = block.timestamp;
        
        doctorList.push(msg.sender);
        isDoctor[msg.sender] = true;
        doctorCount++;

        emit DoctorRegistered(msg.sender, _name);
    }

    // Allows doctors to edit their existing profile
    function editDoctor(
        string _ic, string _name, string _phone, string _gender, string _dob,
        string _qualification, string _major
    ) public {
        require(isDoctor[msg.sender]);
        var d = doctors[msg.sender];
        
        d.ic = _ic;
        d.name = _name;
        d.phone = _phone;
        d.gender = _gender;
        d.dob = _dob;
        d.qualification = _qualification;
        d.major = _major;
        d.addr = msg.sender;
    }

    // Doctor creates appointment: requires verified doctor and patient consent
    function setAppointment(
        address _addr, string _date, string _time, string _diagnosis,
        string _prescription, string _description, string _status
    ) public {
        require(_addr != address(0));
        require(isDoctor[msg.sender]);
        require(isDoctorVerified[msg.sender]);
        require(isApproved[_addr][msg.sender]);

        var a = appointments[_addr];
        a.doctoraddr = msg.sender;
        a.patientaddr = _addr;
        a.date = _date;
        a.time = _time;
        a.diagnosis = _diagnosis;
        a.prescription = _prescription; 
        a.description = _description;
        a.status = _status;
        a.creationDate = block.timestamp;

        uint apptId = appointmentsList.push(a) - 1;
        patientAppointments[_addr].push(apptId);

        appointmentList.push(_addr);
        appointmentCount++;
        AppointmentPerPatient[_addr]++;

        emit AppointmentCreated(apptId, _addr, msg.sender);
    }
    
    // Doctor updates appointment: requires verified doctor and must be the creator or owner
    function updateAppointment(
        address _addr, string _date, string _time, string _diagnosis,
        string _prescription, string _description, string _status
    ) public {
        require(_addr != address(0));
        require(isDoctor[msg.sender]);
        require(isDoctorVerified[msg.sender]);
        require(appointments[_addr].doctoraddr == msg.sender || msg.sender == owner);

        var a = appointments[_addr];
        a.doctoraddr = msg.sender;
        a.patientaddr = _addr;
        a.date = _date;
        a.time = _time;
        a.diagnosis = _diagnosis;
        a.prescription = _prescription; 
        a.description = _description;
        a.status = _status;

        if (patientAppointments[_addr].length > 0) {
            uint lastId = patientAppointments[_addr][patientAppointments[_addr].length - 1];
            appointmentsList[lastId] = a;
        }

        emit AppointmentUpdated(_addr, msg.sender);
    }
    
    // Patient gives permission to a doctor
    function givePermission(address _address) public returns(bool success) {
        require(_address != address(0));
        if (!isApproved[msg.sender][_address]) {
            isApproved[msg.sender][_address] = true;
            permissionGrantedCount++;
            emit AccessGranted(msg.sender, _address);
        }
        return true;
    }

    // Patient revokes permission from a doctor
    function RevokePermission(address _address) public returns(bool success) {
        require(_address != address(0));
        if (isApproved[msg.sender][_address]) {
            isApproved[msg.sender][_address] = false;
            if (permissionGrantedCount > 0) {
                permissionGrantedCount--;
            }
            emit AccessRevoked(msg.sender, _address);
        }
        return true;
    }

    // Retrieve list of all patients
    function getPatients() public view returns(address[]) {
        return patientList;
    }

    // Retrieve list of all doctors
    function getDoctors() public view returns(address[]) {
        return doctorList;
    }

    // Retrieve list of all appointments
    function getAppointments() public view returns(address[]) {
        return appointmentList;
    }

    // Retrieve total number of appointments in array
    function getTotalAppointments() public view returns(uint) {
        return appointmentsList.length;
    }

    // Retrieve appointment IDs for a specific patient
    function getPatientAppointments(address _patient) public view returns (uint[]) {
        require(msg.sender == _patient || isApproved[_patient][msg.sender] || msg.sender == owner);
        return patientAppointments[_patient];
    }
    
    // Search patient demographic: requires consent or owner
    function searchPatientDemographic(address _address) public view returns(string, string, string, string, string, string, string) {
        require(isApproved[_address][msg.sender] || msg.sender == owner);
        var p = patients[_address];
        return (p.ic, p.name, p.phone, p.gender, p.dob, p.height, p.weight);
    }

    // Search patient medical: requires consent or owner
    function searchPatientMedical(address _address) public view returns(string, string, string, string, string, string) {
        require(isApproved[_address][msg.sender] || msg.sender == owner);
        var p = patients[_address];
        return (p.houseaddr, p.bloodgroup, p.allergies, p.medication, p.emergencyName, p.emergencyContact);
    }

    // Search doctor details
    function searchDoctor(address _address) public view returns(string, string, string, string, string, string, string) {
        require(isDoctor[_address]);
        var d = doctors[_address];
        return (d.ic, d.name, d.phone, d.gender, d.dob, d.qualification, d.major);
    }
    
    // Search appointment: requires patient consent or doctor involved or owner
    function searchAppointment(address _address) public view returns(address, string, string, string, string, string, string, string) {
        var a = appointments[_address];
        require(msg.sender == _address || isApproved[_address][msg.sender] || msg.sender == a.doctoraddr || msg.sender == owner);
        var d = doctors[a.doctoraddr];
        return (a.doctoraddr, d.name, a.date, a.time, a.diagnosis, a.prescription, a.description, a.status);
    }

    // Search patient record creation date
    function searchRecordDate(address _address) public view returns(uint) {
        var p = patients[_address];
        return (p.date);
    }

    // Search doctor profile creation date
    function searchDoctorDate(address _address) public view returns(uint) {
        var d = doctors[_address];
        return (d.date);
    }

    // Search appointment creation date
    function searchAppointmentDate(address _address) public view returns(uint) {
        var a = appointments[_address];
        return (a.creationDate);
    }

    // Retrieve patient count
    function getPatientCount() public view returns(uint256) {
        return patientCount;
    }

    // Retrieve doctor count
    function getDoctorCount() public view returns(uint256) {
        return doctorCount;
    }

    // Retrieve appointment count
    function getAppointmentCount() public view returns(uint256) {
        return appointmentCount;
    }

    // Retrieve permission granted count
    function getPermissionGrantedCount() public view returns(uint256) {
        return permissionGrantedCount;
    }

    // Retrieve appointments per patient
    function getAppointmentPerPatient(address _address) public view returns(uint256) {
        return AppointmentPerPatient[_address];
    }
}
