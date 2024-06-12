/** External Dependencies */
import React, { useMemo } from 'react';
import { SELECT_ANNOTATION, SELECT_TOOL } from 'actions';

/** Internal Dependencies */
import { useAnnotationEvents, useStore } from 'hooks';
import { StyledIconWrapper } from './AnnotationOptions.styled';

const Layers = () => {
    const { annotations = {}, selectionsIds = [], dispatch } = useStore();

    const annotationEvents = useAnnotationEvents();

    const setOn = (id, name) => {
        const multiple = false

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

    return useMemo(
        () =>
            Object.values(annotations).map((annotation, index) => (
                <>
                    <StyledIconWrapper
                        onClick={() => (
                            setOn(annotation.id, annotation.name)
                        )}
                    >
                        {`Layer ${index + 1}`}
                    </StyledIconWrapper>
                </>
            )),
        [annotations, annotationEvents, selectionsIds],
    );
};

export default Layers;
