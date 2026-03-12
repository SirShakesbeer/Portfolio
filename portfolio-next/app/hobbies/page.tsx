import Footer from '@/components/Footer';
import Navigation from '@/components/Navigation';
import HobbyCards from '@/components/HobbyCards';
import { getPostsByType } from '@/lib/db';

export default function Hobbies() {
  return (
    <div>
      <Navigation />
      <HobbyCards />
      <Footer />
    </div>
  );
}
