import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { AddCountryService } from '../../services/add-country.service';
import { Loader } from '@googlemaps/js-api-loader';
import { environment } from '../../../environments/environment.development';
import { CityService } from '../../services/city.service';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

interface Cities {
  zone: {
    type: 'Polygon';
    coordinates: [[[number, number]]];
  },
  countryId: string,
  formatted_address: string,
  _id: string
}

@Component({
  selector: 'app-city',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './city.component.html',
  styleUrl: './city.component.css'
})
export class CityComponent {

  private _addCountryService = inject(AddCountryService);
  private _cityService = inject(CityService);
  private _toastr = inject(ToastrService);
  private _fb = inject(FormBuilder);

  drawingManager!: google.maps.drawing.DrawingManager
  drawinPolygon!: google.maps.Polygon

  countryList: any;
  cityList!: Array<Cities>;
  countryId!: string | null;
  API_KEY = environment.API_KEY;
  map!: google.maps.Map;
  geocoder!: google.maps.Geocoder;
  selectedCountry!: string;
  selectedCity!: Cities | null;
  options: any;
  autocomplete!: google.maps.places.Autocomplete;
  place!: google.maps.places.PlaceResult | null;
  coordinates!: any;
  calledOnce = true;
  editableCountry = true;
  editablezone = true;
  polygon!: google.maps.Polygon | null;
  updatedPolygonCoordinates!: { lat: number, lng: number }[];
  storeArea: boolean = false;
  countryForm!: FormGroup;
  // countryName!: string
  // cityName!: string

  @ViewChild('inputTag') inputTag!: ElementRef;


  ngOnInit() {
    this.pageload();
    this. _addCountryService.getCountry().subscribe((res) => {
      if (Array.isArray(res)) {
        this.countryList = res
        // this.seletedC(`${this.countryList[0].countryCode2}+${this.countryList[0]._id}`);
      } console.log(this.countryList);
    })

    this.countryForm = this._fb.group({
      country: [''],
      city: ['']
    })

    this.countryForm.get('city')?.disable();

  }

  initAutocomplete(): void {
    const autocompleteInput = document.getElementById('city') as HTMLInputElement;
    this.autocomplete = new google.maps.places.Autocomplete(autocompleteInput, { types: ['(cities)'] });

    this.autocomplete.addListener('place_changed', () => {
      this.storeArea = false
      console.log('hheeeeeeeeeeee');

      if (this.countryForm.get('city')?.value === '') {
        this._toastr.warning('Please enter all the details', 'Warning');
        return;
      }
      if (autocompleteInput.value.trim() == '') {
        // this.editableCountry = false;
        this.countryForm.get('country')?.disable();
      }
      if (this.place || this.polygon || this.drawingManager) {
        this.polygon?.setMap(null);
        // this.drawinPolygon.setMap(null);
        if (this.drawingManager) this.drawingManager.setMap(null);
        this.place = null
      }
      this.place = this.autocomplete.getPlace();
      console.log(this.place);
      console.log(this.place?.formatted_address);
      // this.cityName = this.place?.formatted_address ;
      // console.log(this.cityName);

      let index = this.cityList.findIndex((city) => city.formatted_address === this.place?.formatted_address);
      if (index > -1) {
        this.cityChoosed(this.cityList[index]);
        console.log('what');
      }
      if (this.place.geometry && this.place.geometry.location) {
        if (this.calledOnce) {
          // this.drawingFunction();
        }
        let location = this.place.geometry?.location;
        let latitude = location?.lat();
        let longitude = location?.lng();
        const newCenter = new google.maps.LatLng(latitude, longitude);
        this.map.setCenter(newCenter);
        this.map.setZoom(9);
      }
      this.drawingFunction();

    });
  }


  seletedC(value: string) {
    this.storeArea = false;

    this.countryForm.get('city')?.enable();
    let gotValue = value.split('+');

    let cca2 = gotValue[0];

    if (this.drawinPolygon) {
      this.drawinPolygon.setMap(null)
    }
    if (this.countryForm.get('city')) {
      this.countryForm.get('city')?.setValue(null);
    }
    if (this.polygon) {
      this.polygon.setMap(null); // Remove polygon from map
      this.polygon = null; // Reset polygon variable
    }
    if (this.countryId) {
      this.countryId = null;
    }
    this.countryId = gotValue[1];
    console.log(this.countryId);
    this._cityService.getCities(this.countryId as string).subscribe((res) => {
      this.cityList = res as Array<Cities>
      console.log(this.cityList);
      console.log(this.countryId);
    })

    this.selectedCountry = cca2;
    console.log(cca2);

    if (this.autocomplete) {
      this.autocomplete.setComponentRestrictions({ 'country': this.selectedCountry });
    }
  }

  //  /*
  pageload() {
    if (navigator.geolocation) {
      // Get the user's current location
      navigator.geolocation.getCurrentPosition(position => {
        const userPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        const loader = new Loader({
          apiKey: this.API_KEY,
          libraries: ['places', 'drawing']
        });

        loader.load().then(() => {
          const mapEle = document.getElementById('map');
          if (mapEle) {
            // Use user's current location as the center
            this.map = new google.maps.Map(mapEle, {
              center: userPosition,
              zoom: 10,
              styles: []
            });

            this.initAutocomplete()
            // Initialize the geocoder
            this.geocoder = new google.maps.Geocoder();
          }
        }).catch(err => {
          console.error('Error loading Google Maps API:', err);
        });
      }, error => {
        // Handle error when user denies location permission
        console.warn('Error getting user location:', error);
        // Load default map without marker
        this.loadDefaultMap();
      });
    } else {
      console.error('Geolocation is not supported by this browser.');
      // Load default map without marker
      this.loadDefaultMap();
    }
  }

  // Function to load default map without marker
  loadDefaultMap() {
    const loader = new Loader({
      apiKey: this.API_KEY,
      libraries: ['places', 'drawing']
    });

    loader.load().then(() => {
      const mapEle = document.getElementById('map');
      if (mapEle) {
        // Load default map without marker
        this.map = new google.maps.Map(mapEle, {
          center: { lat: 25.4484, lng: 78.5685 },
          zoom: 6,
        });
        this.initAutocomplete()

        this.geocoder = new google.maps.Geocoder();
      }
    }).catch(err => {
      console.error('Error loading Google Maps API:', err);
    });
  }
  //  */


  drawingFunction(): void {

    if (this.drawingManager) {
      this.drawingManager.setMap(null);
    }

    this.calledOnce = false;
    enum OverlayType {
      MARKER = 'marker',
      POLYGON = 'polygon',
    }

    if (this.inputTag.nativeElement.value === '') {
      this._toastr.warning('Please enter all the details', 'Warning');
      this.drawingManager.setMap(null);
      return;
    }

    this.drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.POLYGON,
      map: this.map,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [OverlayType.POLYGON]
      },
      polygonOptions: { // Specify polygon options here
        editable: true,
        strokeColor: '#6b0384', //  stroke color
        strokeOpacity: 1, // Stroke opacity
        strokeWeight: 2, // Stroke weight
        fillColor: '#a66eee', // fill color
        fillOpacity: 0.35 // Fill opacity
      }
    });

    this.drawingManager.setMap(this.map);

    // Disable map dragging when drawing
    google.maps.event.addListener(this.drawingManager, 'drawingmode_changed', () => {
      if (this.drawingManager.getDrawingMode() !== null) {
        this.map.setOptions({ draggable: false });
      } else {
        this.map.setOptions({ draggable: true });
      }
    });

    // Initialize drawing complete event listener
    google.maps.event.addListener(this.drawingManager, 'overlaycomplete', (event: { type: google.maps.drawing.OverlayType; overlay: google.maps.Polygon; }) => {
      if (event.type === google.maps.drawing.OverlayType.POLYGON) {

        const polygon = event.overlay;
        // const path = polygon.getPath().getArray()
        const path = polygon.getPath().getArray();
        console.log('path------------>', path);

        if (this.coordinates) {
          this.coordinates = [[[]]]
        }

        // this.editableCountry = false;
        this.countryForm.get('country')?.disable();
        this.countryForm.get('city')?.disable();

        const firstCoordinate = [path[0].lng(), path[0].lat()]

        this.coordinates = [[path.map((latLng) => [latLng.lng(), latLng.lat()])]];
        this.coordinates[0][0].push(firstCoordinate)
        console.log('Polygon coordinates:', this.coordinates);

        // console.log(this.place);
        if (this.drawinPolygon) {
          this.drawinPolygon.setMap(null)
        }
        this.drawinPolygon = event.overlay;

        this.storeArea = true;
        // Re-enable map dragging after drawing is complete
        this.map.setOptions({ draggable: true });
      }
    });
  }

  storeDrawnArea() {
    if (this.countryForm.get('city')?.value == '') {
      this._toastr.warning('Please enter all the details', 'Warning');
      return;
    }
    // if (this.coordinates.length < 2) {
    //   console.log('please draw the proper area');
    //   this._toastr.warning('Please draw the area properly', 'Warning')
    //   return;
    // }
    // if (this.countryForm.get('city')?.value !== this.cityName ) {
    //   console.log(this.countryForm.get('city')?.value);
    //   console.log(this.cityName);

    //   this._toastr.error("Please don't modify the city/country name", "Error");
    //   return;
    // }

    let placeInfo = {
      countryId: this.countryId,
      cityName: this.place?.formatted_address,
      place_id: this.place?.place_id,
      coordinates: this.coordinates
    }
    console.log('placeInfo',placeInfo);

    this._cityService.saveZone(placeInfo).subscribe((res) => {
      console.log(res);
      // this.editableCountry = true;
      this.countryForm.get('city')?.enable();
      this.countryForm.get('country')?.enable();
      this.countryForm.get('city')?.reset();
      // this.countryForm.reset();

      this.cityList.push(res as Cities)
      this._toastr.success('Zone saved successfully', 'Success')
      this.storeArea = false;

      if (this.drawinPolygon) {
        this.drawinPolygon.setMap(null);
      }
      if (this.drawingManager) {
        this.drawingManager.setMap(null);
      }

    }, (er) => {
      this._toastr.error('The Zone already exists', 'error');
      this.countryForm.get('city')?.enable();
      this.countryForm.get('country')?.enable();
      this.countryForm.get('city')?.reset();
      // this.countryForm.reset();
      this.storeArea = false;
      if (this.drawingManager) {
        this.drawingManager.setMap(null);
      }
      if (this.drawinPolygon) {
        this.drawinPolygon.setMap(null)
      }
      console.log(er);
    })
  }

  cityChoosed(city: Cities) {

    console.log('cityChoosed', city.zone.coordinates[0]);
    let updatedCords = city.zone.coordinates[0].map(pair => ({
      lat: pair[1], // Assuming latitude is at index 1
      lng: pair[0]  // Assuming longitude is at index 0
    }));
    console.log('updated cor', updatedCords);
    // return;

    if (this.selectedCity) {
      this.selectedCity = null;
    }
    this.selectedCity = city;
    if (this.polygon) {
      this.polygon.setMap(null); // Remove polygon from map
      this.polygon = null; // Reset polygon variable
    }
    // let coordinates = city.zone.coordinates;


    this.polygon = new google.maps.Polygon({
      paths: updatedCords,
      strokeColor: "#FF0000",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#FF0000",
      fillOpacity: 0.35,
      editable: true
    });

    this.polygon.setMap(this.map);
    const newCenter = new google.maps.LatLng(updatedCords[0].lat, updatedCords[0].lng);
    this.map.setCenter(newCenter);
    this.map.setZoom(10);


    // Add event listeners for vertex updates
    google.maps.event.addListener(this.polygon!.getPath(), 'set_at', () => {
      this.editablezone = false;
      updatePolygonCoordinates.call(this); // Use arrow function to maintain 'this' context
    });
    // Add event listeners for new vertex insertions
    google.maps.event.addListener(this.polygon!.getPath(), 'insert_at', () => {
      this.editablezone = false;
      updatePolygonCoordinates.call(this); // Use arrow function to maintain 'this' context
    });

    google.maps.event.addListener(this.polygon!.getPath(), 'remove_at', () => {
      this.editablezone = false;
      updatePolygonCoordinates.call(this);
    });

    // Function to update the array of polygon coordinates
    function updatePolygonCoordinates(this: any) {
 
      this.updatedPolygonCoordinates = [[]]; // Initialize as empty array
      this.polygon.getPath().getArray().forEach((latLng: google.maps.LatLng) => {
        const coordinatePair = [latLng.lng(), latLng.lat()]; // Format: [lng, lat]
        this.updatedPolygonCoordinates[0].push(coordinatePair); // Push into the first index
        // console.log('this.updatedPolygonCoordinates', this.updatedPolygonCoordinates);
      });

      const cord = this.polygon.getPath().getArray();
      const firstCoordinate = [cord[0].lng(), cord[0].lat()];

      this.updatedPolygonCoordinates[0].push(firstCoordinate); // Push the first coordinate pair

      // Output updated coordinates
      console.log('Updated Polygon Coordinates:', this.updatedPolygonCoordinates);
    }
  }

  saveChangedArea() {
    this.editablezone = true;
    let coordinates = this.updatedPolygonCoordinates
    let updatedZone = {
      cityId: this.selectedCity?._id,
      coordinates: coordinates,
    }

    console.log('Update Zone details',updatedZone);
    // return;
    
    this._cityService.saveChangedZone(updatedZone).subscribe((res) => {
      this._toastr.success('Zone updated successfully', 'Success');
      let updatedZone = res as Cities

      let index = this.cityList.findIndex((obj) => obj._id == updatedZone._id);
      if (index > -1) {
        this.cityList[index] = updatedZone
      }
      // console.log(res);
    }, (error) => {
      this._toastr.error('Some Error Occured', 'Error');
    })
  }

  ClearAll() {
    this.countryForm.get('city')?.enable();
    this.countryForm.get('country')?.enable();
    this.countryForm.get('city')?.reset();
    // this.countryForm.reset();
    if (this.polygon) this.polygon?.setMap(null)
    if (this.drawingManager) this.drawingManager.setMap(null);
    if (this.drawinPolygon) this.drawinPolygon.setMap(null)

    this.storeArea = false;
  }
}