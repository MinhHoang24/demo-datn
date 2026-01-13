import React from 'react'
import { Link } from 'react-router-dom';
import './BreadCrumbs.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faHouse } from '@fortawesome/free-solid-svg-icons';
import { CATEGORY_TITLES } from "../../Constants/Category.ts";

function Breadcrumbs({ product, category, brand }) {
  const lowercaseCategory = category.toLowerCase();
  const categoryTitle =
    CATEGORY_TITLES[category] || category;

  return (
    <div className='breadcrumbs'>
      <div className="breadcrumbs-container">
        <div className="breadcrumbs-blocks">
          <div className="breadcrumbs-block">
            <FontAwesomeIcon icon={faHouse} className='home-icon' />
            <Link to={'/'}>Trang chủ</Link>
          </div>
          <div className="breadcrumbs-block">
            <FontAwesomeIcon icon={faChevronRight} />
            <Link to={`/${lowercaseCategory}`}>{categoryTitle}</Link>
          </div>
          {product && (
            <div className="breadcrumbs-block">
              <FontAwesomeIcon icon={faChevronRight} />
              <Link to={`/product/${product.id}`}>
                {product.name}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Breadcrumbs;