import React from "react";
import "../css/productos.css";
import Nav from "../components/nav/Nav";
import Bar from "../components/bar/Bar";
import { IoMdCreate, IoIosRemove, IoIosAdd } from "react-icons/io";

function Productos() {
  return (
    <div className="conten">
      <Bar></Bar>
      <main>
        <nav>
          <Nav></Nav>
        </nav>
        <div className="dd">
          <div className="top">
            <h1>Productos</h1>
            <div>
              <button>
                <IoIosAdd />
              </button>
            </div>
          </div>
          <div className="medium">
            <table>
              <tr>
                <th>ID</th>
                <th>NOMBRE</th>
                <th>TIPO</th>
                <th>COSTO</th>
                <th>STOCK</th>
              </tr>
              <tr>
                <td>gfd</td>
                <td>fdg</td>
                <td>gfd</td>
                <td>gfdg</td>
                <td>gdfg</td>
                <td>
                  <button><IoMdCreate/></button>
                  <button><IoIosRemove/></button>
                </td>
              </tr>
              
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Productos;
