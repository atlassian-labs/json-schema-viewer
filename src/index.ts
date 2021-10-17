import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './BrowserApp';
import './style.css';

export * from './SchemaExplorer';
export * from './SchemaEditor';
export * from './SchemaView';
export * from './lookup';
export * from './schema';
export * from './example';
export * from './breakpoints';
export * from './route-path';

/* global __webpack_nonce__ */ // eslint-disable-line no-unused-vars

// CSP: Set a special variable to add `nonce` attributes to all styles/script tags
// See https://github.com/webpack/webpack/pull/3210
// __webpack_nonce__ = (window as any).NONCE_ID; // eslint-disable-line no-global-assign, camelcase

// ReactDOM.render(React.createElement(App), document.getElementById('root'));