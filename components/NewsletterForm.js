import { useId, useState } from 'react';
import { ADDRESS } from '../lib/newsletter.mjs';

export default function NewsletterForm({ placement = 'other', refCode = 'direct' }) {
  const id = useId();
  const [message, setMessage] = useState('');

  async function onSubmit(event) {
    event.preventDefault();
    // currentTarget is cleared after the first await, so keep the form node.
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    setMessage('');
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          email: form.get('email'),
          website: form.get('website'),
          placement: form.get('placement'),
          ref: form.get('ref'),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.ok) {
        setMessage('You are on the weekly meal ideas list. We will not send a confirmation email.');
        formEl.reset();
        return;
      }
      setMessage(data.error || 'Could not subscribe right now. Please try again later.');
    } catch {
      setMessage('Could not subscribe right now. Please try again later.');
    }
  }

  return (
    <form onSubmit={onSubmit} action="/api/subscribe" method="post" className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-2">Weekly meal ideas</h2>
      <p className="mb-3 text-gray-700 dark:text-gray-300">
        One signup adds you to the list. About once a week, a short note of dinners you can cook. No confirmation email. Unsubscribe any time with one click.
      </p>
      <label htmlFor={id} className="block text-sm font-medium mb-1">Email address</label>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          id={id}
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          placeholder="you@example.com"
          className="flex-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2"
        />
        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
          Join the weekly list
        </button>
      </div>
      <input type="hidden" name="placement" value={placement} />
      <input type="hidden" name="ref" value={refCode} />
      <div className="sr-only" aria-hidden="true">
        <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
        Telep IO LLC. {ADDRESS}. Submitting this form is your consent to join. We do not mail a confirmation.
      </p>
      {message ? <p className="mt-3" role="status">{message}</p> : null}
    </form>
  );
}
