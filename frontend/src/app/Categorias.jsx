import React from 'react'
import '../css/categorias.css'
import Nav from '../components/nav/Nav'
import Bar from '../components/bar/Bar'

function Categorias() {
  return (
    <div className='conten'>
            <Bar></Bar>
      <main>
        <nav>
          <Nav></Nav>
        </nav>
        <div></div>
      </main>
    </div>
  )
}

export default Categorias