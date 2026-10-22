import type { Metadata } from 'next';
import Link from 'next/link';
import { siteUrl } from '@/lib/seo/site-config';
import { JsonLd, breadcrumbSchema, faqSchema } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'Free Online Image Tools — Compress, Resize, Crop, Convert Images',
  description:
    'Free online image tools that run entirely in your browser. Compress, resize, crop, convert and rotate images — your files stay on your device, never uploaded to a server.',
  alternates: { canonical: siteUrl('/image-tools') },
  keywords: [
    'image tools online', 'free image tools', 'compress image', 'resize image', 'crop image',
    'convert image', 'rotate image', 'browser image editor', 'image optimizer', 'image watermark', 'blur image', 'image to base64',
  ],
  openGraph: {
    title: 'Free Online Image Tools — DevToolsHub',
    description: 'Compress, resize, crop, convert and rotate images free in your browser.',
    url: siteUrl('/image-tools'),
    siteName: 'DevToolsHub',
    type: 'website',
  },
};

const IMAGE_TOOLS = [
  {
    title: 'Compress Image',
    description: 'Reduce image file size with adjustable quality. Supports JPEG, PNG, and WebP.',
    href: '/image-tools/compress',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    ),
  },
  {
    title: 'Resize Image',
    description: 'Resize by pixel dimensions or percentage. Lock aspect ratio or set custom sizes.',
    href: '/image-tools/resize',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
      </svg>
    ),
  },
  {
    title: 'Crop Image',
    description: 'Interactively select and crop any region. Freeform and preset aspect ratios.',
    href: '/image-tools/crop',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7H5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-2M7 7V5a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2h-2M7 7l10 10" />
      </svg>
    ),
  },
  {
    title: 'Convert Image',
    description: 'Convert between JPEG, PNG, and WebP. Control quality and transparency handling.',
    href: '/image-tools/convert',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
  {
    title: 'Rotate & Flip Image',
    description: 'Rotate 90°, 180°, or 270°. Flip horizontally or vertically. Batch supported.',
    href: '/image-tools/rotate-flip',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  {
    title: 'Watermark Image',
    description: 'Add branded text to an image with adjustable color, opacity, size, and position.',
    href: '/image-tools/watermark',
    icon: (<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3l2.5 5.5L20 11l-5.5 2.5L12 19l-2.5-5.5L4 11l5.5-2.5L12 3z" /></svg>),
  },
  {
    title: 'Blur Image',
    description: 'Apply an adjustable blur effect and download the result privately in your browser.',
    href: '/image-tools/blur',
    icon: (<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8m0-12.8L5.6 18.4" /></svg>),
  },
  {
    title: 'Image to Base64',
    description: 'Convert images to Base64 strings or data URLs for HTML, CSS, and JSON.',
    href: '/image-tools/base64',
    icon: (<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 5H5v14h3m8-14h3v14h-3M10 9l-3 3 3 3m4-6l3 3-3 3" /></svg>),
  },
];

export default function ImageToolsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: siteUrl('/') },
        { name: 'Image Tools', url: siteUrl('/image-tools') },
      ])} />
      <JsonLd data={faqSchema([
        {
          question: 'Are these image tools free?',
          answer: 'Yes. All image tools on DevToolsHub are completely free with no account required.',
        },
        {
          question: 'Are my images uploaded to your servers?',
          answer: 'No. All image processing happens entirely in your browser. Your images never leave your device.',
        },
        {
          question: 'What image formats are supported?',
          answer: 'All tools support JPEG, PNG, and WebP input. Output format depends on the tool.',
        },
        {
          question: 'Is there a file size limit?',
          answer: 'Each image can be up to 50 MB. Very large images may be slow on mobile devices.',
        },
        {
          question: 'Can I process multiple images at once?',
          answer: 'Yes. Compress, resize, convert, and rotate tools support batch processing with individual downloads.',
        },
      ])} />

      <section>
        <div className="flex items-center gap-3 mb-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400" aria-hidden="true">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </span>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Fast, Free &amp; Private Image Tools</h1>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl">
          Compress, resize, crop, convert, and rotate images directly in your browser. No uploads, no accounts, no limits.
        </p>
        <aside
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 px-3 py-2 text-xs text-green-800 dark:text-green-400"
          role="note"
          aria-label="Privacy notice"
        >
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          100% browser-based — images are never uploaded to our servers
        </aside>
      </section>

      <section aria-labelledby="tools-heading">
        <h2 id="tools-heading" className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          All Image Tools
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {IMAGE_TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group flex flex-col gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400" aria-hidden="true">
                  {tool.icon}
                </span>
                <span className="font-medium text-sm text-gray-900 dark:text-gray-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                  {tool.title}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{tool.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Why browser-based image tools?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">Complete privacy</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Your images never leave your device. No uploads, no cloud storage, no data leaks.</p>
          </div>
          <div>
            <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">Works offline</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Once the page loads, image processing works without an internet connection.</p>
          </div>
          <div>
            <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">No account required</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">No sign-up, no login, no subscription. Just open and use immediately.</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Frequently Asked Questions
        </h2>
        <dl className="space-y-4">
          {[
            {
              q: 'What image formats are supported?',
              a: 'JPEG, PNG, and WebP are supported for both input and output. AVIF input can be decoded in modern browsers but encoding is not yet universally supported, so it is not offered as an output format.',
            },
            {
              q: 'Will compressing an image always make it smaller?',
              a: 'Not always. Applying lossy compression to a PNG or already-compressed JPEG at a quality setting close to the original may produce a larger file. The compress tool shows the size comparison so you can decide whether to keep the result.',
            },
            {
              q: 'What happens to transparency when converting to JPEG?',
              a: 'JPEG does not support transparency. When converting a PNG or WebP with transparent regions to JPEG, the transparent areas are filled with white. The convert tool warns you when this is about to happen.',
            },
          ].map((item) => (
            <div key={item.q} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
              <dt className="font-medium text-sm text-gray-900 dark:text-gray-100">{item.q}</dt>
              <dd className="mt-1 text-xs text-gray-500 dark:text-gray-400">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
