import React, { useState, useEffect, useRef } from 'react';
import Register from './Register';
import Login from './Login';

const AuthContainer = () => {
    const [isLogin, setIsLogin] = useState(false);
    
    // Centralized verification state management
    const [isVerified, setIsVerified] = useState(false);
    const [verifiedData, setVerifiedData] = useState({ aadhaar: '', phone: '', timestamp: '' });
    const verificationCleanupRef = useRef(null);

    // Check verification status on mount
    const checkVerificationStatus = () => {
        const verifiedAadhaar = localStorage.getItem('aadhaarVerified');
        const verifiedPhone = localStorage.getItem('verifiedPhone');
        const verificationTimestamp = localStorage.getItem('verificationTimestamp');
        
        if (verifiedAadhaar && verifiedPhone && verificationTimestamp) {
            const verifyTime = new Date(verificationTimestamp);
            const now = new Date();
            const minutesDiff = (now - verifyTime) / (1000 * 60); // Minutes difference
            
            if (minutesDiff <= 10) {
                // Verification is still valid (within 10 minutes)
                setIsVerified(true);
                setVerifiedData({ 
                    aadhaar: verifiedAadhaar, 
                    phone: verifiedPhone,
                    timestamp: verificationTimestamp
                });
                
                // Set up auto-cleanup timer for remaining time
                const remainingMs = (10 * 60 * 1000) - (minutesDiff * 60 * 1000);
                verificationCleanupRef.current = setTimeout(() => {
                    clearVerificationStatus();
                }, remainingMs);
                
                return true;
            } else {
                // Verification expired, clear it
                clearVerificationStatus();
                return false;
            }
        }
        return false;
    };

    const clearVerificationStatus = () => {
        localStorage.removeItem('aadhaarVerified');
        localStorage.removeItem('verifiedPhone');
        localStorage.removeItem('verificationTimestamp');
        setIsVerified(false);
        setVerifiedData({ aadhaar: '', phone: '', timestamp: '' });
        if (verificationCleanupRef.current) {
            clearTimeout(verificationCleanupRef.current);
            verificationCleanupRef.current = null;
        }
    };

    // Handle verification completion
    const handleVerificationComplete = (data) => {
        const timestamp = new Date().toISOString();
        
        // Store in localStorage with 10-minute expiry
        localStorage.setItem('aadhaarVerified', data.aadhaar);
        localStorage.setItem('verifiedPhone', data.phone);
        localStorage.setItem('verificationTimestamp', timestamp);
        
        // Update state
        setIsVerified(true);
        setVerifiedData({
            aadhaar: data.aadhaar,
            phone: data.phone,
            timestamp: timestamp
        });

        // Set auto-cleanup timer for 10 minutes
        verificationCleanupRef.current = setTimeout(() => {
            clearVerificationStatus();
        }, 10 * 60 * 1000);
    };

    // Check verification status on component mount
    useEffect(() => {
        checkVerificationStatus();
    }, []);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (verificationCleanupRef.current) clearTimeout(verificationCleanupRef.current);
        };
    }, []);

    const authProps = {
        isVerified,
        verifiedData,
        onVerificationComplete: handleVerificationComplete,
        onVerificationClear: clearVerificationStatus
    };

    return (
        <div>
            {isLogin ? (
                <Login 
                    onSwitchToRegister={() => setIsLogin(false)} 
                    {...authProps}
                />
            ) : (
                <Register 
                    onSwitchToLogin={() => setIsLogin(true)} 
                    {...authProps}
                />
            )}
        </div>
    );
};

export default AuthContainer;