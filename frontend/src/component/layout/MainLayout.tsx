import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header/Header';

/**
 * MainLayout Component
 * 
 * Implements the main structure of the application using the composite pattern.
 * It ensures the Header is present on all child routes.
 */
export const MainLayout: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
                <Outlet />
            </main>

        </div>
    );
};
