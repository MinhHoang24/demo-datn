import { Link } from 'react-router-dom';
import './MenuBar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

import { MENU_ITEMS } from '../../Constants/MenuItems.ts';
import { CATEGORY_TITLES, CATEGORY_ROUTES } from '../../Constants/Category.ts';

function MenuBar() {
  return (
    <div className="menu-bar">
      {MENU_ITEMS.map(({ category, icon: Icon }) => (
        <div key={category} className="label-menu-bar">
          <Link to={CATEGORY_ROUTES[category]}>
            <div className="label-item">
              <div className="item-content">
                <div className="category-icon">
                  <Icon style={{ fontSize: '27px' }} />
                </div>
                <span className="item-link">{CATEGORY_TITLES[category]}</span>
              </div>
              <div className="right-icon">
                <FontAwesomeIcon icon={faChevronRight} />
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}

export default MenuBar;