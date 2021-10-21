import { useEffect } from 'react';

export const useGridScrollTop = (arrayValueChange, classNameGrid = '') => {
  useEffect(() => {
    const grid = document.querySelector(`${classNameGrid ? `.${classNameGrid} ` : ''}.k-grid-container .k-grid-content.k-virtual-content`);
    if (grid) {
      grid.scrollTo(0, 0);
    }
  }, arrayValueChange);
};

export const useKeyListener = (F3IndexColumn = null, F5Funtion = null, F7Enable = true) => {
  useEffect(() => {

    function handlePress(e) {
      if (['F3', 'F5', 'F7'].includes(e.code)) {
        e.preventDefault();
      }
      switch (e.code) {
        case 'F3':
          if (F3IndexColumn) {
            let filterRow = document.querySelector('.k-filter-row');
            let allFiltercells = filterRow.querySelectorAll('th');
            allFiltercells[F3IndexColumn] && allFiltercells[F3IndexColumn].querySelector('input').focus();
          }
          break;
        case 'F5':
          if (F5Funtion && typeof F5Funtion == 'function') {
            F5Funtion();
          }
          break;
        case 'F7':
          if (F7Enable) {
            let addButton = document.querySelector('#add-button');
            addButton && addButton.click();
          }
          break;
      }
    }
    window.addEventListener('keydown', handlePress);
    return () => window.removeEventListener('keydown', handlePress);
  }, [F5Funtion]);
}