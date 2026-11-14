// src/components/Icons.jsx
import React from 'react';

const base = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'square' };

export const WaterIcon = (props) => (
  <svg aria-hidden="true" focusable="false" {...base} {...props}>
    <path d="M12 3c3.5 4.2 6 7.4 6 10.6A6 6 0 0 1 6 13.6C6 10.4 8.5 7.200 12 3z" fill="currentColor" stroke="none" />
  </svg>
);

export const StormIcon = (props) => (
  <svg aria-hidden="true" focusable="false" {...base} {...props}>
    <path d="M4 6h14M7 11h13M4 16h11M9 21h8" />
    <path d="M18 6c2 0 3-1 3-2.500" />
  </svg>
);

export const CheckIcon = (props) => (
  <svg aria-hidden="true" focusable="false" {...base} {...props}><path d="M5 12.500l4.500 4.500L19 7" /></svg>
);

export const DashIcon = (props) => (
  <svg aria-hidden="true" focusable="false" {...base} {...props}><path d="M7 12h10" /></svg>
);
