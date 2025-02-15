import React, { useEffect, useRef, useState, memo, forwardRef } from 'react';
import Card from 'src/pages/worksheet/common/Statistics/Card/Card';
import styled from 'styled-components';
import BraftEditor from 'src/components/braftEditor/braftEditor';
import { getEnumType } from '../../util';
import ButtonList from './ButtonList';
import PreviewContent from '../previewContent';

const WidgetContent = styled.div`
  flex: 1;
  box-sizing: border-box;
  padding: ${props => (props.componentType === 'embedUrl' ? 0 : '8px 15px 16px')};
  background-color: #fff;
  height: 100%;
  &.button {
    display: flex;
  }
  img {
    max-width: 100%;
  }
  .mdEditorContent {
    overflow: initial !important;
  }
`;

const WidgetDisplay = forwardRef((props, $cardRef) => {
  const { layoutType, type, value, button, needUpdate, isFullscreen, scrollTop, editable, ids, ...rest } = props;
  const componentType = getEnumType(type);
  const ref = useRef(null);

  const renderContent = () => {
    if (componentType === 'embedUrl') return <PreviewContent {..._.pick(props, ['value', 'param'])} />;
    if (componentType === 'richText') return <BraftEditor summary={value} isEditing={false} />;
    if (componentType === 'button') {
      return <ButtonList editable={editable} button={button} ids={ids} layoutType={layoutType} {...rest} />;
    }
    if (componentType === 'analysis') {
      return (
        <Card
          ref={$cardRef}
          needEnlarge={!(isFullscreen || editable || layoutType === 'mobile')}
          needRefresh={!editable}
          report={{ id: value }}
          sourceType={1}
          needUpdate={needUpdate}
          worksheetId={ids.worksheetId}
        />
      );
    }
  };
  return (
    <WidgetContent className={componentType} ref={ref} componentType={componentType}>
      {renderContent()}
    </WidgetContent>
  );
});

export default WidgetDisplay;
