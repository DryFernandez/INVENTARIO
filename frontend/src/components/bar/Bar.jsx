import React from 'react'
import './bar.css';
import { AiFillProduct } from "react-icons/ai";
import { MdCategory } from "react-icons/md";
import { FaWindowRestore } from "react-icons/fa6";
import { FaBoxesStacked } from "react-icons/fa6";
import { FaShoppingCart } from "react-icons/fa";
import { BsCartCheckFill } from "react-icons/bs";
import persona from './persona.png'
import { Link }from 'react-router-dom'

function Bar() {
  return (
    <div className="contentBar">
      <div className='user-ima'>
        <img src={persona} alt="" />
        <p>Dary </p>
      </div>

      <div className="bar-menu">
        <ul>
          <li> <Link className='link' to={'/'} > <AiFillProduct className='icon-menu' /> PRODUCTOS </Link></li>
          <li> <Link className='link' to={'/'} > <MdCategory className='icon-menu' /> CATEGORIAS </Link></li>
          <li> <Link className='link' to={'/'} > <FaWindowRestore className='icon-menu' /> ALMACENES </Link></li>
          <li> <Link className='link' to={'/'} > <FaBoxesStacked className='icon-menu' /> PROVEEDORES </Link></li>
          <li> <Link className='link' to={'/'} > <BsCartCheckFill className='icon-menu' /> VENTAS </Link></li>
          <li> <Link className='link' to={'/'} > <FaShoppingCart className='icon-menu' /> COMPRAS </Link></li>
        </ul>
      </div>
    </div>
  )
}

export default Bar
