import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Ho from "../app/ho";

const Path = () => {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<Ho/>}/> 
         <Route
            path="*"
            element={
              <>
                <h1 style={{'display': 'flex', 'justifyContent': 'center', 'alignItems': 'center' ,'textAlign': 'center', 'minHeight': '90vh'}}>not found this path </h1>
               
              </>
            }
          ></Route>
      </Routes>
    </Router>
  );
};

export default Path;