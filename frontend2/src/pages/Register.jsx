import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Eye, EyeOff } from 'lucide-react'; // Import icons for password visibility

// Import Stepper components
import Stepper, { Step } from '../components/Stepper/Stepper';

// GraphQL mutation
const REGISTER_USER = gql`
  mutation Register($input: UserCreateInput!) {
    register(input: $input) {
      id
      username
      email
    }
  }
`;

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [debugError, setDebugError] = useState(null); // For debugging
  const [isRegistered, setIsRegistered] = useState(false); // Track successful registration

  // Apollo mutation hook
  const [registerUser, { loading, error: apolloError }] = useMutation(REGISTER_USER, {
    onCompleted: (data) => {
      console.log('Registration successful:', data);
      // Set registration success flag
      setIsRegistered(true);
      // Move to the success step
      setCurrentStepIndex(3);
    },
    onError: (error) => {
      console.error('Registration error:', error);
      
      // Store the full error for debugging
      setDebugError(JSON.stringify(error, null, 2));
      
      // Extract the error message
      let errorMessage = 'An error occurred during registration';
      
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        errorMessage = error.graphQLErrors[0].message;
        console.log('Method 1 error:', errorMessage);
      } else if (error.message) {
        errorMessage = error.message;
        console.log('Method 3 error:', errorMessage);
      }
      
      // Set the error based on content
      if (errorMessage.toLowerCase().includes('email')) {
        setErrors({ email: errorMessage });
        // Go back to the email step
        setCurrentStepIndex(0);
      } else if (errorMessage.toLowerCase().includes('username')) {
        setErrors({ username: errorMessage });
        // Go back to the username step
        setCurrentStepIndex(0);
      } else {
        setErrors({ submit: errorMessage });
      }
    }
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  // Validate the current step before proceeding
  const validateCurrentStep = (step) => {
    const newErrors = {};
    
    if (step === 0) {
      // Username validation
      if (!formData.username.trim()) {
        newErrors.username = 'Username is required';
      } else if (formData.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      } else if (/\s/.test(formData.username)) {
        newErrors.username = 'Username cannot contain spaces';
      }
      
      // Email validation
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      } else if (/\s/.test(formData.email)) {
        newErrors.email = 'Email cannot contain spaces';
      }
    }
    
    if (step === 1) {
      // Password validation
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      } else if (/\s/.test(formData.password)) {
        newErrors.password = 'Password cannot contain spaces';
      }
      
      // Confirm password validation
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    if (step === 2 && !formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle step change - validate before allowing to proceed
  const handleStepChange = (newStep) => {
    // Convert from 1-based to 0-based index
    const targetStepIndex = newStep - 1;
    const currentIndex = currentStepIndex;
    
    // If moving forward, validate the current step
    if (targetStepIndex > currentIndex) {
      const isValid = validateCurrentStep(currentIndex);
      
      if (isValid) {
        setCurrentStepIndex(targetStepIndex);
        
        // If we're moving from step 2 (Almost Done) to step 3 (Success)
        // This means the user clicked "Continue" on the Terms & Conditions step
        if (currentIndex === 2 && targetStepIndex === 3) {
          handleSubmit();
          // Don't proceed to step 3 yet - wait for API response
          return false;
        }
        
        return true;
      }
      return false;
    } else {
      // Allow moving backward without validation
      setCurrentStepIndex(targetStepIndex);
      return true;
    }
  };

  // Handle final step completion - this is called when the user clicks "Complete"
  const handleFinalStep = () => {
    if (validateCurrentStep(2)) { // Validate the terms step
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!formData.agreeToTerms) {
      setErrors({ agreeToTerms: 'You must agree to the terms and conditions' });
      return;
    }
    
    // Clear any previous errors
    setErrors({});
    
    try {
      await registerUser({
        variables: {
          input: {
            username: formData.username,
            email: formData.email,
            password: formData.password
          }
        }
      });
    } catch (error) {
      // Error is handled in the onError callback of useMutation
      console.error('Submission error:', error);
    }
  };

  // Background blob animations (reused from Features page)
  const BlobAnimation = ({ delay, className }) => {
    return (
      <motion.div
        animate={{ 
          scale: [1, 1.1, 0.9, 1],
          x: [0, 30, -20, 0],
          y: [0, -50, 20, 0],
          rotate: [0, 10, -10, 0]
        }}
        transition={{ 
          repeat: Infinity,
          duration: 20,
          delay: delay,
          ease: "easeInOut"
        }}
        className={className}
      />
    );
  };

  // Add PropTypes validation
  BlobAnimation.propTypes = {
    delay: PropTypes.number.isRequired,
    className: PropTypes.string.isRequired
  };

  return (
    <div className="min-h-screen bg-black pt-28 text-gray-100 overflow-x-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 z-0 overflow-hidden opacity-20">
        <BlobAnimation 
          delay={0}
          className="absolute -top-40 -left-40 w-80 h-80 bg-purple-700 rounded-full mix-blend-multiply filter blur-3xl"
        />
        <BlobAnimation 
          delay={5}
          className="absolute top-0 -right-20 w-80 h-80 bg-blue-700 rounded-full mix-blend-multiply filter blur-3xl"
        />
        <BlobAnimation 
          delay={2.5}
          className="absolute -bottom-40 left-20 w-80 h-80 bg-pink-700 rounded-full mix-blend-multiply filter blur-3xl"
        />
      </div>

      <div className="relative z-10 max-w-md mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
            Create Your Account
          </h1>
          <p className="mt-3 text-gray-300">
            Join Sellovate and transform your e-commerce journey
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-gray-900 rounded-2xl p-6 shadow-xl border border-gray-800"
        >          
          {/* Display Apollo error if present */}
          {apolloError && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-800 rounded-lg">
              <p className="text-red-400 text-sm">Error: {apolloError.message}</p>
            </div>
          )}
          
          {/* Display global error at the top if present */}
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-800 rounded-lg">
              <p className="text-red-400 text-sm">Submit Error: {errors.submit}</p>
            </div>
          )}
          
          <Stepper
            initialStep={currentStepIndex + 1}
            onStepChange={handleStepChange}
            onFinalStepCompleted={handleFinalStep}
            backButtonText="Previous"
            nextButtonText="Continue"
            stepCircleContainerClassName="bg-gray-900 border-none shadow-none"
            contentClassName="text-white"
            footerClassName="mt-6"
            backButtonProps={{
              className: "px-4 py-2 text-gray-300 hover:text-white transition-colors"
            }}
            nextButtonProps={{
              className: "px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:opacity-90 transition-opacity"
            }}
          >
            <Step>
              <div className="space-y-4 py-4">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                  Basic Information
                </h2>
                
                {/* Display email error at the top of this step if present */}
                {errors.email && (
                  <div className="p-3 bg-red-900/50 border border-red-800 rounded-lg mb-4">
                    <p className="text-red-400 text-sm">Email Error: {errors.email}</p>
                  </div>
                )}
                
                {/* Display username error at the top of this step if present */}
                {errors.username && (
                  <div className="p-3 bg-red-900/50 border border-red-800 rounded-lg mb-4">
                    <p className="text-red-400 text-sm">Username Error: {errors.username}</p>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-1">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 bg-gray-800 border ${errors.username ? 'border-red-500' : 'border-gray-700'} rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
                      placeholder="Choose a username"
                    />
                    {errors.username && (
                      <p className="mt-1 text-red-400 text-sm">{errors.username}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 bg-gray-800 border ${errors.email ? 'border-red-500' : 'border-gray-700'} rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
                      placeholder="your@email.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-red-400 text-sm">{errors.email}</p>
                    )}
                  </div>
                </div>
              </div>
            </Step>
            
            <Step>
              <div className="space-y-4 py-4">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                  Secure Your Account
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-1">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Create a strong password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-red-400 text-sm">{errors.password}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-1">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-red-400 text-sm">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>
            </Step>
            
            <Step>
              <div className="space-y-4 py-4">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                  Almost Done!
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="agreeToTerms"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange}
                      className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-700 rounded"
                    />
                    <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-300">
                      I agree to the <a href="#" className="text-purple-400 hover:underline">Terms of Service</a> and <a href="#" className="text-purple-400 hover:underline">Privacy Policy</a>
                    </label>
                  </div>
                  {errors.agreeToTerms && (
                    <p className="text-red-400 text-sm">{errors.agreeToTerms}</p>
                  )}
                  
                  {/* Display any submission errors here as well */}
                  {errors.submit && (
                    <div className="p-3 bg-red-900/50 border border-red-800 rounded-lg">
                      <p className="text-red-400 text-sm">{errors.submit}</p>
                    </div>
                  )}
                  
                  {loading && (
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                  )}
                </div>
              </div>
            </Step>
            
            <Step>
              {isRegistered ? (
                <div className="py-8 text-center space-y-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="mx-auto w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center"
                  >
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </motion.div>
                  
                  <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                    Registration Complete!
                  </h2>
                  
                  <p className="text-gray-300">
                    Your account has been created successfully.
                  </p>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/login')}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:opacity-90 transition-opacity"
                  >
                    Continue to Login
                  </motion.button>
                </div>
              ) : (
                <div className="py-8 text-center space-y-6">
                  <div className="p-3 bg-red-900/50 border border-red-800 rounded-lg">
                    <p className="text-red-400">Registration failed. Please check the errors and try again.</p>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentStepIndex(0)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:opacity-90 transition-opacity"
                  >
                    Go Back to Start
                  </motion.button>
                </div>
              )}
            </Step>
          </Stepper>
          
          <div className="mt-6 text-center text-gray-400 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-purple-400 hover:underline">
              Sign in
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;