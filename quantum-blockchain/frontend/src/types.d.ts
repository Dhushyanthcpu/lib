// Global type definitions

// Window ethereum extension
interface Window {
  ethereum?: any;
  web3?: any;
}

// Chart.js
declare module 'chart.js/auto';

// React component types
declare module '*.tsx' {
  const component: React.FC;
  export default component;
}

// Image imports
declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

// CSS modules
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}