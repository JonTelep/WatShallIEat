import { useState } from 'react';
import { deliveryLinks } from '../lib/delivery.mjs';

export default function DeliveryStep({ option, onRerun }) {
  const [answer, setAnswer] = useState(null);
  const lookup = deliveryLinks(option);

  return (
    <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow" data-testid="delivery-step">
      <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Want it delivered?</p>
      {answer === null && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setAnswer('yes')}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-4 rounded"
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => setAnswer('no')}
            className="bg-gray-200 hover:bg-gray-300 text-gray-900 py-1 px-4 rounded dark:bg-gray-700 dark:text-gray-100"
          >
            No thanks
          </button>
        </div>
      )}
      {answer === 'yes' && lookup.ok && (
        <div>
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            Open a delivery app with {option.name} already searched. Check the store and address match before you order.
          </p>
          <ul className="flex flex-wrap gap-3">
            {lookup.links.map((link) => (
              <li key={link.service}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-service={link.service}
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-1 px-4 rounded"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="text-xs text-gray-500 mt-2">
            If the restaurant does not show up, it may not deliver to you through that app.
          </p>
        </div>
      )}
      {answer === 'yes' && !lookup.ok && (
        <p className="text-gray-700 dark:text-gray-300" role="status">{lookup.reason}</p>
      )}
      {answer === 'no' && (
        <p className="text-gray-700 dark:text-gray-300">Enjoy. Use Directions above to get there.</p>
      )}
      {answer !== null && (
        <button type="button" onClick={onRerun} className="mt-3 text-blue-600 dark:text-blue-400 underline">
          Pick another place
        </button>
      )}
    </div>
  );
}
