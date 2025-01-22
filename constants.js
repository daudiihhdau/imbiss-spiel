const taxRate = 0.19;

const Categories = {
    OBST: 'obst',
    WURST: 'wurst',
    GETRAENKE: 'getraenke',
    SAUCEN: 'saucen',
    SUESSWAREN: 'suesswaren',
    FASTFOOD: 'fastfood',
    SPEISEN: 'speisen'
};

const Rating = {
    SCHLECHT: 'schlecht',
    NORMAL: 'normal',
    GUT: 'gut'
};

const Attributes = {
    BIO: 'bio',
    FAIRTRADE: 'fairtrade'
};

const Units = {
    STUECK: 'Stück',
    PORTIONEN: 'Portionen'
};

const InvoiceStatus = {
    PAID: 'bezahlt',
    OPEN: 'offen'
}

const items = new Map([
    ['Pommes', { emoji: '🍟' }],
    ['Currywurst', { emoji: '🌭' }],
    ['Hamburger', { emoji: '🍔' }],
    ['Kaffee', { emoji: '☕' }],
    ['Bonbon', { emoji: '🍬' }],
    ['Lutscher', { emoji: '🍭' }],
    ['Kartoffelsuppe', { emoji: '🥣' }],
    ['Bratwurst', { emoji: '🥖' }],
]);

const Emotions = {
    HAPPY: { emoji: '😊', description: 'glücklich' },
    SAD: { emoji: '😢', description: 'traurig' },
    ANGRY: { emoji: '😡', description: 'wütend' },
    TIRED: { emoji: '😴', description: 'müde' },
    EXCITED: { emoji: '😁', description: 'fröhlich' },
    HUNGRY: { emoji: '🍴', description: 'hungrig' },
    DISAPPOINTED: { emoji: '😞', description: 'enttäuscht' },
};
