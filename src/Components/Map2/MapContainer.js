/** @format */

import React, { Component } from "react";
import { Map, InfoWindow, Marker, GoogleApiWrapper } from "google-maps-react";
import Context from "../RestaurantsContext";
import ReactModal from "react-modal";
import NewRestoForm from "../AddResto/NewRestoForm";
import Bubble from "../assets/bubble2.png";
import "./marker.css";

export class MapContainer extends Component {
  constructor(props) {
    super(props);
    this.restoList = props.restoList;
    this.userPos = props.userPos;
    this.apiKey = props.apiKey;
    this.setRestoList = props.setRestoList;
    this.state = {
      showingInfoWindow: false,
      activeMarker: {},
      selectedPlace: {},
      allReadyLoaded: false,
      newRestoCoordinate: {
        lat: null,
        lng: null,
      },

      showModal: false,
    };

    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
  }

  handleOpenModal = () => {
    this.setState({ showModal: true });
  };

  handleCloseModal = () => {
    this.setState({ showModal: false });
  };

  // ---------Chargement des resto via l'API Place

  onReady = (...p) => {
    this.setState({ allReadyLoaded: true });

    if (this.state.allReadyLoaded === true) this.onMapReady(...p);
  };

  onNearBySearch = (results, status, google) => {
    let finalResults = [];

    if (status === google.maps.places.PlacesServiceStatus.OK) {
      //stock les données necessaires dans un objet qui correspond au state global
      results.forEach((e) => {
        finalResults.push({
          lat: e.geometry.location.lat(),
          long: e.geometry.location.lng(),
          restaurantName: e.name,
          address: e.vicinity,
          rateAverage: e.rating,
          ratings: [],
          id: e.place_id,
        });
      });

      // application de la methode d'ajout de restaurant dispo dans le state globale

      this.setRestoList(finalResults);
    } else {
      console.log("erreur du reseau :" + status);
    }
  };

  onMapReady = (mapProps, map) => {
    const { google } = mapProps;
    const service = new google.maps.places.PlacesService(map);
    this.props.setMap(map);
    const request = {
      location: mapProps.center,
      radius: "5000",
      type: ["restaurant"],
      keyword: ["restaurant"],
      fields: ["name", "geometry.location", "vicinty", "reviews"],
    };

    // requete et appel de la fonction call back
    service.nearbySearch(request, (results, status) =>
      this.onNearBySearch.call(this, results, status, google)
    );
    // initalise la fonction callback qui va traité la reponse de l'API
  };

  // ---------ouvre et ferme l'infoWindow

  onMarkerClick = (props, marker, e) => {
    this.setState({
      selectedPlace: props,
      activeMarker: marker,
      showingInfoWindow: true,
    });
  };
  // -------- Ajout d'un restaurant avec levent onClick sur la page

  closeInfoWindow = () => {
    if (this.state.showingInfoWindow) {
      this.setState({
        showingInfoWindow: false,
        activeMarker: null,
      });
    }
  };
  /**
   * stock les coordonnées de l'event target dans l'état local newRestoCoordinate
   * puis ouvre le formulaire d'ajout de restaurant
   */
  onMapClicked = (e, mapProps, map) => {
    this.closeInfoWindow();

    this.setState({
      newRestoCoordinate: {
        lat: map.latLng.lat(),
        lng: map.latLng.lng(),
      },
    });
    this.handleOpenModal();
  };

  render() {
    const containerStyle = {
      position: "relative",
      width: "100%",
      height: "90vh",
    };

    const customStyles = {
      content: {
        top: "50%",
        left: "50%",
        right: "auto",
        bottom: "auto",
        width: "30%",
        height: "50%",
        marginRight: "-50%",
        transform: "translate(-50%, -50%)",
      },
    };
    return (
      <Context.Consumer>
        {({
          restoList,
          userPos,
          addResto,
          defaultCenter,
          setRestoList,
          map,
          google,
          filterValue,
        }) => (
          <>
            <Map
              containerStyle={containerStyle}
              google={this.props.google}
              zoom={12}
              initialCenter={userPos}
              center={userPos}
              onClick={this.onMapClicked}
              onReady={this.onReady}
              onRecenter={this.onReady}>
              {userPos && (
                <Marker
                  onClick={this.onMarkerClick}
                  name={"Vous êtes ici"}
                  position={isNaN(userPos.lat) ? defaultCenter : userPos}
                  className='user'
                  icon={{
                    url: Bubble,
                    anchor: new google.maps.Point(32, 32),
                    scaledSize: new google.maps.Size(64, 64),
                  }}
                  label={"You"}
                />
              )}

              {restoList.map(
                (e) =>
                  (e.lat || e.lng !== undefined) &&
                  filterValue.min <= Math.round(e.rateAverage) &&
                  filterValue.max >= Math.round(e.rateAverage) && (
                    <Marker
                      onClick={this.onMarkerClick}
                      key={`${e.lat} - ${e.long} - ${e.id}`}
                      position={{ lat: e.lat, lng: e.long }}
                      name={`${e.restaurantName}`}
                    />
                  )
              )}

              <InfoWindow
                onClose={this.onInfoWindowClose}
                marker={this.state.activeMarker}
                visible={this.state.showingInfoWindow}>
                <div>
                  <p>{this.state.selectedPlace.name}</p>
                </div>
              </InfoWindow>
            </Map>

            <ReactModal
              key={this.index}
              isOpen={this.state.showModal}
              style={customStyles}
              onRequestClose={this.handleCloseModal}
              appElement={document.getElementById("root")}>
              <NewRestoForm
                google={this.props.google}
                addResto={addResto}
                closeModal={this.handleCloseModal}
                lng={this.state.newRestoCoordinate.lng}
                lat={this.state.newRestoCoordinate.lat}
                restoList={restoList}
              />
            </ReactModal>
          </>
        )}
      </Context.Consumer>
    );
  }
}

export default GoogleApiWrapper((props) => ({
  apiKey: props.apiKey,
  language: props.language,
}))(MapContainer);
