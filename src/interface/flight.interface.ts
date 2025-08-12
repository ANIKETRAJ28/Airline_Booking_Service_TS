export interface IFlight {
  id: string;
  flight_number: string;
  departure_time: Date;
  arrival_time: Date;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  created_at: Date;
  updated_at: Date;
  airplane: {
    id: string;
    name: string;
    code: string;
    business_class_seats: number;
    premium_class_seats: number;
    economy_class_seats: number;
    created_at: Date;
    updated_at: Date;
  };
  departure_airport: {
    id: string;
    name: string;
    code: string;
    city: {
      id: string;
      name: string;
      country: {
        id: string;
        name: string;
        created_at: Date;
        updated_at: Date;
      };
      created_at: Date;
      updated_at: Date;
    };
    created_at: Date;
    updated_at: Date;
  };
  arrival_airport: {
    id: string;
    name: string;
    code: string;
    city: {
      id: string;
      name: string;
      country: {
        id: string;
        name: string;
        created_at: Date;
        updated_at: Date;
      };
      created_at: Date;
      updated_at: Date;
    };
    created_at: Date;
    updated_at: Date;
  };
}

export interface IFlightWithDetails extends IFlight {
  price: number;
  class_window_price: {
    economy: {
      first_window_seats: number;
      first_window_remaining_seats: number;
      first_window_percentage: number;
      second_window_seats: number;
      second_window_remaining_seats: number;
      second_window_percentage: number;
      third_window_seats: number;
      third_window_remaining_seats: number;
      third_window_percentage: number;
    };
    premium: {
      first_window_seats: number;
      first_window_remaining_seats: number;
      first_window_percentage: number;
      second_window_seats: number;
      second_window_remaining_seats: number;
      second_window_percentage: number;
    };
    business: {
      first_window_seats: number;
      first_window_remaining_seats: number;
      first_window_percentage: number;
      second_window_seats: number;
      second_window_remaining_seats: number;
      second_window_percentage: number;
    };
  };
}
