// Site-wide constants.
export const SITE = 'https://cinchstack.com';
export const NAME = 'CinchStack';
export const TAGLINE = "The stack that's best for you";
export const ORG_ID = `${SITE}/#org`;
export const AUTHOR_ID = `${SITE}/#rohail-nisar`;

export const AUTHOR = {
  name: 'Rohail Nisar',
  url: `${SITE}/about/`,
  jobTitle: 'Founder and editor',
  bio: 'Rohail owns and edits CinchStack, which reads vendor pricing pages so buyers do not have to, records what they say with the date and re-checks them every week. Rohail also publishes BestAICertifications.com.',
  sameAs: [
    'https://www.linkedin.com/in/rohailnisarahmad/',
    'https://github.com/rohail524823',
    // Both linked visibly from /about/.
    'https://www.upwork.com/freelancers/~019d1190b8777b2000',
    'https://bestaicertifications.com/',
  ],
};

export const NAV = [
  { href: '/stacks/', label: 'Stacks' },
  { href: '/tools/', label: 'Tools' },
  { href: '/compare/', label: 'Compare' },
  { href: '/changes/', label: 'Price changes' },
  { href: '/methodology/', label: 'Method' },
];

// Price-change alerts: the opt-in page of the email list (for example a free Systeme.io list). Empty
// hides every alerts button and the privacy paragraph about it; the list's own page handles consent
// and unsubscribes. See docs/OPERATIONS.md, "Price-change alerts".
export const ALERTS_URL = '';

// Impact.com site verification (keeps cinchstack.com verified as a media property).
export const IMPACT_VERIFICATION = '1f064047-59ad-4a26-8476-b437d20647a3';

// Google Analytics 4 measurement ID ("G-…"). Empty keeps analytics off: no script ships and the
// Content-Security-Policy in netlify.toml must keep script-src 'none'. The build checks both agree.
export const GA_ID = 'G-YVPC1K7T3X';
// Search engine verification tags. Only needed when a property is not verified through DNS.
export const GOOGLE_VERIFICATION = '';
export const BING_VERIFICATION = '';
// IndexNow key (scripts/indexnow.mjs). The key file at /<key>.txt proves to IndexNow engines that we own the host.
export const INDEXNOW_KEY = '7e1d5a9fc48a3143406369871a0b9f1b';
