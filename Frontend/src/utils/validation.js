export function validateCompany(data) {
	const errors = {};

	if (!data.company_name || data.company_name.trim() === "") {
		errors.company_name = "Company name is required";
	}

	if (!data.registration_number || data.registration_number.trim() === "") {
		errors.registration_number = "Registration number is required";
	}

	if (!data.phone || data.phone.trim() === "") {
		errors.phone = "Phone is required";
	}

	if (data.email && data.email.trim() !== "") {
		const re = /^\S+@\S+\.\S+$/;
		if (!re.test(data.email)) {
			errors.email = "Invalid email address";
		}
	}

	return errors;
}

export default validateCompany;

export function validateDepartment(data) {
	const errors = {};

	if (!data.company_id || String(data.company_id).trim() === "") {
		errors.company_id = "Company is required";
	}

	if (!data.department_name || data.department_name.trim() === "") {
		errors.department_name = "Department name is required";
	}

	return errors;
}

export { validateDepartment as defaultDepartment };

export function validateEmployee(data, liveCheck = false) {
    const errors = {};

    // First Name & Last Name: only letters
    const nameRegex = /^[A-Za-z]+$/;
    if (!data.first_name || data.first_name.trim() === "") {
        errors.first_name = "First name is required";
    } else if (!nameRegex.test(data.first_name.trim())) {
        errors.first_name = "First name must contain only letters";
    }

    if (!data.last_name || data.last_name.trim() === "") {
        errors.last_name = "Last name is required";
    } else if (!nameRegex.test(data.last_name.trim())) {
        errors.last_name = "Last name must contain only letters";
    }

    // Email
    const emailRegex = /^[a-zA-Z0-9][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.(com|in)$/i;
    if (!data.email || data.email.trim() === "") {
        errors.email = "Email is required";
    } else if (!emailRegex.test(data.email)) {
        errors.email = "Invalid email format";
    } else if (liveCheck && data.emailExists) {
        errors.email = "Email already exists";
    }

    // Phone: exactly 10 digits
    const phoneRegex = /^\d{10}$/;
    if (!data.phone || data.phone.trim() === "") {
        errors.phone = "Phone is required";
    } else if (!phoneRegex.test(data.phone.trim())) {
        errors.phone = "Phone must be exactly 10 digits";
    }

    // DOB: required, not future
    if (!data.dob) {
        errors.dob = "DOB is required";
    } else {
        const dob = new Date(data.dob);
        const today = new Date();
        today.setHours(0,0,0,0);
        if (dob > today) errors.dob = "DOB cannot be a future date";
    }

    // Gender, company, department, job position, hire date, role
    if (!data.gender) errors.gender = "Gender is required";
    if (!data.company_id || String(data.company_id).trim() === "") errors.company_id = "Company is required";
    if (!data.department_id || String(data.department_id).trim() === "") errors.department_id = "Department is required";
    if (!data.job_position_id || String(data.job_position_id).trim() === "") errors.job_position_id = "Job position is required";
    if (!data.employment_type_id || String(data.employment_type_id).trim() === "") errors.employment_type_id = "Employment type is required";
    if (!data.hire_date) errors.hire_date = "Hire date is required";
    if (!data.role_id || String(data.role_id).trim() === "") errors.role_id = "Role is required";

    return errors;
}

export function validateLeaveRequest(data) {
	const errors = {};

	if (!data.leave_type_id || String(data.leave_type_id).trim() === "") {
		errors.leave_type_id = "Leave type is required";
	}

	if (!data.start_date) errors.start_date = "Start date is required";
	if (!data.end_date) errors.end_date = "End date is required";

	if (data.start_date && data.end_date) {
		const sd = new Date(data.start_date);
		const ed = new Date(data.end_date);
		if (isNaN(sd) || isNaN(ed) || ed < sd) {
			errors.end_date = "End date must be same or after start date";
		}
	}

	if (!data.reason || data.reason.trim() === "") {
		errors.reason = "Reason is required";
	}

	if (!data.approved_by || String(data.approved_by).trim() === "") {
		errors.approved_by = "Please select a manager";
	}

	return errors;
}

export function validateSalary(data) {
	const errors = {};

	if (!data.employee_id || String(data.employee_id).trim() === "") {
		errors.employee_id = "Employee is required";
	}

	if (data.basic_salary === "" || data.basic_salary === null) {
		errors.basic_salary = "Basic salary is required";
	} else if (Number(data.basic_salary) < 0) {
		errors.basic_salary = "Basic salary must be positive";
	}

	if (data.deductions === "" || data.deductions === null) {
		errors.deductions = "Deductions are required";
	} else if (Number(data.deductions) < 0) {
		errors.deductions = "Deductions must be positive";
	}

	if (!data.start_date) {
		errors.start_date = "Salary date is required";
	}

	return errors;
}

export function validateLocation(data) {
	const errors = {};
	if (!data.company_id || String(data.company_id).trim() === "") {
		errors.company_id = "Company is required";
	}
	if (!data.location_name || data.location_name.trim() === "") {
		errors.location_name = "Location name is required";
	}
	if (!data.city || data.city.trim() === "") {
		errors.city = "City is required";
	}
	if (!data.state || data.state.trim() === "") {
		errors.state = "State is required";
	}
	if (!data.country || data.country.trim() === "") {
		errors.country = "Country is required";
	}
	return errors;
}
