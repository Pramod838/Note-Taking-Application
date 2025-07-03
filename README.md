# Note-Taking-Application

A beautiful, full-featured authentication and note-taking application built with React, TypeScript, and Supabase.
Demo -https://auth-notes-app-git-main-riya-742005s-projects.vercel.app/

## ✨ Features

### Authentication Options
- **Secure JWT-based Session Management** - Automatic token refresh and state management
- **Password Validation** - Comprehensive form validation with real-time error feedback

### Notes Management
- **Create, Edit, and Delete Notes** - Full CRUD operations for personal notes
- **Real-time Search Functionality** - Instantly search through note titles and content
- **Responsive Grid Layout** - Beautiful card-based design that adapts to all screen sizes
- **Auto-save Functionality** - Changes are saved automatically

### User Experience
- **Beautiful, Modern UI** - Clean design with smooth animations and micro-interactions
- **Mobile-first Responsive Design** - Optimized for all devices from mobile to desktop
- **Toast Notifications** - Clear user feedback for all actions
- **Loading States and Error Handling** - Comprehensive error management

### Security
- **Row Level Security (RLS)** - Database-level security with Supabase
- **Protected Routes** - Authentication required for accessing notes
- **Input Validation and Sanitization** - All user inputs are validated using Zod schemas

## 🚀 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (Auth, Database, API)
- **State Management**: React Context API
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Styling**: Tailwind CSS with custom gradients and animations

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd auth-notes-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Settings > API to get your project URL and anon key
   - Enable email authentication in Authentication > Settings
   - Set up Google OAuth (optional) in Authentication > Providers

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Run database migrations**
   - In your Supabase dashboard, go to SQL Editor
   - Copy and paste the content from `supabase/migrations/20250702072743_fierce_reef.sql`
   - Run the migration to create the notes table and security policies

6. **Start the development server**
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── LoadingSpinner.tsx
│   └── NoteModal.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx
├── lib/               # Utilities and API clients
│   ├── api.ts
│   └── supabase.ts
├── pages/             # Page components
│   ├── DashboardPage.tsx
│   ├── LoginPage.tsx
│   ├── OTPVerificationPage.tsx
│   └── SignupPage.tsx
├── App.tsx            # Main app component
└── main.tsx          # Entry point
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Design Features

- **Modern UI**: Clean, card-based design with subtle shadows and rounded corners
- **Color System**: Carefully crafted color palette with gradients
- **Typography**: Proper hierarchy and contrast ratios
- **Animations**: Smooth transitions and micro-interactions
- **Responsive**: Mobile-first design with breakpoints for all screen sizes

## 🔐 Authentication Flow

### Email/OTP Flow
1. **Signup**: User enters email, password, and full name
2. **Account Activation**: Email verified, account becomes active
3. **Login**: User can now login with email/password

### Google OAuth Flow
1. **Google Authentication**: User authenticates with Google
2. **Account Creation**: Account automatically created and verified
3. **Dashboard Access**: User immediately redirected to dashboard

### Session Management
- **Automatic Token Refresh**: Sessions are maintained automatically
- **Protected Routes**: Dashboard requires authentication
- **Secure Logout**: Proper session cleanup on logout

## 📱 Mobile Responsiveness

The app is fully responsive with:
- Mobile-first design approach
- Touch-friendly interface elements
- Optimized layouts for different screen sizes
- Proper spacing and typography scaling

## 🚀 Deployment

### Frontend (Netlify/Vercel)
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your preferred hosting service
3. Set environment variables in your hosting dashboard

### Database
- Supabase handles all backend infrastructure
- No additional server deployment needed

## 🔒 Security Considerations

- All user inputs are validated using Zod schemas
- Row Level Security (RLS) ensures users can only access their own data
- Environment variables protect sensitive configuration
- HTTPS enforced in production
- JWT tokens for secure API communication

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 🆘 Support

If you encounter any issues:
1. Check the console for error messages
2. Verify your Supabase configuration
3. Ensure all environment variables are set correctly
4. Check that the database migrations have been run

For additional help, please open an issue in the repository.

## 🌟 Features Implemented

✅ **Email/Password Signup with OTP Verification**
✅ **Google OAuth Integration**
✅ **Comprehensive Form Validation**
✅ **Error Handling and User Feedback**
✅ **Welcome Dashboard with User Information**
✅ **Create and Delete Notes**
✅ **Mobile-Friendly Responsive Design**
✅ **JWT Authorization for API Calls**
✅ **Modern UI with Production-Ready Design**
✅ **Real-time Search and CRUD Operations**
✅ **Secure Database with Row Level Security**
