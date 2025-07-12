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
          <Link to='/DienThoai'>
            <div className="label-item">
              <div className="item-content">
                <div className="category-icon">
                  <FaCamera style={{fontSize:'27px'}}/>
                </div>
                <span className='item-link'>Dien Thoai</span>
              </div>
              <div className='right-icon'>
                <FontAwesomeIcon icon={faChevronRight} />
              </div>
            </div>
          </Link>
        </div>
        <div className="label-menu-bar">
          <Link to='/Laptop'>
            <div className="label-item">
              <div className="item-content">
                <div className="category-icon">
                  <RiCameraLensFill style={{fontSize:'27px'}}/>
                </div>
                <span className='item-link'>Laptop</span>
              </div>
              <div className='right-icon'>
                <FontAwesomeIcon icon={faChevronRight} />
              </div>
            </div>
          </Link>
        </div>
        <div className="label-menu-bar">
          <Link to='/TaiNghe'>
            <div className="label-item">
              <div className="item-content">
                <div className="category-icon">
                <HiAdjustmentsHorizontal style={{fontSize:'27px'}} />
                </div>
                <span style={{textDecoration:'none'}} className='item-link'>Tai nghe</span>
              </div> 
              <div className='right-icon'>
                <FontAwesomeIcon icon={faChevronRight} />
              </div>
            </div>
          </Link>
        </div>
        <div className="label-menu-bar">
          <Link to='/BanPhim'>
            <div className="label-item">
              <div className="item-content">
                <div className="category-icon">
                  <FaCamera style={{fontSize:'27px'}}/>
                </div>
                <span className='item-link'>Ban phim</span>
              </div>
              <div className='right-icon'>
                <FontAwesomeIcon icon={faChevronRight} />
              </div>
            </div>
          </Link>
        </div>
        <div className="label-menu-bar">
          <Link to='/PhuKien'>
            <div className="label-item">
              <div className="item-content">
                <div className="category-icon">
                  <FaCamera style={{fontSize:'27px'}}/>
                </div>
                <span className='item-link'>Phu Kien</span>
              </div>
              <div className='right-icon'>
                <FontAwesomeIcon icon={faChevronRight} />
              </div>
            </div>
          </Link>
        </div>
        <div className="label-menu-bar">
          <Link to='/Chuot'>
            <div className="label-item">
              <div className="item-content">
                <div className="category-icon">
                  <FaCamera style={{fontSize:'27px'}}/>
                </div>
                <span className='item-link'>Chuot</span>
              </div>
              <div className='right-icon'>
                <FontAwesomeIcon icon={faChevronRight} />
              </div>
            </div>
          </Link>
        </div>
        <div className="label-menu-bar">
          <Link to='/Tivi'>
            <div className="label-item">
              <div className="item-content">
                <div className="category-icon">
                  <FaCamera style={{fontSize:'27px'}}/>
                </div>
                <span className='item-link'>Tivi</span>
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