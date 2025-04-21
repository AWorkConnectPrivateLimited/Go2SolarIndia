# Go2Solar India

A comprehensive solar energy management platform built with React Native, Expo, and Supabase.

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/go2solar.git
cd go2solar
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your Supabase credentials and other API keys

### Supabase Setup

1. Create a new Supabase project at [https://supabase.com](https://supabase.com)

2. Get your Supabase URL and anon key:
   - Go to Project Settings > API
   - Copy the "Project URL" and paste it as `EXPO_PUBLIC_SUPABASE_URL` in your `.env` file
   - Copy the "anon public" key and paste it as `EXPO_PUBLIC_SUPABASE_ANON_KEY` in your `.env` file

3. Set up the database schema:
   - Go to the SQL Editor in your Supabase dashboard
   - Run the SQL scripts from the `supabase/schema.sql` file to create the necessary tables

4. Configure authentication:
   - Go to Authentication > Settings
   - Enable the authentication providers you want to use (Email, Phone, Social)

### Running the App

```bash
# Start the development server
npm start
# or
yarn start
```

Then, follow the instructions in the terminal to open the app on your device or emulator.

## Project Structure

- `app/`: Contains all the screens and navigation logic
- `src/`: Contains the application logic, components, and services
  - `components/`: Reusable UI components
  - `services/`: API and external service integrations
  - `store/`: State management
  - `utils/`: Utility functions
  - `constants/`: App constants
  - `types/`: TypeScript type definitions
  - `theme/`: Theme configuration

## Features

- User authentication and role-based access
- Solar project management
- Energy consumption tracking
- Service request management
- Digital wallet integration
- Referral program
- Agent management
- Analytics and reporting

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
