import React from 'react';
import cx from 'classnames';
import Icon from 'ming-ui/components/Icon';
import { FLOW_STATUS } from './config';

const STATUS2ICON = {
  suspend: 'workflow_suspend',
  fail: 'workflow_failure',
  completed: 'hr_ok',
  filter: 'workflow_suspend',
  overrule: 'workflow_suspend',
};
export default ({ statusCode = 1, config = FLOW_STATUS, className, size = 30 }) => {
  const { status, text } = config[statusCode];
  return (
    <div className={cx('historyStatus', className)}>
      <div className={cx('historyStatusIcon', status)} style={{ width: size, height: size }}>
        {_.includes(['pending'], status) ? (
          <div className={cx(`statusIcon statusIcon-${status}`)} />
        ) : (
          <Icon icon={STATUS2ICON[status]} style={{ fontSize: size / 1.5 }} />
        )}
      </div>
      <div className="statusText Font14">{text}</div>
    </div>
  );
};
