import { validateAadhaar } from '../services/api';

// Check if Aadhaar format is correct (client-side)
export const validateAadhaarFormat = (aadhaar) => {
    const cleanAadhaar = aadhaar.replace(/\s/g, '');

    if (!cleanAadhaar) {
        return { isValid: false, error: 'Aadhaar number is required' };
    }

    if (!/^\d{12}$/.test(cleanAadhaar)) {
        return { isValid: false, error: 'Aadhaar number must be exactly 12 digits' };
    }

    return { isValid: true, error: '' };
};

// Format Aadhaar for display (XXXX XXXX XXXX)
export const formatAadhaar = (aadhaar) => {
    const cleanAadhaar = aadhaar.replace(/\s/g, '');
    if (cleanAadhaar.length <= 12) {
        return cleanAadhaar.replace(/(\d{4})(?=\d)/g, '$1 ');
    }
    return aadhaar;
};

// Mask Aadhaar for privacy (XXXXXXXX1234)
export const maskAadhaar = (aadhaar) => {
    const cleanAadhaar = aadhaar.replace(/\s/g, '');
    if (cleanAadhaar.length === 12) {
        return 'XXXXXXXX' + cleanAadhaar.slice(-4);
    }
    return aadhaar;
};

// Complete validation (format + database check)
export const validateAadhaarComplete = async (aadhaarNumber) => {
    try {
        // First check format
        const formatCheck = validateAadhaarFormat(aadhaarNumber);
        if (!formatCheck.isValid) {
            return formatCheck;
        }

        // Then validate against database
        const result = await validateAadhaar(aadhaarNumber);

        return {
            isValid: true,
            error: '',
            data: result.data
        };
    } catch (error) {
        return {
            isValid: false,
            error: error.message || 'Aadhaar validation failed'
        };
    }
};
