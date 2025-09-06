import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useLocalization } from '../../context/LocalizationContext.ts';
import { STRINGS } from '../../constants.ts';
import { Spinner } from '../Spinner.tsx';
import { supabaseCredentialsProvided } from '../../services/supabaseClient.ts';

interface LoginProps {
  onSwitchToSignUp: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToSignUp }) => {
    const { login } = useAuth();
    const { language } = useLocalization();
    const s = STRINGS[language];

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(email, password);
        } catch (err: any) {
            setError(err.message || s.loginError);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md dark:bg-gray-800 m-4">
                <div className="text-center">
                     <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse mb-4">
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-primary-500">
                            <path d="M12.378 1.602a.75.75 0 00-.756 0L3 6.632l9 5.25 9-5.25-8.622-5.03zM21.75 7.93l-9 5.25v9l8.628-5.032a.75.75 0 00.372-.648V7.93zM12 22.18v-9l-9-5.25v8.57a.75.75 0 00.372-.648l8.628 5.033z" />
                        </svg>
                        <h1 className="text-3xl font-bold text-gray-700 dark:text-gray-200">{s.appName}</h1>
                      </div>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">{s.welcome}</p>
                </div>
                
                {!supabaseCredentialsProvided && (
                    <div className="p-4 text-sm text-yellow-800 rounded-lg bg-yellow-50 dark:bg-gray-900 dark:text-yellow-300" role="alert">
                        <span className="font-medium">{s.configNeeded}</span> {s.updateSupabaseCredentials}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="flex flex-col">
                        <label htmlFor="email" className="mb-2 font-medium text-gray-700 dark:text-gray-300">{s.emailLabel}</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder={s.emailPlaceholder}
                        />
                    </div>
                     <div className="flex flex-col">
                        <label htmlFor="password"className="mb-2 font-medium text-gray-700 dark:text-gray-300">{s.passwordLabel}</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder={s.passwordPlaceholder}
                        />
                    </div>
                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                    <div>
                        <button
                            type="submit"
                            disabled={loading || !email || !password}
                            className="w-full px-8 py-3 font-medium tracking-wide text-white capitalize transition-colors duration-200 transform bg-primary-600 rounded-md hover:bg-primary-500 focus:outline-none focus:ring focus:ring-primary-300 focus:ring-opacity-80 disabled:bg-primary-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                            {loading ? <Spinner /> : s.login}
                        </button>
                    </div>
                </form>
                 <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                    {s.noAccount}{' '}
                    <button onClick={onSwitchToSignUp} className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 focus:outline-none focus:underline">
                        {s.signUp}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;
