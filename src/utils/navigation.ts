// Store the last visited product page URL in localStorage
export const storeLastVisitedPage = (url: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('lastVisitedPage', url);
  }
};

// Get the last visited product page URL from localStorage
export const getLastVisitedPage = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('lastVisitedPage') || '/dashboard';
  }
  return '/dashboard';
};

// Clear the last visited page from localStorage
export const clearLastVisitedPage = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('lastVisitedPage');
  }
}; 