/**
 * Utility function for humanizing URL slugs
 * Converts kebab-case to Title Case
 * 
 * @example
 * humanizeSlug('my-new-page') // 'My New Page'
 * humanizeSlug('user-settings') // 'User Settings'
 */
export const humanizeSlug = (slug: string): string => {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

