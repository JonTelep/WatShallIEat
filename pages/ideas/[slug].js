import Link from 'next/link';
import SiteChrome from '../../components/SiteChrome';
import Seo from '../../components/Seo';
import NewsletterForm from '../../components/NewsletterForm';
import { getMeal, meals } from '../../lib/meals.mjs';

export default function MealPage({ meal }) {
  return (
    <SiteChrome>
      <Seo
        title={`${meal.title} | Wat Shall I Eat`}
        description={meal.description}
        path={`/ideas/${meal.slug}`}
      />
      <p className="mb-3"><Link href="/ideas" className="underline">All meal ideas</Link></p>
      <article>
        <h1 className="text-4xl font-bold mb-2">{meal.title}</h1>
        <p className="mb-4 text-sm">About {meal.time}. Serves {meal.serves}.</p>
        <p className="mb-6 max-w-3xl">{meal.intro}</p>
        <h2 className="text-2xl font-semibold mb-2">Ingredients</h2>
        <ul className="list-disc pl-6 mb-6 space-y-1">
          {meal.ingredients.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <h2 className="text-2xl font-semibold mb-2">Steps</h2>
        <ol className="list-decimal pl-6 mb-6 space-y-2">
          {meal.steps.map((step) => <li key={step}>{step}</li>)}
        </ol>
        <h2 className="text-2xl font-semibold mb-2">Notes</h2>
        <p className="mb-8 max-w-3xl">{meal.notes}</p>
      </article>
      <NewsletterForm placement="article-footer" />
    </SiteChrome>
  );
}

export function getStaticPaths() {
  return {
    paths: meals.map((meal) => ({ params: { slug: meal.slug } })),
    fallback: false,
  };
}

export function getStaticProps({ params }) {
  const meal = getMeal(params.slug);
  if (!meal) return { notFound: true };
  return { props: { meal } };
}
