import { Link } from "react-router";
function Navbar(){
    return(
        <> 
            <div id = "navbar" className = "w-screen h-[12vh] flex-row flex justify-around items-center text-center">
                <div id = "navbar-items">
                    <ul className = "list-none flex flex-row gap-4">
                        <li><Link to = "/">Home</Link></li>
                        <li><Link to = "/find">Find Item</Link></li>
                        <li><Link to = "/post">Post Item</Link></li>
                        <li><Link to = "/about">About us</Link></li>
                        <li><Link to = "/library">Library</Link></li>
                    </ul>
                </div>

                <div className = "">
                    <h1 className = "text-[24px] font-extrabold text-[#2F27CE]">Campus</h1>
                    <h2 className = "text-[24px] font-extrabold text-[#2F27CE]">Exchange</h2>
                </div>

                <div>
                    <label htmlFor="">Search</label>
                    <input type="search" name="" id="" placeholder = "Find item" className = "ml-4 border-2 pl-2 rounded-[4px] mr-8"/>
                    
                    <span>Profile</span>
                </div>
            </div>
        </>
    )
}

export default Navbar ; 