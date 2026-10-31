import { ILocalizationStrings } from '../interfaces';

export interface IAppStrings extends ILocalizationStrings {
  app: {
    name: string;
    version: string;
    loading: string;
    error: string;
    retry: string;
    noResults: string;
    viewAll: string;
    learnMore: string;
  };
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    create: string;
    update: string;
    submit: string;
    confirm: string;
    close: string;
    back: string;
    next: string;
    previous: string;
    search: string;
    filter: string;
    sort: string;
    clear: string;
    reset: string;
    apply: string;
    yes: string;
    no: string;
    ok: string;
    loading: string;
    saving: string;
    deleting: string;
    required: string;
    optional: string;
    selectAll: string;
    deselectAll: string;
    showMore: string;
    showLess: string;
    copyLink: string;
    linkCopied: string;
    share: string;
    export: string;
    import: string;
    refresh: string;
    actions: string;
    details: string;
    status: string;
    date: string;
    time: string;
    from: string;
    to: string;
    all: string;
    none: string;
    unknown: string;
    notAvailable: string;
  };
  navigation: {
    dashboard: string;
    listings: string;
    createListing: string;
    myListings: string;
    favorites: string;
    wantedAds: string;
    messages: string;
    reviews: string;
    reports: string;
    categories: string;
    search: string;
    admin: string;
    settings: string;
    help: string;
    privacy: string;
    terms: string;
    sellerProfile: string;
  };
  dashboard: {
    title: string;
    welcome: string;
    welcomeMessage: string;
    stats: {
      totalListings: string;
      activeListings: string;
      pendingApprovals: string;
      totalUsers: string;
      messagesToday: string;
      viewsToday: string;
    };
    featuredListings: string;
    newestListings: string;
    trendingListings: string;
    topCategories: string;
    recentActivity: string;
    quickActions: string;
    createNewListing: string;
    browseCategories: string;
    viewMessages: string;
    noFeaturedListings: string;
    noRecentActivity: string;
    announcements: string;
  };
  listings: {
    title: string;
    allListings: string;
    myListings: string;
    featured: string;
    newest: string;
    trending: string;
    related: string;
    noListings: string;
    noListingsDescription: string;
    loadMore: string;
    endOfResults: string;
    viewDetails: string;
    contactSeller: string;
    addToFavorites: string;
    removeFromFavorites: string;
    reportListing: string;
    shareListing: string;
    reserveListing: string;
    markAsSold: string;
    renewListing: string;
    archiveListing: string;
    duplicateListing: string;
    views: string;
    favorites: string;
    messages: string;
    postedOn: string;
    expiresOn: string;
    soldOn: string;
    reservedBy: string;
    seller: string;
    category: string;
    condition: string;
    location: string;
    price: string;
    negotiable: string;
    free: string;
    donation: string;
    rental: string;
    auction: string;
    pickupAvailable: string;
    shippingAvailable: string;
    tags: string;
    description: string;
    specifications: string;
    gallery: string;
    noImages: string;
    primaryImage: string;
    status: {
      draft: string;
      pending: string;
      approved: string;
      rejected: string;
      expired: string;
      archived: string;
      reserved: string;
      sold: string;
    };
    type: {
      sell: string;
      buy: string;
      rent: string;
      exchange: string;
      donate: string;
      wanted: string;
    };
    conditionValues: {
      new: string;
      likeNew: string;
      good: string;
      fair: string;
      poor: string;
    };
    sortOptions: {
      newest: string;
      oldest: string;
      priceLow: string;
      priceHigh: string;
      mostViewed: string;
      mostFavorited: string;
      relevance: string;
    };
    viewModes: {
      grid: string;
      list: string;
      compact: string;
      gallery: string;
    };
    filters: {
      title: string;
      category: string;
      department: string;
      location: string;
      condition: string;
      priceRange: string;
      minPrice: string;
      maxPrice: string;
      listingType: string;
      status: string;
      tags: string;
      dateRange: string;
      featuredOnly: string;
      clearFilters: string;
      activeFilters: string;
    };
  };
  createWizard: {
    title: string;
    editTitle: string;
    steps: {
      category: string;
      details: string;
      images: string;
      pricing: string;
      location: string;
      review: string;
    };
    categoryStep: {
      title: string;
      description: string;
      selectCategory: string;
      approvalRequired: string;
    };
    detailsStep: {
      title: string;
      listingTitle: string;
      listingTitlePlaceholder: string;
      description: string;
      descriptionPlaceholder: string;
      keywords: string;
      keywordsPlaceholder: string;
      tags: string;
      tagsPlaceholder: string;
      listingType: string;
      condition: string;
      aiGenerateTitle: string;
      aiGenerateDescription: string;
      aiImprove: string;
    };
    imagesStep: {
      title: string;
      description: string;
      uploadImages: string;
      dragDrop: string;
      maxImages: string;
      maxSize: string;
      setPrimary: string;
      removeImage: string;
      reorderImages: string;
    };
    pricingStep: {
      title: string;
      price: string;
      currency: string;
      negotiable: string;
      isRental: string;
      isAuction: string;
      isDonation: string;
    };
    locationStep: {
      title: string;
      selectLocation: string;
      building: string;
      city: string;
      country: string;
      pickupAvailable: string;
      shippingAvailable: string;
    };
    reviewStep: {
      title: string;
      description: string;
      submitForApproval: string;
      saveDraft: string;
      publish: string;
      moderationPending: string;
    };
    validation: {
      titleRequired: string;
      titleMinLength: string;
      titleMaxLength: string;
      descriptionRequired: string;
      descriptionMinLength: string;
      categoryRequired: string;
      priceInvalid: string;
      imagesRequired: string;
    };
    success: {
      created: string;
      updated: string;
      draftSaved: string;
      submitted: string;
    };
  };
  favorites: {
    title: string;
    myFavorites: string;
    collections: string;
    createCollection: string;
    collectionName: string;
    collectionDescription: string;
    addToCollection: string;
    removeFromCollection: string;
    notifyOnChange: string;
    noFavorites: string;
    noFavoritesDescription: string;
    addedToFavorites: string;
    removedFromFavorites: string;
    defaultCollection: string;
  };
  wantedAds: {
    title: string;
    createWantedAd: string;
    myWantedAds: string;
    noWantedAds: string;
    maxPrice: string;
    matchCount: string;
    active: string;
    inactive: string;
    description: string;
  };
  messages: {
    title: string;
    inbox: string;
    sent: string;
    compose: string;
    newMessage: string;
    reply: string;
    send: string;
    subject: string;
    body: string;
    attachment: string;
    noMessages: string;
    noConversations: string;
    unread: string;
    markAsRead: string;
    markAllAsRead: string;
    deleteConversation: string;
    aboutListing: string;
    messageSent: string;
    messageFailed: string;
    typeMessage: string;
  };
  reviews: {
    title: string;
    writeReview: string;
    rating: string;
    comment: string;
    submitReview: string;
    noReviews: string;
    averageRating: string;
    reviewCount: string;
    moderated: string;
    reported: string;
    thankYou: string;
  };
  reports: {
    title: string;
    reportListing: string;
    reportType: string;
    reason: string;
    submitReport: string;
    types: {
      spam: string;
      duplicate: string;
      fraud: string;
      inappropriate: string;
      other: string;
    };
    status: {
      pending: string;
      reviewed: string;
      dismissed: string;
      actionTaken: string;
    };
    noReports: string;
    reportSubmitted: string;
    adminNotes: string;
  };
  search: {
    title: string;
    placeholder: string;
    recentSearches: string;
    clearHistory: string;
    suggestions: string;
    noSuggestions: string;
    resultsFor: string;
    resultCount: string;
    savedSearches: string;
    saveSearch: string;
    notifyOnMatch: string;
    aiSuggestions: string;
  };
  categories: {
    title: string;
    allCategories: string;
    browseByCategory: string;
    listingCount: string;
    noCategories: string;
    subcategories: string;
    parentCategory: string;
  };
  sellerProfile: {
    title: string;
    listings: string;
    reviews: string;
    rating: string;
    memberSince: string;
    department: string;
    office: string;
    jobTitle: string;
    bio: string;
    contactSeller: string;
    followSeller: string;
    listingCount: string;
    soldCount: string;
    reviewCount: string;
  };
  admin: {
    title: string;
    dashboard: string;
    approvalQueue: string;
    moderation: string;
    reports: string;
    users: string;
    settings: string;
    activityLog: string;
    announcements: string;
    featureRequests: string;
    analytics: string;
    branding: string;
    emailTemplates: string;
    provisioning: string;
    approvalQueueTitle: string;
    pendingCount: string;
    approve: string;
    reject: string;
    approvalNotes: string;
    approved: string;
    rejected: string;
    bulkActions: string;
    selectItems: string;
    activityLogTitle: string;
    action: string;
    entityType: string;
    entityId: string;
    user: string;
    timestamp: string;
    announcementsTitle: string;
    createAnnouncement: string;
    announcementTitle: string;
    announcementBody: string;
    startDate: string;
    endDate: string;
    priority: string;
    isActive: string;
    featureRequestsTitle: string;
    submitFeatureRequest: string;
    votes: string;
    status: {
      open: string;
      planned: string;
      inProgress: string;
      completed: string;
      declined: string;
    };
    settingsCategories: {
      general: string;
      branding: string;
      email: string;
      approval: string;
      ai: string;
      storage: string;
      retention: string;
      notifications: string;
      teams: string;
      license: string;
    };
    aiSettings: {
      title: string;
      enableGeneration: string;
      enableModeration: string;
      enableDuplicateDetection: string;
      endpoint: string;
      deploymentName: string;
    };
  };
  settings: {
    title: string;
    general: string;
    notifications: string;
    privacy: string;
    appearance: string;
    language: string;
    theme: string;
    themeLight: string;
    themeDark: string;
    themeSystem: string;
    telemetry: string;
    telemetryOptIn: string;
    telemetryDescription: string;
    saved: string;
  };
  permissions: {
    accessDenied: string;
    adminRequired: string;
    moderatorRequired: string;
    approverRequired: string;
    ownerRequired: string;
    insufficientPermissions: string;
  };
  notifications: {
    title: string;
    markAsRead: string;
    markAllAsRead: string;
    noNotifications: string;
    types: {
      message: string;
      approval: string;
      expiration: string;
      match: string;
      review: string;
      system: string;
      sold: string;
      reserved: string;
    };
  };
  onboarding: {
    title: string;
    subtitle: string;
    checkingStatus: string;
    adminRequired: string;
    groupsIntro: string;
    seedTitle: string;
    seedDescription: string;
    ownersDescription: string;
    moderatorsDescription: string;
    approversDescription: string;
    contributorsDescription: string;
    visitorsDescription: string;
    startButton: string;
    running: string;
    continueButton: string;
    completeMessage: string;
    setupFailed: string;
    close: string;
    completeSetup: string;
    viewInSettings: string;
    setupRequired: string;
    setupNotCompleteContext: string;
    setupCompleteLoading: string;
    setupMayTakeTimeProgress: string;
    dedicatedSubsiteTitle: string;
    dedicatedSubsiteMessage: string;
    teamsTabTitle: string;
    teamsTabMessage: string;
    setupIncomplete: string;
    editModeReady: string;
    editModeStepFinishLayout: string;
    editModeStepPublishPrefix: string;
    editModeStepPublishAction: string;
    editModeStepPublishSuffix: string;
    editModeStepReturn: string;
    editModeSetupNote: string;
    editModeCanSetup: string;
    wizard: {
      welcome: string;
      groups: string;
      setup: string;
      next: string;
      back: string;
      welcomeBody: string;
      groupsBody: string;
      listingsTitle: string;
      listingsBody: string;
      searchTitle: string;
      searchBody: string;
      moderateTitle: string;
      moderateBody: string;
      listsTitle: string;
      listsBody: string;
      readyTitle: string;
      readyBody: string;
    };
  };
  errors: {
    generic: string;
    network: string;
    notFound: string;
    unauthorized: string;
    validation: string;
    uploadFailed: string;
    saveFailed: string;
    deleteFailed: string;
    loadFailed: string;
    tryAgain: string;
  };
  help: {
    title: string;
    gettingStarted: string;
    faq: string;
    contactSupport: string;
    documentation: string;
  };
  privacy: {
    title: string;
    lastUpdated: string;
  };
  terms: {
    title: string;
    lastUpdated: string;
  };
}

export const enUsStrings: IAppStrings = {
  app: {
    name: 'Enterprise Classifieds 365',
    version: '1.0.0',
    loading: 'Loading...',
    error: 'Something went wrong',
    retry: 'Try again',
    noResults: 'No results found',
    viewAll: 'View all',
    learnMore: 'Learn more'
  },
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    update: 'Update',
    submit: 'Submit',
    confirm: 'Confirm',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    clear: 'Clear',
    reset: 'Reset',
    apply: 'Apply',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    loading: 'Loading...',
    saving: 'Saving...',
    deleting: 'Deleting...',
    required: 'Required',
    optional: 'Optional',
    selectAll: 'Select all',
    deselectAll: 'Deselect all',
    showMore: 'Show more',
    showLess: 'Show less',
    copyLink: 'Copy link',
    linkCopied: 'Link copied to clipboard',
    share: 'Share',
    export: 'Export',
    import: 'Import',
    refresh: 'Refresh',
    actions: 'Actions',
    details: 'Details',
    status: 'Status',
    date: 'Date',
    time: 'Time',
    from: 'From',
    to: 'To',
    all: 'All',
    none: 'None',
    unknown: 'Unknown',
    notAvailable: 'N/A'
  },
  navigation: {
    dashboard: 'Dashboard',
    listings: 'Listings',
    createListing: 'Create Listing',
    myListings: 'My Listings',
    favorites: 'Favorites',
    wantedAds: 'Wanted Ads',
    messages: 'Messages',
    reviews: 'Reviews',
    reports: 'Reports',
    categories: 'Categories',
    search: 'Search',
    admin: 'Admin',
    settings: 'Settings',
    help: 'Help',
    privacy: 'Privacy',
    terms: 'Terms',
    sellerProfile: 'Seller Profile'
  },
  dashboard: {
    title: 'Dashboard',
    welcome: 'Welcome, {name}',
    welcomeMessage: 'Browse listings, manage your ads, and connect with colleagues.',
    stats: {
      totalListings: 'Total Listings',
      activeListings: 'Active Listings',
      pendingApprovals: 'Pending Approvals',
      totalUsers: 'Total Users',
      messagesToday: 'Messages Today',
      viewsToday: 'Views Today'
    },
    featuredListings: 'Featured Listings',
    newestListings: 'Newest Listings',
    trendingListings: 'Trending Listings',
    topCategories: 'Top Categories',
    recentActivity: 'Recent Activity',
    quickActions: 'Quick Actions',
    createNewListing: 'Create New Listing',
    browseCategories: 'Browse Categories',
    viewMessages: 'View Messages',
    noFeaturedListings: 'No featured listings available',
    noRecentActivity: 'No recent activity',
    announcements: 'Announcements'
  },
  listings: {
    title: 'Listings',
    allListings: 'All Listings',
    myListings: 'My Listings',
    featured: 'Featured',
    newest: 'Newest',
    trending: 'Trending',
    related: 'Related Listings',
    noListings: 'No listings found',
    noListingsDescription: 'Try adjusting your filters or create a new listing.',
    loadMore: 'Load more',
    endOfResults: 'You have reached the end of the results',
    viewDetails: 'View details',
    contactSeller: 'Contact seller',
    addToFavorites: 'Add to favorites',
    removeFromFavorites: 'Remove from favorites',
    reportListing: 'Report listing',
    shareListing: 'Share listing',
    reserveListing: 'Reserve listing',
    markAsSold: 'Mark as sold',
    renewListing: 'Renew listing',
    archiveListing: 'Archive listing',
    duplicateListing: 'Duplicate listing',
    views: 'Views',
    favorites: 'Favorites',
    messages: 'Messages',
    postedOn: 'Posted on',
    expiresOn: 'Expires on',
    soldOn: 'Sold on',
    reservedBy: 'Reserved by',
    seller: 'Seller',
    category: 'Category',
    condition: 'Condition',
    location: 'Location',
    price: 'Price',
    negotiable: 'Negotiable',
    free: 'Free',
    donation: 'Donation',
    rental: 'Rental',
    auction: 'Auction',
    pickupAvailable: 'Pickup available',
    shippingAvailable: 'Shipping available',
    tags: 'Tags',
    description: 'Description',
    specifications: 'Specifications',
    gallery: 'Gallery',
    noImages: 'No images available',
    primaryImage: 'Primary image',
    status: {
      draft: 'Draft',
      pending: 'Pending Approval',
      approved: 'Approved',
      rejected: 'Rejected',
      expired: 'Expired',
      archived: 'Archived',
      reserved: 'Reserved',
      sold: 'Sold'
    },
    type: {
      sell: 'For Sale',
      buy: 'Looking to Buy',
      rent: 'For Rent',
      exchange: 'Exchange',
      donate: 'Donation',
      wanted: 'Wanted'
    },
    conditionValues: {
      new: 'New',
      likeNew: 'Like New',
      good: 'Good',
      fair: 'Fair',
      poor: 'Poor'
    },
    sortOptions: {
      newest: 'Newest first',
      oldest: 'Oldest first',
      priceLow: 'Price: Low to High',
      priceHigh: 'Price: High to Low',
      mostViewed: 'Most viewed',
      mostFavorited: 'Most favorited',
      relevance: 'Relevance'
    },
    viewModes: {
      grid: 'Grid view',
      list: 'List view',
      compact: 'Compact view',
      gallery: 'Gallery view'
    },
    filters: {
      title: 'Filters',
      category: 'Category',
      department: 'Department',
      location: 'Location',
      condition: 'Condition',
      priceRange: 'Price range',
      minPrice: 'Min price',
      maxPrice: 'Max price',
      listingType: 'Listing type',
      status: 'Status',
      tags: 'Tags',
      dateRange: 'Date range',
      featuredOnly: 'Featured only',
      clearFilters: 'Clear filters',
      activeFilters: 'Active filters'
    }
  },
  createWizard: {
    title: 'Create Listing',
    editTitle: 'Edit Listing',
    steps: {
      category: 'Category',
      details: 'Details',
      images: 'Images',
      pricing: 'Pricing',
      location: 'Location',
      review: 'Review'
    },
    categoryStep: {
      title: 'Select a category',
      description: 'Choose the category that best describes your item.',
      selectCategory: 'Select category',
      approvalRequired: 'Listings in this category require approval before publishing.'
    },
    detailsStep: {
      title: 'Listing details',
      listingTitle: 'Title',
      listingTitlePlaceholder: 'Enter a descriptive title',
      description: 'Description',
      descriptionPlaceholder: 'Describe your item in detail',
      keywords: 'Keywords',
      keywordsPlaceholder: 'Comma-separated keywords for search',
      tags: 'Tags',
      tagsPlaceholder: 'Add tags',
      listingType: 'Listing type',
      condition: 'Condition',
      aiGenerateTitle: 'Generate title with AI',
      aiGenerateDescription: 'Generate description with AI',
      aiImprove: 'Improve with AI'
    },
    imagesStep: {
      title: 'Upload images',
      description: 'Add up to {max} images. The first image will be the primary photo.',
      uploadImages: 'Upload images',
      dragDrop: 'Drag and drop images here, or click to browse',
      maxImages: 'Maximum {max} images allowed',
      maxSize: 'Maximum file size: {size} MB',
      setPrimary: 'Set as primary',
      removeImage: 'Remove image',
      reorderImages: 'Drag to reorder images'
    },
    pricingStep: {
      title: 'Pricing',
      price: 'Price',
      currency: 'Currency',
      negotiable: 'Price is negotiable',
      isRental: 'This is a rental listing',
      isAuction: 'This is an auction listing',
      isDonation: 'This is a donation (free)'
    },
    locationStep: {
      title: 'Location & delivery',
      selectLocation: 'Select location',
      building: 'Building',
      city: 'City',
      country: 'Country',
      pickupAvailable: 'Pickup available',
      shippingAvailable: 'Shipping available'
    },
    reviewStep: {
      title: 'Review and submit',
      description: 'Review your listing details before submitting.',
      submitForApproval: 'Submit for approval',
      saveDraft: 'Save as draft',
      publish: 'Publish listing',
      moderationPending: 'Your listing will be reviewed before it appears publicly.'
    },
    validation: {
      titleRequired: 'Title is required',
      titleMinLength: 'Title must be at least 3 characters',
      titleMaxLength: 'Title must not exceed 200 characters',
      descriptionRequired: 'Description is required',
      descriptionMinLength: 'Description must be at least 10 characters',
      categoryRequired: 'Please select a category',
      priceInvalid: 'Please enter a valid price',
      imagesRequired: 'At least one image is required'
    },
    success: {
      created: 'Listing created successfully',
      updated: 'Listing updated successfully',
      draftSaved: 'Draft saved successfully',
      submitted: 'Listing submitted for approval'
    }
  },
  favorites: {
    title: 'Favorites',
    myFavorites: 'My Favorites',
    collections: 'Collections',
    createCollection: 'Create collection',
    collectionName: 'Collection name',
    collectionDescription: 'Description',
    addToCollection: 'Add to collection',
    removeFromCollection: 'Remove from collection',
    notifyOnChange: 'Notify me of price changes',
    noFavorites: 'No favorites yet',
    noFavoritesDescription: 'Save listings you are interested in to find them quickly later.',
    addedToFavorites: 'Added to favorites',
    removedFromFavorites: 'Removed from favorites',
    defaultCollection: 'Default collection'
  },
  wantedAds: {
    title: 'Wanted Ads',
    createWantedAd: 'Create wanted ad',
    myWantedAds: 'My wanted ads',
    noWantedAds: 'No wanted ads found',
    maxPrice: 'Maximum price',
    matchCount: '{count} matches',
    active: 'Active',
    inactive: 'Inactive',
    description: 'Post what you are looking for and get notified when matching listings appear.'
  },
  messages: {
    title: 'Messages',
    inbox: 'Inbox',
    sent: 'Sent',
    compose: 'Compose',
    newMessage: 'New message',
    reply: 'Reply',
    send: 'Send',
    subject: 'Subject',
    body: 'Message',
    attachment: 'Attachment',
    noMessages: 'No messages',
    noConversations: 'No conversations yet',
    unread: 'Unread',
    markAsRead: 'Mark as read',
    markAllAsRead: 'Mark all as read',
    deleteConversation: 'Delete conversation',
    aboutListing: 'About listing',
    messageSent: 'Message sent successfully',
    messageFailed: 'Failed to send message',
    typeMessage: 'Type a message...'
  },
  reviews: {
    title: 'Reviews',
    writeReview: 'Write a review',
    rating: 'Rating',
    comment: 'Comment',
    submitReview: 'Submit review',
    noReviews: 'No reviews yet',
    averageRating: 'Average rating',
    reviewCount: '{count} reviews',
    moderated: 'This review is pending moderation',
    reported: 'This review has been reported',
    thankYou: 'Thank you for your review'
  },
  reports: {
    title: 'Reports',
    reportListing: 'Report this listing',
    reportType: 'Report type',
    reason: 'Reason',
    submitReport: 'Submit report',
    types: {
      spam: 'Spam',
      duplicate: 'Duplicate listing',
      fraud: 'Suspected fraud',
      inappropriate: 'Inappropriate content',
      other: 'Other'
    },
    status: {
      pending: 'Pending review',
      reviewed: 'Reviewed',
      dismissed: 'Dismissed',
      actionTaken: 'Action taken'
    },
    noReports: 'No reports found',
    reportSubmitted: 'Report submitted successfully',
    adminNotes: 'Admin notes'
  },
  search: {
    title: 'Search',
    placeholder: 'Search listings, categories, tags...',
    recentSearches: 'Recent searches',
    clearHistory: 'Clear history',
    suggestions: 'Suggestions',
    noSuggestions: 'No suggestions',
    resultsFor: 'Results for "{query}"',
    resultCount: '{count} results',
    savedSearches: 'Saved searches',
    saveSearch: 'Save this search',
    notifyOnMatch: 'Notify me when new matches appear',
    aiSuggestions: 'AI suggestions'
  },
  categories: {
    title: 'Categories',
    allCategories: 'All Categories',
    browseByCategory: 'Browse by category',
    listingCount: '{count} listings',
    noCategories: 'No categories available',
    subcategories: 'Subcategories',
    parentCategory: 'Parent category'
  },
  sellerProfile: {
    title: 'Seller Profile',
    listings: 'Listings',
    reviews: 'Reviews',
    rating: 'Rating',
    memberSince: 'Member since',
    department: 'Department',
    office: 'Office',
    jobTitle: 'Job title',
    bio: 'Bio',
    contactSeller: 'Contact seller',
    followSeller: 'Follow seller',
    listingCount: '{count} listings',
    soldCount: '{count} sold',
    reviewCount: '{count} reviews'
  },
  admin: {
    title: 'Administration',
    dashboard: 'Admin Dashboard',
    approvalQueue: 'Approval Queue',
    moderation: 'Moderation',
    reports: 'Reports',
    users: 'Users',
    settings: 'Settings',
    activityLog: 'Activity Log',
    announcements: 'Announcements',
    featureRequests: 'Feature Requests',
    analytics: 'Analytics',
    branding: 'Branding',
    emailTemplates: 'Email Templates',
    provisioning: 'Provisioning',
    approvalQueueTitle: 'Pending Approvals',
    pendingCount: '{count} pending',
    approve: 'Approve',
    reject: 'Reject',
    approvalNotes: 'Approval notes',
    approved: 'Approved',
    rejected: 'Rejected',
    bulkActions: 'Bulk actions',
    selectItems: 'Select items',
    activityLogTitle: 'Activity Log',
    action: 'Action',
    entityType: 'Entity type',
    entityId: 'Entity ID',
    user: 'User',
    timestamp: 'Timestamp',
    announcementsTitle: 'Manage Announcements',
    createAnnouncement: 'Create announcement',
    announcementTitle: 'Title',
    announcementBody: 'Body',
    startDate: 'Start date',
    endDate: 'End date',
    priority: 'Priority',
    isActive: 'Active',
    featureRequestsTitle: 'Feature Requests',
    submitFeatureRequest: 'Submit feature request',
    votes: 'Votes',
    status: {
      open: 'Open',
      planned: 'Planned',
      inProgress: 'In Progress',
      completed: 'Completed',
      declined: 'Declined'
    },
    settingsCategories: {
      general: 'General',
      branding: 'Branding',
      email: 'Email',
      approval: 'Approval',
      ai: 'AI',
      storage: 'Storage',
      retention: 'Retention',
      notifications: 'Notifications',
      teams: 'Teams',
      license: 'License'
    },
    aiSettings: {
      title: 'AI Settings',
      enableGeneration: 'Enable AI content generation',
      enableModeration: 'Enable AI moderation',
      enableDuplicateDetection: 'Enable duplicate detection',
      endpoint: 'AI endpoint',
      deploymentName: 'Deployment name'
    }
  },
  settings: {
    title: 'Settings',
    general: 'General',
    notifications: 'Notifications',
    privacy: 'Privacy',
    appearance: 'Appearance',
    language: 'Language',
    theme: 'Theme',
    themeLight: 'Light',
    themeDark: 'Dark',
    themeSystem: 'System',
    telemetry: 'Telemetry',
    telemetryOptIn: 'Share anonymous usage data',
    telemetryDescription: 'Help us improve Enterprise Classifieds 365 by sharing anonymous usage data.',
    saved: 'Settings saved'
  },
  permissions: {
    accessDenied: 'Access denied',
    adminRequired: 'Administrator access is required',
    moderatorRequired: 'Moderator access is required',
    approverRequired: 'Approver access is required',
    ownerRequired: 'You must be the owner of this item',
    insufficientPermissions: 'You do not have permission to perform this action'
  },
  notifications: {
    title: 'Notifications',
    markAsRead: 'Mark as read',
    markAllAsRead: 'Mark all as read',
    noNotifications: 'No notifications',
    types: {
      message: 'New message',
      approval: 'Approval update',
      expiration: 'Listing expiring',
      match: 'New match',
      review: 'New review',
      system: 'System notification',
      sold: 'Item sold',
      reserved: 'Item reserved'
    }
  },
  onboarding: {
    title: 'Welcome to Enterprise Classifieds 365',
    subtitle: 'One-time setup for this site.',
    checkingStatus: 'Checking onboarding status...',
    adminRequired: 'A site owner must complete onboarding before others can use the application.',
    groupsIntro: 'The following SharePoint security groups will be created and seeded with default members:',
    seedTitle: 'Automatic member seeding',
    seedDescription: 'Owners receive site admins and the current user. Contributors receive site members. Visitors receive everyone except external users and the site visitors group.',
    ownersDescription: 'Full control over settings, security, lists, and all marketplace content.',
    moderatorsDescription: 'Moderate listings, reviews, reports, announcements, and approval workflows.',
    approversDescription: 'Review and approve or reject pending listings in the approval queue.',
    contributorsDescription: 'Create and manage listings, messages, favorites, saved searches, and wanted ads.',
    visitorsDescription: 'Read-only access to published listings, categories, locations, and help content.',
    startButton: 'Start onboarding',
    running: 'Provisioning...',
    continueButton: 'Continue to app',
    completeMessage: 'Onboarding completed successfully. Enterprise Classifieds 365 is ready to use.',
    setupFailed: 'Setup failed. Review the steps above and try again.',
    close: 'Close setup',
    completeSetup: 'Complete setup',
    viewInSettings: 'View in Settings',
    setupRequired: 'Setup required',
    setupNotCompleteContext: 'SharePoint lists, libraries, and security groups must be provisioned before the marketplace can be used.',
    setupCompleteLoading: 'Setup complete. Loading your marketplace...',
    setupMayTakeTimeProgress: 'This may take a few minutes. Please keep this page open while provisioning runs.',
    dedicatedSubsiteTitle: 'Use a dedicated workspace',
    dedicatedSubsiteMessage: 'Run setup on its own SharePoint subsite (for example, /sites/YourSite/Classifieds) so marketplace data stays separate from other team or communication site content.',
    teamsTabTitle: 'Microsoft Teams tab',
    teamsTabMessage: 'This tab reads and writes data in the backing SharePoint site for this team. Complete setup on that site before using {appName} in Teams.',
    setupIncomplete: 'Setup is not complete for this site.',
    editModeReady: 'This web part is ready. Publish the page to start the one-time setup wizard that creates your SharePoint lists, libraries, and security groups for your internal marketplace.',
    editModeStepFinishLayout: 'Finish editing the page layout',
    editModeStepPublishPrefix: 'Click',
    editModeStepPublishAction: 'Publish',
    editModeStepPublishSuffix: ' (or Republish)',
    editModeStepReturn: 'Return to this page — setup will begin automatically',
    editModeSetupNote: 'Setup does not run while the page is in edit mode.',
    editModeCanSetup: 'This page is in edit mode. Start setup here, then publish the page so the web part stays in place.',
    wizard: {
      welcome: 'Welcome',
      groups: 'Access',
      setup: 'Setup',
      next: 'Next',
      back: 'Back',
      welcomeBody: 'People in your organization can post items, find them, and message each other.',
      groupsBody: 'Owners, moderators, and members get access. You can change that later in SharePoint.',
      listingsTitle: 'Listings',
      listingsBody: 'Employees post items for sale, rent, donation, or wanted ads.',
      searchTitle: 'Search and messages',
      searchBody: 'People find listings, save favorites, and message sellers.',
      moderateTitle: 'Moderation',
      moderateBody: 'Owners and moderators review reports and approve listings.',
      listsTitle: 'Lists and libraries',
      listsBody: 'Setup creates the marketplace lists, image and document libraries, and the settings record for this site.',
      readyTitle: 'Ready to provision',
      readyBody: 'Start setup to create the marketplace on this site. Keep this page open while it runs.'
    }
  },
  errors: {
    generic: 'An unexpected error occurred',
    network: 'Network error. Please check your connection.',
    notFound: 'The requested item was not found',
    unauthorized: 'You are not authorized to perform this action',
    validation: 'Please correct the validation errors',
    uploadFailed: 'File upload failed',
    saveFailed: 'Failed to save changes',
    deleteFailed: 'Failed to delete item',
    loadFailed: 'Failed to load data',
    tryAgain: 'Please try again'
  },
  help: {
    title: 'Help',
    gettingStarted: 'Getting started',
    faq: 'Frequently asked questions',
    contactSupport: 'Contact support',
    documentation: 'Documentation'
  },
  privacy: {
    title: 'Privacy Policy',
    lastUpdated: 'Last updated: {date}'
  },
  terms: {
    title: 'Terms of Service',
    lastUpdated: 'Last updated: {date}'
  }
};
