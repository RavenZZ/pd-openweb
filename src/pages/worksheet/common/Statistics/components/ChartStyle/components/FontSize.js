import React, { Component } from 'react';
import cx from 'classnames';

const sizeList = [{
  name: _l('小'),
  value: 0
}, {
  name: _l('中'),
  value: 1
}, {
  name: _l('大'),
  value: 2
}];

export default class FontSize extends Component {
  constructor(props) {
    super(props);
    this.state = {}
  }
  handleChangeFontSize = value => {
    const { currentReport, onChangeCurrentReport } = this.props;
    onChangeCurrentReport({
      style: {
        ...currentReport.style,
        fontSize: value
      }
    }, true);
  }
  render() {
    const { currentReport } = this.props;
    const { style } = currentReport;
    const { fontSize } = style || _.object();
    return (
      <div className="mBottom16">
        <div className="chartTypeSelect flexRow valignWrapper">
          {
            sizeList.map(item => (
              <div
                key={item.value}
                className={cx('flex centerAlign pointer Gray_75', { active: (fontSize || 0) === item.value })}
                onClick={() => {
                  this.handleChangeFontSize(item.value);
                }}
              >
                {item.name}
              </div>
            ))
          }
        </div>
      </div>
    );
  }
}
