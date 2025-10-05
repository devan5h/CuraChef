import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const SignUpForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { handleSignUp, authError, setAuthModalState } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    }
    await handleSignUp(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {authError && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm text-center">
            {authError}
        </div>
      )}
      {passwordError && (
         <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm text-center">
            {passwordError}
        </div>
      )}
      <div>
        <label htmlFor="email-signup" className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <input
          id="email-signup"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-shadow duration-200 shadow-sm"
        />
      </div>
      <div>
        <label htmlFor="password-signup" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password-signup"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-shadow duration-200 shadow-sm"
        />
      </div>
       <div>
        <label htmlFor="confirm-password-signup" className="block text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <input
          id="confirm-password-signup"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-shadow duration-200 shadow-sm"
        />
      </div>
      <div>
        <button
          type="submit"
          className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg text-lg shadow-md hover:bg-green-600 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-green-300"
        >
          Create Account
        </button>
      </div>
      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <button type="button" onClick={() => setAuthModalState('signIn')} className="font-semibold text-green-600 hover:underline">
          Sign In
        </button>
      </p>
    </form>
  );
};

export default SignUpForm;