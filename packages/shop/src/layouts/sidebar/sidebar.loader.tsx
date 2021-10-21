import ContentLoader from 'react-content-loader';
export const SidebarMobileLoader = () => (
  <>
    {[1, 2, 3, 4, 5, 6, 7, 8].map(() => (
      <div>
        <ContentLoader
          height='100%'
          width='100%'
          speed={2}
          backgroundColor='#f3f3f3'
          foregroundColor='#ecebeb'
        >
          <rect x='0' y='0' rx='0' ry='0' width='990' height='990' />
        </ContentLoader>
      </div>
    ))}
  </>
);

export const SidebarLoader = (props) => (
  <ContentLoader
    height='100%'
    width={300}
    speed={2}
    backgroundColor='#f3f3f3'
    foregroundColor='#ecebeb'
    {...props}
  >
    <rect x='0' y='0' rx='0' ry='0' width='290' height='42' />

    <rect x='0' y='52' rx='0' ry='0' width='140' height='136' />
    <rect x='150' y='52' rx='0' ry='0' width='140' height='136' />

    <rect x='0' y='198' rx='0' ry='0' width='140' height='136' />
    <rect x='150' y='198' rx='0' ry='0' width='140' height='136' />

    <rect x='0' y='344' rx='0' ry='0' width='140' height='136' />
    <rect x='150' y='344' rx='0' ry='0' width='140' height='136' />

    <rect x='0' y='490' rx='0' ry='0' width='140' height='136' />
    <rect x='150' y='490' rx='0' ry='0' width='140' height='136' />

    <rect x='0' y='636' rx='0' ry='0' width='140' height='136' />
    <rect x='150' y='636' rx='0' ry='0' width='140' height='136' />
  </ContentLoader>
);