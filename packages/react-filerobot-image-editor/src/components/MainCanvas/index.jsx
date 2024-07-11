/** External Dependencies */
import React, { useCallback, useEffect, useRef } from 'react';

/** Internal Dependencies */
import { DesignLayer, TransformersLayer } from 'components/Layers';
import { AppProviderOverridenValue } from 'context';
import { SET_CANVAS_SIZE } from 'actions';
import { useResizeObserver, useStore } from 'hooks';
import NodeControls from 'components/NodeControls';
import CanvasNode from './CanvasNode';
import { CanvasContainer, StyledOrignalImage } from './MainCanvas.styled';
import { Layer } from 'react-konva';
import GridLayer from './GridLayer';
const MainCanvas = () => {
  const [observeResize] = useResizeObserver();
  const providedAppContext = useStore();
  const canvasContainerRef = useRef(null);
  const snapSettings = {
    snapGrid: 160, // Adjust for grid snapping if needed
  };
  const setNewCanvasSize = useCallback(
    ({ width: containerWidth, height: containerHeight }) => {
      providedAppContext.dispatch({
        type: SET_CANVAS_SIZE,
        payload: {
          canvasWidth: containerWidth,
          canvasHeight: containerHeight,
        },
      });
    },
    [],
  );

  useEffect(() => {
    observeResize(canvasContainerRef.current, setNewCanvasSize);
  }, []);

  return (
    <CanvasContainer className="FIE_canvas-container" ref={canvasContainerRef}>
      {!providedAppContext.textIdOfEditableContent && <NodeControls />}
      {providedAppContext.isShowOriginalImage && (
        <StyledOrignalImage
          className="FIE_original-image-compare"
          src={providedAppContext.originalImage.src}
        />
      )}
      <CanvasNode>
        <AppProviderOverridenValue overridingValue={providedAppContext}>
          <DesignLayer />
          <TransformersLayer />
          <Layer>
          <GridLayer
            width={providedAppContext.initialCanvasWidth}
            height={providedAppContext.initialCanvasHeight}
            gridSize={snapSettings.snapGrid}
          />
        </Layer>  
        </AppProviderOverridenValue>
      </CanvasNode>
    </CanvasContainer>
  );
};

export default MainCanvas;
