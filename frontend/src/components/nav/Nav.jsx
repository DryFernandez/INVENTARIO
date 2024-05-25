import React from 'react'
import './nav.css'
import { IoMdExit } from "react-icons/io";
import { FaUser } from "react-icons/fa";
function Nav() {
  return (
    <div className='content'>
        <h1>INVENTARIO</h1>
      <div className="PerSal">
      <FaUser className="icon" />
      <IoMdExit className="icon"/>
      </div>
    </div>
  )
}

export default Nav
