import React, {
  Component
} from 'react';
import { Navbar, Jumbotron, Button } from 'react-bootstrap';
import logo from './logo.svg';
import './App.css';
import axios from 'axios'
import { debug } from 'util';

class App extends Component {


  //state holder for every state its needs for the application
  constructor (props){
    super(props);
    this.state = {
      //store the venues in a state objects
      venues: [],
      //store the search terms to show in the map
      searchTerm: null,
      map: null,
      infowindow: null,
      markers: []
    };
  }

  // staring the applicarion
  componentDidMount() {
    this.setState({
      searchTerm: "farmacias"
    },() => this.getVenues())
  }

  //initialize the google maps rendereing 
  initMap = () => {
    googleMapsApiScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyAoCeZJBub98KUEqX6my01IIxPrkgNuexY&callback=initMap")
    window.initMap = this.renderMap
  }
  //calling the foursquare api to get the venues
  getVenues = () => {
    //setting the endpoint and parameters for the axio request
    var endpoint = "https://api.foursquare.com/v2/venues/explore?";
    var parameters = {
      client_id: "LQZDG0IJYY4B2PF45AYVVMIRFPXX2DV5MHOAK0O3Q4FRRFWA",
      client_secret: "50XP1ELUVXDRKG3ECTN2BG3F3JAPIVHD0KB20Q5FFQHSU53W",
      query: this.state.searchTerm,
      near: "Joao Pessoa",
      v: "20190202"
    };
    //requesting the venues from foursquare api using axio
    axios.get(endpoint + new URLSearchParams(parameters)).then(response => {
      //setting the data requested from the foursquare api to a state 
      //after that the map rendering is started
      this.setState({
        venues: response.data.response.groups[0].items
      }, this.initMap());
    }).catch(error => {
      console.log("ERROR GETTING THE FOURSQUARE API DATA " + error)
    });

  }

  //render the map area with the markers
  renderMap = () => {
    var map = new window.google.maps.Map(document.getElementById('map'), {
      center: {
        lat: -7.119093,
        lng: -34.8470307
      },
      zoom: 12
    });
    
    //the info window for every marker
    var infowindow = new window.google.maps.InfoWindow({
    });
    //temporary array containig all the markers placed
    var myMarkers = [];
    /** the program loops the venue state placing markers */
    this.state.venues.map(place => {
      var contentString ='Nome: ' + `${place.venue.name}`;
      var id = place.venue.id;
      // every marker
      var marker = new window.google.maps.Marker({
        position: {
          lat: place.venue.location.lat,
          lng: place.venue.location.lng
        },
        map: map
      });
      
      //listener to when the user clicks on a marker
      marker.addListener('click', function() {
        infowindow.setContent(contentString);
        infowindow.open(map, marker);
      });

      //pushing the markers to the temporary array
      /*pushing the id to compare to the buttom id, to call the open info
        window when the user clicks on the side menu buttom
      */
      myMarkers.push( {myPlaceId: id, myMarker: marker, myIndoWindowContent: contentString});
    });

    this.setState({
      map: map
    });
    this.setState({
      infowindow: infowindow
    });
    this.setState({
      markers: myMarkers
    });
  
  }

  //handlers
  handleClickOnSidebarVenue = (event) =>{
    event.preventDefault();
    this.state.markers.map( marker =>{
      if(marker.myPlaceId === event.target.id){
        this.state.infowindow.setContent(marker.myIndoWindowContent);
        this.state.infowindow.open(this.state.map, marker.myMarker);
      }
    });
  }
  handleSubmit = (event) => {
    event.preventDefault();
    this.getVenues();
  }
  handleInputChange = (event) => {
    event.preventDefault();
    this.setState({
      [event.target.name]: event.target.value
    })

  }
  
  render() {
    //the searched term
    const {searchTerm} = this.state;
    //iterating over venues to show the names and info in the sidemenu
    const venueList = this.state.venues.map(place => 
      <a href="" onClick={this.handleClickOnSidebarVenue} className =" list-group-item list-group-hover list-group-item-action " role="tab" key={place.venue.id} id={place.venue.id}>{place.venue.name}</a>

    );
    //the render return
    return ( 
    <main>
      <section className="head">
    <div className="container">
      <h2 className="text-center"><span>João Pessoa Places</span></h2>
    </div>
  </section>
  <div className="clearfix"></div>

  <section className="search-box">
    <div className="container-fluid p-0">
      <div className="d-flex" id="wrapper">



      <div className ="bg-light border-right side-menu scrollable p-3" id="sidebar-wrapper">

          <p>current searched term: </p>
          <h3> {searchTerm} </h3>
          <form onSubmit={this.handleSubmit}>

          <div className ="input-group mb-3">
            <input type="text" onChange={this.handleInputChange} name='searchTerm' className ="form-control" placeholder="Tipo de local" aria-label="Recipient's username" aria-describedby="button-addon2"/>
            <div className ="input-group-append">
              <button className ="btn btn-outline-primary" type="submit" value="Submit" id="button-addon2">pesquisar</button>
            </div>
          </div>
          </form>
          
          <div className ="list-group list-group-flush" id="list-tab" role="tablist">
            {venueList}
          
          </div>
      </div>

      <div className ="full" id="page-content-wrapper">

        <div id = "map" > </div> 

      </div>

      </div>

    </div>
  </section>

      </main>

    );
  }
}

function googleMapsApiScript(url) {
  var index = window.document.getElementsByTagName("script")[0];
  var script = window.document.createElement("script");
  script.src = url;
  script.async = true;
  script.defer = true;
  index.parentNode.insertBefore(script, index);
}
export default App;