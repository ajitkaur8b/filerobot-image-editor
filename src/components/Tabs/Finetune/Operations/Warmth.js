import React from 'react';

import { FintuneOperationWrapper } from './Operations.styled';
import useImageFilter from '../../../../hooks/useImageFilter';

const Warmth = () => {
  const [value, setValue] = useImageFilter({
    filterClassNameInLib: 'Warmth',
    valueObject: {
      warmth: 0
    }
  });

  const changeValue = (e) => {
    setValue({
      warmth: +e.target.value
    });
  }

  return (
    <FintuneOperationWrapper>
      <input type="range" min="0" step="0.01" max="200" value={value.warmth} onChange={changeValue} />
    </FintuneOperationWrapper>
  );
}

export default Warmth;