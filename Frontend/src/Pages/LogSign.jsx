import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

const LogSign = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState, reset } = useForm();
  const { errors } = formState;
  
  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
      const endpoint = isLogin ? '/login' : '/signup';
      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      console.log('Server response:', result);

      alert(isLogin ? 'Logged in successfully!' : 'Signed up successfully!');
      reset();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const toggleForm = () => {
    setIsLogin(!isLogin);
    reset();
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#2f27ce] via-[#0060fb] to-[#009ff5] p-2 sm:p-4 md:p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="p-4 sm:p-6 md:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-4 sm:mb-6">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            
            <form onSubmit={handleSubmit(onSubmit)}>
              {!isLogin && (
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                    Full Name
                  </label>
                  <input
                    className="appearance-none border-2 border-gray-200 rounded w-full py-2 sm:py-3 px-3 sm:px-4 text-gray-700 leading-tight focus:outline-none focus:border-[#0083ff] transition-colors"
                    id="name"
                    type="text"
                    placeholder="Enter Your Full Name"
                    {...register('name', { required: !isLogin })}
                  />
                  {errors.name && <p className="text-red-500 text-xs italic mt-1">Name is required</p>}
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  className="appearance-none border-2 border-gray-200 rounded w-full py-2 sm:py-3 px-3 sm:px-4 text-gray-700 leading-tight focus:outline-none focus:border-[#0083ff] transition-colors"
                  id="email"
                  type="email"
                  placeholder="Enter your email ID"
                  {...register('email', { 
                    required: true, 
                    pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i 
                  })}
                />
                {errors.email?.type === 'required' && <p className="text-red-500 text-xs italic mt-1">Email is required</p>}
                {errors.email?.type === 'pattern' && <p className="text-red-500 text-xs italic mt-1">Invalid email address</p>}
              </div>
              
              <div className="mb-4 sm:mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                  Password
                </label>
                <input
                  className="appearance-none border-2 border-gray-200 rounded w-full py-2 sm:py-3 px-3 sm:px-4 text-gray-700 leading-tight focus:outline-none focus:border-[#0083ff] transition-colors"
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  {...register('password', { 
                    required: true, 
                    minLength: 6 
                  })}
                />
                {errors.password?.type === 'required' && <p className="text-red-500 text-xs italic mt-1">Password is required</p>}
                {errors.password?.type === 'minLength' && <p className="text-red-500 text-xs italic mt-1">Password must be at least 6 characters</p>}
              </div>
              
              {!isLogin && (
                <div className="mb-4 sm:mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <input
                    className="appearance-none border-2 border-gray-200 rounded w-full py-2 sm:py-3 px-3 sm:px-4 text-gray-700 leading-tight focus:outline-none focus:border-[#0083ff] transition-colors"
                    id="confirmPassword"
                    type="password"
                    placeholder="Enter Password"
                    {...register('confirmPassword', { 
                      validate: (value, formValues) => !isLogin ? value === formValues.password : true
                    })}
                  />
                  {errors.confirmPassword && <p className="text-red-500 text-xs italic mt-1">Passwords don't match</p>}
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
                {isLogin && (
                  <div className="flex items-center mb-2 sm:mb-0">
                    <input className="mr-2 cursor-pointer" type="checkbox" id="remember" {...register('remember')} />
                    <label className="text-sm text-gray-600 cursor-pointer" htmlFor="remember">
                      Remember me
                    </label>
                  </div>
                )}
                
                {isLogin && (
                  <a className="text-sm text-[#0060fb] hover:text-[#2f27ce] transition-colors" href="#">
                    Forgot Password?
                  </a>
                )}
              </div>
              
              {/* Updated button with new color gradient */}
              <button
                className={`w-full bg-gradient-to-r from-[#2f27ce] via-[#0060fb] to-[#009ff5] hover:from-[#2f27ce] hover:via-[#0083ff] hover:to-[#009ff5] text-white font-bold cursor-pointer py-2 sm:py-3 px-3 sm:px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-300 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>
          </div>
          
          <div className="px-4 sm:px-8 py-4 sm:py-6 bg-gray-50 border-t border-gray-200 flex flex-col items-center">
            <p className="text-sm text-gray-600 mb-3 sm:mb-4">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </p>
            <button
              onClick={toggleForm}
              className="text-[#0060fb] hover:text-[#2f27ce] font-medium transition-colors cursor-pointer"
            >
              {isLogin ? 'Create an account' : 'Log in'}
            </button>
          </div>
          
          {isLogin && (
            <div className="px-4 sm:px-8 py-4 sm:py-6 bg-gray-100 border-t border-gray-200">
              <div className="flex flex-col space-y-3 sm:space-y-4">
                <p className="text-sm text-center text-gray-600 mb-2">Or sign in with</p>
                <button className="flex items-center justify-center bg-white hover:bg-gray-100 text-gray-700 font-medium py-2 sm:py-3 px-3 sm:px-4 border border-gray-300 rounded transition-colors cursor-pointer">
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </button>
                {/* Updated Facebook button with new blue color */}
                <button className="flex items-center justify-center bg-[#0060fb] hover:bg-[#2f27ce] text-white font-medium py-2 sm:py-3 px-3 sm:px-4 rounded transition-colors cursor-pointer">
                  <svg className="h-5 w-5 mr-2 fill-current" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
                  </svg>
                  Facebook
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogSign;