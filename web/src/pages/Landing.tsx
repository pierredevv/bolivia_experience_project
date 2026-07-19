import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Hero from '../sections/Hero'
import SocialProofStrip from '../sections/SocialProofStrip'
import HowItWorks from '../sections/HowItWorks'
import FeaturesPreview from '../sections/FeaturesPreview'
import Categories from '../sections/Categories'
import ForBusiness from '../sections/ForBusiness'
import Testimonials from '../sections/Testimonials'
import MapSection from '../sections/MapSection'
import FAQ from '../sections/FAQ'
import FinalCTA from '../sections/FinalCTA'

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <SocialProofStrip />
      <HowItWorks />
      <FeaturesPreview />
      <Categories />
      <ForBusiness />
      <Testimonials />
      <MapSection />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  )
}
