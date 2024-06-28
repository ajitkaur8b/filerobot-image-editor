/** External Dependencies */
import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import MenuItem from '@scaleflex/ui/core/menu-item';
import FontBold from '@scaleflex/icons/font-bold';
import FontItalic from '@scaleflex/icons/font-italic';

/** Internal Dependencies */
import { TOOLS_IDS, TRANSFORMERS_LAYER_ID } from 'utils/constants';
import AnnotationOptions from 'components/common/AnnotationOptions';
import { StyledIconWrapper } from 'components/common/AnnotationOptions/AnnotationOptions.styled';
import { ENABLE_TEXT_CONTENT_EDIT } from 'actions';
import restrictNumber from 'utils/restrictNumber';
import { useStore } from 'hooks';

import {
  StyledFontFamilySelect,
  StyledFontSizeInput,
  StyledToolsWrapper,
} from './TextOptions.styled';
import {
  textOptionsPopupComponents,
  TEXT_POPPABLE_OPTIONS,
} from './TextOptions.constants';
import {
  activateTextChange,
  deactivateTextChange,
} from './handleTextChangeArea';
import axios from 'axios';
const TextControls = ({ text, saveText, children }) => {
  const { dispatch, textIdOfEditableContent, designLayer, t, config } =
    useStore();
  const { useCloudimage } = config;
  //const { fonts = [], onFontChange } = config[TOOLS_IDS.TEXT];
  const { fonts: defaultFonts = [], onFontChange } = config[TOOLS_IDS.MERGETAG];
  const [showForm, setShowForm] = useState(false);
  // State for managing fonts
  const [fonts, setFonts] = useState(defaultFonts);
    // State for managing custom font upload
  
  const toggleForm = () => {
    setShowForm(!showForm);
    
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    const fontName = file.name.replace(/\.[^/.]+$/, ''); // Extract font name
    if (file) {
      try {
        const reader = new FileReader();
        reader.onload = function(event) {
          const fontData = event.target.result;

          // Prepare the @font-face rule
          const fontFaceRule = `
            @font-face {
              font-family: '${fontName}';
            src: url('${fontData}');
          }
          `;

          // Create a style element and append @font-face rule
          const style = document.createElement('style');
          style.appendChild(document.createTextNode(fontFaceRule));
          document.head.appendChild(style);
        };
        reader.readAsDataURL(file);
        const formData = new FormData();
        formData.append('fontFile', file);

        // Example: Upload font to backend
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/uploadFont`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        if (response.status === 201) {
          // Update state with the new font
          const newFont = { label: fontName, value: fontName };
          setFonts(prevFonts => [...prevFonts, newFont]);
          //setCustomFontName('');
          //fileInput.value = '';
          setShowForm(false);
        } else {
          console.error('Failed to upload font:', response.statusText);
        }
      } catch (error) {
        console.error('Error uploading font:', error);
      }
    } else {
      alert('Please provide file.');
    }
  };

  const changeTextProps = useCallback(
    (e) => {
      const { name, value, type } = e.target;
      saveText((latestText) => ({
        id: latestText.id,
        [name]: type === 'number' ? restrictNumber(value, 1, 500) : value,
      }));
    },
    [saveText],
  );

  const changeFontFamily = useCallback(
    (newFontFamily) => {
      changeTextProps({
        target: { name: 'fontFamily', value: newFontFamily },
      });
      if (
        text.fontFamily !== newFontFamily &&
        typeof onFontChange === 'function'
      ) {
        const reRenderCanvasFn = designLayer.draw.bind(designLayer);
        onFontChange(newFontFamily, reRenderCanvasFn);
      }
    },
    [changeTextProps, text, designLayer],
  );

  const changeFontStyle = useCallback(
    (newStyle) => {
      let fontStyle = text.fontStyle?.replace('normal', '').split(' ') || [];
      if (Object.keys(fontStyle).length > 0 && fontStyle.includes(newStyle)) {
        fontStyle = fontStyle.filter((style) => style !== newStyle);
      } else {
        fontStyle.push(newStyle);
      }

      changeTextProps({
        target: {
          name: 'fontStyle',
          value: fontStyle.join(' ').trim() || 'normal',
        },
      });
    },
    [text],
  );

  const disableTextEdit = useCallback(() => {
    dispatch({
      type: ENABLE_TEXT_CONTENT_EDIT,
      payload: {
        textIdOfEditableContent: null,
      },
    });
  }, []);

  const changeTextContent = useCallback((newContent) => {
    changeTextProps({
      target: {
        name: 'text',
        value: newContent,
      },
    });
    disableTextEdit();
  }, []);

  useEffect(() => {
    let transformer;
    if (textIdOfEditableContent && text.id === textIdOfEditableContent) {
      const canvasStage = designLayer.getStage();
      [transformer] = canvasStage.findOne(`#${TRANSFORMERS_LAYER_ID}`).children;
      activateTextChange(
        textIdOfEditableContent,
        canvasStage,
        transformer,
        changeTextContent,
        disableTextEdit,
      );
    }

    return () => {
      if (transformer && textIdOfEditableContent) deactivateTextChange();
    };
  }, [textIdOfEditableContent]);

  return (
    <AnnotationOptions
      className="FIE_text-tool-options"
      annotation={text}
      updateAnnotation={saveText}
      morePoppableOptionsPrepended={!useCloudimage ? TEXT_POPPABLE_OPTIONS : []}
      moreOptionsPopupComponentsObj={
        !useCloudimage ? textOptionsPopupComponents : {}
      }
      t={t}
    >
      {Array.isArray(fonts) && fonts.length > 1 && (
        <StyledFontFamilySelect
          className="FIE_text-font-family-option"
          onChange={changeFontFamily}
          value={text.fontFamily}
          placeholder={t('fontFamily')}
          size="sm"
        >
          {/* fontFamily is string or object */}
          {fonts.map((fontFamily = '') => (
            <MenuItem
              className="FIE_text-font-family-item"
              key={fontFamily.value ?? fontFamily}
              value={fontFamily.value ?? fontFamily}
            >
              {fontFamily.label ?? fontFamily}
            </MenuItem>
          ))}
        </StyledFontFamilySelect>
      )}
      <StyledFontSizeInput
        className="FIE_text-size-option"
        value={text.fontSize || ''}
        name="fontSize"
        onChange={changeTextProps}
        inputMode="numeric"
        type="number"
        size="sm"
        placeholder={t('size')}
      />
      {showForm && (
        <form className='FIE_custom-font-div'>
                {/* <input type='text' className='FIE_text-font-name' value={customFontName} onChange={(e) => setCustomFontName(e.target.value)}  placeholder='Font Name' /> */}

          <input
            type="file"
            id="fileInput"
            accept=".ttf,.otf,.woff,.woff2"
            className='FIE_text-font-file'
            onChange={handleSubmit}
          />
        {/* <button type="submit" className="FIE_button-add-font" title="Add Custom font..">+ Add Font</button> */}
        </form>
      )}
      <button  onClick={toggleForm} className='FIE_button-add-font' title="Add Custom font..">+ Add Font</button>
      <StyledToolsWrapper>
        {!useCloudimage && (
          <>
            <StyledIconWrapper
              className="FIE_text-bold-option"
              active={(text.fontStyle || '').includes('bold')}
              onClick={() => changeFontStyle('bold')}
              watermarkTool
            >
              <FontBold size={20} />
            </StyledIconWrapper>
            <StyledIconWrapper
              className="FIE_text-italic-option"
              active={(text.fontStyle || '').includes('italic')}
              onClick={() => changeFontStyle('italic')}
              watermarkTool
            >
              <FontItalic size={20} />
            </StyledIconWrapper>
          </>
        )}
        {children}
      </StyledToolsWrapper>
    </AnnotationOptions>
  );
};

TextControls.defaultProps = {
  children: null,
};

TextControls.propTypes = {
  text: PropTypes.instanceOf(Object).isRequired,
  saveText: PropTypes.func.isRequired,
  children: PropTypes.node,
};

export default TextControls;
