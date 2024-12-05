# API Status Server V2

A lightweight server for monitoring system status such as OS info, CPU usage, RAM usage, Disk info, Network stats, Uptime, and Node.js version. Designed to work on **Windows** and **Linux** platforms.

## Features

- Retrieve real-time system stats:
  - Operating System information
  - CPU model, core count, thread count, and usage percentage
  - RAM (total, used, free, and usage percentage)
  - Disk (total, used, free, and usage percentage)
  - Network (total data received/sent and real-time speed)
  - System uptime in a human-readable format
  - Node.js version
- Supports **Windows** and **Linux** platforms
- Auto-updates stats every second
- Simple REST API for fetching the data

## Prerequisites

- Node.js >= 14.x
- Supported platforms: Windows or Linux

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/riiixch/API-Status-Server-V2.git
   cd API-Status-Server-V2
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   node .
   ```

4. Access the server:
   - Root endpoint: [http://localhost:3000](http://localhost:3000)
   - Status endpoint: [http://localhost:3000/status](http://localhost:3000/status)

## API Endpoints

### GET `/status`

Fetches the current system status.

#### Example Response:
```json
{
  "data": {
    "os": "Linux",
    "cpu": {
      "model": "Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz",
      "cores": 6,
      "threads": 12,
      "usage": 15.2
    },
    "ram": {
      "total": "16.00 GB",
      "free": "8.00 GB",
      "used": "8.00 GB",
      "usage": 50.0
    },
    "disk": {
      "total": "500.00 GB",
      "free": "200.00 GB",
      "used": "300.00 GB",
      "usage": 60.0
    },
    "network": {
      "received": "1.00 GB",
      "sent": "500.00 MB",
      "speed": {
        "received": "1.00 Mbps",
        "sent": "500.00 Kbps"
      }
    },
    "uptime": "02:15:30",
    "nodejs": "20.0.0"
  }
}
```

### Root (`/`)

Returns a welcome message.

### Catch-All (`*`)

Handles all undefined routes with a default message.

## Platform Support

- **Windows**: Uses `wmic` for CPU and disk information.
- **Linux**: Uses `lscpu`, `df`, and `/proc/net/dev` for system stats.

## Customization

- Update the `PORT` variable in the source code to change the server's port.
- Adjust the `updateStatsInterval` variable to modify the stats refresh interval.

## Notes

- Ensure the necessary system tools are available on your platform:
  - **Windows**: `wmic` must be enabled.
  - **Linux**: Commands like `lscpu`, `df`, and `/proc/net/dev` should be accessible.

## License

This project is licensed under the [MIT License](LICENSE).

---

Created with ❤️ by **RIIIXCH**