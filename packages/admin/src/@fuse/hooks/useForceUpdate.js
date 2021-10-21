import { useState } from 'react';

const useForceUpdate = () => {
  const [count, setCount] = useState(0)

  const increment = () => setCount(prevCount => prevCount + 1)
  return [increment, count]
};

export default useForceUpdate;