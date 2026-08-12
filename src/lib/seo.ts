export function updatePageMeta({
  title,
  description,
  image,
}: {
  title?: string;
  description?: string;
  image?: string;
}) {
  const defaultTitle = "DUCHESSOT | Luxury Real Estate, Apartments & Short Lets in Ghana";
  const defaultDesc = "DUCHESSOT Real Estate & Apartments offers luxury homes for sale, executive apartments, penthouses, villas, and short lets in East Legon, Airport Hills, Cantonments, and Accra, Ghana.";

  const finalTitle = title ? `${title} | DUCHESSOT Real Estate` : defaultTitle;
  const finalDesc = description || defaultDesc;

  document.title = finalTitle;

  // Update Meta Description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute('content', finalDesc);
  }

  // Update OG Title
  let ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) {
    ogTitle.setAttribute('content', finalTitle);
  }

  // Update OG Description
  let ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) {
    ogDesc.setAttribute('content', finalDesc);
  }

  // Update Twitter Title
  let twitterTitle = document.querySelector('meta[name="twitter:title"]');
  if (twitterTitle) {
    twitterTitle.setAttribute('content', finalTitle);
  }

  // Update Twitter Description
  let twitterDesc = document.querySelector('meta[name="twitter:description"]');
  if (twitterDesc) {
    twitterDesc.setAttribute('content', finalDesc);
  }

  if (image) {
    let ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) ogImage.setAttribute('content', image);
    let twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (twitterImage) twitterImage.setAttribute('content', image);
  }
}
