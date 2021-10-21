export const checkMembership = (customer: any) => {
  if (customer.membership_number) return true;
  return false;
}