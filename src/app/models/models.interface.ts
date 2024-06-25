import { BehaviorSubject } from "rxjs";

export interface Cities {
  coordinates: [{
    lat: number;
    lng: number;
  }],
  countryId: string,
  formatted_address: string,
  _id: string
}

export interface CitiesForCreateRide {
  // {
  cities: [
    {
      _id: string,
      coordinates: [{ lat: number, lng: number }],

    }
  ]
  // },
  status: string
}


export interface VehicleType {
  vehicleIcon: string;
  vehicleType: string;
  _id: string;
}

export interface VehicleTypeByCountryId {
  // documents: {
    vehicleIcon: string;
    vehicleType: string;
    _id: string;
  // }
}


export interface UserData {
  _id: string;
  userProfile: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  stripCustomerId: string

  countryCallingCode: {
    country: string,
    countryCallingCode: string
    countryCode: string
    countryCode2: string
    currency: string
    flagSymbol: string
    timeZone: string
    _id: string
  };
}

export interface DriverData {
  approveStatus: boolean;
  driverEmail: string;
  driverName: string;
  driverPhone: string;
  driverProfile: string;
  bankDetailsAdded:boolean;

  cityId: {
    countryId: string,
    formatted_address: string,
    _id: string
  } | null;

  countryId: {
    country: string,
    countryCallingCode: string
    countryCode: string
    countryCode2: string
    currency: string
    flagSymbol: string
    timeZone: string
    _id: string
  };

   serviceType: {
     vehicleIcon: string;
     vehicleType: string;
     _id: string;
   } | null;

  // serviceType: string

  _id: string;
}


export interface Country {
  country: string,
  countryCallingCode: string
  countryCode: string
  countryCode2: string
  currency: string
  flagSymbol: string
  timeZone: string
  _id: string
}

export interface CountryForRide {
  country: {
    country: string,
    countryCallingCode: string
    countryCode: string
    countryCode2: string
    currency: string
    flagSymbol: string
    timeZone: string
    _id: string
  };
}



export interface userForCreateRide {
  status: string;
  user: {
    countryCallingCode: string;
    stripCustomerId: string;
    userEmail: string;
    userName: string;
    userPhone: string;
    _id: string;
  };
  cardArray: Array<cardForCreateRide>
}


export interface singleUser {
  countryCallingCode: string;
  stripCustomerId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  userProfile: string,
  _id: string;
}

export interface Settings {
  Stops: number,
  TimeOut: number,
  _id: string
}


export interface Card {
  cardId: string;
  brand: string;
  country: string;
  last4: string;
  exp_month: number;
  exp_year: number
  // id: string;
  // object: string;
  // billing_details: {
  //   address: {
  //     city: string;
  //     country: string;
  //     line1: string;
  //     line2: string;
  //     postal_code: string;
  //     state: string;
  //   };
  //   email: string | null;
  //   name: string;
  //   phone: string | null;
  // };
  // card: {
  //   brand: string;
  //   checks: {
  //     address_line1_check: string;
  //     address_postal_code_check: string;
  //     cvc_check: string;
  //   };
  //   country: string;
  //   display_brand: string;
  //   exp_month: number;
  //   exp_year: number;
  //   fingerprint: string;
  //   funding: string;
  //   generated_from: string | null;
  //   last4: string;
  //   networks: {
  //     available: string[];
  //     preferred: string[];
  //   };
  //   three_d_secure_usage: {
  //     supported: boolean;
  //   };
  //   wallet: string | null;
  // };
  // created: number;
  // customer: string;
  // livemode: boolean;
  // metadata: {
  //   [key: string]: string;
  // };
  // type: string;
}

export interface cardForCreateRide {
  // interface PaymentMethod {
  id: string;
  object: string;
  billing_details: {
    address: {
      city: string | null;
      country: string | null;
      line1: string | null;
      line2: string | null;
      postal_code: string | null;
      state: string | null;
    };
    email: string | null;
    name: string;
    phone: string | null;
  };
  card: {
    brand: string;
    checks: {
      address_line1_check: string | null;
      address_postal_code_check: string | null;
      cvc_check: string | null;
    };
    country: string;
    display_brand: string;
    exp_month: number;
    exp_year: number;
    fingerprint: string;
    funding: string;
    generated_from: any;
    last4: string;
    networks: {
      available: string[];
      preferred: any;
    };
    three_d_secure_usage: {
      supported: boolean;
    };
    wallet: any;
  };
  created: number;
  customer: string;
  livemode: boolean;
  metadata: any;
  type: string;
  // }

}

interface Vehicle {
  vehicleIcon: string;
  vehicleType: string;
  _id: string;
}

export interface ValidateImageObj {
  extentions: string[];
  ValidateImage: BehaviorSubject<boolean>;
}


export interface ActiveDriver {
  _id: string;
  driverName: string;
  driverProfile: string;
  driverEmail: string;
  countryId: {
    _id: string;
    country: string,
    countryCallingCode: string,
    currency: string,
  };
  cityId: {
    _id: string;
    formatted_address: string;
    // Add more properties if needed
  };
  driverPhone: string;
  serviceType: string;
  approveStatus: boolean;
}

export interface cityPricingforTypes {
  _id: string;
  typeId: { _id: string, vehicleType: string, vehicleIcon: string };
  cityId: string;
  countryId: string;
  vehicleType: string;
  driverProfit: number;
  minFare: number;
  distanceForBasePrice: number;
  basePrice: number;
  pricePerUnitDistance: number;
  pricePerUnitTime_Min: number;
  maxSpace: number;
}

export interface cityPricingforTypesResponse {
  status: string,
  pricings: cityPricingforTypes[]
}


export interface City {
  coordinates: {
    lat: number;
    lng: number;
  }[];
  countryId: string;
  formatted_address: string;
  __v: number;
  _id: string;
}


export interface Pricing {
  _id: string;
  countryName: string;
  cityName: string;
  vehicleType: string;
  // countryId: string;
  // cityId: string;
  // typeId: string;
  driverProfit: number;
  minFare: number;
  distanceForBasePrice: number;
  basePrice: number;
  pricePerUnitDistance: number;
  pricePerUnitTime_Min: number;
  maxSpace: number;
  typeId: {
    vehicleIcon: string;
    vehicleType: string;
    _id: string;
  };
  countryId: {
    country: string,
    countryCallingCode: string
    countryCode: string
    countryCode2: string
    currency: string
    flagSymbol: string
    timeZone: string
    _id: string
  };
  cityId: {
    coordinates: any[]; // You can define a proper type for coordinates if needed
    countryId: string;
    formatted_address: string;
    _id: string;
  };
}


export interface Ride {
  _id: string;
  cityId: string,
  userId: {
    _id: string;
    userName: string;
    userProfile: string;
    userEmail: string;
    countryCallingCode: string;
    userPhone: string;
    stripCustomerId: string;
  };
  typeId: {
    _id: string,
    vehicleType: string,
    vehicleIcon: string
  };
  rideStatus: number;
  Ride_index:number
  date: string;
  time: number;
  totalFare: number;
  route: string[];
  paymentMethod: string;
  totalDistance: number;
  totalTime: number;
  startLocation: string,
  endLocation: string,
  timeInString: string,
  nearest: boolean,
  feedback:{
    rating: Number,
    message: String
  }
  countryInfo: {
    _id: string;
    country: string;
    currency: string;
    countryCode: string;
    countryCallingCode: string;
    timeZone: string;
    flagSymbol: string;
    countryCode2: string;
  },
  driverId: {
    _id: string;
    driverName: string;
    driverProfile: string;
    driverEmail: string;
    driverPhone: string;
    approveStatus: boolean;
  } | null,
  settings:{
    TimeOut:number
  }
}


export interface assignedRidesWithDriver extends Ride {
  driverId: {
    _id: string;
    driverName: string;
    driverProfile: string;
    driverEmail: string;
    driverPhone: string;
    approveStatus: boolean;
  }
}


