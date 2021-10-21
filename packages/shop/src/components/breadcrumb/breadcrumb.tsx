import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApp } from 'contexts/app/app.provider';
import { StyledBreadcrumb, StyledBreadcrumbItem } from './breadcrumb.style';

type Props = {
  category_id: number
};

export default function Breadcrumb({ category_id = 0 }: Props) {
  const { categoryMap } = useApp();
  const [breadcrumb, setBreadcrumb] = useState([]);

  useEffect(() => {
    if (category_id && categoryMap) {
      let newBreadcrumb = [];
      for (let i = category_id; i && categoryMap[i]; i = categoryMap[i].parent_id) {
        newBreadcrumb.unshift(categoryMap[i]);
      }
      setBreadcrumb(newBreadcrumb);
    }
  }, [category_id, categoryMap]);

  const length = breadcrumb.length;
  if (length === 0) return null;
  return (
    <StyledBreadcrumb>
      {breadcrumb.map((category, index) => (
        <StyledBreadcrumbItem key={index}>
          <Link href={'/category/[slug]'} as={`/category/${category._id}-${category.slug}`}>{category.name}</Link>
        </StyledBreadcrumbItem>
      )
      )}
    </StyledBreadcrumb>
  )
}