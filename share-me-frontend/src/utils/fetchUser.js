export const fetchUser = () => {
  const userInfo = localStorage.getItem("user");
  if(userInfo === 'undefined') return false;

  return JSON.parse(userInfo);
};
