import React, { Component } from 'react';
import icon from '../../assets/img/icon-128.png';

export default function Greetings() {
  return (
    <div>
      <p>Hello, user!</p>
      <img src={icon} alt="extension icon" />
    </div>
  );
}
