import Link from 'next/link';
import SiteChrome from '../../components/SiteChrome';
import Seo from '../../components/Seo';

export default function Unsubscribed() {
  return (
    <SiteChrome>
      <Seo
        title="Unsubscribed | Wat Shall I Eat"
        description="You are unsubscribed from Wat Shall I Eat weekly meal ideas."
        path="/newsletter/unsubscribed"
        noindex
      />
      <h1 className="text-4xl font-bold mb-4">You are unsubscribed</h1>
      <p className="mb-4 max-w-3xl">
        This address is off the weekly meal ideas list. A new signup will not turn it back on.
      </p>
      <p><Link href="/" className="underline">Back to Wat Shall I Eat</Link></p>
    </SiteChrome>
  );
}
