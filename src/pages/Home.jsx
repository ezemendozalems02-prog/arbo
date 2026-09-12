import { useEffect } from 'react'
import Hero from '../sections/home/Hero'
import Manifesto from '../sections/home/Manifesto'
import ExperienceGrid from '../sections/home/ExperienceGrid'
import MenuPreview from '../sections/home/MenuPreview'
import OrderTeaser from '../sections/home/OrderTeaser'
import UpcomingEvents from '../sections/home/UpcomingEvents'
import ReservationCTA from '../sections/home/ReservationCTA'
import Testimonials from '../sections/home/Testimonials'
import ClubSection from '../sections/home/ClubSection'
import FranchiseTeaser from '../sections/home/FranchiseTeaser'
import InstagramGrid from '../sections/home/InstagramGrid'
import LocationSection from '../sections/home/LocationSection'

export default function Home() {
  useEffect(() => { document.title = 'Arbo Patagonia | Wine & Café en Trevelin' }, [])

  return (
    <div>
      <Hero />
      <Manifesto />
      <ExperienceGrid />
      <MenuPreview />
      <OrderTeaser />
      <UpcomingEvents />
      <ReservationCTA />
      <Testimonials />
      <ClubSection />
      <FranchiseTeaser />
      <InstagramGrid />
      <LocationSection />
    </div>
  )
}
