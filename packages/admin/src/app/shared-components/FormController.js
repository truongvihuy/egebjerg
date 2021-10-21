export const InputLabel = ({ label, labelCols = 2 }) => {
  return <div className={`${labelCols} leading-7`}>{label}</div>;
};

export const FieldItem = ({
  label,
  children,
  alignItems = 'items-center',
  gridCols = 'grid-cols-7',
  labelCols = 'col-span-2',
  childrenCols = 'col-span-5',
  marginTop = 'mt-10'
}) => {
  return (
    <div className={`grid ${gridCols} gap-4 ${marginTop} ${alignItems}`}>
      <InputLabel label={label} labelCols={labelCols} />
      <div className={`${childrenCols}`}>{children}</div>
    </div>
  );
};

export const processValue = (value, type = 'text') => {
  return value ?? (type == 'text' ? '' : 0);
};
