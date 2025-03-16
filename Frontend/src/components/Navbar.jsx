import { Link } from "react-router";
import { CircleUserRound, Search, ChevronDown } from 'lucide-react'

function Navbar(){
    return(
        <> 
            <div id = "navbar" className = "w-screen h-[12vh] flex-row flex justify-between items-center text-center px-8">
                <div id = "navbar-items">
                    <ul className = "list-none flex flex-row gap-6">
                        <li><Link to = "/">Home</Link></li>
                        <li><Link to = "/find">Find Item</Link></li>
                        <li><Link to = "/post">Post Item</Link></li>
                        <li><Link to = "/about">About us</Link></li>
                        <li><Link to = "/library">Library</Link></li>
                    </ul>
                </div>

                <div className = "">
                    <Link to ="/">
                        <h1 className = "text-[24px] font-extrabold text-[#2F27CE]">Campus</h1>
                        <h2 className = "text-[24px] font-extrabold text-[#2F27CE]">Exchange</h2>
                    </Link>
                </div>

                <div className = "flex flex-row">
                    <Search size={18} className = "relative left-10 top-2 z-10" color="#2F27CE"/>
                    <input type="search" name="" id="" placeholder = "Find item" className = "ml-4 border-2 pl-8 rounded-[4px] mr-4 w-70 outline-none border-[#2F27CE]"/>
                    <button className = "px-8 py-1 bg-[#2F27CE] text-white rounded-[8px] cursor-pointer hover:bg-[#2F27CE] font-[600]">Search</button>
                </div>

                <div className = "flex flex-row gap-2 cursor-pointer" id = "profile">
                    <span><CircleUserRound size={28} color="#2F27CE"/></span>
                    <span id = "arrow"><ChevronDown size = {24} color="#2F27CE"/></span>
                </div>
            </div>
        </>
    )
}

export default Navbar ; 