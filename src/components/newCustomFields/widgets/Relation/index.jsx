import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Icon } from 'ming-ui';
import DialogRelationControl from 'src/components/relationControl/relationControl';
import List from './List';
import cx from 'classnames';

export default class Widgets extends Component {
  static propTypes = {
    from: PropTypes.number,
    disabled: PropTypes.bool,
    value: PropTypes.any,
    enumDefault: PropTypes.number,
    onChange: PropTypes.func,
  };

  state = {
    dialogVisible: false,
  };

  /**
   * 删除指定项目
   */
  itemOnDelete = (item, i) => {
    if (!item) {
      return;
    }

    const { value } = this.props;
    const list = _.cloneDeep(JSON.parse(value || '[]'));

    list.splice(i, 1);
    this.props.onChange(JSON.stringify(list));
  };

  onDialogPick = item => {
    const { value } = this.props;
    const list = _.cloneDeep(JSON.parse(value || '[]'));

    list.push(item);
    this.props.onChange(JSON.stringify(list));
    this.setState({ dialogVisible: false });
  };

  render() {
    const { from, disabled, value, enumDefault } = this.props;
    const { dialogVisible } = this.state;

    return (
      <div className={cx('customFormControlBox', { controlDisabled: disabled })} style={{ height: 'auto' }}>
        <List data={JSON.parse(value || '[]')} from={from} disabled={disabled} onDelete={this.itemOnDelete} />

        {!disabled && (
          <button className="customFormRelationBtn Gray_75 ThemeHoverColor3 pointer w100 TxtLeft" onClick={() => this.setState({ dialogVisible: true })}>
            <Icon icon="plus" className="mRight5" />
            <span>{_l('自由连接...')}</span>
          </button>
        )}

        {dialogVisible && (
          <DialogRelationControl
            title={''}
            types={enumDefault === 0 ? [] : [enumDefault]}
            onCancel={() => this.setState({ dialogVisible: false })}
            onSubmit={this.onDialogPick}
          />
        )}
      </div>
    );
  }
}
