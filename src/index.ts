import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './BrowserApp';
import './style.css';

/* global __webpack_nonce__ */ // eslint-disable-line no-unused-vars

// CSP: Set a special variable to add `nonce` attributes to all styles/script tags
// See https://github.com/webpack/webpack/pull/3210
__webpack_nonce__ = (window as any).NONCE_ID; // eslint-disable-line no-global-assign, camelcase

ReactDOM.render(React.createElement(App), document.getElementById('root'));