import { Link } from "react-router";
import { CircleUserRound, Search, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from "react";

function Navbar() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [closeTimeout, setCloseTimeout] = useState(null);
    const dropdownRef = useRef(null);
    const profileRef = useRef(null);

    const handleProfileEnter = () => {
        if (closeTimeout) {
            clearTimeout(closeTimeout);
            setCloseTimeout(null);
        }
        setIsDropdownOpen(true);
    };

    const handleDropdownEnter = () => {
        if (closeTimeout) {
            clearTimeout(closeTimeout);
            setCloseTimeout(null);
        }
    };

    const handleProfileLeave = () => {
        
        if (!dropdownRef.current || !dropdownRef.current.matches(':hover')) {
            const timeout = setTimeout(() => {
                setIsDropdownOpen(false);
            }, 750);
            setCloseTimeout(timeout);
        }
    };

    const handleDropdownLeave = () => {
        if (!profileRef.current || !profileRef.current.matches(':hover')) {
            const timeout = setTimeout(() => {
                setIsDropdownOpen(false);
            }, 750);
            setCloseTimeout(timeout);
        }
    };

    useEffect(() => {
        return () => {
            if (closeTimeout) {
                clearTimeout(closeTimeout);
            }
        };
    }, [closeTimeout]);

    return (
        <>
            <div id="navbar" className="w-screen h-[12vh] flex-row flex justify-between items-center text-center px-8">
                <div className="">
                    <Link to="/">
                        <h1 className="font-extrabold text-[24px]">
                            <span>Campus</span>
                            <span className="text-[#0060fb] text-[40px]">X</span>
                            change
                        </h1>
                    </Link>
                </div>

                <div className="flex flex-row gap-4">
                    <div id="navbar-items">
                        <ul className="list-none flex flex-row gap-2">
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/market">Market Place</Link></li>
                            <li><Link to="/about">About us</Link></li>
                            <li><Link to="/library">Library</Link></li>
                        </ul>
                    </div>

                    <Search size={18} className="relative left-14 top-2.5 z-10" color="#2F27CE" />
                    <input 
                        type="search" 
                        placeholder="Find item" 
                        className="ml-4 border-2 pl-8 rounded-[4px] mr-4 w-70 outline-none border-[#2F27CE]" 
                    />
                    <button className="px-4 bg-[#0060fb] text-white rounded-[8px] cursor-pointer hover:bg-[#2F27CE] font-[600]">
                        Search
                    </button>

                    <div 
                        className="cursor-pointer flex flex-row justify-center items-center" 
                        id="profile" 
                        ref={profileRef}
                        onMouseEnter={handleProfileEnter} 
                        onMouseLeave={handleProfileLeave}
                    >
                        <span><CircleUserRound size={28} color="#2F27CE" /></span>
                        <span id="arrow" className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                            <ChevronDown size={24} color="#2F27CE" />
                        </span>
                    </div>
                </div>
            </div>

            {isDropdownOpen && (
                <div 
                    className="h-[16vh] w-[12vw] rounded-2xl shadow-2xl absolute right-4 flex items-center justify-center"
                    id="drop-down"
                    ref={dropdownRef}
                    onMouseEnter={handleDropdownEnter}
                    onMouseLeave={handleDropdownLeave}
                >
                    <div className="flex flex-col w-full">
                        <ul className="flex flex-col text-center space-y-3">
                            <li className="cursor-pointer hover:text-[#2F27CE] transition-colors font-[600]">Account</li>
                            <li className="cursor-pointer hover:text-[#2F27CE] transition-colors font-[600]">Sign Up</li>
                        </ul>
                    </div>
                </div>
            )}
        </>
    );
}

export default Navbar;