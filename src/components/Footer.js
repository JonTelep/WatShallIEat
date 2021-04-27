/*
At this moment this component is explicitly used to make space on the bottom
Eventually will be a legitimate footer with content
*/
import React from 'react';
import '../CSS/Footer.css';
//import JON from '../Images/T_Jon.png';

const Footer = () => {
    return (
    <div className="ui bottom fixed menu">
        <div className="ui container">
             Bug reporting please fill out the form located:  <a href="https://www.jonathantelep.com/contact"> here</a>
        </div>
    </div>
    );
}

export default Footer;