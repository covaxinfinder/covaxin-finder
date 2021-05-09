import React from 'react';
export const Label = (props) => (
  <span className={`label ${props.type}`}>{props.message}</span>
);