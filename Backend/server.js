import express from "express" ; 

const port = 3000 ; 
const app = express() ; 

app.listen(port, ()=>{
    console.log(`Server running on port ${port}`) ; 
}) ; 

app.get('/' , (req, res) =>{
    res.send("This is working") ; 
})