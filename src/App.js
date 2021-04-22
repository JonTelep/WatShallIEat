import React from 'react';
import WatShallIEat from './components/WatShallIEat';
import Header from './components/Header';
import Loader from './components/Loader';
//import GooglePlaces from '../apis/GooglePlaces';
import MapContainer from './components/GoogleMap';
//import Form from './components/Form';



class App extends React.Component {
    //initializing state
    state = {
        latitude: null,
        longitude: null,
        errorMessage: ""
    };

    //Grab user's location a single time
    componentDidMount() {
        console.log(`Initial formBody is: ${this.state.formBody}`);
        window.navigator.geolocation.getCurrentPosition(
            (position) => {
                this.setState({ latitude: position.coords.latitude });
                this.setState({ longitude: position.coords.longitude });
            },
            (err) => this.setState({ errorMessage: err.message })
        );
    }
    
    render() {

        //Display Error if there is one.
        if(this.state.errorMessage && !this.state.latitude && !this.state.longitude) {
            return <div>Error: {this.state.errorMessage} </div>;
        }
        //Display App if location accepted and the location is found.
        if(!this.state.errorMessage && this.state.latitude && this.state.longitude) {
            return (
                <div  className="ui container">
                    <Header />
                    <WatShallIEat 
                        lat={this.state.latitude}
                        lng={this.state.longitude}
                    />
                    <div className="ui divider">
                
{/*                         <MapContainer 
                        lat={this.state.latitude}
                        lng={this.state.longitude}
                        /> */}
                        
                    </div>
                </div>
            );
            
        }
        //Display Loader while waiting for user to accept loaction.
        return <Loader message="Accept location request." />;
    }
}

export default App;