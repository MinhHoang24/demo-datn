import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faStarHalfAlt } from '@fortawesome/free-solid-svg-icons';
import './ProductRating.css'

const ProductRating = ({ rating }) => {
  const stars = [];
  const fullStars = Math.floor(rating); 
  const halfStar = rating - fullStars >= 0.5; 
  for (let i = 0; i < fullStars; i++) {
    stars.push(<FontAwesomeIcon icon={faStar} key={i} style={{ color: 'gold' }} />);
  }


  if (halfStar) {
    stars.push(<FontAwesomeIcon icon={faStarHalfAlt} key={fullStars} style={{ color: 'gold' }} />);
  }

  let  remainingStars = 5 - stars.length;
  for (let i = 0; i < remainingStars; i++) {
    stars.push(<FontAwesomeIcon icon={faStar} key={fullStars + i + 1} style={{ color: 'gray' }} />);
  }

  return <div className="box-rating">{stars.map((star, index) => <div className="star-icon" key={index}>{star}</div>)}</div>;
};

export default ProductRating;