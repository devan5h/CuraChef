import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const SignInForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { handleSignIn, authError, setAuthModalState } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSignIn(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {authError && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm text-center">
            {authError}
        </div>
      )}
      <div>
        <label htmlFor="email-signin" className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <input
          id="email-signin"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-shadow duration-200 shadow-sm"
        />
      </div>
      <div>
        <label htmlFor="password-signin" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password-signin"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-shadow duration-200 shadow-sm"
        />
      </div>
      <div>
        <button
          type="submit"
          className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg text-lg shadow-md hover:bg-green-600 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-green-300"
        >
          Sign In
        </button>
      </div>
      <p className="text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <button type="button" onClick={() => setAuthModalState('signUp')} className="font-semibold text-green-600 hover:underline">
          Sign Up
        </button>
      </p>
    </form>
  );
};

export default SignInForm;