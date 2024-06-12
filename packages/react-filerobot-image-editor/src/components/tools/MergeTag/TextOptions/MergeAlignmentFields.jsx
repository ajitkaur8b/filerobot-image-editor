/** External Dependencies */
import React from 'react';
import PropTypes from 'prop-types';

/** Internal Dependencies */
import {
  StyledIconWrapper,
} from 'components/common/AnnotationOptions/AnnotationOptions.styled';


const TextAlignmentFields = ({
  annotation: text,
  updateAnnotation: updateText,
}) => {
  const { align, verticalAlign } = text;

  const changeHorizontalAlignment = (newHorizonalAlignment, newVerticalAlignment) => {
    updateText({ align: newHorizonalAlignment, verticalAlign: newVerticalAlignment })
  };

  return (
    <>
      <StyledIconWrapper
        onClick={() => changeHorizontalAlignment('left','top')}
        active={align === 'left' && verticalAlign==='top'}
      >
        Left Top
      </StyledIconWrapper>
      <StyledIconWrapper
        onClick={() => changeHorizontalAlignment('left','bottom')}
        active={align === 'left'&& verticalAlign==='bottom'}
      >
        Left Bottom
      </StyledIconWrapper>
      <StyledIconWrapper
        onClick={() => changeHorizontalAlignment('left','middle')}
        active={align === 'left' && verticalAlign==='middle'}
      >
        Left Center
      </StyledIconWrapper>

      <StyledIconWrapper
        onClick={() => changeHorizontalAlignment('right','top')}
        active={align === 'right'&& verticalAlign==='top'}
      >
        Right Top
      </StyledIconWrapper>
      <StyledIconWrapper
        onClick={() => changeHorizontalAlignment('right','bottom')}
        active={align === 'right' && verticalAlign==='bottom'}
      >
        Right Bottom
      </StyledIconWrapper>
      <StyledIconWrapper
        onClick={() => changeHorizontalAlignment('right','middle')}
        active={align === 'right' && verticalAlign==='middle'}
      >
        Right Center
      </StyledIconWrapper>
      <StyledIconWrapper
        onClick={() => changeHorizontalAlignment('center','top',)}
        active={align === 'center' && verticalAlign==='top'}
      >
        Center Top
      </StyledIconWrapper>
      <StyledIconWrapper
        onClick={() => changeHorizontalAlignment('center','bottom')}
        active={align === 'center' && verticalAlign==='bottom'}
      >
        Center Bottom
      </StyledIconWrapper>
      <StyledIconWrapper
        onClick={() => changeHorizontalAlignment('center','middle')}
        active={align === 'center' && verticalAlign==='middle'}
      >
        Center Center
      </StyledIconWrapper>
    </>
  );
};

TextAlignmentFields.propTypes = {
  annotation: PropTypes.instanceOf(Object).isRequired,
  updateAnnotation: PropTypes.func.isRequired,
};

export default TextAlignmentFields;
