# Behavior Chart

A behavior tracking and charting application built with Node.js and Express.

## Features

- 📊 Behavior data tracking
- 📈 Data visualization and charting
- 🔒 Secure API endpoints
- 🚀 Fast and lightweight server
- 📱 Responsive web interface

## Prerequisites

- Node.js (version 16 or higher)
- npm (version 8 or higher)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd behavior-chart
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
# Edit .env with your configuration
```

## Usage

### Development Mode
```bash
npm run dev
```
This will start the server with nodemon for automatic restarts on file changes.

### Production Mode
```bash
npm start
```

### Build
```bash
npm run build
```

### Testing
```bash
npm test
```

### Linting
```bash
npm run lint
npm run lint:fix
```

## API Endpoints

- `GET /` - API information
- `GET /api/health` - Health check endpoint

## Project Structure

```
behavior-chart/
├── src/
│   └── index.js          # Main application file
├── public/               # Static files
├── package.json          # Project configuration
├── .gitignore           # Git ignore rules
├── env.example          # Environment variables template
└── README.md            # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details
