import React from 'react'
import '../css/almacenes.css'
import Nav from '../components/nav/Nav'
import Bar from '../components/bar/Bar'

function Almacenes() {
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

export default Almacenes
