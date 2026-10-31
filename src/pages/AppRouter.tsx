import * as React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../constants';
import { DashboardPage } from './Dashboard';
import { ListingDetailPage, ListingsPage } from './Listings';
import { CreateListingWizard } from './CreateListing';
import { CategoriesPage } from './Categories';
import { SellerProfilePage } from './SellerProfile';
import { FavoritesPage } from './Favorites';
import { WantedAdsPage } from './WantedAds';
import { MyListingsPage } from './MyListings';
import { MessagesPage } from './Messages';
import { ReviewsPage } from './Reviews';
import { ReportsPage } from './Reports';
import { AdminCenterPage } from './Admin';
import { SearchPage } from './Search';
import { SettingsPage } from './Settings';
import { HelpPage, PrivacyPage, TermsPage } from './Legal';

export interface IAppRouterProps {
  basename?: string;
}

export const AppRouter: React.FC<IAppRouterProps> = () => (
  <Routes>
    <Route path={ROUTES.Dashboard} element={<DashboardPage />} />
    <Route path={ROUTES.Listings} element={<ListingsPage />} />
    <Route path={ROUTES.ListingDetail} element={<ListingDetailPage />} />
    <Route path={ROUTES.CreateListing} element={<CreateListingWizard />} />
    <Route path={ROUTES.EditListing} element={<CreateListingWizard />} />
    <Route path={ROUTES.Categories} element={<CategoriesPage />} />
    <Route path={ROUTES.SellerProfile} element={<SellerProfilePage />} />
    <Route path={ROUTES.Favorites} element={<FavoritesPage />} />
    <Route path={ROUTES.WantedAds} element={<WantedAdsPage />} />
    <Route path={ROUTES.MyListings} element={<MyListingsPage />} />
    <Route path={ROUTES.Messages} element={<MessagesPage />} />
    <Route path={ROUTES.Reviews} element={<ReviewsPage />} />
    <Route path={ROUTES.Reports} element={<ReportsPage />} />
    <Route path={ROUTES.Admin} element={<AdminCenterPage />} />
    <Route path={ROUTES.Search} element={<SearchPage />} />
    <Route path={ROUTES.Settings} element={<SettingsPage />} />
    <Route path={ROUTES.Privacy} element={<PrivacyPage />} />
    <Route path={ROUTES.Terms} element={<TermsPage />} />
    <Route path={ROUTES.Help} element={<HelpPage />} />
    <Route path="*" element={<Navigate to={ROUTES.Dashboard} replace />} />
  </Routes>
);

export default AppRouter;
