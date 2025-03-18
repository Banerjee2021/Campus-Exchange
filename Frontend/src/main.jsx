
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route} from 'react-router' ; 
import Home from "./Pages/Home.jsx" ; 
import About from './Pages/About.jsx' ; 
import MarketPlace from './Pages/MarketPlace.jsx';
import Library from './Pages/Library.jsx' ; 
import LogSign from './Pages/LogSign.jsx';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path = "/" element = {<Home />}/>
      <Route path = "/about" element = {<About />}/>
      <Route path = "/market" element = {<MarketPlace />}/>
      <Route path = "/library" element = {<Library />}/>
      <Route path = "/login" element = {<LogSign />} />
    </Routes>
  </BrowserRouter>
)
