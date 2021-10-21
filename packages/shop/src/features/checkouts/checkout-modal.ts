import { openModal } from '@redq/reuse-modal';

// Add or edit modal
export const handleModal = (
  modalComponent: any,
  modalProps?: any,
  className: string = 'add-address-modal',
  width: any = '600px',
) => {
  openModal({
    show: true,
    config: {
      width: width,
      height: 'auto',
      enableResizing: false,
      disableDragging: true,
      className: className,
    },
    closeOnClickOutside: true,
    component: modalComponent,
    componentProps: modalProps,
  });
};
