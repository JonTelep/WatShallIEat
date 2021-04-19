import React from 'react';
import { Formik, Field, Form } from 'formik';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const FoodForm = (props) => (
  <div>
    <h3>Select a radius around you</h3>
    <Formik
      initialValues={{
        radius: '5',
        foodsChecked: [],
        lat: props.latitude,
        lng: props.longitude
      }}
      onSubmit={async (values) => {
        await sleep(500);
        console.log(JSON.stringify(values, null, 2));
      }}
    >
      {({ values }) => (
        <Form className="ui form">
          <Field
              className="form-control"
              as="select"
              name="radius"
          >
            <option value="5">5 Miles</option>
            <option value="10">10 Miles</option>
            <option value="15">15 Miles</option>
            <option value="20">20 Miles</option>
            <option value="25">25 Miles</option>

          </Field>
          <h3>Select types of foods:</h3>
          <div  className="grouped fields">
            <div className="field">
                <div className = "ui toggle checkbox"> 
                <Field type="checkbox" name="foodsChecked" value="Bars" className=""/>
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
