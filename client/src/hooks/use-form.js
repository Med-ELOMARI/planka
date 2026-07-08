

import { useCallback, useState } from 'react';

const CHECKED_TYPES_SET = new Set(['checkbox', 'radio']);

export default (initialData) => {
  const [data, setData] = useState(initialData);

  const handleFieldChange = useCallback((_, { type, name: fieldName, value, checked }) => {
    setData((prevData) => ({
      ...prevData,
      [fieldName]: CHECKED_TYPES_SET.has(type) ? checked : value,
    }));
  }, []);

  return [data, handleFieldChange, setData];
};
