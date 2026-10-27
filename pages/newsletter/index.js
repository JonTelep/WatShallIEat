import { useRouter } from 'next/router';
import SiteChrome from '../../components/SiteChrome';
import Seo from '../../components/Seo';
import NewsletterForm from '../../components/NewsletterForm';

const description = 'Join the Wat Shall I Eat weekly meal ideas list. One signup, no confirmation email, and a one click unsubscribe.';

const errors = {
  invalid: 'Please enter a valid email address.',
  unavailable: 'Signup is not configured yet. Please try again later.',
  failed: 'Could not subscribe right now. Please try again later.',
};

export default function NewsletterPage({ joined, error }) {
  const router = useRouter();
  const refCode = typeof router.query.ref === 'string' ? router.query.ref : 'direct';
  return (
    <SiteChrome>
      <Seo
        title="Weekly meal ideas | Wat Shall I Eat"
        description={description}
        path="/newsletter"
        noindex={joined || Boolean(error)}
      />
      <h1 className="text-4xl font-bold mb-4">Weekly meal ideas</h1>
      <p className="mb-3 max-w-3xl">
        The list is a short note of dinners and breakfasts, about once a week. You get ideas you can cook with groceries from a normal store, in the same style as the meal pages on this site.
      </p>
      <p className="mb-6 max-w-3xl">
        Signup is a single step. Submitting your email is consent to join. We do not send a confirmation message from this site. A signed link lets you unsubscribe in one click.
      </p>
      {joined ? (
        <p className="mb-4 p-4 bg-green-100 text-green-900 rounded" role="status">
          You are on the weekly meal ideas list. We will not send a confirmation email.
        </p>
      ) : null}
      {error ? (
        <p className="mb-4 p-4 bg-red-100 text-red-800 rounded" role="status">{errors[error] || errors.failed}</p>
      ) : null}
      <NewsletterForm placement="newsletter-page" refCode={refCode} />
    </SiteChrome>
  );
}

export function getServerSideProps({ query }) {
  const error = typeof query.error === 'string' ? query.error : '';
  return {
    props: {
      joined: query.joined === '1',
      error: errors[error] ? error : '',
    },
  };
}
