import React from 'react'
import { Link } from 'react-router-dom'
import './MenuBar.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { PiTelevision } from "react-icons/pi";
import { FaTools } from "react-icons/fa";
import { IoPhonePortraitOutline } from "react-icons/io5";
import { FaLaptop } from "react-icons/fa";
import { CiHeadphones } from "react-icons/ci";
import { FaKeyboard } from "react-icons/fa";
import { FaMouse } from "react-icons/fa";
function MenuBar() {
  return (
    <>
      <div className='menu-bar'>
        <div className="label-menu-bar">
          <Link to='/DienThoai'>
            <div className="label-item">
              <div className="item-content">
                <div className="category-icon">
                  <IoPhonePortraitOutline style={{fontSize:'27px'}}/>
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
                  <FaLaptop style={{fontSize:'27px'}}/>
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
                <CiHeadphones style={{fontSize:'27px'}} />
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
                  <FaKeyboard style={{fontSize:'27px'}}/>
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
                  <FaTools style={{fontSize:'27px'}}/>
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
                  <FaMouse style={{fontSize:'27px'}}/>
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
                  <PiTelevision style={{fontSize:'27px'}}/>
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