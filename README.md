# 🍔 Wat Shall I Eat

A fun, mobile-friendly app that helps you decide what to eat! Can't make up your mind? Let the app pick a random restaurant near you based on your preferences.

## ✨ Features

- **🎲 Random Food Picker** - Let fate decide what you're eating
- **🎯 Smart Filters** - Filter by cuisine type (Fast Food, Pizza, Mexican, Chinese, etc.)
- **💰 Price Range** - Filter by budget ($, $$, $$$, $$$$)
- **📍 Location-based** - Finds restaurants near your current location
- **🗺️ Google Maps Integration** - See directions to your chosen restaurant
- **🌙 Dark Mode** - Easy on the eyes at night
- **📱 Mobile-First Design** - Looks great on any device

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- A Google Maps API key with the following APIs enabled:
  - Maps JavaScript API
  - Places API
  - Directions API

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/JonTelep/WatShallIEat.git
   cd WatShallIEat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your Google Maps API key:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Your Google Maps API key | Yes |

## 📁 Project Structure

```
WatShallIEat/
├── components/
│   ├── DarkModeToggle.js   # Light/dark theme toggle
│   ├── Filters.js          # Food type, radius, price filters
│   ├── FoodOption.js       # Restaurant result card
│   ├── Map.js              # Google Maps integration
│   └── SpinWheel.js        # Fun loading animation
├── pages/
│   ├── api/
│   │   └── search.js       # Google Places API proxy
│   ├── _app.js
│   ├── _document.js
│   └── index.js            # Main page
├── services/
│   └── placeService.js     # API client
├── styles/
│   └── globals.css         # Global styles & animations
├── .env.example            # Environment template
├── package.json
├── tailwind.config.js
└── README.md
```

## 🍕 Supported Food Types

- 🍟 Fast Food
- 🍕 Pizza
- 🌮 Mexican
- 🥡 Chinese
- 🍝 Italian
- 🍣 Japanese
- 🍛 Indian
- 🍜 Thai
- 🍔 American
- 🦐 Seafood
- 🥘 Korean
- 🥙 Mediterranean
- 🥞 Breakfast
- ☕ Cafe
- 🍰 Dessert
- 🥗 Healthy

## 🛠️ Built With

- [Next.js 14](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Google Maps Platform](https://developers.google.com/maps) - Maps & Places API

## 📝 License

ISC

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

---

Made with 🍕 by [Telep IO](https://telep.io)
