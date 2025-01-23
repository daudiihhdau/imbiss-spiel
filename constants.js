export const taxRate = 0.19;

export const Categories = {
    OBST: 'obst',
    WURST: 'wurst',
    GETRAENKE: 'getraenke',
    SAUCEN: 'saucen',
    SUESSWAREN: 'suesswaren',
    SPEISEN: 'speisen'
};

export const Rating = {
    SCHLECHT: 'schlecht',
    NORMAL: 'normal',
    GUT: 'gut'
};

export const Attributes = {
    BIO: 'bio',
    FAIRTRADE: 'fairtrade'
};

export const Units = {
    STUECK: 'Stück',
    PORTIONEN: 'Portionen'
};

export const InvoiceStatus = {
    PAID: 'bezahlt',
    OPEN: 'offen'
}

export const items = new Map([
    ['Pommes', { emoji: '🍟' }],
    ['Currywurst', { emoji: '🌭' }],
    ['Hamburger', { emoji: '🍔' }],
    ['Kaffee', { emoji: '☕' }],
    ['Bonbon', { emoji: '🍬' }],
    ['Lutscher', { emoji: '🍭' }],
    ['Kartoffelsuppe', { emoji: '🥣' }],
    ['Bratwurst', { emoji: '🥖' }],
]);

export const Emotions = {
    HAPPY: { emoji: '😊', description: 'glücklich' },
    SAD: { emoji: '😢', description: 'traurig' },
    ANGRY: { emoji: '😡', description: 'wütend' },
    TIRED: { emoji: '😴', description: 'müde' },
    EXCITED: { emoji: '😁', description: 'fröhlich' },
    HUNGRY: { emoji: '🍴', description: 'hungrig' },
    DISAPPOINTED: { emoji: '😞', description: 'enttäuscht' },
};
