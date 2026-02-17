import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import WhyDelegate from './components/WhyDelegate';
import StakingInfo from './components/StakingInfo';
import Gallery from './components/Gallery';
import Footer from './components/Footer';
import AIConcierge from './components/AIConcierge';

function App() {
  return (
    <div className="font-sans antialiased text-gray-900 bg-white min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <About />
        <WhyDelegate />
        <StakingInfo />
        <Gallery />
      </main>
      <Footer />
      <AIConcierge />
    </div>
  );
}

export default App;
