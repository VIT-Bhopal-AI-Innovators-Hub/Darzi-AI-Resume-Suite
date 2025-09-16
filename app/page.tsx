'use client'

import HeroHeader from '../components/header'
import HeroSection from '../components/hero-section'
import FeaturesSection from '../components/feature-card'
import TeamSection from '../components/team'
import FooterSection from '@/components/footer'

export default function Home() {
  return (
    <div>
      <HeroHeader />
      <HeroSection />
      <FeaturesSection />
      <TeamSection />
      <FooterSection />
    </div>
  )
}
