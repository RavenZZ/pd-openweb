import React, { Component, Fragment } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { formatrChartValue } from './common';

const PivotTableContent = styled.table`
  border-spacing: 0;
  text-align: left;
  font-size: 12px;
  color: #4b4b4b;
  border-top: 1px solid #E0E0E0;
  border-left: 1px solid #E0E0E0;
  max-width: 2000px;
  width: 100%;
  tr>th, tr>td {
    font-size: 13px;
    min-width: 100px;
    padding: 8px 10px;
    line-height: 18px;
    border-width: 0 1px 1px 0;
    border-style: solid;
    border-color: #E0E0E0;
    font-weight: unset;
  }
  thead {
    color: #757575;
    background-color: #fafafa;
  }
  thead th {
    font-weight: bold;
  }
`;


/**
 * 将连续的单元格合并
 */
const uniqMerge = data => {
  for(let i = data.length - 1; i >= 0; i--) {
    let current = data[i];
    let last = data[i - 1];
    if (current == last) {
      data[i] = null;
      data[i - 1] = {
        value: last,
        length: 2,
      }
    }
    if (_.isObject(current) && current.value === last) {
      data[i - 1] = {
        value: last,
        length: current.length + 1,
      }
      data[i] = null;
    }
  }
  return data;
}


/**
 * 多维度单元格合并
 */
const mergeTableCell = list => {
  list.map((item, index) => {
    const last = list[index - 1];
    if (last) {
      let data = last.data.map((n, i) => {
        if (_.isObject(n)) {
          let end = i + n.length;
          return uniqMerge(item.data.slice(i, end));
        } else if (_.isString(n)) {
          return item.data[i];
        } else {
          return false;
        }
      });
      item.data = _.flatten(data.filter(item => item));
    } else {
      item.data = uniqMerge(item.data);
    }
    return item;
  });
  return list;
}

const mergeColumnsCell = (data, yaxisList) => {
  const length = data[0].y.length;
  const result = [];

  for(let i = 0; i < length; i++) {
    result.push({
      index: i,
      data: [],
    });
    data.forEach(item => {
      if (item.y) {
        result[i].data.push(item.y[i]);
      }
    });
  }

  mergeTableCell(result).forEach((item, index) => {
    item.data.forEach((n, i) => {
      data[i].y[index] = n;
    });
  });

  data.forEach(item => {
    const { t_id, data } = item;
    const { rename, controlName } = _.find(yaxisList, { controlId: t_id }) || _.object();
    item.name = rename || controlName;
    item.data = data.map(n => {
      if (_.isNumber(n)) {
        const current = _.find(yaxisList, { controlId: t_id });
        if (current && [0, 1].includes(current.magnitude)) {
          const newYaxisList = yaxisList.map(item => {
            return {
              ...item,
              magnitude: 1,
              ydot: '',
            };
          });
          return formatrChartValue(current.dot ? Number(n.toFixed(current.dot)) : n, false, newYaxisList, t_id, false);
        } else {
          return formatrChartValue(n, false, yaxisList, t_id, false);
        }
      } else {
        return n;
      }
    });
  });

  return data;
}

const mergeLinesCell = (data, lines, valueMap) => {
  const result = data.map(item => {
    const key = Object.keys(item)[0];
    const res = item[key].map(item => {
      return valueMap[key] ? (valueMap[key][item] || item) : item;
    });
    const target = _.find(lines, { controlId: key }) || _.object();
    return {
      name: target.rename || target.controlName,
      data: res,
    };
  });
  return mergeTableCell(result);
}

export default class extends Component {
  constructor(props) {
    super(props);
  }
  renderColumnTotal() {
    const { columns, pivotTable, yaxisList } = this.props.reportData;
    const { showColumnTotal, columnSummary } = pivotTable || this.props.reportData;
    return (
      showColumnTotal && columns.length ? (
        <th
          rowSpan={columns.length}
          colSpan={yaxisList.length}
        >
          {_l('行汇总')}
          {columnSummary.name ? `(${columnSummary.name})` : null}
        </th>
      ) : null
    )
  }
  renderLineTotal(xFieldsLength) {
    const { data, lines, pivotTable, yaxisList } = this.props.reportData;
    const { showLineTotal, lineSummary } = pivotTable || this.props.reportData;
    const rowCountList = data.data;
    return (
      showLineTotal ? (
       <tr>
          <th
            className="Bold Gray_75"
            colSpan={xFieldsLength}
          >
            {_l('列汇总')}
            {lineSummary.name ? `(${lineSummary.name})` : null}
          </th>
          {
            rowCountList.map((item, index) => (
              <td key={index}>{formatrChartValue(item.sum, false, yaxisList, item.t_id, false)}</td>
            ))
          }
        </tr>
      ) : null
    )
  }
  render() {
    const { data, columns, pivotTable, yaxisList, lines, valueMap } = this.props.reportData;
    const { columnSummary, lineSummary } = pivotTable || this.props.reportData;
    const result = mergeColumnsCell(_.cloneDeep(data.data), yaxisList);
    const xFields = mergeLinesCell(data.x, lines, valueMap);
    const tableLentghData = Array.from({ length: xFields[0] ? xFields[0].data.length : 1 });
    return (
      <div className="h100 flexColumn" style={{ overflowX: 'auto' }}>
        <PivotTableContent>
          <thead>
            {
              columns.map((columnItem, index) => (
                <tr key={index}>
                  <th colSpan={xFields.length}>{columnItem.rename || columnItem.controlName}</th>
                  { (index == 0 && columnSummary.location === 3) && this.renderColumnTotal() }
                  {
                    result.map((item, i) => (
                      item.y && item.y[index] ? (
                        _.isObject(item.y[index]) ? (
                          <th
                            className={cx({hide: !item.y[index].value})}
                            key={i}
                            colSpan={item.y[index].length}
                          >
                            {valueMap[columnItem.controlId] ? valueMap[columnItem.controlId][item.y[index].value] : item.y[index].value}
                          </th>
                        ) : (
                          <th key={i}>{valueMap[columnItem.controlId] ? valueMap[columnItem.controlId][item.y[index]] : item.y[index]}</th>
                        )
                      ) : null
                    ))
                  }
                  { (index == 0 && columnSummary.location === 4) && this.renderColumnTotal() }
                </tr>
              ))
            }
            <tr>
              {
                xFields.length ? (
                  xFields.map((item, index) => (
                    <th key={index}>{item.name}</th>
                  ))
                ) : (
                  <th></th>
                )
              }
              {
                result.map((item, index) => (
                  <th key={index}>{item.name}</th>
                ))
              }
            </tr>
          </thead>
          <tbody>
            { lineSummary.location == 1 && this.renderLineTotal(xFields.length) }
            {
              tableLentghData.map((n, lengthIndex) => (
                <tr key={lengthIndex}>
                  {
                    xFields.length ? (
                      xFields.map((item, index) => (
                        item.data[lengthIndex] ? (
                          _.isObject(item.data[lengthIndex]) ? (
                            <th key={index} rowSpan={item.data[lengthIndex].length}>{item.data[lengthIndex].value}</th>
                          ) : (
                            <th key={index}>{item.data[lengthIndex]}</th>
                          )
                        ) : null
                      ))
                    ) : (
                      <th></th>
                    )
                  }
                  {
                    result.map((item, index) => (
                      <td key={index}>{_.isNull(item.data[lengthIndex]) ? '--' : item.data[lengthIndex]}</td>
                    ))
                  }
                </tr>
              ))
            }
            { lineSummary.location == 2 && this.renderLineTotal(xFields.length) }
          </tbody>
        </PivotTableContent>
      </div>
    );
  }
}
