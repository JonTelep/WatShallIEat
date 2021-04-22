/*

checkbox supported types https://developers.google.com/maps/documentation/places/web-service/supported_types
food types supported:
Could have 2 types
food places:
bankery, cafe, meal_delivery, meal_takeaway, restaurant

going out:
bar, liquor_store, night_club
*/

import React, { useState } from 'react';
import { Formik, Field, Form } from 'formik';
import axios from 'axios';


const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const FoodForm = (props) => (
    
    
  <div>
    <h3>Select a radius around you</h3>
    <Formik
      initialValues={{
        radius: '8046',
        foodsChecked: [],
        lat: props.latitude,
        lng: props.longitude,
        //responseData: null
      }}
      onSubmit={async (values) => {    
        await sleep(500);
        console.log(JSON.stringify(values, null, 2));
        //props.onChange(JSON.stringify(values, null, 2));
        //console.log(`Created formBody is: ${this.state.formBody}`);
        
        //console.log(`The key is ${process.env.REACT_APP_API_GOOGLE_PLACES}`);

         axios.get(`https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/findplacefromtext/json?key=${process.env.REACT_APP_API_GOOGLE_PLACES}&location=${props.latitude},${props.longitude}&radius=${values.radius}&input=restaurant,cafe&inputtype=textquery&fields=icon,geometry,formatted_address,name,opening_hours,price_level,opening_hours,business_status`)
        .then(response =>{
          props.onChange(JSON.stringify(response.data));
          //console.log(typeof JSON.stringify(response.data));
          //console.log(response.data);
        
        })
        .catch(err => {
            console.log(err);
        });


/*         console.log("Print is below");
        console.log(props.); 
        console.log("Print is above"); */
      }}
    >
      {({ values }) => (
        <Form className="ui form">
          <Field
              className="form-control"
              as="select"
              name="radius"
          >
            {/* The value below is in meters, Google API's radius is configured in meters. */}
            <option value="8046">5 Miles</option>
            <option value="16093">10 Miles</option>
            <option value="24140">15 Miles</option>
            <option value="32186">20 Miles</option>
            <option value="40233">25 Miles</option>
            <option value="50000">30 Miles</option>

          </Field>
          <h3>Select types of foods:</h3>
          <div  className="grouped fields">
            <div className="field">
                <div className = "ui toggle checkbox"> 
                <Field type="checkbox" name="foodsChecked" value="bar" className=""/>
                <label>Bars</label>
                </div>
            </div>
            <div className="field">
                <div className = "ui toggle checkbox"> 
                <Field type="checkbox" name="foodsChecked" value="Fastfood" />
                <label>Fastfood</label>
                </div>
            </div>
            <div className="field">
                <div className = "ui toggle checkbox"> 
                <Field type="checkbox" name="foodsChecked" value="Restaurants" />
                <label>Restaurants</label>
                </div>
            </div>
          </div>
          <button className="ui button" type="submit">Find your food</button>
        </Form>
      )}
    </Formik>
  </div>
);

export default FoodForm;
