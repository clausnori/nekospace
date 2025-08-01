# NekoSpaces - Production-Ready Music Streaming Platform

A complete, production-ready music streaming application built with Next.js 14, MongoDB, and modern web technologies. Features responsive design, complete authentication, file uploads, search, admin dashboard, and real-time music playback.

## 🚀 Features

### Core Features
- 🎵 **Music Streaming** - Full-featured responsive audio player
- 🔐 **Authentication** - JWT-based auth with secure HTTP-only cookies
- 📤 **File Upload** - Audio and image upload with validation
- 🔍 **Real-time Search** - Search songs, artists, albums, and playlists
- 👥 **User Management** - Listeners, Authors, and Admin roles
- 🎨 **Artist Dashboard** - Upload and manage music content
- 📱 **Fully Responsive** - Perfect on mobile, tablet, and desktop
- 🌙 **Dark Theme** - Beautiful black and white aesthetic

### Production Features
- 🛡️ **Security** - Password hashing, input validation, XSS protection
- 📊 **Admin Dashboard** - Complete platform management
- 🎯 **User Verification** - Author verification system
- 📋 **Playlist Management** - Create and manage custom playlists
- ⚙️ **User Settings** - Comprehensive preferences
- 🔄 **Empty States** - Graceful handling of no data scenarios
- 📈 **Analytics** - Play counts, user stats, and insights
- 🎧 **Audio Controls** - Volume, crossfade, quality settings

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB
- **Authentication**: JWT with HTTP-only cookies, bcryptjs
- **UI Components**: Radix UI, shadcn/ui
- **Audio**: HTML5 Audio API with custom controls
- **Database**: MongoDB with proper indexing and relationships
- **File Storage**: Local file system (easily extensible to cloud)
- **Deployment**: Vercel-ready with production optimizations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone and install**:
\`\`\`bash
git clone <repository-url>
cd nekospaces-music-app
npm install
\`\`\`

2. **Environment setup**:
\`\`\`bash
cp .env.example .env.local
# Edit .env.local with your configuration
\`\`\`

3. **Database setup**:
\`\`\`bash
npm run db:init
\`\`\`

4. **Start development**:
\`\`\`bash
npm run dev
\`\`\`

5. **Open** [http://localhost:3000](http://localhost:3000)

## 📱 Responsive Design

The application is fully responsive and optimized for all devices:

### Mobile (320px - 768px)
- Collapsible navigation menu
- Touch-friendly button sizes (44px minimum)
- Optimized music player with expandable controls
- Horizontal scrolling for categories
- Stacked layouts for better readability

### Tablet (768px - 1024px)
- Adaptive grid layouts
- Search bar in header
- Balanced content distribution
- Touch and mouse interaction support

### Desktop (1024px+)
- Full navigation in header
- Multi-column layouts
- Advanced music player controls
- Hover states and interactions

## 🗄️ Database Schema

### Production-Ready Setup
The application starts with a clean database containing only:
- **Admin User**: Default admin account for platform management
- **Indexes**: Optimized database indexes for performance
- **Collections**: Empty collections ready for content

### Empty State Handling
- Graceful handling when no content exists
- Encouraging call-to-action messages
- Progressive disclosure of features
- User-friendly onboarding experience

## 🔐 Authentication System

### Default Admin Account
After running `npm run db:init`, you'll get:
- **Email**: admin@nekospaces.com
- **Password**: (randomly generated - check console output)
- **Role**: Admin with full platform access

### User Roles
- **Listener**: Stream music, create playlists, follow artists
- **Author**: Upload music, manage albums, view analytics (requires verification)
- **Admin**: Platform management, user verification, content moderation

## 📤 File Upload System

### Supported Formats
- **Audio**: MP3, WAV, FLAC (max 50MB)
- **Images**: JPEG, PNG, WebP (max 5MB)

### Features
- File type validation
- Size limits
- Secure file naming
- Organized storage structure
- Progress indicators

## 🔍 Search System

### Capabilities
- **Real-time search** with debouncing
- **Multi-entity search** (songs, artists, albums, playlists)
- **Fuzzy matching** with MongoDB text indexes
- **Instant results** with dropdown interface
- **Mobile-optimized** search experience

## 👨‍💼 Admin Dashboard

### Features
- **User Management** - View, verify, manage users
- **Content Moderation** - Review uploads, manage content
- **Analytics** - Platform statistics and insights
- **System Health** - Monitor performance and usage
- **Responsive Design** - Works on all devices

## 🎵 Audio System

### Mobile Player
- **Compact View** - Essential controls visible
- **Expandable Controls** - Additional options on demand
- **Touch Optimized** - Large touch targets
- **Progress Bar** - Easy seeking on mobile

### Desktop Player
- **Full Controls** - All features visible
- **Volume Slider** - Precise volume control
- **Keyboard Shortcuts** - Space for play/pause
- **Visual Feedback** - Hover states and animations

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect repository** to Vercel
2. **Set environment variables**:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_APP_URL`
3. **Deploy** - Automatic deployments on push

### Manual Deployment

1. **Build the application**:
\`\`\`bash
npm run build
\`\`\`

2. **Set up MongoDB** (Atlas recommended)
3. **Configure environment variables**
4. **Deploy to your platform**

## 🔧 Configuration

### Environment Variables

\`\`\`bash
# Required
MONGODB_URI=mongodb://localhost:27017/nekospaces
JWT_SECRET=your-super-secret-jwt-key
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional
NODE_ENV=production
\`\`\`

### Database Commands

\`\`\`bash
npm run db:init     # Initialize clean database with admin user
npm run db:reset    # Reset database (removes all data)
npm run db:check    # Check database status
\`\`\`

## 🎯 Production Features

### Security
- **Password Hashing** - bcryptjs with salt rounds
- **JWT Security** - HTTP-only cookies, secure flags
- **Input Validation** - Server-side validation for all inputs
- **File Upload Security** - Type and size validation
- **Route Protection** - Middleware-based authentication

### Performance
- **Database Indexing** - Optimized queries
- **Image Optimization** - Next.js Image component
- **Code Splitting** - Automatic route-based splitting
- **Responsive Images** - Adaptive image loading
- **Lazy Loading** - Components and images

### User Experience
- **Empty States** - Meaningful messages when no content
- **Loading States** - Skeleton loaders and spinners
- **Error Handling** - Graceful error recovery
- **Mobile First** - Optimized for mobile devices
- **Accessibility** - WCAG compliant design

## 📊 Getting Started (Empty Database)

When you first run the application:

1. **Admin Setup**: Use the generated admin credentials to log in
2. **Create Authors**: Register author accounts and verify them via admin panel
3. **Upload Content**: Authors can upload music and create albums
4. **Build Community**: Users can create playlists and follow artists
5. **Monitor Growth**: Use admin dashboard to track platform growth

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on mobile and desktop
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the admin dashboard for platform insights

---

**NekoSpaces** - A production-ready music streaming platform. Built with ❤️ using modern web technologies and responsive design principles.
