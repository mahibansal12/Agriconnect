import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

export default function About() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#FBF5E7' }}>
      <Navbar />
      <div style={{ flex: 1, padding: '80px 20px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '42px', fontWeight: '800', color: '#0A2E0C', marginBottom: '24px' }}>About AgriConnect</h1>
        <p style={{ fontSize: '18px', color: '#3A4D38', lineHeight: '1.7', marginBottom: '24px' }}>
          AgriConnect is India's smartest farming platform, built to empower every farmer with technology, knowledge, and fair markets. Our mission is to bridge the gap between traditional farming and modern agricultural tools.
        </p>
        <p style={{ fontSize: '18px', color: '#3A4D38', lineHeight: '1.7' }}>
          From real-time mandi prices and AI-powered crop advice to government schemes and a direct marketplace, we provide a complete ecosystem for the modern farmer to thrive. Join us in revolutionizing Indian agriculture.
        </p>
      </div>
      <Footer />
    </div>
  );
}
