import React from "react";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography } from "@material-tailwind/react";

const Landing = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/home');
        }, 3000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center relative" 
             style={{ 
                 transition: 'all 1s ease-in-out',
                 backgroundImage: 'url("/img/background-3.png")',
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
             }}>
            {/* Overlay for better text visibility */}
            <div className="absolute inset-0 bg-black/50" />
            
            <div className="text-center space-y-8 relative z-10" 
                 style={{ 
                     animation: 'fadeIn 1s ease-in-out',
                     transition: 'transform 0.3s ease',
                 }}>
                <Typography 
                    variant="h1" 
                    className="text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300"
                    style={{ 
                        animation: 'slideDown 1s ease-out',
                    }}
                >
                    Ather
                </Typography>
                <Typography 
                    variant="h3" 
                    className="text-3xl text-white"
                    style={{ 
                        animation: 'slideUp 1s ease-out 0.5s both',
                    }}
                >
                    Welcomes You
                </Typography>
                <div className="mt-8 flex justify-center items-center gap-4">
                    {[0, 1, 2].map((index) => (
                        <div 
                            key={index}
                            className="w-3 h-3 rounded-full"
                            style={{
                                animation: `bounce 1s ease-in-out ${index * 0.2}s infinite`,
                                backgroundColor: index === 1 ? '#ffffff' : '#e5e7eb'
                            }}
                        />
                    ))}
                </div>
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideDown {
                    from { 
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes bounce {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }
            `}</style>
        </div>
    );
};

export default Landing;