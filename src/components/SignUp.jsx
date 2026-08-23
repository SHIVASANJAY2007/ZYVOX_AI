import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { GOOGLE_CLIENT_ID, GOOGLE_SHEET_DATABASE_URL, SIGNUP_ENABLED } from '../config';

const SignUp = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [gsiLoaded, setGsiLoaded] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('zyvox_user');
        if (storedUser) {
            navigate('/get-plan');
            return;
        }

        if (!SIGNUP_ENABLED) {
            navigate('/get-plan');
            return;
        }

        if (window.google?.accounts?.oauth2) {
            setGsiLoaded(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            setGsiLoaded(true);
        };
        script.onerror = () => {
            console.error('Failed to load Google Identity Services SDK.');
        };
        document.body.appendChild(script);

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, [navigate]);

    const signUpWithGoogle = () => {
        if (!gsiLoaded || isLoading) return;

        setIsLoading(true);

        try {
            const client = window.google.accounts.oauth2.initTokenClient({
                client_id: GOOGLE_CLIENT_ID,
                scope: 'email profile openid',
                callback: async (tokenResponse) => {
                    if (tokenResponse.error) {
                        console.error('Google Auth Error:', tokenResponse.error);
                        setIsLoading(false);
                        return;
                    }

                    try {
                        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                            headers: {
                                Authorization: `Bearer ${tokenResponse.access_token}`
                            }
                        });
                        const userInfo = await res.json();
                        
                        if (userInfo && userInfo.email) {
                            const userData = {
                                googleId: userInfo.sub,
                                name: userInfo.name,
                                email: userInfo.email,
                                picture: userInfo.picture,
                                action: 'Login/Signup'
                            };

                            if (GOOGLE_SHEET_DATABASE_URL) {
                                try {
                                    await fetch(GOOGLE_SHEET_DATABASE_URL, {
                                        method: 'POST',
                                        mode: 'no-cors',
                                        headers: {
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify(userData)
                                    });
                                } catch (sheetError) {
                                    console.error('Error writing to Google Sheets:', sheetError);
                                }
                            } else {
                                console.warn('VITE_GOOGLE_SHEET_DATABASE_URL is not set. Signup details not sent to Google Sheets.');
                            }

                            localStorage.setItem('zyvox_user', JSON.stringify(userData));
                            navigate('/get-plan');
                        } else {
                            throw new Error('Failed to retrieve email from user info.');
                        }
                    } catch (fetchError) {
                        console.error('Error fetching user info / saving user:', fetchError);
                        setIsLoading(false);
                    }
                },
                error_callback: (err) => {
                    console.error('GSI Token Client Error:', err);
                    setIsLoading(false);
                }
            });

            client.requestAccessToken();
        } catch (err) {
            console.error('Error in Google OAuth Flow:', err);
            setIsLoading(false);
        }
    };

    if (!SIGNUP_ENABLED) {
        return (
            <div className="flex h-screen w-full bg-[#fdf8f3] items-center justify-center p-4">
                <div className="flex w-full max-w-5xl bg-[#fdf8f3] rounded-3xl overflow-hidden shadow-none">
                    {/* Left Side - Image */}
                    <div className="hidden md:flex w-1/2 p-4 items-center justify-center">
                        <div className="relative w-full h-[600px] rounded-[40px] overflow-hidden bg-[#0a0a0a] border-2 border-black flex items-center justify-center">
                            <img
                                src="/assets/logo/logo.png"
                                alt="Zyvox AI"
                                className="w-3/4 h-auto object-contain"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none"></div>
                        </div>
                    </div>

                    {/* Right Side - Content */}
                    <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-16 py-12 text-center md:text-left">
                        <div className="mb-10">
                            <h1 className="text-6xl font-black text-black leading-[0.9] tracking-tighter mb-4">
                                Sign Up is<br />Closed
                            </h1>
                            <p className="text-lg font-bold text-gray-500">
                                Signups are temporarily disabled. We are preparing for our next launch phase.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-[#FFF3CD] border-2 border-[#FFEBA8] text-[#856404] px-6 py-4 rounded-2xl font-bold text-center text-sm">
                                New user registration is currently paused. Please check back later!
                            </div>
                            <button
                                onClick={() => navigate('/')}
                                className="w-full bg-black text-white font-bold text-lg py-4 rounded-full border-2 border-black flex items-center justify-center gap-3 active:scale-95 hover:bg-gray-800 transition-all shadow-lg shadow-black/10"
                            >
                                Go Back to Home
                            </button>
                        </div>

                        <p className="text-[10px] text-gray-400 mt-10 text-center font-medium leading-relaxed">
                            For support or inquiries, please contact our community channel.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full bg-[#fdf8f3] items-center justify-center p-4">
            <div className="flex w-full max-w-5xl bg-[#fdf8f3] rounded-3xl overflow-hidden shadow-none">
                {/* Left Side - Image */}
                <div className="hidden md:flex w-1/2 p-4 items-center justify-center">
                    <div className="relative w-full h-[600px] rounded-[40px] overflow-hidden bg-[#0a0a0a] border-2 border-black flex items-center justify-center">
                        <img
                            src="/assets/logo/logo.png"
                            alt="Zyvox AI"
                            className="w-3/4 h-auto object-contain"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none"></div>
                    </div>
                </div>

                {/* Right Side - Content */}
                <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-16 py-12 text-center md:text-left">
                    <div className="mb-10">
                        <h1 className="text-6xl font-black text-black leading-[0.9] tracking-tighter mb-4">
                            Sign Up to<br />Zyvox AI
                        </h1>
                        <p className="text-lg font-bold text-gray-500">
                            Join the community of explorers.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <button
                            onClick={signUpWithGoogle}
                            disabled={isLoading}
                            className={`w-full bg-white text-black font-bold text-lg py-4 rounded-full border-2 border-gray-200 flex items-center justify-center gap-3 active:scale-95 transition-all ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                                }`}
                        >
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
                            {isLoading ? 'Connecting...' : 'Continue with Google'}
                        </button>
                    </div>

                    <p className="text-[10px] text-gray-500 mt-10 text-center font-medium leading-relaxed">
                        By connecting to Zyvox AI you agree to our <span className="text-black font-bold">Terms of use</span> and <span className="text-black font-bold">Privacy Policy</span>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
