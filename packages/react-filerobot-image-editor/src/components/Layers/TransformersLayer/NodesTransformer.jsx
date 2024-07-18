/** External Dependencies */
import React, { useMemo,useCallback, useState } from 'react';
import { Transformer,Layer, Line, Stage } from 'react-konva';

/** Internal Dependencies */
import {
  NODES_TRANSFORMER_ID,
  POINTER_ICONS,
  TOOLS_IDS,
} from 'utils/constants';
import { useStore } from 'hooks';
import { CHANGE_POINTER_ICON, ENABLE_TEXT_CONTENT_EDIT } from 'actions';
import getProperImageToCanvasSpacing from 'utils/getProperImageToCanvasSpacing';
const NodesTransformer = () => {
  const {
    selectionsIds = [],
    theme,
    designLayer,
    dispatch,
    originalImage = {},
    initialCanvasWidth,
    initialCanvasHeight,
    toolId,
    config: { useCloudimage },
  } = useStore();
  const [draggedItem, setDraggedItem] = useState(null);
  const [guides, setGuides] = useState([]);
  

  const selections = useMemo(
    () =>
      designLayer?.findOne
        ? selectionsIds
            .map((selectionId) => designLayer.findOne(`#${selectionId}`))
            .filter(Boolean)
        : [],
    [selectionsIds],
  );
  // const canvasWidth = originalImage.width;
  // const canvasHeight = originalImage.height;
  const CANVAS_TO_IMG_SPACING = 5;//getProperImageToCanvasSpacing();
  console.log('CANVAS_TO_IMG_SPACING', CANVAS_TO_IMG_SPACING);
  const changePointerIconToMove = () => {
    dispatch({
      type: CHANGE_POINTER_ICON,
      payload: {
        pointerCssIcon: POINTER_ICONS.MOVE,
      },
    });
  };

  const changePointerIconToDraw = () => {
    dispatch({
      type: CHANGE_POINTER_ICON,
      payload: {
        pointerCssIcon: POINTER_ICONS.DRAW,
      },
    });
  };

  const enableTextContentChangeOnDblClick = () => {
    if (selections.length === 1 && (selections[0].name() === TOOLS_IDS.TEXT || selections[0].name() === TOOLS_IDS.MERGETAG)) {
      dispatch({
        type: ENABLE_TEXT_CONTENT_EDIT,
        payload: {
          textIdOfEditableContent: selections[0].id(),
        },
      });
    }
  };

  

  const enabledAnchors = useCloudimage
    ? ['top-left', 'bottom-left', 'top-right', 'bottom-right']
    : undefined;

  const getNodeById = useCallback((id) => {
    if (!designLayer) return null; // Ensure designLayer is defined
  
    // Find the node in designLayer children that matches the id
    const node = designLayer.children.find(child => child.id() === id);
    return node || null; // Return the found node or null if not found
  }, [designLayer]);
  const handleDragMove = useCallback((e) => {
    const shape = e.target;
    const stage = shape.getStage();
    if (!stage) return;
    const selectedNode = getNodeById(selectionsIds[0]);
    //console.log('selectedNode', selectedNode);
    const lineGuideStops = getLineGuideStops(selectedNode,stage); // Pass canvas dimensions
    const itemBounds = getObjectSnappingEdges(selectedNode); // Pass canvas dimensions
    const calculatedGuides = getGuides(lineGuideStops, itemBounds);
    setGuides(calculatedGuides);
  
    const absPos = shape.absolutePosition();
    calculatedGuides.forEach((lg) => {
      switch (lg.orientation) {
        case 'V':
          absPos.x = lg.lineGuide + lg.offset;
          break;
        case 'H':
          absPos.y = lg.lineGuide + lg.offset;
          break;
        default:
          break;
      }
    });
  
    shape.absolutePosition(absPos);
  }, [getNodeById, selectionsIds]);
  
    
  const handleDragEnd = useCallback(() => {
    setGuides([]);
  }, []);

  const getLineGuideStops = useCallback((skipShape, stage) => {
    let vertical = [0, stage.width()/ 2, stage.width()];
    let horizontal = [0, stage.height()/ 2, stage.height()];
    // Iterate through all objects on the canvas (assuming they have class name 'object')
    stage.find('.Text, .Rect, .MergeTag, .Image').forEach((guideItem) => {
      if (guideItem === skipShape) {
        return;
      }
      //if (guideItem.getClassName() === 'Text' || guideItem.getClassName() === 'MergeTag' || guideItem.getClassName() === 'Rect' || guideItem.getClassName() === 'Image') {
        const box = guideItem.getClientRect();
        // Push snap points for vertical edges and center of the object
        vertical.push([box.x, box.x + box.width, box.x + box.width / 2]);
        // Push snap points for horizontal edges and center of the object
        horizontal.push([box.y, box.y + box.height, box.y + box.height / 2]);
      //} 
      
    });
    // Flatten arrays to get final snap points
    return {
      vertical: vertical.flat(),
      horizontal: horizontal.flat(),
    };
  }, []);

  const getObjectSnappingEdges = useCallback((node) => {
    var box = node.getClientRect();
    var absPos = node.absolutePosition();

    return {
      vertical: [
        {
          guide: Math.round(box.x),
          offset: Math.round(absPos.x - box.x),
          snap: 'start',
        },
        {
          guide: Math.round(box.x + box.width / 2),
          offset: Math.round(absPos.x - box.x - box.width / 2),
          snap: 'center',
        },
        {
          guide: Math.round(box.x + box.width),
          offset: Math.round(absPos.x - box.x - box.width),
          snap: 'end',
        },
      ],
      horizontal: [
        {
          guide: Math.round(box.y),
          offset: Math.round(absPos.y - box.y),
          snap: 'start',
        },
        {
          guide: Math.round(box.y + box.height / 2),
          offset: Math.round(absPos.y - box.y - box.height / 2),
          snap: 'center',
        },
        {
          guide: Math.round(box.y + box.height),
          offset: Math.round(absPos.y - box.y - box.height),
          snap: 'end',
        },
      ],
    };
  }, []);

  const getGuides = useCallback((lineGuideStops, itemBounds) => {
    var resultV = [];
    var resultH = [];
    lineGuideStops.vertical.forEach((lineGuide) => {
      itemBounds.vertical.forEach((itemBound) => {
        var diff = Math.abs(lineGuide - itemBound.guide);
        // if the distance between guild line and object snap point is close we can consider this for snapping
        if (diff < CANVAS_TO_IMG_SPACING) {
          resultV.push({
            lineGuide: lineGuide,
            diff: diff,
            snap: itemBound.snap,
            offset: itemBound.offset,
          });
        }
      });
    });

    lineGuideStops.horizontal.forEach((lineGuide) => {
      itemBounds.horizontal.forEach((itemBound) => {
        var diff = Math.abs(lineGuide - itemBound.guide);
        if (diff < CANVAS_TO_IMG_SPACING) {
          resultH.push({
            lineGuide: lineGuide,
            diff: diff,
            snap: itemBound.snap,
            offset: itemBound.offset,
          });
        }
      });
    });

    var guides = [];

    // find closest snap
    var minV = resultV.sort((a, b) => a.diff - b.diff)[0];
    var minH = resultH.sort((a, b) => a.diff - b.diff)[0];
    if (minV) {
      guides.push({
        lineGuide: minV.lineGuide,
        offset: minV.offset,
        orientation: 'V',
        snap: minV.snap,
      });
    }
    if (minH) {
      guides.push({
        lineGuide: minH.lineGuide,
        offset: minH.offset,
        orientation: 'H',
        snap: minH.snap,
      });
    }
    return guides;
  }, []);
  
  // ALT is used to center scaling
  // SHIFT is used to scaling with keeping ratio
  return (
    <>
        {/* Render horizontal guides */}
        {guides.map((guide, index) => (
          <Line
            key={`guide-${index}`}
            points={
              guide.orientation === 'H'
              ? [-6000, 0, 6000, 0]  // Horizontal line across the canvas width
              : [0, -6000, 0, 6000] // Vertical line across the canvas height
            }
            stroke={theme.palette['accent-primary']}
            strokeWidth={2}
            dash={[5, 6]}
            x={guide.orientation === 'H' ? 0 : guide.lineGuide}
            y={guide.orientation === 'H' ? guide.lineGuide : 0}
          />
        ))}
    <Transformer
      id={NODES_TRANSFORMER_ID}
      centeredScaling={false}
      rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
      nodes={selections}
      rotateAnchorOffset={30}
      anchorSize={14}
      anchorCornerRadius={7}
      padding={selections.length === 1 ? selections[0].attrs.padding ?? 1 : 1}
      ignoreStroke={false}
      anchorStroke={theme.palette['accent-primary']}
      anchorFill={theme.palette['access-primary']}
      anchorStrokeWidth={2}
      borderStroke={theme.palette['accent-primary']}
      borderStrokeWidth={2}
      borderDash={[4]}
      rotateEnabled={!useCloudimage}
      onMouseOver={changePointerIconToMove}
      onMouseLeave={changePointerIconToDraw}
      onDblClick={enableTextContentChangeOnDblClick}
      onDblTap={enableTextContentChangeOnDblClick}
      enabledAnchors={enabledAnchors}
      flipEnabled={!useCloudimage}
      shouldOverdrawWholeArea
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd} 
      />
      </>
  );
};

export default NodesTransformer;
