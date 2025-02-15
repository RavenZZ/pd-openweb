import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { ScrollView, Button, Modal } from 'ming-ui';
import IconBtn from 'worksheet/common/recordInfo/RecordForm/IconBtn.jsx';
import RowDetail from './RowDetail';
import { browserIsMobile } from 'src/util';

export default function RowDetailModal(props) {
  const {
    disabled,
    className,
    title,
    visible,
    controlName,
    aglinBottom,
    projectId,
    data,
    controls,
    switchDisabled = {},
    onClose,
    onSave,
    onDelete,
    onSwitch,
    handleUniqueValidate,
  } = props;
  const formContent = useRef(null);
  const isMobile = browserIsMobile();
  const content = (
    <ScrollView>
      <div className="rowDetailCon flexColumn" style={{ height: '100%' }}>
        <div className="header flexRow">
          <Button
            size="mdbig"
            type="ghostgray"
            disabled={switchDisabled.prev}
            className="switchButton"
            onClick={() => !switchDisabled.prev && onSwitch({ prev: true })}
          >
            <i className="icon icon-arrow-up-border"></i>
            <span className="text">{_l('上一条')}</span>
          </Button>
          <Button
            size="mdbig"
            type="ghostgray"
            disabled={switchDisabled.next}
            className="switchButton"
            onClick={() => !switchDisabled.next && onSwitch({ next: true })}
          >
            <i className="icon icon-arrow-down-border"></i>
            <span className="text">{_l('下一条')}</span>
          </Button>
          <div className="flex" />
          {!disabled && (
            <IconBtn
              className="headerBtn Hand ThemeHoverColor3 delete"
              onClick={() => {
                onDelete(data.rowid);
                onClose();
              }}
            >
              <i className="icon icon-task-new-delete"></i>
            </IconBtn>
          )}
          <IconBtn
            className="headerBtn Hand ThemeHoverColor3"
            onClick={() => {
              if (formContent.current) {
                formContent.current.handleClose();
              }
            }}
          >
            <i className="icon icon-close"></i>
          </IconBtn>
        </div>

        <div className="forCon flex">
          <div className="title">{title}</div>
          <RowDetail
            isSync
            disabled={disabled}
            controlName={controlName}
            ref={formContent}
            projectId={projectId}
            data={data}
            controls={controls}
            handleUniqueValidate={handleUniqueValidate}
            onSave={onSave}
            onClose={onClose}
          />
        </div>
      </div>
    </ScrollView>
  );
  return (
    <Modal
      className={cx('childTableRowDetailDialog', className)}
      verticalAlign={aglinBottom && 'bottom'}
      type="fixed"
      visible
      width={isMobile ? window.innerWidth - 20 : 630}
      bodyStyle={{ height: isMobile ? window.innerHeight - 20 * 2 : window.innerHeight - 32 * 2 }}
      onCancel={onClose}
      visible={visible}
    >
      {content}
    </Modal>
  );
}

RowDetailModal.propTypes = {
  disabled: PropTypes.bool,
  visible: PropTypes.bool,
  className: PropTypes.string,
  onClose: PropTypes.func,
};
