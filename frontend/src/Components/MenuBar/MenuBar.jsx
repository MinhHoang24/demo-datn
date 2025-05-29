import React from 'react'
import { Link } from 'react-router-dom'
import './MenuBar.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { HiAdjustmentsHorizontal } from "react-icons/hi2";
import { FaCamera } from "react-icons/fa";
import { RiCameraLensFill } from "react-icons/ri";
function MenuBar() {
  return (
    <>
      <div className='menu-bar'>
        <div className="label-menu-bar">
          <Link to='/Body'>
            <div className="label-item">
              <div className="item-content">
                <div className="category-icon">
                  <FaCamera style={{fontSize:'27px'}}/>
                </div>
                <span className='item-link'>Body</span>
              </div>
              <div className='right-icon'>
                <FontAwesomeIcon icon={faChevronRight} />
              </div>
            </div>
          </Link>
        </div>
        <div className="label-menu-bar">
          <Link to='/Lens'>
            <div className="label-item">
              <div className="item-content">
                <div className="category-icon">
                  <RiCameraLensFill style={{fontSize:'27px'}}/>
                </div>
                <span className='item-link'>Lens</span>
              </div>
              <div className='right-icon'>
                <FontAwesomeIcon icon={faChevronRight} />
              </div>
            </div>
          </Link>
        </div>
        <div className="label-menu-bar">
          <Link to='/Phụ kiện'>
            <div className="label-item">
              <div className="item-content">
                <div className="category-icon">
                <HiAdjustmentsHorizontal style={{fontSize:'27px'}} />
                </div>
                <span style={{textDecoration:'none'}} className='item-link'>Phụ Kiện</span>
              </div> 
              <div className='right-icon'>
                <FontAwesomeIcon icon={faChevronRight} />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </>
  )
}

export default MenuBar;