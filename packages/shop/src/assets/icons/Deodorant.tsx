import React from 'react';
export const Deodorant = ({
  color = 'currentColor',
  width = '18px',
  height = '18px',
}) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width}
      height={height}
      viewBox='0 0 18 18'
    >
      <g data-name='018---Roll-On' fill={color}>
        <ellipse
          cx='1.607'
          cy='3.535'
          rx='1.607'
          ry='3.535'
          transform='translate(2.176 8.678)'
        />
        <path d='M7.244 4.821H.321a.321.321 0 00-.32.356l.027.254a71.835 71.835 0 01.311 11.215A1.282 1.282 0 001.621 18h4.325a1.282 1.282 0 001.282-1.353 71.835 71.835 0 01.3-11.214l.027-.254a.321.321 0 00-.316-.358zm-6.355.962a.321.321 0 01.321-.321h.641a.321.321 0 110 .641H1.21a.321.321 0 01-.321-.32zm2.9 10.607c-1.261 0-2.25-1.832-2.25-4.178s.988-4.178 2.25-4.178 2.25 1.832 2.25 4.178-.995 4.181-2.256 4.181zM6.354 6.104H3.14a.321.321 0 110-.641h3.214a.321.321 0 110 .641z' />
        <path
          data-name='Shape'
          d='M3.783 0a2.25 2.25 0 00-2.224 1.929h4.447A2.25 2.25 0 003.783 0zM6.443 2.572H1.128a5.946 5.946 0 00-.237 1.607h5.785a5.946 5.946 0 00-.233-1.607zM11.82 16.716h3.214v-1.284a2.893 2.893 0 10-5.786 0v1.284h.964a.321.321 0 010 .641h-.964v.321a.321.321 0 00.321.321h5.143a.321.321 0 00.321-.321v-.321H11.82a.321.321 0 110-.641zm-.964-1.929a.321.321 0 01-.641 0 1.55 1.55 0 011.606-1.608.321.321 0 110 .641.916.916 0 00-.966.964z'
        />
      </g>
    </svg>
  );
};
