// /og/<slug>.png: the share image of every page the sitemap lists (src/lib/og.mjs says what each shows).
import { ogPages, ogCard } from '../../lib/og.mjs';
import { renderCard } from './_render.mjs';

export async function getStaticPaths() {
  return (await ogPages()).map(({ path, slug }) => ({ params: { slug }, props: { path } }));
}

export async function GET({ props }) {
  const png = await renderCard(await ogCard(props.path));
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
}
