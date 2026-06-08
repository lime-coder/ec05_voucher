export const generateSlug = (str: string): string => {
  // Convert to lower case
  let slug = str.toLowerCase();

  // Remove accents/diacritics
  slug = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Replace spaces with hyphens
  slug = slug.replace(/\s+/g, '-');

  // Remove all non-word chars (alphanumeric and hyphens allowed)
  slug = slug.replace(/[^\w\-]+/g, '');

  // Replace multiple hyphens with single hyphen
  slug = slug.replace(/\-\-+/g, '-');

  // Trim hyphens from start and end
  slug = slug.replace(/^-+/, '').replace(/-+$/, '');

  return slug;
};
