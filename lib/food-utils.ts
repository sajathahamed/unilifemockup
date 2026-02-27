export interface MenuItem {
    id: string
    name: string
    description: string
    price: number
    emoji: string
    popular?: boolean
}

export interface MenuCategory {
    id: string
    label: string
    emoji: string
    items: MenuItem[]
}

const MENU_TEMPLATES: Record<string, MenuCategory[]> = {
    'Rice & Curry': [
        {
            id: 'mains', label: 'Main Curries', emoji: '🍛',
            items: [
                { id: 'rc1', name: 'Chicken Rice & Curry', description: 'Steam rice with 3 veg curries, chicken & papadum', price: 450, emoji: '🍗', popular: true },
                { id: 'rc2', name: 'Fish Rice & Curry', description: 'Authentic Jaffna style fish curry with sides', price: 400, emoji: '🐟' },
                { id: 'rc3', name: 'Vegetable Rice & Curry', description: '5 varieties of seasonal vegetable curries', price: 300, emoji: '🥗', popular: true },
                { id: 'rc4', name: 'Egg Rice & Curry', description: 'Daily special egg curry with 3 sides', price: 350, emoji: '🥚' },
            ],
        },
        {
            id: 'drinks', label: 'Drinks', emoji: '🥤',
            items: [
                { id: 'd1', name: 'Ginger Beer (EGB)', description: 'Classic Sri Lankan ginger beer', price: 120, emoji: '🍺' },
                { id: 'd2', name: 'Iced Milo', description: 'Chilled energy drink', price: 150, emoji: '🧋', popular: true },
                { id: 'd3', name: 'Fresh Lime Juice', description: 'Refreshing local lime juice', price: 100, emoji: '🍋' },
            ],
        }
    ],
    'Kottu & Hoppers': [
        {
            id: 'mains', label: 'Kottu Specialties', emoji: '🥘',
            items: [
                { id: 'k1', name: 'Chicken Cheese Kottu', description: 'Shredded roti with chicken, egg, veg & creamy cheese', price: 850, emoji: '🧀', popular: true },
                { id: 'k2', name: 'Beef Kottu', description: 'Spicy stir-fried roti with tender beef', price: 750, emoji: '🥩' },
                { id: 'k3', name: 'Egg Kottu', description: 'Classic street style egg kottu', price: 550, emoji: '🍳' },
                { id: 'k4', name: 'Vegetable Kottu', description: 'Mixed veg stir-fried with roti', price: 450, emoji: '🥗' },
            ],
        },
        {
            id: 'hoppers', label: 'Hoppers', emoji: '🥣',
            items: [
                { id: 'h1', name: 'Egg Hopper (1pc)', description: 'Crispy edges with a soft egg center', price: 80, emoji: '🥚', popular: true },
                { id: 'h2', name: 'Plain Hopper (1pc)', description: 'Bowl-shaped fermented rice pancake', price: 50, emoji: '🥣' },
                { id: 'h3', name: 'Milk Hopper', description: 'Sweetened with coconut milk', price: 70, emoji: '🥥' },
            ],
        }
    ],
    'Bakery & Short Eats': [
        {
            id: 'snacks', label: 'Short Eats', emoji: '🥐',
            items: [
                { id: 'se1', name: 'Fish Roll (1pc)', description: 'Spicy fish & potato stuffed pancake roll', price: 70, emoji: '🌯', popular: true },
                { id: 'se2', name: 'Vegetable Patty', description: 'Baked pastry with spiced potatoes', price: 60, emoji: '🥟' },
                { id: 'se3', name: 'Egg Roti', description: 'Folded roti with whole egg inside', price: 100, emoji: '🫓' },
                { id: 'se4', name: 'Fish Bun (Seeni Sambol)', description: 'Sweet and spicy onion relish in a soft bun', price: 60, emoji: '🥯' },
            ],
        },
        {
            id: 'drinks', label: 'Hot Drinks', emoji: '☕',
            items: [
                { id: 't1', name: 'Plain Tea', description: 'Ceylon black tea', price: 40, emoji: '☕' },
                { id: 't2', name: 'Milk Tea', description: 'Hot Ceylonese milk tea', price: 70, emoji: '🍵', popular: true },
                { id: 't3', name: 'Coffee', description: 'Freshly brewed local coffee', price: 80, emoji: '☕' },
            ],
        }
    ],
    'Fast Food & Burgers': [
        {
            id: 'mains', label: 'Burgers & Subs', emoji: '🍔',
            items: [
                { id: 'b1', name: 'Classic Chicken Burger', description: 'Crispy chicken patty with lettuce & mayo', price: 650, emoji: '🍔', popular: true },
                { id: 'b2', name: 'Crispy Fish Burger', description: 'Golden fried fish fillet with tartar sauce', price: 600, emoji: '🐟' },
                { id: 'b3', name: 'Veggie Sub', description: 'Loaded with fresh veg and peri-peri sauce', price: 450, emoji: '🥖' },
            ],
        },
        {
            id: 'sides', label: 'Sides', emoji: '🍟',
            items: [
                { id: 'f1', name: 'French Fries', description: 'Salted golden potato fries', price: 300, emoji: '🍟' },
                { id: 'f2', name: 'Onion Rings', description: 'Crispy battered onion rings', price: 250, emoji: '🧅' },
            ],
        }
    ]
}

export function getMenuForShop(name: string, tags: string[]): MenuCategory[] {
    const combined = (name + ' ' + tags.join(' ')).toLowerCase()

    if (combined.includes('kottu') || combined.includes('hopper')) return MENU_TEMPLATES['Kottu & Hoppers']
    if (combined.includes('bake') || combined.includes('pastry') || combined.includes('short') || combined.includes('bakery'))
        return MENU_TEMPLATES['Bakery & Short Eats']
    if (combined.includes('burger') || combined.includes('fast food') || combined.includes('sub') || combined.includes('mcdonald') || combined.includes('burger king'))
        return MENU_TEMPLATES['Fast Food & Burgers']

    return MENU_TEMPLATES['Rice & Curry']
}

export function getPriceLabel(level: number): string {
    return 'Rs'
}
