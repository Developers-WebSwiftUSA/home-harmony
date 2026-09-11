export const USER_GUIDE_EVENT = "htg-open-user-guide";

export const openUserGuide = () => {
  window.dispatchEvent(new Event(USER_GUIDE_EVENT));
};
