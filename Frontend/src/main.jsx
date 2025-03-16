
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route} from 'react-router' ; 
import Home from "./Pages/Home.jsx" ; 
import About from './Pages/About.jsx' ; 
import Find from './Pages/Find.jsx' ; 
import Post from './Pages/Post.jsx' ; 
import Library from './Pages/Library.jsx' ; 

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path = "/" element = {<Home />}/>
      <Route path = "/about" element = {<About />}/>
      <Route path = "/find" element = {<Find />}/>
      <Route path = "/post" element = {<Post />}/>
      <Route path = "/library" element = {<Library />}/>
    </Routes>
  </BrowserRouter>
)
