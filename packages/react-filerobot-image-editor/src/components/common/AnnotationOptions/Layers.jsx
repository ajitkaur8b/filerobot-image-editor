/** External Dependencies */
import React, { useEffect, useState } from 'react';
import { SELECT_ANNOTATION, SELECT_TOOL, SET_ANNOTATIONS } from 'actions';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

/** Internal Dependencies */
import { useAnnotationEvents, useStore } from 'hooks';
import { StyledIconWrapper } from './AnnotationOptions.styled';

// Define a constant for the drag type
const DRAG_TYPE = 'ANNOTATION';

const LayerItem = ({ annotation, index, moveCard, setOn }) => {
  const [{ isDragging }, dragRef] = useDrag({
    type: DRAG_TYPE,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, dropRef] = useDrop({
    accept: DRAG_TYPE,
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveCard(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => dragRef(dropRef(node))}
      style={{
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: 'white',
        cursor: 'move',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
      onClick={() => setOn(annotation.id, annotation.name)}
    >
      <StyledIconWrapper
        style={{
          width: "125px",
          justifyContent: 'start',
        }}
      >
        {annotation.name === "Image" ? "Image" : annotation.text}
      </StyledIconWrapper>
    </div>
  );
};

const Layers = () => {
  const { annotations = {}, dispatch } = useStore();
  const [annotationss, setAnnotations] = useState(Object.values(annotations));

  useEffect(() => {
    console.log("Inside useEffect ->", annotations)
  }, [annotations])
  const setOn = (id, name) => {
    const multiple = false;

    dispatch({
      type: SELECT_TOOL,
      payload: {
        toolId: name,
        keepSelections: multiple,
      },
    });

    dispatch({
      type: SELECT_ANNOTATION,
      payload: {
        annotationId: id,
        multiple,
      },
    });
  };

  const moveCard = (fromIndex, toIndex) => {
    const updatedAnnotations = [...annotationss];
    const [movedItem] = updatedAnnotations.splice(fromIndex, 1);
    updatedAnnotations.splice(toIndex, 0, movedItem);
    setAnnotations(updatedAnnotations);
    dispatch({
      type: SET_ANNOTATIONS,
      payload: updatedAnnotations,
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ position: 'relative', overflowX: 'hidden' }}>
        {annotationss.map((annotation, index) => (
          <LayerItem
            key={annotation.id}
            annotation={annotation}
            index={index}
            moveCard={moveCard}
            setOn={setOn}
          />
        ))}
      </div>
    </DndProvider>
  );
};

export default Layers;
