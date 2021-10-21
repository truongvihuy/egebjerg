const navigationConfig = [
  {
    id: 'shop',
    title: 'Shop',
    translate: 'Shop',
    type: 'group',
    children: [
      {
        id: 'order',
        title: 'Order',
        translate: 'Ordrer',
        type: 'item',
        icon: 'library_books',
        url: '/order'
      },
      {
        id: 'create_order',
        title: 'Create order',
        translate: 'Opret ordre',
        type: 'item',
        icon: 'add_shopping_cart',
        url: '/create-order'
      },
      {
        id: 'product',
        title: 'Product',
        translate: 'Produkter',
        type: 'item',
        icon: 'fastfood',
        url: '/product'
      },
      {
        id: 'customer',
        title: 'Customer',
        translate: 'Kunder',
        type: 'item',
        icon: 'emoji_people',
        url: '/customer'
      },
      {
        id: 'newspaper',
        title: 'Newspaper',
        translate: 'Tilbudsavis',
        type: 'item',
        icon: 'pages',
        url: '/newspaper'
      },
      {
        id: 'tag',
        title: 'Tag',
        translate: 'Tag',
        type: 'item',
        icon: 'local_offer',
        url: '/tag'
      },
      {
        id: 'report',
        title: 'Report',
        translate: 'Rapport',
        type: 'item',
        icon: 'assessment',
        url: '/report'
      },
    ]
  },
  {
    id: 'settings',
    title: 'Settings',
    translate: 'Indstillinger',
    type: 'group',
    icon: 'shopping_cart',
    children: [
      {
        id: 'setting',
        title: 'General',
        translate: 'Generel indstilling',
        type: 'item',
        icon: 'settings',
        url: '/setting'
      },
      {
        id: 'pbs',
        title: 'PBS',
        translate: 'PBS',
        type: 'item',
        icon: 'account_balance',
        url: '/pbs'
      },
      {
        id: 'user_group/user',
        title: 'User Group/User',
        translate: 'Bruger/grupper',
        type: 'collapse',
        icon: 'verified_user',
        children: [
          {
            id: 'user',
            title: 'User',
            translate: 'Bruger',
            type: 'item',
            icon: 'person',
            url: '/user'
          },
          {
            id: 'user_group',
            title: 'User Group',
            translate: 'Grupper',
            type: 'item',
            icon: 'groups',
            url: '/user-group'
          }
        ]
      },
      {
        id: 'brand',
        title: 'Brand',
        translate: 'Producent',
        type: 'item',
        icon: 'bookmark_border',
        url: '/brand'
      },
      {
        id: 'task',
        title: 'Task',
        translate: 'Task',
        type: 'item',
        icon: 'list_alt',
        url: '/task'
      },
      {
        id: 'category',
        title: 'Category',
        translate: 'Katalog',
        type: 'item',
        icon: 'category',
        url: '/category'
      },
      {
        id: 'store',
        title: 'Store',
        translate: 'Brugser',
        type: 'item',
        icon: 'store',
        url: '/store'
      },
      {
        id: 'geography',
        title: 'Geography',
        translate: 'Geografi',
        type: 'collapse',
        icon: 'map',
        children: [
          {
            id: 'municipality',
            title: 'Municipality',
            translate: 'Kommuner',
            type: 'item',
            icon: 'location_city',
            url: '/municipality'
          },
          {
            id: 'city',
            title: 'City',
            translate: 'Byer',
            type: 'item',
            icon: 'roofing',
            url: '/city'
          },
          {
            id: 'zip_code',
            title: 'Zip Code',
            translate: 'Postnumre',
            type: 'item',
            icon: 'my_location',
            url: '/zip-code'
          }
        ]
      }
    ]
  }
];

export default navigationConfig;
