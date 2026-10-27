import Link from 'next/link';
import SiteChrome from '../../components/SiteChrome';
import Seo from '../../components/Seo';
import NewsletterForm from '../../components/NewsletterForm';
import { meals } from '../../lib/meals.mjs';

const description = 'Weekly meal ideas you can cook at home: sheet pan chicken, bean bowls, pasta, fried rice, lentil soup, and yogurt jars.';

export default function Ideas() {
  return (
    <SiteChrome>
      <Seo title="Meal ideas | Wat Shall I Eat" description={description} path="/ideas" />
      <h1 className="text-4xl font-bold mb-4">Meal ideas</h1>
      <p className="mb-8 max-w-3xl">
        These are practical meals for a normal week. Each page lists what to buy, the steps, and how to keep leftovers. None of them need a special pantry.
      </p>
      <ul className="space-y-6 mb-10">
        {meals.map((meal) => (
          <li key={meal.slug} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h2 className="text-xl font-semibold">
              <Link href={`/ideas/${meal.slug}`} className="underline">{meal.title}</Link>
            </h2>
            <p className="mt-2 text-gray-700 dark:text-gray-300">{meal.description}</p>
            <p className="mt-1 text-sm">About {meal.time}. Serves {meal.serves}.</p>
          </li>
        ))}
      </ul>
      <NewsletterForm placement="article-footer" />
    </SiteChrome>
  );
}
