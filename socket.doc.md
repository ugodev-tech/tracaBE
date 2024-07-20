
# Socket Events Documentation

## Base URL
- **Socket URL**: This is the base URL for socket connections. For example, `https://tracabe.onrender.com`.

## Authentication
- **JWT Token**: All socket connections must include a `token` (JWT token) in the request headers for authentication. 

## User Types and Connection

### Users and Admins
- **Connection Requirement**: Must connect using a valid `orderNumber`.
- **Room Assignment**: Users and admins are assigned to a room based on the `orderNumber`, allowing them to see real-time updates for that specific order.

### Riders
- **Connection Requirement**: Connect using the base URL only. No `orderNumber` is required.
- **Room Assignment**: Riders are connected to their personal room based on their user ID.

## Client Events

### SEND_ORDER_LOCATION
- **Description**: Sends the real-time latitude and longitude coordinates of the rider.
- **Usage**: Emitted by the rider to update their current location.
- **Data**: `{ lat: string, long: string }`

### RECEIVE_LOCATION_FROM_SERVER
- **Description**: Notifies users who are expecting the delivery with real-time locations of the rider delivering their order.
- **Usage**: Users (connected with the `orderNumber`) receive updates on the rider's location.
- **Data**: `{ lat: string, long: string }`

## Server Events

### ERROR
- **Description**: Indicates an error has occurred.
- **Usage**: Emitted when an error occurs during socket operations or authentication.
- **Data**: `{ status: number, message: string, success: boolean }`

### SUCCESS
- **Description**: Indicates a successful operation.
- **Usage**: Emitted when an operation, such as sending location updates, is successful.
- **Data**: `{ status: number, message: string, success: boolean }`

### WELCOME
- **Description**: Sends a welcome message to the user upon successful connection.
- **Usage**: Emitted when a user connects to the server, either as a rider, user, or admin.
- **Data**: `{ message: string }`
