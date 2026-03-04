import React, { useEffect, useState } from 'react';
import { getAllApplicants, deleteApplicant, updateApplicantStatus } from '../Services/adminService';
import "../Styles/Admin.css";

const Admin = () => {
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);


}