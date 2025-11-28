import ReactGA from 'react-ga4';

const TRACKING_ID = "G-GLHSW4YPZM"; // Replace with your Measurement ID

export const initAnalytics = () => {
  ReactGA.initialize(TRACKING_ID);
};

export const trackPageView = (path) => {
  ReactGA.send({ 
    hitType: "pageview", 
    page: path 
  });
};

export const trackEvent = (category, action, label) => {
  ReactGA.event({
    category,
    action,
    label
  });
};