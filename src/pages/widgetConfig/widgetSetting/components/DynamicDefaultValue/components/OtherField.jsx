import React, { Component, Fragment } from 'react';
import { string } from 'prop-types';
import cx from 'classnames';
import update from 'immutability-helper';
import { getControlType } from '../util';
import { OtherFieldWrap } from '../styled';
import { SYSTEM_FIELD_TO_TEXT } from '../config';

export default function OtherField(props) {
  const {
    dynamicValue,
    onDynamicValueChange,
    item = {},
    data,
    text,
    className,
    globalSheetInfo,
    globalSheetControls = [],
  } = props;
  const { worksheetId } = globalSheetInfo;
  const controls = props.controls.concat(globalSheetControls);
  const getFieldName = (controls, fieldId) => {
    if (_.includes(['ctime', 'utime', 'owner', 'caid'], fieldId)) return SYSTEM_FIELD_TO_TEXT[fieldId];
    return (
      _.get(
        _.find(controls, item => _.includes([item.controlId, item.id], fieldId)),
        'controlName',
      ) || '已删除'
    );
  };
  const getFieldNameById = (item, controls) => {
    const { cid, rcid } = item;
    if (rcid) {
      // 子表控件中 如果是主记录
      if (rcid === worksheetId) {
        return { fieldName: getFieldName(controls, cid) };
      }
      const record = _.find(controls, item => item.controlId === rcid);
      return {
        recordName: _.get(record, 'controlName'),
        fieldName: getFieldName(_.get(record, 'relationControls'), cid),
      };
    } else {
      return { fieldName: getFieldName(controls, cid) };
    }
  };
  const delField = tag => {
    const { cid, rcid, staticValue } = tag;
    const index = _.findIndex(
      dynamicValue,
      item => item.cid === cid && item.rcid === rcid && item.staticValue === staticValue,
    );
    onDynamicValueChange(update(dynamicValue, { $splice: [[index, 1]] }));
  };
  const isFieldDeleteFn = (item, controls = []) => {
    const { cid, rcid } = item;
    const isFieldNotInControls = (controls, cid) => {
      if (_.includes(['ctime', 'utime', 'owner', 'caid'], cid)) return false;
      return !_.some(controls, item => _.includes([item.controlId, item.id], cid));
    };
    if (rcid) {
      // 子表控件中 主记录控件
      if (rcid === worksheetId) {
        return isFieldNotInControls(controls, cid);
      }
      const record = _.find(controls, item => item.controlId === rcid);
      if (!record) return true;
      return isFieldNotInControls(_.get(record, 'relationControls'), cid);
    } else {
      return isFieldNotInControls(controls, cid);
    }
  };
  if (text) return <span style={{ height: '26px' }}>{text}</span>;
  const isText = getControlType(data) === 'text';
  const { fieldName, recordName } = getFieldNameById(item, controls);
  const isFieldDelete = isFieldDeleteFn(item, controls);
  return (
    <OtherFieldWrap className={cx(className, { pointer: !isText, haveCloseIcon: !isText, deleted: isFieldDelete })}>
      <Fragment>
        <span>{fieldName}</span>
        {recordName && <span className="recordName">{recordName}</span>}
      </Fragment>
      {!isText && (
        <i
          className="icon-close"
          onClick={e => {
            e.stopPropagation();
            delField(item);
          }}></i>
      )}
    </OtherFieldWrap>
  );
}
