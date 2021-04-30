/*

checkbox supported types https://developers.google.com/maps/documentation/places/web-service/supported_types
food types supported:
Could have 2 types
food places:
bankery, cafe, meal_delivery, meal_takeaway, restaurant

going out:
bar, liquor_store, night_club
*/

import React from 'react';
import { Formik, Field, Form } from 'formik';
import axios from 'axios';
import GooglePlaces from '../apis/GooglePlaces';

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
      }}
      onSubmit={async (values) => {    
        //have to add https://cors-anywhere.herokuapp.com/ and activate proxy in dev mode
        await sleep(500);

        var keywordArray = 'restuarant,cafe,';
        console.log(values.foodsChecked);
        for(var i = 0; i < values.foodsChecked.length; i++) {
          keywordArray += `${values.foodsChecked[i]},`;
          console.log(keywordArray)
        }
        
        //https://maps.googleapis.com
        //`/maps/api/place/nearbysearch/json?key=${process.env.REACT_APP_API_GOOGLE_PLACES}&location=${props.latitude},${props.longitude}&radius=${values.radius}&keyword=restaurant,cafe&fields=icon,geometry,formatted_address,name,opening_hours,price_level,opening_hours,business_status`,{
        const response = await GooglePlaces.get(`/maps/api/place/nearbysearch/json`, {
          headers: {
            "Access-Control-Allow-Origin": "http://localhost:3000/",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": `application/json`, 
            "Access-Control-Allow-Credentials": true
          },  
          params: {
            location: `${props.latitude},${props.longitude}`,
            radius: values.radius,
            keyword: keywordArray,
            fields: `icon,geometry,formatted_address,name,opening_hours,price_level,opening_hours,business_status`
          }
        })
        .then(response =>{
          props.onChange(response.data.results);
        
        })
        .catch(err => {
            console.log(err);
        });
        console.log(response);

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
          <h3>Select addtional options:</h3>
          <p>Note 'Restaurants' is defaulted to be on and will always be sent as an option.</p>
          <div  className="grouped fields">
            <div className="field">
                <div className = "ui toggle checkbox"> 
                <Field type="checkbox" name="foodsChecked" value="bar" className=""/>
                <label>Bars</label>
                </div>
            </div>
{/*             <div className="field">
                <div className = "ui toggle checkbox"> 
                <Field type="checkbox" name="foodsChecked" value="liquor_store" />
                <label>Liquor Store</label>
                </div>
            </div> */}
            <div className="field">
                <div className = "ui toggle checkbox"> 
                <Field type="checkbox" name="foodsChecked" value="night_club" />
                <label>Night Club</label>
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
