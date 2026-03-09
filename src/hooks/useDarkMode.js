import { useState, useEffect } from 'react';

/**
 * Custom hook for global dark mode using localStorage.
 * When toggled in the Sidebar, it persists across all pages.
 */
const useDarkMode = () => {
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('eram-darkmode') === 'true';
    });

    useEffect(() => {
        localStorage.setItem('eram-darkmode', darkMode);
        document.body.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    return [darkMode, setDarkMode];
};

export default useDarkMode;
