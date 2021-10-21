export const processProjection = (projectionList: string[]) => {
  let res = {};
  projectionList.forEach((fieldName: any) => {
    if (fieldName !== 'password') {
      res[fieldName] = 1;
    }
  });

  return res;
};