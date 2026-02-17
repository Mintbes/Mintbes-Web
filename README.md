# Mintbes Validator Website

Modern, high-performance website for the Mintbes Harmony ONE Validator.

## Tech Stack
- React
- Tailwind CSS
- Vite
- Framer Motion (Animations)
- Lucide React (Icons)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Customization

- **Colors**: Edit `tailwind.config.js` to change the `mintbes` color palette.
- **Logos**: Replace SVG paths in `src/components/Logos.jsx`.
- **Images**: Update `src/components/Gallery.jsx` with actual validator images.
- **Content**: Data is hardcoded in components for simplicity. Edit the respective component files to update text.

## Deployment

Deploy the `dist` folder to any static hosting service (Vercel, Netlify, GitHub Pages).
