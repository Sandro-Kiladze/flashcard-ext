// webapp/src/components/Navigation.tsx

import React from 'react';

type Page = 'review' | 'create' | 'stats';

interface NavigationProps {
  currentPage: Page;
  onChangePage: (page: Page) => void;
}

/**
 * Component for app navigation between main pages
 */
const Navigation: React.FC<NavigationProps> = ({ currentPage, onChangePage }) => {
  /**
   * Determine if a nav item is active
   * @param page Page to check
   * @returns CSS classes for the nav item
   */
  const getNavItemClasses = (page: Page) => {
    return `px-4 py-2 rounded-lg transition-colors ${
      currentPage === page
        ? 'bg-blue-500 text-white font-medium'
        : 'text-gray-700 hover:bg-gray-100'
    }`;
  };

  return (
    <nav className="flex space-x-2">
      <button
        className={getNavItemClasses('review')}
        onClick={() => onChangePage('review')}
      >
        Review Flashcards
      </button>
      <button
        className={getNavItemClasses('create')}
        onClick={() => onChangePage('create')}
      >
        Create Flashcards
      </button>
      <button
        className={getNavItemClasses('stats')}
        onClick={() => onChangePage('stats')}
      >
        Statistics
      </button>
    </nav>
  );
};

export default Navigation;