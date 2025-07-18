import React from 'react'
import '../css/dashboard.css'
import Nav from '../components/nav/Nav'
import Bar from '../components/bar/Bar'

function Dashboard() {
  return (
    <div className='contp'>
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

export default Dashboard
