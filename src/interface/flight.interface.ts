export interface IFlightWithDetails {
  id: string;
  flight_number: string;
  departure_time: Date;
  arrival_time: Date;
  status: 'SCHEDULED' | 'BOARDING' | 'IN_FLIGHT' | 'LANDED' | 'COMPLETED' | 'DELAYED' | 'CANCELLED';
  price: number;
  created_at: Date;
  updated_at: Date;
  airplane: {
    id: string;
    name: string;
    code: string;
    capacity: number;
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
  class_window_price: {
    economy: {
      first_window_seats: number;
      first_window_percentage: number;
      second_window_seats: number;
      second_window_percentage: number;
      third_window_seats: number;
      third_window_percentage: number;
    };
    premium: {
      first_window_seats: number;
      first_window_percentage: number;
      second_window_seats: number;
      second_window_percentage: number;
    };
    business: {
      first_window_seats: number;
      first_window_percentage: number;
      second_window_seats: number;
      second_window_percentage: number;
    };
  };
}
