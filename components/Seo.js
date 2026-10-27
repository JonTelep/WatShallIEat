import Head from 'next/head';
import { absoluteUrl } from '../lib/paths.mjs';

export default function Seo({ title, description, path = '/', noindex = false }) {
  const url = absoluteUrl(path);
  const image = `https://watshallieat.com/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(description)}`;
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex ? <meta name="robots" content="noindex" /> : <meta name="robots" content="index,follow" />}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Wat Shall I Eat" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Head>
  );
}
