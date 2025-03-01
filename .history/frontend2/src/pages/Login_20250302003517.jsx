import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, ArrowRight } from 'lucide-react';
import PropTypes from 'prop-types';

// GraphQL login mutation
const LOGIN_USER = gql`
  mutation Login($input: UserLoginInput!) {
    login(input: $input) {
      accessToken
      tokenType
    }
  }
`;

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Apollo mutation hook
  const [loginUser, { loading, error: apolloError }] = useMutation(LOGIN_USER, {
    onCompleted: (data) => {
      console.log('Login successful:', data);
      
      // Store the token in localStorage
      localStorage.setItem('accessToken', data.login.accessToken);
      localStorage.setItem('tokenType', data.login.tokenType);
      
      // Redirect to dashboard or home page
      navigate('/dashboard');
    },
    onError: (error) => {
      console.error('Login error:', error);
      
      // Extract the error message
      let errorMessage = 'An error occurred during login';
      
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        errorMessage = error.graphQLErrors[0].message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Set the error based on content
      if (errorMessage.toLowerCase().includes('email')) {
        setErrors({ email: errorMessage });
      } else if (errorMessage.toLowerCase().includes('password') || 
                errorMessage.toLowerCase().includes('credentials')) {
        setErrors({ password: errorMessage });
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

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Clear any previous errors
    setErrors({});
    
    try {
      await loginUser({
        variables: {
          input: {
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

  // Background blob animations (reused from Register page)
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
            Welcome Back
          </h1>
          <p className="mt-3 text-gray-300">
            Log in to your Sellovate account
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
              <p className="text-red-400 text-sm">Error: {errors.submit}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
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
              
              <div>
                <label className="block text-gray-300 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 bg-gray-800 border ${errors.password ? 'border-red-500' : 'border-gray-700'} rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    placeholder="Enter your password"
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
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-700 rounded"
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-300">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <Link to="/forgot-password" className="text-purple-400 hover:text-purple-300">
                    Forgot password?
                  </Link>
                </div>
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Logging in...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <LogIn size={20} className="mr-2" />
                    Log In
                  </div>
                )}
              </button>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Don't have an account?{' '}
                <Link to="/register" className="text-purple-400 hover:text-purple-300 flex items-center justify-center mt-2">
                  Create an account <ArrowRight size={16} className="ml-1" />
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;