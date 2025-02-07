import PropTypes from 'prop-types';
import React, { createElement } from 'react';
import cx from 'classnames';
import './less/Item.less';

function Item(props) {
  const { className, children, icon, iconAtEnd, subMenu, target, href, disabled, text, iconName, iconHint, ...rest } = props;
  return (
    <li {...rest} className={cx(className, `ming Item ${iconAtEnd ? 'iconAtEnd' : ''}`)}>
      {createElement(
        href ? 'a' : 'div',
        {
          className: 'Item-content' + (disabled ? ' disabled' : ''),
          href,
          target,
        },
        <span>
          {icon}
          {children}
        </span>
      )}
      {subMenu}
    </li>
  );
}
Item.propTypes = {
  icon: PropTypes.element,
  iconAtEnd: PropTypes.bool,
  subMenu: PropTypes.element,
  target: PropTypes.string,
  href: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.any,
  disabled: PropTypes.bool, // 是否禁用
};

export default Item;
