import React, { Component } from 'react';
import cx from 'classnames';
import { withRouter } from 'react-router-dom';
import { Flex } from 'antd-mobile';
import { Icon } from 'ming-ui';
import styled from 'styled-components';

const Content = styled(Flex)`
  display: flex;
  color: #2196F3;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: #fff;
  position: fixed;
  right: 20px;
  bottom: 72px;
  z-index: 99;
  &.low {
    bottom: 20px;
  }
  .icon {
    font-size: 33px;
    margin-top: 3px;
  }
`;

const isWxWork = window.navigator.userAgent.toLowerCase().includes('wxwork');

@withRouter
export default class Back extends Component {
  constructor(props) {
    super(props);
  }
  renderContent() {
    const { history, className, style } = this.props;
    return (
      <Content
        justify="center"
        align="center"
        className={cx('card', className)}
        style={style}
        onClick={() => {
          history.push('/mobile/appHome');
        }}
      >
        <Icon icon="home_page"/>
      </Content>
    );
  }
  render() {
    return (
      isWxWork ? null : this.renderContent()
    );
  }
}
