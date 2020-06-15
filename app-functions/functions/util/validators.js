const isEmail = (email) => {
    const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (email.match(emailRegEx)) return true;
    else return false;
};

const isEmpty = (string) => {
    if (string.trim() === '') return true;
    else return false;
};

exports.validateSignupData = (data) => {
    // Validation security
    let errors = {};

    // Email validation
    if (isEmpty(data.email)) {
        errors.email = 'Must not be empty';
    } else if (!isEmail(data.email)) {
        errors.email = 'Must be a valid email address';
    }

    // Password validation
    if (isEmpty(data.password)) {
        errors.password = 'Must not be empty';
    }
    if (data.password !== data.confirmPassword) {
        errors.confirmPassword = 'Passwords must match';
    }

    // Username validation
    if (isEmpty(data.username)) {
        errors.username = 'Must note be empty';
    }

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
};

exports.validateLoginData = (data) => {
    let errors = {};

    // Email and password validation (no inputs)
    if (isEmpty(data.email)) errors.email = 'Must not be empty';
    if (isEmpty(data.password)) errors.password = 'Must not be empty';

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
};