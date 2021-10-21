import { useApp } from "contexts/app/app.provider";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { pushQueryToUrlParams } from "./parse-url-params";

export const useSideBar = (categoryId, query) => {
  const router = useRouter();
  const { categoryMap } = useApp();
  const [currentCategoryListParentId, setCurrentCategoryListParentId] = useState(0);

  useEffect(() => {
    if (categoryMap) {
      setCurrentCategoryListParentId(categoryMap[categoryId]?.parent_id ?? 0);
    }
  }, [categoryMap]);
  useEffect(() => {
    if (categoryMap) {
      const item = categoryMap[categoryId];
      if (item) {
        if (item.children_direct?.length) {
          setCurrentCategoryListParentId(item._id);
        } else {
          setCurrentCategoryListParentId(item.parent_id);
        }
      }
    }
  }, [categoryId]);
  useEffect(() => {
    if (categoryMap) {
      const item = categoryMap[categoryId];
      if (item) {
        setCurrentCategoryListParentId(item.parent_id);
      }
    }
  }, [query.is_coop_xtra, query.is_ecology, query.is_frozen, query.is_offer, query.is_favorite, query.is_most_bought]);

  const onCategoryClick = (category: any) => {
    if (category.children_direct?.length)
      setCurrentCategoryListParentId(category._id);

    const tmpRouter = {
      pathname: '/category/[slug]',
      params: pushQueryToUrlParams({ ...query }),
    };
    router.push(tmpRouter.pathname, `/category/${category._id}-${category.slug}${tmpRouter.params ? `?${tmpRouter.params}` : ''}`);
  };
  const onClickBack = () => {
    const currentCategory = categoryMap[currentCategoryListParentId];
    setCurrentCategoryListParentId(currentCategory.parent_id ?? 0);
  }

  return {
    categoryMap,
    onClickBack,
    onCategoryClick,
    currentCategoryListParentId,
  }
};
