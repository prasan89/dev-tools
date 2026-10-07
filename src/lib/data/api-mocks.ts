// ---------------------------------------------------------------------------
// api-mocks.ts — Realistic mock datasets for API development
// ALL DATA IS ENTIRELY FICTIONAL. No real personal information.
// Fictional names · fake emails (@example.com) · fake addresses
// ---------------------------------------------------------------------------

// ─── Users ──────────────────────────────────────────────────────────────────

export function mockUsersData() {
  return [
    { id: 1, name: 'Alice Hartwell', email: 'alice.hartwell@example.com', username: 'ahartwell', phone: '555-0101', avatar: 'https://placehold.co/80x80?text=AH', address: { street: '12 Maple Ave', city: 'Springfield', state: 'IL', zip: '62701', country: 'US' }, company: 'Acme Corp', jobTitle: 'Software Engineer', department: 'Engineering', createdAt: '2023-01-15T08:30:00Z', active: true },
    { id: 2, name: 'Brian Colton', email: 'brian.colton@example.com', username: 'bcolton', phone: '555-0102', avatar: 'https://placehold.co/80x80?text=BC', address: { street: '8 Oak Street', city: 'Shelbyville', state: 'TN', zip: '37160', country: 'US' }, company: 'Widgets Inc', jobTitle: 'Product Manager', department: 'Product', createdAt: '2023-02-10T10:00:00Z', active: true },
    { id: 3, name: 'Carla Mendez', email: 'carla.mendez@example.com', username: 'cmendez', phone: '555-0103', avatar: 'https://placehold.co/80x80?text=CM', address: { street: '5 Pine Road', city: 'Lakeview', state: 'CA', zip: '90210', country: 'US' }, company: 'TechStart', jobTitle: 'UX Designer', department: 'Design', createdAt: '2023-02-28T09:15:00Z', active: true },
    { id: 4, name: 'David Osei', email: 'david.osei@example.com', username: 'dosei', phone: '555-0104', avatar: 'https://placehold.co/80x80?text=DO', address: { street: '22 Birch Lane', city: 'Riverside', state: 'OH', zip: '43210', country: 'US' }, company: 'Global Ops', jobTitle: 'DevOps Engineer', department: 'Infrastructure', createdAt: '2023-03-05T14:00:00Z', active: false },
    { id: 5, name: 'Elena Vasquez', email: 'elena.vasquez@example.com', username: 'evasquez', phone: '555-0105', avatar: 'https://placehold.co/80x80?text=EV', address: { street: '3 Cedar Blvd', city: 'Westport', state: 'CT', zip: '06880', country: 'US' }, company: 'DataCo', jobTitle: 'Data Analyst', department: 'Analytics', createdAt: '2023-03-20T11:30:00Z', active: true },
    { id: 6, name: 'Frank Nguyen', email: 'frank.nguyen@example.com', username: 'fnguyen', phone: '555-0106', avatar: 'https://placehold.co/80x80?text=FN', address: { street: '17 Elm Court', city: 'Madison', state: 'WI', zip: '53703', country: 'US' }, company: 'BuildRight', jobTitle: 'Backend Developer', department: 'Engineering', createdAt: '2023-04-01T08:00:00Z', active: true },
    { id: 7, name: 'Grace Kim', email: 'grace.kim@example.com', username: 'gkim', phone: '555-0107', avatar: 'https://placehold.co/80x80?text=GK', address: { street: '9 Walnut Dr', city: 'Portland', state: 'OR', zip: '97201', country: 'US' }, company: 'CloudNine', jobTitle: 'Frontend Developer', department: 'Engineering', createdAt: '2023-04-15T13:45:00Z', active: true },
    { id: 8, name: 'Henry Park', email: 'henry.park@example.com', username: 'hpark', phone: '555-0108', avatar: 'https://placehold.co/80x80?text=HP', address: { street: '33 Spruce St', city: 'Austin', state: 'TX', zip: '78701', country: 'US' }, company: 'Nexus LLC', jobTitle: 'Security Analyst', department: 'Security', createdAt: '2023-05-01T09:00:00Z', active: true },
    { id: 9, name: 'Isla Thompson', email: 'isla.thompson@example.com', username: 'ithompson', phone: '555-0109', avatar: 'https://placehold.co/80x80?text=IT', address: { street: '6 Redwood Way', city: 'Denver', state: 'CO', zip: '80201', country: 'US' }, company: 'Horizon Media', jobTitle: 'Content Strategist', department: 'Marketing', createdAt: '2023-05-18T10:30:00Z', active: false },
    { id: 10, name: 'James Okafor', email: 'james.okafor@example.com', username: 'jokafor', phone: '555-0110', avatar: 'https://placehold.co/80x80?text=JO', address: { street: '44 Aspen Rd', city: 'Atlanta', state: 'GA', zip: '30301', country: 'US' }, company: 'Acme Corp', jobTitle: 'QA Engineer', department: 'Engineering', createdAt: '2023-06-02T08:30:00Z', active: true },
    { id: 11, name: 'Karen Liu', email: 'karen.liu@example.com', username: 'kliu', phone: '555-0111', avatar: 'https://placehold.co/80x80?text=KL', address: { street: '2 Poplar Ave', city: 'Seattle', state: 'WA', zip: '98101', country: 'US' }, company: 'Widgets Inc', jobTitle: 'Scrum Master', department: 'Product', createdAt: '2023-06-20T14:15:00Z', active: true },
    { id: 12, name: 'Liam Foster', email: 'liam.foster@example.com', username: 'lfoster', phone: '555-0112', avatar: 'https://placehold.co/80x80?text=LF', address: { street: '55 Hickory Ln', city: 'Charlotte', state: 'NC', zip: '28201', country: 'US' }, company: 'TechStart', jobTitle: 'Mobile Developer', department: 'Engineering', createdAt: '2023-07-07T11:00:00Z', active: true },
    { id: 13, name: 'Mia Chen', email: 'mia.chen@example.com', username: 'mchen', phone: '555-0113', avatar: 'https://placehold.co/80x80?text=MC', address: { street: '18 Magnolia Ct', city: 'Boston', state: 'MA', zip: '02101', country: 'US' }, company: 'DataCo', jobTitle: 'ML Engineer', department: 'Data Science', createdAt: '2023-07-25T09:45:00Z', active: true },
    { id: 14, name: 'Nathan Bell', email: 'nathan.bell@example.com', username: 'nbell', phone: '555-0114', avatar: 'https://placehold.co/80x80?text=NB', address: { street: '71 Cypress St', city: 'Phoenix', state: 'AZ', zip: '85001', country: 'US' }, company: 'BuildRight', jobTitle: 'Solutions Architect', department: 'Engineering', createdAt: '2023-08-10T08:00:00Z', active: false },
    { id: 15, name: 'Olivia Grant', email: 'olivia.grant@example.com', username: 'ogrant', phone: '555-0115', avatar: 'https://placehold.co/80x80?text=OG', address: { street: '29 Sycamore Blvd', city: 'Minneapolis', state: 'MN', zip: '55401', country: 'US' }, company: 'CloudNine', jobTitle: 'HR Manager', department: 'Human Resources', createdAt: '2023-08-28T13:30:00Z', active: true },
    { id: 16, name: 'Paul Reyes', email: 'paul.reyes@example.com', username: 'preyes', phone: '555-0116', avatar: 'https://placehold.co/80x80?text=PR', address: { street: '14 Chestnut Dr', city: 'San Jose', state: 'CA', zip: '95101', country: 'US' }, company: 'Nexus LLC', jobTitle: 'Sales Engineer', department: 'Sales', createdAt: '2023-09-05T10:00:00Z', active: true },
    { id: 17, name: 'Quinn Hughes', email: 'quinn.hughes@example.com', username: 'qhughes', phone: '555-0117', avatar: 'https://placehold.co/80x80?text=QH', address: { street: '38 Linden Ave', city: 'Detroit', state: 'MI', zip: '48201', country: 'US' }, company: 'Global Ops', jobTitle: 'Project Manager', department: 'Operations', createdAt: '2023-09-22T09:15:00Z', active: true },
    { id: 18, name: 'Rachel Stone', email: 'rachel.stone@example.com', username: 'rstone', phone: '555-0118', avatar: 'https://placehold.co/80x80?text=RS', address: { street: '5 Acacia Rd', city: 'Nashville', state: 'TN', zip: '37201', country: 'US' }, company: 'Horizon Media', jobTitle: 'Creative Director', department: 'Design', createdAt: '2023-10-08T11:30:00Z', active: true },
    { id: 19, name: 'Samuel Diaz', email: 'samuel.diaz@example.com', username: 'sdiaz', phone: '555-0119', avatar: 'https://placehold.co/80x80?text=SD', address: { street: '60 Willow Way', city: 'Las Vegas', state: 'NV', zip: '89101', country: 'US' }, company: 'Acme Corp', jobTitle: 'Financial Analyst', department: 'Finance', createdAt: '2023-10-25T08:45:00Z', active: true },
    { id: 20, name: 'Tara Williams', email: 'tara.williams@example.com', username: 'twilliams', phone: '555-0120', avatar: 'https://placehold.co/80x80?text=TW', address: { street: '11 Palm St', city: 'Orlando', state: 'FL', zip: '32801', country: 'US' }, company: 'DataCo', jobTitle: 'Data Engineer', department: 'Data Science', createdAt: '2023-11-10T14:00:00Z', active: false },
    { id: 21, name: 'Uma Patel', email: 'uma.patel@example.com', username: 'upatel', phone: '555-0121', avatar: 'https://placehold.co/80x80?text=UP', address: { street: '23 Peach Ln', city: 'San Diego', state: 'CA', zip: '92101', country: 'US' }, company: 'TechStart', jobTitle: 'Product Owner', department: 'Product', createdAt: '2023-11-28T09:00:00Z', active: true },
    { id: 22, name: 'Victor Santos', email: 'victor.santos@example.com', username: 'vsantos', phone: '555-0122', avatar: 'https://placehold.co/80x80?text=VS', address: { street: '7 Mulberry Dr', city: 'Columbus', state: 'OH', zip: '43201', country: 'US' }, company: 'BuildRight', jobTitle: 'Cloud Architect', department: 'Infrastructure', createdAt: '2023-12-05T10:30:00Z', active: true },
    { id: 23, name: 'Wendy Turner', email: 'wendy.turner@example.com', username: 'wturner', phone: '555-0123', avatar: 'https://placehold.co/80x80?text=WT', address: { street: '41 Plum Ave', city: 'Memphis', state: 'TN', zip: '38101', country: 'US' }, company: 'CloudNine', jobTitle: 'Operations Manager', department: 'Operations', createdAt: '2023-12-20T13:00:00Z', active: true },
    { id: 24, name: 'Xander Brooks', email: 'xander.brooks@example.com', username: 'xbrooks', phone: '555-0124', avatar: 'https://placehold.co/80x80?text=XB', address: { street: '9 Hazel St', city: 'Kansas City', state: 'MO', zip: '64101', country: 'US' }, company: 'Nexus LLC', jobTitle: 'Full Stack Developer', department: 'Engineering', createdAt: '2024-01-08T08:30:00Z', active: true },
    { id: 25, name: 'Yuki Tanaka', email: 'yuki.tanaka@example.com', username: 'ytanaka', phone: '555-0125', avatar: 'https://placehold.co/80x80?text=YT', address: { street: '15 Juniper Blvd', city: 'Salt Lake City', state: 'UT', zip: '84101', country: 'US' }, company: 'Global Ops', jobTitle: 'Business Analyst', department: 'Product', createdAt: '2024-01-22T11:00:00Z', active: true },
  ];
}

// ─── Products ────────────────────────────────────────────────────────────────

export function mockProductsData() {
  return [
    { id: 1, name: 'Wireless Ergonomic Mouse', description: 'Comfortable wireless mouse with ergonomic design for all-day use.', price: 39.99, currency: 'USD', category: 'Electronics', sku: 'EL-MSE-001', stock: 142, images: ['https://placehold.co/400x300?text=Mouse'], rating: 4.3, reviewCount: 87, tags: ['mouse', 'wireless', 'ergonomic'], featured: false },
    { id: 2, name: 'Mechanical Keyboard TKL', description: 'Tenkeyless mechanical keyboard with tactile brown switches.', price: 79.99, currency: 'USD', category: 'Electronics', sku: 'EL-KBD-002', stock: 54, images: ['https://placehold.co/400x300?text=Keyboard'], rating: 4.6, reviewCount: 213, tags: ['keyboard', 'mechanical', 'tkl'], featured: true },
    { id: 3, name: '27-Inch IPS Monitor', description: '4K IPS monitor with HDR support and 144Hz refresh rate.', price: 349.00, currency: 'USD', category: 'Electronics', sku: 'EL-MON-003', stock: 28, images: ['https://placehold.co/400x300?text=Monitor'], rating: 4.7, reviewCount: 156, tags: ['monitor', '4k', 'ips'], featured: true },
    { id: 4, name: 'USB-C Docking Station', description: '10-in-1 USB-C hub with HDMI, ethernet, and USB-A ports.', price: 59.99, currency: 'USD', category: 'Electronics', sku: 'EL-HUB-004', stock: 93, images: ['https://placehold.co/400x300?text=DockingStation'], rating: 4.1, reviewCount: 62, tags: ['usb-c', 'hub', 'dock'], featured: false },
    { id: 5, name: 'Noise-Cancelling Headphones', description: 'Over-ear headphones with active noise cancellation and 30h battery.', price: 129.00, currency: 'USD', category: 'Electronics', sku: 'EL-HPH-005', stock: 67, images: ['https://placehold.co/400x300?text=Headphones'], rating: 4.5, reviewCount: 304, tags: ['headphones', 'noise-cancelling', 'wireless'], featured: true },
    { id: 6, name: 'Webcam 1080p', description: 'Full HD webcam with built-in microphone and autofocus.', price: 49.99, currency: 'USD', category: 'Electronics', sku: 'EL-CAM-006', stock: 115, images: ['https://placehold.co/400x300?text=Webcam'], rating: 3.9, reviewCount: 44, tags: ['webcam', 'hd', 'streaming'], featured: false },
    { id: 7, name: 'Standing Desk Converter', description: 'Height-adjustable desk converter for sit-stand working.', price: 189.00, currency: 'USD', category: 'Furniture', sku: 'FN-DSK-007', stock: 19, images: ['https://placehold.co/400x300?text=StandingDesk'], rating: 4.2, reviewCount: 31, tags: ['desk', 'ergonomic', 'sit-stand'], featured: false },
    { id: 8, name: 'Lumbar Support Cushion', description: 'Memory foam lumbar cushion for office chairs.', price: 24.99, currency: 'USD', category: 'Furniture', sku: 'FN-CSH-008', stock: 200, images: ['https://placehold.co/400x300?text=LumbarCushion'], rating: 4.0, reviewCount: 119, tags: ['lumbar', 'ergonomic', 'cushion'], featured: false },
    { id: 9, name: 'LED Desk Lamp', description: 'Smart LED lamp with adjustable brightness and color temperature.', price: 34.99, currency: 'USD', category: 'Furniture', sku: 'FN-LMP-009', stock: 88, images: ['https://placehold.co/400x300?text=DeskLamp'], rating: 4.4, reviewCount: 76, tags: ['lamp', 'led', 'smart'], featured: false },
    { id: 10, name: 'Cable Management Kit', description: 'Set of 30 reusable cable ties and clips for desk organization.', price: 12.99, currency: 'USD', category: 'Accessories', sku: 'AC-CBL-010', stock: 340, images: ['https://placehold.co/400x300?text=CableKit'], rating: 4.2, reviewCount: 98, tags: ['cables', 'organizer', 'desk'], featured: false },
    { id: 11, name: 'Laptop Stand Aluminum', description: 'Adjustable aluminum stand for laptops 11–17 inches.', price: 27.99, currency: 'USD', category: 'Accessories', sku: 'AC-STD-011', stock: 73, images: ['https://placehold.co/400x300?text=LaptopStand'], rating: 4.5, reviewCount: 147, tags: ['stand', 'laptop', 'aluminum'], featured: true },
    { id: 12, name: 'Smart Plug Wi-Fi', description: 'Wi-Fi enabled smart plug with energy monitoring and scheduling.', price: 16.99, currency: 'USD', category: 'Electronics', sku: 'EL-PLG-012', stock: 260, images: ['https://placehold.co/400x300?text=SmartPlug'], rating: 4.1, reviewCount: 88, tags: ['smart home', 'plug', 'wifi'], featured: false },
    { id: 13, name: 'Wireless Charging Pad', description: '15W Qi wireless charging pad compatible with all Qi devices.', price: 19.99, currency: 'USD', category: 'Electronics', sku: 'EL-CHG-013', stock: 185, images: ['https://placehold.co/400x300?text=ChargingPad'], rating: 4.3, reviewCount: 165, tags: ['wireless', 'charging', 'qi'], featured: false },
    { id: 14, name: 'Portable SSD 1TB', description: 'Compact 1TB SSD with USB 3.2 for fast data transfer.', price: 89.99, currency: 'USD', category: 'Storage', sku: 'ST-SSD-014', stock: 41, images: ['https://placehold.co/400x300?text=PortableSSD'], rating: 4.8, reviewCount: 231, tags: ['ssd', 'storage', 'portable'], featured: true },
    { id: 15, name: 'Bluetooth Speaker', description: 'Portable waterproof Bluetooth speaker with 12h battery.', price: 44.99, currency: 'USD', category: 'Electronics', sku: 'EL-SPK-015', stock: 102, images: ['https://placehold.co/400x300?text=BTSpeaker'], rating: 4.4, reviewCount: 190, tags: ['bluetooth', 'speaker', 'waterproof'], featured: false },
    { id: 16, name: 'Adjustable Monitor Arm', description: 'Articulating dual-arm monitor mount for VESA-compatible displays.', price: 64.99, currency: 'USD', category: 'Furniture', sku: 'FN-ARM-016', stock: 35, images: ['https://placehold.co/400x300?text=MonitorArm'], rating: 4.6, reviewCount: 79, tags: ['monitor', 'arm', 'mount'], featured: false },
    { id: 17, name: 'Mechanical Pencil Set', description: 'Pack of 5 drafting mechanical pencils in 0.3, 0.5, 0.7mm.', price: 14.99, currency: 'USD', category: 'Office Supplies', sku: 'OS-PNC-017', stock: 420, images: ['https://placehold.co/400x300?text=PencilSet'], rating: 4.0, reviewCount: 55, tags: ['pencil', 'drafting', 'set'], featured: false },
    { id: 18, name: 'Whiteboard 36x24', description: 'Magnetic dry-erase whiteboard with aluminum frame.', price: 39.99, currency: 'USD', category: 'Office Supplies', sku: 'OS-WBD-018', stock: 60, images: ['https://placehold.co/400x300?text=Whiteboard'], rating: 4.3, reviewCount: 42, tags: ['whiteboard', 'magnetic', 'office'], featured: false },
    { id: 19, name: 'Noise Machine', description: 'Desktop white noise machine with 20 ambient sound profiles.', price: 29.99, currency: 'USD', category: 'Accessories', sku: 'AC-NSM-019', stock: 77, images: ['https://placehold.co/400x300?text=NoiseMachine'], rating: 4.7, reviewCount: 213, tags: ['noise', 'sleep', 'focus'], featured: true },
    { id: 20, name: 'Mesh Office Chair', description: 'Breathable mesh chair with lumbar support and adjustable armrests.', price: 229.00, currency: 'USD', category: 'Furniture', sku: 'FN-CHR-020', stock: 12, images: ['https://placehold.co/400x300?text=OfficeChair'], rating: 4.5, reviewCount: 88, tags: ['chair', 'ergonomic', 'mesh'], featured: true },
    { id: 21, name: 'Thermal Coffee Mug', description: 'Vacuum-insulated stainless steel travel mug, 16oz.', price: 21.99, currency: 'USD', category: 'Kitchen', sku: 'KT-MUG-021', stock: 310, images: ['https://placehold.co/400x300?text=ThermalMug'], rating: 4.6, reviewCount: 127, tags: ['mug', 'thermal', 'travel'], featured: false },
    { id: 22, name: 'Desk Organizer Tray', description: 'Bamboo 5-compartment desk organizer for stationery.', price: 17.99, currency: 'USD', category: 'Office Supplies', sku: 'OS-TRY-022', stock: 190, images: ['https://placehold.co/400x300?text=DeskTray'], rating: 4.1, reviewCount: 68, tags: ['organizer', 'bamboo', 'desk'], featured: false },
    { id: 23, name: 'Footrest Adjustable', description: 'Ergonomic adjustable footrest with massage surface.', price: 31.99, currency: 'USD', category: 'Furniture', sku: 'FN-FRT-023', stock: 55, images: ['https://placehold.co/400x300?text=Footrest'], rating: 4.3, reviewCount: 49, tags: ['footrest', 'ergonomic', 'comfort'], featured: false },
    { id: 24, name: 'Screen Privacy Filter', description: 'Anti-glare privacy filter for 24-inch widescreen monitors.', price: 26.99, currency: 'USD', category: 'Accessories', sku: 'AC-PRV-024', stock: 84, images: ['https://placehold.co/400x300?text=PrivacyFilter'], rating: 3.8, reviewCount: 33, tags: ['privacy', 'screen', 'filter'], featured: false },
    { id: 25, name: 'Wireless Presenter Remote', description: 'Presentation clicker with laser pointer and 100ft range.', price: 22.99, currency: 'USD', category: 'Electronics', sku: 'EL-RMT-025', stock: 130, images: ['https://placehold.co/400x300?text=Presenter'], rating: 4.2, reviewCount: 71, tags: ['presenter', 'remote', 'wireless'], featured: false },
    { id: 26, name: 'Surge Protector Power Strip', description: '8-outlet surge protector with 2 USB ports and 6ft cord.', price: 23.99, currency: 'USD', category: 'Electronics', sku: 'EL-SRG-026', stock: 174, images: ['https://placehold.co/400x300?text=SurgeProtector'], rating: 4.4, reviewCount: 196, tags: ['surge', 'power', 'strip'], featured: false },
    { id: 27, name: 'Sticky Notes Value Pack', description: 'Bulk pack of 24 sticky note pads in assorted colors.', price: 9.99, currency: 'USD', category: 'Office Supplies', sku: 'OS-STK-027', stock: 550, images: ['https://placehold.co/400x300?text=StickyNotes'], rating: 4.0, reviewCount: 82, tags: ['sticky', 'notes', 'office'], featured: false },
    { id: 28, name: 'Anti-fatigue Mat', description: 'Comfort mat for standing desks, 20x36 inches.', price: 44.99, currency: 'USD', category: 'Furniture', sku: 'FN-MAT-028', stock: 40, images: ['https://placehold.co/400x300?text=AntiFatigueMat'], rating: 4.5, reviewCount: 61, tags: ['mat', 'standing', 'comfort'], featured: false },
    { id: 29, name: 'Label Maker', description: 'Handheld label maker with QWERTY keyboard and thermal printing.', price: 18.99, currency: 'USD', category: 'Office Supplies', sku: 'OS-LBL-029', stock: 98, images: ['https://placehold.co/400x300?text=LabelMaker'], rating: 4.1, reviewCount: 57, tags: ['label', 'maker', 'printer'], featured: false },
    { id: 30, name: 'Smart Light Bulb', description: 'Wi-Fi RGB smart bulb, 800 lumens, compatible with voice assistants.', price: 13.99, currency: 'USD', category: 'Electronics', sku: 'EL-BLB-030', stock: 320, images: ['https://placehold.co/400x300?text=SmartBulb'], rating: 4.3, reviewCount: 143, tags: ['smart', 'bulb', 'rgb'], featured: false },
  ];
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export function mockOrdersData() {
  return [
    { id: 'ORD-0001', userId: 1, status: 'delivered', items: [{ productId: 2, name: 'Mechanical Keyboard TKL', qty: 1, price: 79.99 }, { productId: 1, name: 'Wireless Ergonomic Mouse', qty: 1, price: 39.99 }], subtotal: 119.98, tax: 9.60, total: 129.58, createdAt: '2024-03-01T10:00:00Z', updatedAt: '2024-03-05T14:30:00Z', shippingAddress: { street: '12 Maple Ave', city: 'Springfield', state: 'IL', zip: '62701', country: 'US' } },
    { id: 'ORD-0002', userId: 3, status: 'shipped', items: [{ productId: 5, name: 'Noise-Cancelling Headphones', qty: 1, price: 129.00 }], subtotal: 129.00, tax: 10.32, total: 139.32, createdAt: '2024-03-03T09:15:00Z', updatedAt: '2024-03-06T08:00:00Z', shippingAddress: { street: '5 Pine Road', city: 'Lakeview', state: 'CA', zip: '90210', country: 'US' } },
    { id: 'ORD-0003', userId: 5, status: 'processing', items: [{ productId: 14, name: 'Portable SSD 1TB', qty: 2, price: 89.99 }], subtotal: 179.98, tax: 14.40, total: 194.38, createdAt: '2024-03-07T11:30:00Z', updatedAt: '2024-03-07T12:00:00Z', shippingAddress: { street: '3 Cedar Blvd', city: 'Westport', state: 'CT', zip: '06880', country: 'US' } },
    { id: 'ORD-0004', userId: 7, status: 'pending', items: [{ productId: 20, name: 'Mesh Office Chair', qty: 1, price: 229.00 }], subtotal: 229.00, tax: 18.32, total: 247.32, createdAt: '2024-03-08T14:00:00Z', updatedAt: '2024-03-08T14:00:00Z', shippingAddress: { street: '9 Walnut Dr', city: 'Portland', state: 'OR', zip: '97201', country: 'US' } },
    { id: 'ORD-0005', userId: 2, status: 'cancelled', items: [{ productId: 3, name: '27-Inch IPS Monitor', qty: 1, price: 349.00 }], subtotal: 349.00, tax: 27.92, total: 376.92, createdAt: '2024-02-20T08:30:00Z', updatedAt: '2024-02-21T09:00:00Z', shippingAddress: { street: '8 Oak Street', city: 'Shelbyville', state: 'TN', zip: '37160', country: 'US' } },
    { id: 'ORD-0006', userId: 10, status: 'delivered', items: [{ productId: 11, name: 'Laptop Stand Aluminum', qty: 1, price: 27.99 }, { productId: 9, name: 'LED Desk Lamp', qty: 1, price: 34.99 }], subtotal: 62.98, tax: 5.04, total: 68.02, createdAt: '2024-02-15T10:00:00Z', updatedAt: '2024-02-19T16:00:00Z', shippingAddress: { street: '44 Aspen Rd', city: 'Atlanta', state: 'GA', zip: '30301', country: 'US' } },
    { id: 'ORD-0007', userId: 13, status: 'shipped', items: [{ productId: 19, name: 'Noise Machine', qty: 1, price: 29.99 }], subtotal: 29.99, tax: 2.40, total: 32.39, createdAt: '2024-03-05T13:00:00Z', updatedAt: '2024-03-08T09:30:00Z', shippingAddress: { street: '18 Magnolia Ct', city: 'Boston', state: 'MA', zip: '02101', country: 'US' } },
    { id: 'ORD-0008', userId: 6, status: 'delivered', items: [{ productId: 4, name: 'USB-C Docking Station', qty: 1, price: 59.99 }, { productId: 13, name: 'Wireless Charging Pad', qty: 2, price: 19.99 }], subtotal: 99.97, tax: 8.00, total: 107.97, createdAt: '2024-01-28T09:00:00Z', updatedAt: '2024-02-02T11:00:00Z', shippingAddress: { street: '17 Elm Court', city: 'Madison', state: 'WI', zip: '53703', country: 'US' } },
    { id: 'ORD-0009', userId: 16, status: 'processing', items: [{ productId: 26, name: 'Surge Protector Power Strip', qty: 3, price: 23.99 }], subtotal: 71.97, tax: 5.76, total: 77.73, createdAt: '2024-03-09T10:30:00Z', updatedAt: '2024-03-09T11:00:00Z', shippingAddress: { street: '14 Chestnut Dr', city: 'San Jose', state: 'CA', zip: '95101', country: 'US' } },
    { id: 'ORD-0010', userId: 22, status: 'delivered', items: [{ productId: 16, name: 'Adjustable Monitor Arm', qty: 1, price: 64.99 }], subtotal: 64.99, tax: 5.20, total: 70.19, createdAt: '2024-01-10T14:00:00Z', updatedAt: '2024-01-15T10:00:00Z', shippingAddress: { street: '7 Mulberry Dr', city: 'Columbus', state: 'OH', zip: '43201', country: 'US' } },
    { id: 'ORD-0011', userId: 8, status: 'shipped', items: [{ productId: 8, name: 'Lumbar Support Cushion', qty: 1, price: 24.99 }, { productId: 23, name: 'Footrest Adjustable', qty: 1, price: 31.99 }], subtotal: 56.98, tax: 4.56, total: 61.54, createdAt: '2024-03-06T08:45:00Z', updatedAt: '2024-03-09T12:00:00Z', shippingAddress: { street: '33 Spruce St', city: 'Austin', state: 'TX', zip: '78701', country: 'US' } },
    { id: 'ORD-0012', userId: 19, status: 'pending', items: [{ productId: 21, name: 'Thermal Coffee Mug', qty: 2, price: 21.99 }], subtotal: 43.98, tax: 3.52, total: 47.50, createdAt: '2024-03-09T15:00:00Z', updatedAt: '2024-03-09T15:00:00Z', shippingAddress: { street: '60 Willow Way', city: 'Las Vegas', state: 'NV', zip: '89101', country: 'US' } },
    { id: 'ORD-0013', userId: 24, status: 'delivered', items: [{ productId: 6, name: 'Webcam 1080p', qty: 1, price: 49.99 }, { productId: 12, name: 'Smart Plug Wi-Fi', qty: 2, price: 16.99 }], subtotal: 83.97, tax: 6.72, total: 90.69, createdAt: '2024-02-01T09:30:00Z', updatedAt: '2024-02-06T14:00:00Z', shippingAddress: { street: '9 Hazel St', city: 'Kansas City', state: 'MO', zip: '64101', country: 'US' } },
    { id: 'ORD-0014', userId: 11, status: 'delivered', items: [{ productId: 7, name: 'Standing Desk Converter', qty: 1, price: 189.00 }], subtotal: 189.00, tax: 15.12, total: 204.12, createdAt: '2024-01-20T10:00:00Z', updatedAt: '2024-01-25T11:30:00Z', shippingAddress: { street: '2 Poplar Ave', city: 'Seattle', state: 'WA', zip: '98101', country: 'US' } },
    { id: 'ORD-0015', userId: 25, status: 'cancelled', items: [{ productId: 15, name: 'Bluetooth Speaker', qty: 1, price: 44.99 }], subtotal: 44.99, tax: 3.60, total: 48.59, createdAt: '2024-02-10T08:00:00Z', updatedAt: '2024-02-10T09:30:00Z', shippingAddress: { street: '15 Juniper Blvd', city: 'Salt Lake City', state: 'UT', zip: '84101', country: 'US' } },
    { id: 'ORD-0016', userId: 15, status: 'shipped', items: [{ productId: 28, name: 'Anti-fatigue Mat', qty: 1, price: 44.99 }, { productId: 10, name: 'Cable Management Kit', qty: 1, price: 12.99 }], subtotal: 57.98, tax: 4.64, total: 62.62, createdAt: '2024-03-04T11:00:00Z', updatedAt: '2024-03-07T15:00:00Z', shippingAddress: { street: '29 Sycamore Blvd', city: 'Minneapolis', state: 'MN', zip: '55401', country: 'US' } },
    { id: 'ORD-0017', userId: 21, status: 'delivered', items: [{ productId: 18, name: 'Whiteboard 36x24', qty: 1, price: 39.99 }, { productId: 27, name: 'Sticky Notes Value Pack', qty: 2, price: 9.99 }], subtotal: 59.97, tax: 4.80, total: 64.77, createdAt: '2024-01-15T14:30:00Z', updatedAt: '2024-01-20T10:00:00Z', shippingAddress: { street: '23 Peach Ln', city: 'San Diego', state: 'CA', zip: '92101', country: 'US' } },
    { id: 'ORD-0018', userId: 17, status: 'processing', items: [{ productId: 30, name: 'Smart Light Bulb', qty: 4, price: 13.99 }], subtotal: 55.96, tax: 4.48, total: 60.44, createdAt: '2024-03-08T09:00:00Z', updatedAt: '2024-03-08T10:00:00Z', shippingAddress: { street: '38 Linden Ave', city: 'Detroit', state: 'MI', zip: '48201', country: 'US' } },
    { id: 'ORD-0019', userId: 12, status: 'delivered', items: [{ productId: 24, name: 'Screen Privacy Filter', qty: 1, price: 26.99 }], subtotal: 26.99, tax: 2.16, total: 29.15, createdAt: '2024-02-05T09:30:00Z', updatedAt: '2024-02-10T13:00:00Z', shippingAddress: { street: '55 Hickory Ln', city: 'Charlotte', state: 'NC', zip: '28201', country: 'US' } },
    { id: 'ORD-0020', userId: 18, status: 'shipped', items: [{ productId: 25, name: 'Wireless Presenter Remote', qty: 1, price: 22.99 }, { productId: 29, name: 'Label Maker', qty: 1, price: 18.99 }], subtotal: 41.98, tax: 3.36, total: 45.34, createdAt: '2024-03-07T15:30:00Z', updatedAt: '2024-03-09T09:00:00Z', shippingAddress: { street: '5 Acacia Rd', city: 'Nashville', state: 'TN', zip: '37201', country: 'US' } },
  ];
}

// ─── Transactions ────────────────────────────────────────────────────────────

export function mockTransactionsData() {
  return [
    { id: 'TXN-001', userId: 1, type: 'debit', amount: 129.58, currency: 'USD', description: 'Order ORD-0001 payment', category: 'Shopping', status: 'completed', createdAt: '2024-03-01T10:05:00Z', reference: 'REF-A1B2C3' },
    { id: 'TXN-002', userId: 3, type: 'debit', amount: 139.32, currency: 'USD', description: 'Order ORD-0002 payment', category: 'Shopping', status: 'completed', createdAt: '2024-03-03T09:20:00Z', reference: 'REF-D4E5F6' },
    { id: 'TXN-003', userId: 5, type: 'debit', amount: 194.38, currency: 'USD', description: 'Order ORD-0003 payment', category: 'Shopping', status: 'pending', createdAt: '2024-03-07T11:35:00Z', reference: 'REF-G7H8I9' },
    { id: 'TXN-004', userId: 1, type: 'credit', amount: 50.00, currency: 'USD', description: 'Referral bonus credit', category: 'Reward', status: 'completed', createdAt: '2024-03-02T08:00:00Z', reference: 'REF-J1K2L3' },
    { id: 'TXN-005', userId: 2, type: 'credit', amount: 376.92, currency: 'USD', description: 'Refund for ORD-0005', category: 'Refund', status: 'completed', createdAt: '2024-02-21T10:00:00Z', reference: 'REF-M4N5O6' },
    { id: 'TXN-006', userId: 10, type: 'debit', amount: 68.02, currency: 'USD', description: 'Order ORD-0006 payment', category: 'Shopping', status: 'completed', createdAt: '2024-02-15T10:05:00Z', reference: 'REF-P7Q8R9' },
    { id: 'TXN-007', userId: 6, type: 'debit', amount: 107.97, currency: 'USD', description: 'Order ORD-0008 payment', category: 'Shopping', status: 'completed', createdAt: '2024-01-28T09:05:00Z', reference: 'REF-S1T2U3' },
    { id: 'TXN-008', userId: 13, type: 'debit', amount: 32.39, currency: 'USD', description: 'Order ORD-0007 payment', category: 'Shopping', status: 'completed', createdAt: '2024-03-05T13:05:00Z', reference: 'REF-V4W5X6' },
    { id: 'TXN-009', userId: 7, type: 'credit', amount: 25.00, currency: 'USD', description: 'Promotional credit applied', category: 'Reward', status: 'completed', createdAt: '2024-03-01T09:00:00Z', reference: 'REF-Y7Z8A9' },
    { id: 'TXN-010', userId: 22, type: 'debit', amount: 70.19, currency: 'USD', description: 'Order ORD-0010 payment', category: 'Shopping', status: 'completed', createdAt: '2024-01-10T14:05:00Z', reference: 'REF-B1C2D3' },
    { id: 'TXN-011', userId: 16, type: 'debit', amount: 77.73, currency: 'USD', description: 'Order ORD-0009 payment', category: 'Shopping', status: 'pending', createdAt: '2024-03-09T10:35:00Z', reference: 'REF-E4F5G6' },
    { id: 'TXN-012', userId: 11, type: 'debit', amount: 204.12, currency: 'USD', description: 'Order ORD-0014 payment', category: 'Shopping', status: 'completed', createdAt: '2024-01-20T10:05:00Z', reference: 'REF-H7I8J9' },
    { id: 'TXN-013', userId: 8, type: 'debit', amount: 61.54, currency: 'USD', description: 'Order ORD-0011 payment', category: 'Shopping', status: 'completed', createdAt: '2024-03-06T08:50:00Z', reference: 'REF-K1L2M3' },
    { id: 'TXN-014', userId: 19, type: 'credit', amount: 10.00, currency: 'USD', description: 'Loyalty points redemption', category: 'Reward', status: 'completed', createdAt: '2024-02-28T14:00:00Z', reference: 'REF-N4O5P6' },
    { id: 'TXN-015', userId: 24, type: 'debit', amount: 90.69, currency: 'USD', description: 'Order ORD-0013 payment', category: 'Shopping', status: 'completed', createdAt: '2024-02-01T09:35:00Z', reference: 'REF-Q7R8S9' },
    { id: 'TXN-016', userId: 21, type: 'debit', amount: 64.77, currency: 'USD', description: 'Order ORD-0017 payment', category: 'Shopping', status: 'completed', createdAt: '2024-01-15T14:35:00Z', reference: 'REF-T1U2V3' },
    { id: 'TXN-017', userId: 18, type: 'debit', amount: 45.34, currency: 'USD', description: 'Order ORD-0020 payment', category: 'Shopping', status: 'completed', createdAt: '2024-03-07T15:35:00Z', reference: 'REF-W4X5Y6' },
    { id: 'TXN-018', userId: 15, type: 'debit', amount: 62.62, currency: 'USD', description: 'Order ORD-0016 payment', category: 'Shopping', status: 'pending', createdAt: '2024-03-04T11:05:00Z', reference: 'REF-Z7A8B9' },
    { id: 'TXN-019', userId: 5, type: 'credit', amount: 15.00, currency: 'USD', description: 'Newsletter signup bonus', category: 'Reward', status: 'completed', createdAt: '2024-02-14T10:00:00Z', reference: 'REF-C1D2E3' },
    { id: 'TXN-020', userId: 12, type: 'debit', amount: 29.15, currency: 'USD', description: 'Order ORD-0019 payment', category: 'Shopping', status: 'completed', createdAt: '2024-02-05T09:35:00Z', reference: 'REF-F4G5H6' },
    { id: 'TXN-021', userId: 25, type: 'credit', amount: 48.59, currency: 'USD', description: 'Refund for ORD-0015', category: 'Refund', status: 'completed', createdAt: '2024-02-10T10:00:00Z', reference: 'REF-I7J8K9' },
    { id: 'TXN-022', userId: 17, type: 'debit', amount: 60.44, currency: 'USD', description: 'Order ORD-0018 payment', category: 'Shopping', status: 'pending', createdAt: '2024-03-08T09:05:00Z', reference: 'REF-L1M2N3' },
    { id: 'TXN-023', userId: 23, type: 'credit', amount: 20.00, currency: 'USD', description: 'Account top-up via bank transfer', category: 'Deposit', status: 'completed', createdAt: '2024-03-01T12:00:00Z', reference: 'REF-O4P5Q6' },
    { id: 'TXN-024', userId: 9, type: 'debit', amount: 5.99, currency: 'USD', description: 'Subscription fee - Basic Plan', category: 'Subscription', status: 'failed', createdAt: '2024-03-01T08:00:00Z', reference: 'REF-R7S8T9' },
    { id: 'TXN-025', userId: 14, type: 'debit', amount: 12.99, currency: 'USD', description: 'Subscription fee - Pro Plan', category: 'Subscription', status: 'completed', createdAt: '2024-03-01T08:05:00Z', reference: 'REF-U1V2W3' },
  ];
}

// ─── Comments ────────────────────────────────────────────────────────────────

export function mockCommentsData() {
  return [
    { id: 1, postId: 1, userId: 4, name: 'David Osei', email: 'david.osei@example.com', body: 'Great post! Really enjoyed the insights here. Will definitely share with my team.', createdAt: '2024-02-10T09:00:00Z', likes: 12, flagged: false },
    { id: 2, postId: 1, userId: 7, name: 'Grace Kim', email: 'grace.kim@example.com', body: 'Interesting perspective, though I disagree with point number three.', createdAt: '2024-02-10T10:30:00Z', likes: 4, flagged: false },
    { id: 3, postId: 2, userId: 11, name: 'Karen Liu', email: 'karen.liu@example.com', body: 'This is exactly what I needed. Thank you for writing this up.', createdAt: '2024-02-12T08:45:00Z', likes: 23, flagged: false },
    { id: 4, postId: 2, userId: 15, name: 'Olivia Grant', email: 'olivia.grant@example.com', body: 'Could you elaborate on the section about integration patterns?', createdAt: '2024-02-12T11:00:00Z', likes: 7, flagged: false },
    { id: 5, postId: 3, userId: 2, name: 'Brian Colton', email: 'brian.colton@example.com', body: 'Well written and easy to follow. Bookmarked for later reference.', createdAt: '2024-02-15T14:00:00Z', likes: 18, flagged: false },
    { id: 6, postId: 3, userId: 20, name: 'Tara Williams', email: 'tara.williams@example.com', body: 'The code examples were especially helpful. More of this please!', createdAt: '2024-02-15T15:30:00Z', likes: 31, flagged: false },
    { id: 7, postId: 4, userId: 9, name: 'Isla Thompson', email: 'isla.thompson@example.com', body: 'I had this exact problem last week. Wish I had seen this sooner.', createdAt: '2024-02-18T08:00:00Z', likes: 9, flagged: false },
    { id: 8, postId: 4, userId: 23, name: 'Wendy Turner', email: 'wendy.turner@example.com', body: 'Short and to the point. Exactly what a technical post should be.', createdAt: '2024-02-18T09:45:00Z', likes: 14, flagged: false },
    { id: 9, postId: 5, userId: 6, name: 'Frank Nguyen', email: 'frank.nguyen@example.com', body: 'Love how the author explains complex topics simply. Subscribed!', createdAt: '2024-02-20T10:00:00Z', likes: 22, flagged: false },
    { id: 10, postId: 5, userId: 12, name: 'Liam Foster', email: 'liam.foster@example.com', body: 'A few typos, but the content itself is solid. Nice work.', createdAt: '2024-02-20T11:30:00Z', likes: 5, flagged: false },
    { id: 11, postId: 6, userId: 18, name: 'Rachel Stone', email: 'rachel.stone@example.com', body: 'The diagrams really clarify the architecture. Top-notch explanation.', createdAt: '2024-02-22T08:30:00Z', likes: 17, flagged: false },
    { id: 12, postId: 6, userId: 25, name: 'Yuki Tanaka', email: 'yuki.tanaka@example.com', body: 'I applied this in my project and it worked perfectly. Thank you!', createdAt: '2024-02-22T10:00:00Z', likes: 28, flagged: false },
    { id: 13, postId: 7, userId: 1, name: 'Alice Hartwell', email: 'alice.hartwell@example.com', body: 'This article changed how I think about state management.', createdAt: '2024-02-25T09:00:00Z', likes: 11, flagged: false },
    { id: 14, postId: 7, userId: 5, name: 'Elena Vasquez', email: 'elena.vasquez@example.com', body: 'Very useful read. I shared this in our engineering Slack channel.', createdAt: '2024-02-25T10:30:00Z', likes: 20, flagged: false },
    { id: 15, postId: 8, userId: 16, name: 'Paul Reyes', email: 'paul.reyes@example.com', body: 'Could use more real-world examples but overall a good primer.', createdAt: '2024-02-27T08:45:00Z', likes: 8, flagged: true },
    { id: 16, postId: 8, userId: 3, name: 'Carla Mendez', email: 'carla.mendez@example.com', body: 'I love this blog. Always find something new and useful here.', createdAt: '2024-02-27T09:15:00Z', likes: 15, flagged: false },
    { id: 17, postId: 9, userId: 17, name: 'Quinn Hughes', email: 'quinn.hughes@example.com', body: 'Great summary of the current state of the ecosystem.', createdAt: '2024-02-28T11:00:00Z', likes: 6, flagged: false },
    { id: 18, postId: 9, userId: 24, name: 'Xander Brooks', email: 'xander.brooks@example.com', body: 'Spot on. This matches my experience working on distributed teams.', createdAt: '2024-02-28T13:00:00Z', likes: 10, flagged: false },
    { id: 19, postId: 10, userId: 8, name: 'Henry Park', email: 'henry.park@example.com', body: 'Security implications are often overlooked. Thank you for covering this.', createdAt: '2024-03-01T09:00:00Z', likes: 33, flagged: false },
    { id: 20, postId: 10, userId: 21, name: 'Uma Patel', email: 'uma.patel@example.com', body: 'Would love a follow-up post on threat modeling basics.', createdAt: '2024-03-01T11:00:00Z', likes: 19, flagged: false },
    { id: 21, postId: 11, userId: 13, name: 'Mia Chen', email: 'mia.chen@example.com', body: 'Excellent breakdown of the ML pipeline steps. Very clear.', createdAt: '2024-03-03T08:30:00Z', likes: 27, flagged: false },
    { id: 22, postId: 11, userId: 19, name: 'Samuel Diaz', email: 'samuel.diaz@example.com', body: 'Numbers in Table 2 seem off — mind double-checking section 4?', createdAt: '2024-03-03T10:00:00Z', likes: 3, flagged: true },
    { id: 23, postId: 12, userId: 10, name: 'James Okafor', email: 'james.okafor@example.com', body: 'Testing strategies are always a hot topic. Great read.', createdAt: '2024-03-05T09:00:00Z', likes: 16, flagged: false },
    { id: 24, postId: 12, userId: 14, name: 'Nathan Bell', email: 'nathan.bell@example.com', body: 'The part about integration tests vs unit tests is gold.', createdAt: '2024-03-05T11:00:00Z', likes: 24, flagged: false },
    { id: 25, postId: 13, userId: 22, name: 'Victor Santos', email: 'victor.santos@example.com', body: 'Cloud migrations are scary. This post made it less daunting.', createdAt: '2024-03-07T08:00:00Z', likes: 21, flagged: false },
    { id: 26, postId: 13, userId: 4, name: 'David Osei', email: 'david.osei@example.com', body: 'Solid advice. We used a similar pattern last year and it saved us weeks.', createdAt: '2024-03-07T10:00:00Z', likes: 13, flagged: false },
    { id: 27, postId: 14, userId: 2, name: 'Brian Colton', email: 'brian.colton@example.com', body: 'Product roadmap planning is part art, part science. Well captured here.', createdAt: '2024-03-08T09:30:00Z', likes: 9, flagged: false },
    { id: 28, postId: 14, userId: 18, name: 'Rachel Stone', email: 'rachel.stone@example.com', body: 'The user story templates mentioned are super practical.', createdAt: '2024-03-08T11:00:00Z', likes: 7, flagged: false },
    { id: 29, postId: 15, userId: 6, name: 'Frank Nguyen', email: 'frank.nguyen@example.com', body: 'CI/CD setups can be overwhelming at first. Great starter guide.', createdAt: '2024-03-09T08:00:00Z', likes: 18, flagged: false },
    { id: 30, postId: 15, userId: 12, name: 'Liam Foster', email: 'liam.foster@example.com', body: 'Would love a deep-dive follow-up on deployment strategies.', createdAt: '2024-03-09T10:00:00Z', likes: 11, flagged: false },
  ];
}

// ─── Blog Posts ──────────────────────────────────────────────────────────────

export function mockBlogPostsData() {
  return [
    { id: 1, title: 'Getting Started with TypeScript', slug: 'getting-started-with-typescript', excerpt: 'A hands-on introduction to TypeScript for JavaScript developers.', body: 'TypeScript extends JavaScript by adding types, making large codebases easier to manage. In this post we cover basic types, interfaces, and generics. By the end you will be ready to migrate your first project.', authorId: 1, authorName: 'Alice Hartwell', tags: ['typescript', 'javascript', 'beginners'], publishedAt: '2024-02-08T08:00:00Z', updatedAt: '2024-02-09T10:00:00Z', status: 'published', viewCount: 2840, commentCount: 2 },
    { id: 2, title: 'REST API Design Best Practices', slug: 'rest-api-design-best-practices', excerpt: 'Principles and patterns for designing clean, usable REST APIs.', body: 'A well-designed REST API is intuitive, consistent, and versioned from day one. We explore resource naming, HTTP verbs, pagination, and error responses. Practical examples show both good and bad patterns.', authorId: 6, authorName: 'Frank Nguyen', tags: ['api', 'rest', 'design'], publishedAt: '2024-02-11T09:00:00Z', updatedAt: '2024-02-13T08:00:00Z', status: 'published', viewCount: 4102, commentCount: 2 },
    { id: 3, title: 'Introduction to React Hooks', slug: 'introduction-to-react-hooks', excerpt: 'Learn how hooks simplify state and side effects in React.', body: 'Hooks let you use state and other React features without writing a class. We walk through useState, useEffect, and useContext with working examples. Understanding hooks is essential for modern React development.', authorId: 7, authorName: 'Grace Kim', tags: ['react', 'hooks', 'frontend'], publishedAt: '2024-02-14T10:00:00Z', updatedAt: '2024-02-14T10:00:00Z', status: 'published', viewCount: 5731, commentCount: 2 },
    { id: 4, title: 'Docker for Developers', slug: 'docker-for-developers', excerpt: 'Containerise your applications with Docker from scratch.', body: 'Docker simplifies environment consistency by packaging applications with their dependencies. This guide covers Dockerfiles, images, containers, and Compose. You will ship reproducible builds by the end.', authorId: 4, authorName: 'David Osei', tags: ['docker', 'devops', 'containers'], publishedAt: '2024-02-17T08:30:00Z', updatedAt: '2024-02-18T09:00:00Z', status: 'published', viewCount: 3215, commentCount: 2 },
    { id: 5, title: 'Building Accessible UIs', slug: 'building-accessible-uis', excerpt: 'Practical accessibility tips every frontend developer should know.', body: 'Accessibility is not optional — it is a legal and ethical requirement. We cover ARIA roles, keyboard navigation, contrast ratios, and screen reader testing. Implementing these practices benefits all users.', authorId: 3, authorName: 'Carla Mendez', tags: ['accessibility', 'ux', 'frontend'], publishedAt: '2024-02-19T11:00:00Z', updatedAt: '2024-02-20T08:00:00Z', status: 'published', viewCount: 1879, commentCount: 2 },
    { id: 6, title: 'Microservices Architecture Explained', slug: 'microservices-architecture-explained', excerpt: 'When to use microservices and how to design them well.', body: 'Microservices break monoliths into independently deployable services, each owning its data. We discuss service discovery, inter-service communication, and failure handling. The trade-offs versus monoliths are examined honestly.', authorId: 22, authorName: 'Victor Santos', tags: ['microservices', 'architecture', 'backend'], publishedAt: '2024-02-21T09:00:00Z', updatedAt: '2024-02-22T10:00:00Z', status: 'published', viewCount: 6480, commentCount: 2 },
    { id: 7, title: 'State Management in 2024', slug: 'state-management-in-2024', excerpt: 'Comparing Redux, Zustand, Jotai, and Context API for modern React apps.', body: 'The state management landscape has evolved dramatically. We compare popular solutions across bundle size, boilerplate, and developer experience. Choosing the right tool depends on your team size and app complexity.', authorId: 7, authorName: 'Grace Kim', tags: ['react', 'state', 'redux', 'zustand'], publishedAt: '2024-02-24T08:00:00Z', updatedAt: '2024-02-25T09:00:00Z', status: 'published', viewCount: 7212, commentCount: 2 },
    { id: 8, title: 'Understanding OAuth 2.0', slug: 'understanding-oauth-2', excerpt: 'A clear explanation of the OAuth 2.0 authorization framework.', body: 'OAuth 2.0 is the industry standard for delegated authorization. We explain grant types, tokens, scopes, and the roles of each party. Practical flows are illustrated with sequence diagrams.', authorId: 8, authorName: 'Henry Park', tags: ['oauth', 'security', 'auth'], publishedAt: '2024-02-26T10:00:00Z', updatedAt: '2024-02-27T08:30:00Z', status: 'published', viewCount: 3044, commentCount: 2 },
    { id: 9, title: 'The State of Frontend Tooling', slug: 'state-of-frontend-tooling', excerpt: 'From Webpack to Vite: how frontend build tools have changed.', body: 'Frontend tooling has undergone a revolution driven by ES modules and native browser capabilities. We survey bundlers, transpilers, and dev servers in 2024. Performance benchmarks show why Vite has become so popular.', authorId: 13, authorName: 'Mia Chen', tags: ['vite', 'webpack', 'build-tools', 'frontend'], publishedAt: '2024-02-27T09:00:00Z', updatedAt: '2024-02-28T10:00:00Z', status: 'published', viewCount: 4867, commentCount: 2 },
    { id: 10, title: 'Web Application Security Checklist', slug: 'web-application-security-checklist', excerpt: 'Essential security controls every web app must implement.', body: 'Security vulnerabilities cost companies millions each year and erode user trust. This checklist covers OWASP top-10 mitigations, CSP, rate limiting, and dependency auditing. Use it as a baseline for every release.', authorId: 8, authorName: 'Henry Park', tags: ['security', 'owasp', 'checklist'], publishedAt: '2024-02-29T08:00:00Z', updatedAt: '2024-03-01T09:00:00Z', status: 'published', viewCount: 8920, commentCount: 2 },
    { id: 11, title: 'Machine Learning Pipelines with Python', slug: 'ml-pipelines-with-python', excerpt: 'Building reproducible ML pipelines using scikit-learn and MLflow.', body: 'A reproducible ML pipeline is the foundation of reliable model deployment. We construct an end-to-end pipeline covering data ingestion, preprocessing, training, and experiment tracking. MLflow makes versioning and comparison effortless.', authorId: 13, authorName: 'Mia Chen', tags: ['ml', 'python', 'scikit-learn', 'mlflow'], publishedAt: '2024-03-02T10:00:00Z', updatedAt: '2024-03-03T08:30:00Z', status: 'published', viewCount: 3301, commentCount: 2 },
    { id: 12, title: 'Testing Strategies for Full-Stack Apps', slug: 'testing-strategies-full-stack', excerpt: 'Unit, integration, and end-to-end testing without the headache.', body: 'A balanced test suite covers fast unit tests, meaningful integration tests, and targeted end-to-end scenarios. We discuss test pyramid theory and apply it with Jest, Supertest, and Playwright. Avoid common pitfalls that lead to brittle tests.', authorId: 10, authorName: 'James Okafor', tags: ['testing', 'jest', 'playwright', 'fullstack'], publishedAt: '2024-03-04T08:00:00Z', updatedAt: '2024-03-05T09:00:00Z', status: 'published', viewCount: 2677, commentCount: 2 },
    { id: 13, title: 'Cloud Migration Patterns', slug: 'cloud-migration-patterns', excerpt: 'Lift-and-shift, re-platform, and re-architect: choosing the right approach.', body: 'Cloud migration is not one-size-fits-all — the right strategy depends on timeline, budget, and technical debt. We analyze the six Rs framework and share lessons from real migrations. Understanding trade-offs prevents costly surprises.', authorId: 22, authorName: 'Victor Santos', tags: ['cloud', 'aws', 'migration', 'architecture'], publishedAt: '2024-03-06T10:00:00Z', updatedAt: '2024-03-07T09:00:00Z', status: 'published', viewCount: 4155, commentCount: 2 },
    { id: 14, title: 'Product Roadmap Planning for Engineers', slug: 'product-roadmap-planning', excerpt: 'How engineering teams can contribute meaningfully to roadmap planning.', body: 'Engineers who understand the product strategy ship better software. We cover estimation techniques, technical debt advocacy, and communicating with stakeholders. Collaborative roadmap sessions lead to more realistic timelines.', authorId: 2, authorName: 'Brian Colton', tags: ['product', 'roadmap', 'planning', 'engineering'], publishedAt: '2024-03-07T08:00:00Z', updatedAt: '2024-03-08T09:00:00Z', status: 'published', viewCount: 2038, commentCount: 2 },
    { id: 15, title: 'CI/CD Pipelines from Scratch', slug: 'cicd-pipelines-from-scratch', excerpt: 'Set up a complete CI/CD pipeline with GitHub Actions in under an hour.', body: 'Continuous integration and delivery reduce manual steps and catch regressions early. We build a full pipeline: lint, test, build, and deploy to a staging environment using GitHub Actions. The resulting YAML is production-ready.', authorId: 6, authorName: 'Frank Nguyen', tags: ['ci', 'cd', 'github-actions', 'devops'], publishedAt: '2024-03-08T09:00:00Z', updatedAt: '2024-03-09T08:00:00Z', status: 'published', viewCount: 5443, commentCount: 2 },
  ];
}

// ─── Events ──────────────────────────────────────────────────────────────────

export function mockEventsData() {
  return [
    { id: 1, title: 'Frontend Summit 2024', description: 'Annual conference covering the latest in frontend development, tools, and frameworks.', startDate: '2024-04-15T09:00:00Z', endDate: '2024-04-17T17:00:00Z', location: { venue: 'Lakeside Convention Center', city: 'Portland', state: 'OR', country: 'US' }, organizer: 'TechStart', capacity: 1000, registered: 843, type: 'conference', tags: ['frontend', 'javascript', 'react'] },
    { id: 2, title: 'Cloud Infrastructure Workshop', description: 'Hands-on workshop on Kubernetes, Terraform, and cloud cost optimization.', startDate: '2024-04-22T10:00:00Z', endDate: '2024-04-22T16:00:00Z', location: { venue: 'Nexus Innovation Hub', city: 'Austin', state: 'TX', country: 'US' }, organizer: 'CloudNine', capacity: 50, registered: 48, type: 'workshop', tags: ['kubernetes', 'terraform', 'cloud'] },
    { id: 3, title: 'Product Design Sprint', description: 'A collaborative five-day sprint to solve complex design challenges.', startDate: '2024-04-29T09:00:00Z', endDate: '2024-05-03T17:00:00Z', location: { venue: 'CreativeSpace Studio', city: 'San Francisco', state: 'CA', country: 'US' }, organizer: 'Horizon Media', capacity: 20, registered: 18, type: 'workshop', tags: ['design', 'sprint', 'ux'] },
    { id: 4, title: 'Open Source Hackathon', description: 'Weekend hackathon contributing to popular open-source projects.', startDate: '2024-05-04T08:00:00Z', endDate: '2024-05-05T20:00:00Z', location: { venue: 'Tech Hub Central', city: 'Chicago', state: 'IL', country: 'US' }, organizer: 'BuildRight', capacity: 150, registered: 122, type: 'hackathon', tags: ['open-source', 'community', 'coding'] },
    { id: 5, title: 'Data Science Meetup', description: 'Monthly meetup for data scientists to share projects and new techniques.', startDate: '2024-05-10T18:30:00Z', endDate: '2024-05-10T21:00:00Z', location: { venue: 'DataCo Offices', city: 'Boston', state: 'MA', country: 'US' }, organizer: 'DataCo', capacity: 80, registered: 67, type: 'meetup', tags: ['data', 'ml', 'python'] },
    { id: 6, title: 'Security & Privacy Symposium', description: 'Expert talks on cybersecurity threats, defensive strategies, and privacy law.', startDate: '2024-05-20T09:00:00Z', endDate: '2024-05-21T17:00:00Z', location: { venue: 'Federal Hall Annex', city: 'Washington', state: 'DC', country: 'US' }, organizer: 'Nexus LLC', capacity: 300, registered: 251, type: 'symposium', tags: ['security', 'privacy', 'compliance'] },
    { id: 7, title: 'Agile Transformation Summit', description: 'Three-day summit on scaling agile practices across engineering organizations.', startDate: '2024-06-03T09:00:00Z', endDate: '2024-06-05T17:00:00Z', location: { venue: 'Grand Regency Hotel', city: 'Denver', state: 'CO', country: 'US' }, organizer: 'Global Ops', capacity: 400, registered: 312, type: 'conference', tags: ['agile', 'scrum', 'transformation'] },
    { id: 8, title: 'Mobile Development Bootcamp', description: 'Intensive three-day bootcamp covering React Native and Flutter.', startDate: '2024-06-10T09:00:00Z', endDate: '2024-06-12T17:00:00Z', location: { venue: 'Innovate Campus', city: 'Seattle', state: 'WA', country: 'US' }, organizer: 'TechStart', capacity: 30, registered: 30, type: 'bootcamp', tags: ['mobile', 'react-native', 'flutter'] },
    { id: 9, title: 'API Design Webinar', description: 'Live online session on designing developer-friendly APIs.', startDate: '2024-06-18T14:00:00Z', endDate: '2024-06-18T15:30:00Z', location: { venue: 'Online', city: '', state: '', country: '' }, organizer: 'Acme Corp', capacity: 500, registered: 347, type: 'webinar', tags: ['api', 'design', 'rest', 'graphql'] },
    { id: 10, title: 'Women in Tech Networking Night', description: 'Evening networking event celebrating and connecting women in the tech industry.', startDate: '2024-06-25T18:00:00Z', endDate: '2024-06-25T21:00:00Z', location: { venue: 'Skyline Rooftop Bar', city: 'New York', state: 'NY', country: 'US' }, organizer: 'Horizon Media', capacity: 120, registered: 98, type: 'networking', tags: ['diversity', 'networking', 'community'] },
    { id: 11, title: 'Kubernetes Day', description: 'Full-day event with talks and labs focused on Kubernetes in production.', startDate: '2024-07-08T09:00:00Z', endDate: '2024-07-08T18:00:00Z', location: { venue: 'Container World Expo', city: 'San Jose', state: 'CA', country: 'US' }, organizer: 'CloudNine', capacity: 200, registered: 183, type: 'conference', tags: ['kubernetes', 'containers', 'devops'] },
    { id: 12, title: 'JavaScript Conf', description: 'The premier JavaScript conference featuring 40+ speakers and workshops.', startDate: '2024-07-22T09:00:00Z', endDate: '2024-07-24T17:00:00Z', location: { venue: 'Metro Convention Hall', city: 'Minneapolis', state: 'MN', country: 'US' }, organizer: 'TechStart', capacity: 1500, registered: 1342, type: 'conference', tags: ['javascript', 'node', 'web'] },
    { id: 13, title: 'UX Research Methods Workshop', description: 'A practical workshop on qualitative and quantitative UX research methods.', startDate: '2024-07-30T10:00:00Z', endDate: '2024-07-30T16:00:00Z', location: { venue: 'Design Guild', city: 'Atlanta', state: 'GA', country: 'US' }, organizer: 'Horizon Media', capacity: 25, registered: 22, type: 'workshop', tags: ['ux', 'research', 'design'] },
    { id: 14, title: 'Startup Pitch Night', description: 'Five pre-seed startups pitch to a panel of investors and receive feedback.', startDate: '2024-08-07T18:30:00Z', endDate: '2024-08-07T21:30:00Z', location: { venue: 'Venture Loft', city: 'Miami', state: 'FL', country: 'US' }, organizer: 'BuildRight', capacity: 100, registered: 87, type: 'networking', tags: ['startup', 'pitch', 'investment'] },
    { id: 15, title: 'DevOps Days Nashville', description: 'Community conference exploring the intersection of dev and ops practices.', startDate: '2024-08-19T09:00:00Z', endDate: '2024-08-20T17:00:00Z', location: { venue: 'Music City Center', city: 'Nashville', state: 'TN', country: 'US' }, organizer: 'Global Ops', capacity: 600, registered: 521, type: 'conference', tags: ['devops', 'sre', 'platform'] },
    { id: 16, title: 'GraphQL Summit', description: 'Dedicated conference for GraphQL practitioners and API platform engineers.', startDate: '2024-09-09T09:00:00Z', endDate: '2024-09-10T17:00:00Z', location: { venue: 'The Grand Atrium', city: 'Las Vegas', state: 'NV', country: 'US' }, organizer: 'Acme Corp', capacity: 350, registered: 298, type: 'conference', tags: ['graphql', 'api', 'backend'] },
    { id: 17, title: 'Annual Company All-Hands', description: 'Company-wide meeting to review the year, share roadmap, and celebrate wins.', startDate: '2024-09-25T10:00:00Z', endDate: '2024-09-25T13:00:00Z', location: { venue: 'Acme Corp HQ', city: 'Springfield', state: 'IL', country: 'US' }, organizer: 'Acme Corp', capacity: 250, registered: 243, type: 'internal', tags: ['all-hands', 'company', 'internal'] },
    { id: 18, title: 'Serverless Computing Workshop', description: 'Learn to build and deploy serverless applications on AWS Lambda.', startDate: '2024-10-07T09:00:00Z', endDate: '2024-10-07T17:00:00Z', location: { venue: 'Online', city: '', state: '', country: '' }, organizer: 'CloudNine', capacity: 100, registered: 76, type: 'workshop', tags: ['serverless', 'aws', 'lambda'] },
    { id: 19, title: 'Tech for Good Symposium', description: 'Bringing together technologists working on social and environmental impact.', startDate: '2024-10-21T09:00:00Z', endDate: '2024-10-22T17:00:00Z', location: { venue: 'Civic Auditorium', city: 'Portland', state: 'OR', country: 'US' }, organizer: 'TechStart', capacity: 500, registered: 389, type: 'symposium', tags: ['social', 'impact', 'nonprofit'] },
    { id: 20, title: 'Year-End Engineering Retrospective', description: 'Engineering org-wide retrospective covering wins, learnings, and 2025 goals.', startDate: '2024-12-10T14:00:00Z', endDate: '2024-12-10T17:00:00Z', location: { venue: 'Online', city: '', state: '', country: '' }, organizer: 'Acme Corp', capacity: 300, registered: 178, type: 'internal', tags: ['retrospective', 'planning', 'internal'] },
  ];
}

// ─── Notifications ────────────────────────────────────────────────────────────

export function mockNotificationsData() {
  return [
    { id: 1, userId: 1, type: 'order_update', title: 'Order Shipped', message: 'Your order ORD-0001 has been shipped and will arrive by Friday.', read: true, createdAt: '2024-03-04T09:00:00Z', actionUrl: '/orders/ORD-0001' },
    { id: 2, userId: 3, type: 'order_update', title: 'Order Shipped', message: 'Your order ORD-0002 is on its way. Tracking number: TRK-88451.', read: false, createdAt: '2024-03-06T08:30:00Z', actionUrl: '/orders/ORD-0002' },
    { id: 3, userId: 5, type: 'order_update', title: 'Order Confirmed', message: 'We have received your order ORD-0003 and it is being processed.', read: false, createdAt: '2024-03-07T11:40:00Z', actionUrl: '/orders/ORD-0003' },
    { id: 4, userId: 1, type: 'promotion', title: 'Weekend Sale — 20% Off', message: 'Use code WEEKEND20 at checkout for 20% off all accessories this weekend.', read: false, createdAt: '2024-03-08T08:00:00Z', actionUrl: '/shop?category=accessories' },
    { id: 5, userId: 2, type: 'refund', title: 'Refund Processed', message: 'Your refund of $376.92 for order ORD-0005 has been processed.', read: true, createdAt: '2024-02-21T11:00:00Z', actionUrl: '/orders/ORD-0005' },
    { id: 6, userId: 7, type: 'system', title: 'Account Security Alert', message: 'A new device logged into your account from Portland, OR.', read: false, createdAt: '2024-03-08T14:30:00Z', actionUrl: '/account/security' },
    { id: 7, userId: 10, type: 'order_update', title: 'Order Delivered', message: 'Your order ORD-0006 was delivered successfully.', read: true, createdAt: '2024-02-19T17:00:00Z', actionUrl: '/orders/ORD-0006' },
    { id: 8, userId: 13, type: 'order_update', title: 'Order Shipped', message: 'Your order ORD-0007 is on its way! Expected delivery: Tuesday.', read: true, createdAt: '2024-03-08T10:00:00Z', actionUrl: '/orders/ORD-0007' },
    { id: 9, userId: 6, type: 'review_request', title: 'How was your order?', message: 'You recently received ORD-0008. Leave a review and help others.', read: false, createdAt: '2024-02-04T10:00:00Z', actionUrl: '/reviews/new?order=ORD-0008' },
    { id: 10, userId: 16, type: 'payment', title: 'Payment Pending', message: 'Your payment for ORD-0009 is pending confirmation. Check your bank app.', read: false, createdAt: '2024-03-09T10:45:00Z', actionUrl: '/orders/ORD-0009' },
    { id: 11, userId: 11, type: 'order_update', title: 'Order Delivered', message: 'Your standing desk converter has arrived. Enjoy the new setup!', read: true, createdAt: '2024-01-25T12:00:00Z', actionUrl: '/orders/ORD-0014' },
    { id: 12, userId: 22, type: 'review_request', title: 'Review your monitor arm', message: 'Tell us what you think about the Adjustable Monitor Arm you bought.', read: false, createdAt: '2024-01-17T10:00:00Z', actionUrl: '/reviews/new?product=16' },
    { id: 13, userId: 19, type: 'promotion', title: 'Loyalty Reward Applied', message: 'A $10 loyalty reward has been added to your account.', read: true, createdAt: '2024-02-28T14:05:00Z', actionUrl: '/account/rewards' },
    { id: 14, userId: 8, type: 'order_update', title: 'Order Shipped', message: 'ORD-0011 is heading your way. Estimated delivery in 2-3 business days.', read: true, createdAt: '2024-03-09T13:00:00Z', actionUrl: '/orders/ORD-0011' },
    { id: 15, userId: 25, type: 'refund', title: 'Refund Issued', message: 'Refund of $48.59 has been issued for ORD-0015. Allow 3-5 business days.', read: true, createdAt: '2024-02-10T11:00:00Z', actionUrl: '/orders/ORD-0015' },
    { id: 16, userId: 15, type: 'payment', title: 'Payment Confirmed', message: 'Your payment for ORD-0016 was confirmed. Thank you!', read: false, createdAt: '2024-03-04T11:10:00Z', actionUrl: '/orders/ORD-0016' },
    { id: 17, userId: 21, type: 'review_request', title: 'Review your recent order', message: 'Share your thoughts on the Whiteboard and Sticky Notes you received.', read: false, createdAt: '2024-01-22T10:00:00Z', actionUrl: '/reviews/new?order=ORD-0017' },
    { id: 18, userId: 24, type: 'order_update', title: 'Order Delivered', message: 'ORD-0013 was delivered. Enjoy your new tech!', read: true, createdAt: '2024-02-06T15:00:00Z', actionUrl: '/orders/ORD-0013' },
    { id: 19, userId: 12, type: 'system', title: 'Password Changed', message: 'Your account password was updated successfully.', read: true, createdAt: '2024-02-03T09:00:00Z', actionUrl: '/account/security' },
    { id: 20, userId: 18, type: 'order_update', title: 'Order Shipped', message: 'ORD-0020 has been dispatched and is expected by Monday.', read: false, createdAt: '2024-03-09T09:30:00Z', actionUrl: '/orders/ORD-0020' },
    { id: 21, userId: 17, type: 'payment', title: 'Payment Processing', message: 'Your payment for ORD-0018 is being processed. No action needed.', read: false, createdAt: '2024-03-08T09:10:00Z', actionUrl: '/orders/ORD-0018' },
    { id: 22, userId: 9, type: 'system', title: 'Subscription Renewal Failed', message: 'We could not charge your card for your Basic Plan. Please update your payment info.', read: false, createdAt: '2024-03-01T08:10:00Z', actionUrl: '/account/billing' },
    { id: 23, userId: 4, type: 'promotion', title: 'Flash Sale — Electronics', message: 'Electronics are 15% off for the next 24 hours. Shop now!', read: true, createdAt: '2024-03-05T08:00:00Z', actionUrl: '/shop?category=electronics' },
    { id: 24, userId: 23, type: 'system', title: 'Account Verified', message: 'Your email address has been verified. Your account is fully active.', read: true, createdAt: '2023-12-20T14:00:00Z', actionUrl: '/account' },
    { id: 25, userId: 14, type: 'promotion', title: 'Pro Plan Discount', message: 'Upgrade to an annual Pro Plan and save 30% — offer ends soon.', read: false, createdAt: '2024-03-07T09:00:00Z', actionUrl: '/pricing' },
  ];
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export function mockReviewsData() {
  return [
    { id: 1, productId: 2, userId: 1, userName: 'Alice Hartwell', rating: 5, title: 'Best keyboard I have owned', body: 'The tactile feedback is perfect and it has held up after months of heavy use. Worth every penny.', helpful: 34, verified: true, createdAt: '2024-03-06T10:00:00Z' },
    { id: 2, productId: 5, userId: 3, userName: 'Carla Mendez', rating: 4, title: 'Great noise cancellation', body: 'Battery life is excellent and the ANC is effective in coffee shops. Slightly tight on the head after 3+ hours.', helpful: 21, verified: true, createdAt: '2024-03-07T09:00:00Z' },
    { id: 3, productId: 14, userId: 5, userName: 'Elena Vasquez', rating: 5, title: 'Lightning fast transfer speeds', body: 'Transferred 200GB in minutes. Very compact and feels solid. Highly recommended for anyone who works on the go.', helpful: 47, verified: true, createdAt: '2024-03-08T11:00:00Z' },
    { id: 4, productId: 20, userId: 7, userName: 'Grace Kim', rating: 5, title: 'Game changer for my back', body: 'The lumbar support is outstanding. I no longer have afternoon back pain after switching to this chair.', helpful: 58, verified: false, createdAt: '2024-03-09T08:00:00Z' },
    { id: 5, productId: 11, userId: 10, userName: 'James Okafor', rating: 4, title: 'Sturdy and well made', body: 'Very stable at every angle. The height adjustments are smooth. Wish it came in more colors.', helpful: 15, verified: true, createdAt: '2024-02-20T10:00:00Z' },
    { id: 6, productId: 9, userId: 10, userName: 'James Okafor', rating: 4, title: 'Perfect lighting for video calls', body: 'The color temperature range is wide and the brightness is very adjustable. Touch controls are responsive.', helpful: 12, verified: true, createdAt: '2024-02-20T10:15:00Z' },
    { id: 7, productId: 4, userId: 6, userName: 'Frank Nguyen', rating: 3, title: 'Good but gets warm', body: 'Does everything it claims but the unit gets noticeably warm under load. Works fine for daily use.', helpful: 9, verified: true, createdAt: '2024-02-02T09:00:00Z' },
    { id: 8, productId: 13, userId: 6, userName: 'Frank Nguyen', rating: 5, title: 'Fast charge, clean design', body: 'Really like how minimal this looks on the desk. Charges my phone and earbuds simultaneously without issue.', helpful: 18, verified: true, createdAt: '2024-02-02T09:30:00Z' },
    { id: 9, productId: 19, userId: 13, userName: 'Mia Chen', rating: 5, title: 'Absolutely love this', body: 'The rain and white noise profiles are exceptional. It has improved my focus dramatically during deep work sessions.', helpful: 63, verified: true, createdAt: '2024-03-06T10:00:00Z' },
    { id: 10, productId: 26, userId: 16, userName: 'Paul Reyes', rating: 4, title: 'Good value surge protector', body: 'Solid build quality and the USB ports are fast. The cord length is adequate but I wish it were 8 feet.', helpful: 7, verified: true, createdAt: '2024-03-10T10:00:00Z' },
    { id: 11, productId: 16, userId: 22, userName: 'Victor Santos', rating: 5, title: 'Freed up so much desk space', body: 'Moved my monitor off the desk and immediately gained room for notebooks and coffee. Great build quality.', helpful: 29, verified: true, createdAt: '2024-01-16T09:00:00Z' },
    { id: 12, productId: 8, userId: 8, userName: 'Henry Park', rating: 4, title: 'Good lumbar relief', body: 'Noticeably reduced lower back discomfort. The strap keeps it in place. Memory foam softness is just right.', helpful: 11, verified: true, createdAt: '2024-03-07T08:00:00Z' },
    { id: 13, productId: 23, userId: 8, userName: 'Henry Park', rating: 3, title: 'Decent but a bit wobbly', body: 'Does the job but I notice a slight wobble at the highest setting. Does not affect comfort, just not perfectly rigid.', helpful: 5, verified: true, createdAt: '2024-03-07T08:30:00Z' },
    { id: 14, productId: 21, userId: 19, userName: 'Samuel Diaz', rating: 5, title: 'Keeps coffee hot all morning', body: 'Four hours in and my coffee was still very warm. Clean design that looks great on any desk.', helpful: 22, verified: false, createdAt: '2024-03-10T09:00:00Z' },
    { id: 15, productId: 6, userId: 24, userName: 'Xander Brooks', rating: 3, title: 'Works but nothing special', body: 'Video quality is decent in good lighting. Autofocus is slow. Fine for occasional calls, not for streaming.', helpful: 8, verified: true, createdAt: '2024-02-07T10:00:00Z' },
    { id: 16, productId: 7, userId: 11, userName: 'Karen Liu', rating: 5, title: 'Transformed my workspace', body: 'Easy to assemble and very stable. Switching between sitting and standing is effortless. Major productivity boost.', helpful: 41, verified: true, createdAt: '2024-01-26T10:00:00Z' },
    { id: 17, productId: 3, userId: 14, userName: 'Nathan Bell', rating: 5, title: 'Stunning image quality', body: 'Colors are vibrant and the 144Hz makes everything buttery smooth. HDR is genuinely impressive on this panel.', helpful: 55, verified: false, createdAt: '2024-01-05T10:00:00Z' },
    { id: 18, productId: 28, userId: 15, userName: 'Olivia Grant', rating: 4, title: 'Very comfortable to stand on', body: 'After a full day of standing I have much less fatigue. The massage bumps are a nice touch.', helpful: 16, verified: true, createdAt: '2024-03-06T10:00:00Z' },
    { id: 19, productId: 18, userId: 21, userName: 'Uma Patel', rating: 4, title: 'Clean and sturdy', body: 'Writes smoothly and erases cleanly. Magnetic surface is handy for pinning notes. Frame is solid.', helpful: 10, verified: true, createdAt: '2024-01-21T10:00:00Z' },
    { id: 20, productId: 30, userId: 17, userName: 'Quinn Hughes', rating: 4, title: 'Easy to set up, great colors', body: 'Connected to my hub in minutes. Color accuracy is good for mood lighting. Does not interfere with Wi-Fi.', helpful: 14, verified: true, createdAt: '2024-03-09T09:00:00Z' },
    { id: 21, productId: 24, userId: 12, userName: 'Liam Foster', rating: 3, title: 'Privacy is good, glare reduction less so', body: 'Does a solid job blocking side views. The anti-glare coating slightly reduces brightness. Trade-off I can live with.', helpful: 6, verified: true, createdAt: '2024-02-11T10:00:00Z' },
    { id: 22, productId: 25, userId: 18, userName: 'Rachel Stone', rating: 5, title: 'Clicker worked flawlessly', body: 'Range was excellent in a large conference room. Laser is bright and the buttons are satisfying to click.', helpful: 20, verified: true, createdAt: '2024-03-08T10:00:00Z' },
    { id: 23, productId: 29, userId: 18, userName: 'Rachel Stone', rating: 4, title: 'Handy little gadget', body: 'Makes organizing the office a breeze. Tape adhesion is strong and labels are readable. Battery lasts a long time.', helpful: 8, verified: true, createdAt: '2024-03-08T10:30:00Z' },
    { id: 24, productId: 1, userId: 4, userName: 'David Osei', rating: 4, title: 'Comfortable for long sessions', body: 'The ergonomic shape fits my hand well. Clicks are quiet and battery indicator is useful. Tracking is reliable.', helpful: 17, verified: false, createdAt: '2024-01-12T09:00:00Z' },
    { id: 25, productId: 15, userId: 25, userName: 'Yuki Tanaka', rating: 3, title: 'Good sound, bass is thin', body: 'Clear mids and highs. Waterproofing held up in the rain. Just wish there were a bit more bass presence.', helpful: 4, verified: false, createdAt: '2024-01-30T09:00:00Z' },
  ];
}

// ─── Customers ───────────────────────────────────────────────────────────────

export function mockCustomersData() {
  return [
    { id: 'CUST-001', name: 'Alice Hartwell', email: 'alice.hartwell@example.com', phone: '555-0101', company: 'Acme Corp', status: 'active', tier: 'pro', createdAt: '2023-01-15T08:30:00Z', totalOrders: 8, totalSpend: 1024.56 },
    { id: 'CUST-002', name: 'Brian Colton', email: 'brian.colton@example.com', phone: '555-0102', company: 'Widgets Inc', status: 'inactive', tier: 'free', createdAt: '2023-02-10T10:00:00Z', totalOrders: 1, totalSpend: 376.92 },
    { id: 'CUST-003', name: 'Carla Mendez', email: 'carla.mendez@example.com', phone: '555-0103', company: 'TechStart', status: 'active', tier: 'pro', createdAt: '2023-02-28T09:15:00Z', totalOrders: 5, totalSpend: 697.60 },
    { id: 'CUST-004', name: 'David Osei', email: 'david.osei@example.com', phone: '555-0104', company: 'Global Ops', status: 'active', tier: 'free', createdAt: '2023-03-05T14:00:00Z', totalOrders: 2, totalSpend: 178.30 },
    { id: 'CUST-005', name: 'Elena Vasquez', email: 'elena.vasquez@example.com', phone: '555-0105', company: 'DataCo', status: 'active', tier: 'enterprise', createdAt: '2023-03-20T11:30:00Z', totalOrders: 14, totalSpend: 3841.20 },
    { id: 'CUST-006', name: 'Frank Nguyen', email: 'frank.nguyen@example.com', phone: '555-0106', company: 'BuildRight', status: 'active', tier: 'pro', createdAt: '2023-04-01T08:00:00Z', totalOrders: 6, totalSpend: 892.44 },
    { id: 'CUST-007', name: 'Grace Kim', email: 'grace.kim@example.com', phone: '555-0107', company: 'CloudNine', status: 'active', tier: 'enterprise', createdAt: '2023-04-15T13:45:00Z', totalOrders: 11, totalSpend: 2150.75 },
    { id: 'CUST-008', name: 'Henry Park', email: 'henry.park@example.com', phone: '555-0108', company: 'Nexus LLC', status: 'active', tier: 'pro', createdAt: '2023-05-01T09:00:00Z', totalOrders: 4, totalSpend: 561.90 },
    { id: 'CUST-009', name: 'Isla Thompson', email: 'isla.thompson@example.com', phone: '555-0109', company: 'Horizon Media', status: 'suspended', tier: 'free', createdAt: '2023-05-18T10:30:00Z', totalOrders: 0, totalSpend: 0.00 },
    { id: 'CUST-010', name: 'James Okafor', email: 'james.okafor@example.com', phone: '555-0110', company: 'Acme Corp', status: 'active', tier: 'pro', createdAt: '2023-06-02T08:30:00Z', totalOrders: 7, totalSpend: 1133.82 },
    { id: 'CUST-011', name: 'Karen Liu', email: 'karen.liu@example.com', phone: '555-0111', company: 'Widgets Inc', status: 'active', tier: 'enterprise', createdAt: '2023-06-20T14:15:00Z', totalOrders: 9, totalSpend: 2877.60 },
    { id: 'CUST-012', name: 'Liam Foster', email: 'liam.foster@example.com', phone: '555-0112', company: 'TechStart', status: 'active', tier: 'free', createdAt: '2023-07-07T11:00:00Z', totalOrders: 3, totalSpend: 319.45 },
    { id: 'CUST-013', name: 'Mia Chen', email: 'mia.chen@example.com', phone: '555-0113', company: 'DataCo', status: 'active', tier: 'pro', createdAt: '2023-07-25T09:45:00Z', totalOrders: 5, totalSpend: 748.95 },
    { id: 'CUST-014', name: 'Nathan Bell', email: 'nathan.bell@example.com', phone: '555-0114', company: 'BuildRight', status: 'inactive', tier: 'free', createdAt: '2023-08-10T08:00:00Z', totalOrders: 1, totalSpend: 129.00 },
    { id: 'CUST-015', name: 'Olivia Grant', email: 'olivia.grant@example.com', phone: '555-0115', company: 'CloudNine', status: 'active', tier: 'pro', createdAt: '2023-08-28T13:30:00Z', totalOrders: 4, totalSpend: 622.10 },
    { id: 'CUST-016', name: 'Paul Reyes', email: 'paul.reyes@example.com', phone: '555-0116', company: 'Nexus LLC', status: 'active', tier: 'pro', createdAt: '2023-09-05T10:00:00Z', totalOrders: 3, totalSpend: 484.25 },
    { id: 'CUST-017', name: 'Quinn Hughes', email: 'quinn.hughes@example.com', phone: '555-0117', company: 'Global Ops', status: 'active', tier: 'enterprise', createdAt: '2023-09-22T09:15:00Z', totalOrders: 12, totalSpend: 4320.00 },
    { id: 'CUST-018', name: 'Rachel Stone', email: 'rachel.stone@example.com', phone: '555-0118', company: 'Horizon Media', status: 'active', tier: 'pro', createdAt: '2023-10-08T11:30:00Z', totalOrders: 6, totalSpend: 980.88 },
    { id: 'CUST-019', name: 'Samuel Diaz', email: 'samuel.diaz@example.com', phone: '555-0119', company: 'Acme Corp', status: 'active', tier: 'free', createdAt: '2023-10-25T08:45:00Z', totalOrders: 2, totalSpend: 244.72 },
    { id: 'CUST-020', name: 'Tara Williams', email: 'tara.williams@example.com', phone: '555-0120', company: 'DataCo', status: 'inactive', tier: 'free', createdAt: '2023-11-10T14:00:00Z', totalOrders: 1, totalSpend: 55.96 },
  ];
}

// ─── Addresses ───────────────────────────────────────────────────────────────

export function mockAddressesData() {
  return [
    { id: 1, userId: 1, label: 'Home', street: '12 Maple Ave', city: 'Springfield', state: 'IL', zip: '62701', country: 'United States', countryCode: 'US', lat: 39.7817, lng: -89.6501, isDefault: true },
    { id: 2, userId: 1, label: 'Work', street: '100 Tech Parkway, Ste 400', city: 'Springfield', state: 'IL', zip: '62704', country: 'United States', countryCode: 'US', lat: 39.7990, lng: -89.6440, isDefault: false },
    { id: 3, userId: 2, label: 'Home', street: '8 Oak Street', city: 'Shelbyville', state: 'TN', zip: '37160', country: 'United States', countryCode: 'US', lat: 35.4834, lng: -86.4608, isDefault: true },
    { id: 4, userId: 3, label: 'Home', street: '5 Pine Road', city: 'Lakeview', state: 'CA', zip: '90210', country: 'United States', countryCode: 'US', lat: 34.0901, lng: -118.4065, isDefault: true },
    { id: 5, userId: 4, label: 'Home', street: '22 Birch Lane', city: 'Riverside', state: 'OH', zip: '43210', country: 'United States', countryCode: 'US', lat: 39.9612, lng: -82.9988, isDefault: true },
    { id: 6, userId: 5, label: 'Home', street: '3 Cedar Blvd', city: 'Westport', state: 'CT', zip: '06880', country: 'United States', countryCode: 'US', lat: 41.1415, lng: -73.3579, isDefault: true },
    { id: 7, userId: 5, label: 'Office', street: '200 Data Drive', city: 'Stamford', state: 'CT', zip: '06901', country: 'United States', countryCode: 'US', lat: 41.0534, lng: -73.5387, isDefault: false },
    { id: 8, userId: 6, label: 'Home', street: '17 Elm Court', city: 'Madison', state: 'WI', zip: '53703', country: 'United States', countryCode: 'US', lat: 43.0731, lng: -89.4012, isDefault: true },
    { id: 9, userId: 7, label: 'Home', street: '9 Walnut Dr', city: 'Portland', state: 'OR', zip: '97201', country: 'United States', countryCode: 'US', lat: 45.5051, lng: -122.6750, isDefault: true },
    { id: 10, userId: 8, label: 'Home', street: '33 Spruce St', city: 'Austin', state: 'TX', zip: '78701', country: 'United States', countryCode: 'US', lat: 30.2672, lng: -97.7431, isDefault: true },
    { id: 11, userId: 9, label: 'Home', street: '6 Redwood Way', city: 'Denver', state: 'CO', zip: '80201', country: 'United States', countryCode: 'US', lat: 39.7392, lng: -104.9903, isDefault: true },
    { id: 12, userId: 10, label: 'Home', street: '44 Aspen Rd', city: 'Atlanta', state: 'GA', zip: '30301', country: 'United States', countryCode: 'US', lat: 33.7490, lng: -84.3880, isDefault: true },
    { id: 13, userId: 11, label: 'Home', street: '2 Poplar Ave', city: 'Seattle', state: 'WA', zip: '98101', country: 'United States', countryCode: 'US', lat: 47.6062, lng: -122.3321, isDefault: true },
    { id: 14, userId: 12, label: 'Home', street: '55 Hickory Ln', city: 'Charlotte', state: 'NC', zip: '28201', country: 'United States', countryCode: 'US', lat: 35.2271, lng: -80.8431, isDefault: true },
    { id: 15, userId: 13, label: 'Home', street: '18 Magnolia Ct', city: 'Boston', state: 'MA', zip: '02101', country: 'United States', countryCode: 'US', lat: 42.3601, lng: -71.0589, isDefault: true },
    { id: 16, userId: 14, label: 'Home', street: '71 Cypress St', city: 'Phoenix', state: 'AZ', zip: '85001', country: 'United States', countryCode: 'US', lat: 33.4484, lng: -112.0740, isDefault: true },
    { id: 17, userId: 15, label: 'Home', street: '29 Sycamore Blvd', city: 'Minneapolis', state: 'MN', zip: '55401', country: 'United States', countryCode: 'US', lat: 44.9778, lng: -93.2650, isDefault: true },
    { id: 18, userId: 16, label: 'Home', street: '14 Chestnut Dr', city: 'San Jose', state: 'CA', zip: '95101', country: 'United States', countryCode: 'US', lat: 37.3382, lng: -121.8863, isDefault: true },
    { id: 19, userId: 17, label: 'Home', street: '38 Linden Ave', city: 'Detroit', state: 'MI', zip: '48201', country: 'United States', countryCode: 'US', lat: 42.3314, lng: -83.0458, isDefault: true },
    { id: 20, userId: 18, label: 'Home', street: '5 Acacia Rd', city: 'Nashville', state: 'TN', zip: '37201', country: 'United States', countryCode: 'US', lat: 36.1627, lng: -86.7816, isDefault: true },
  ];
}

// ─── Invoices ────────────────────────────────────────────────────────────────

export function mockInvoicesData() {
  return [
    { id: 'INV-0001', invoiceNumber: 'INV-2024-0001', customerId: 'CUST-001', customerName: 'Alice Hartwell', items: [{ description: 'Pro Plan Subscription', qty: 1, unitPrice: 49.00, total: 49.00 }], subtotal: 49.00, tax: 3.92, total: 52.92, status: 'paid', dueDate: '2024-02-15T00:00:00Z', paidAt: '2024-02-12T10:00:00Z', createdAt: '2024-02-01T09:00:00Z' },
    { id: 'INV-0002', invoiceNumber: 'INV-2024-0002', customerId: 'CUST-005', customerName: 'Elena Vasquez', items: [{ description: 'Enterprise Plan - Annual', qty: 1, unitPrice: 999.00, total: 999.00 }, { description: 'Onboarding Support', qty: 3, unitPrice: 150.00, total: 450.00 }], subtotal: 1449.00, tax: 115.92, total: 1564.92, status: 'paid', dueDate: '2024-01-30T00:00:00Z', paidAt: '2024-01-28T14:00:00Z', createdAt: '2024-01-15T09:00:00Z' },
    { id: 'INV-0003', invoiceNumber: 'INV-2024-0003', customerId: 'CUST-007', customerName: 'Grace Kim', items: [{ description: 'Enterprise Plan - Monthly', qty: 1, unitPrice: 199.00, total: 199.00 }], subtotal: 199.00, tax: 15.92, total: 214.92, status: 'paid', dueDate: '2024-03-01T00:00:00Z', paidAt: '2024-02-28T09:00:00Z', createdAt: '2024-02-15T09:00:00Z' },
    { id: 'INV-0004', invoiceNumber: 'INV-2024-0004', customerId: 'CUST-010', customerName: 'James Okafor', items: [{ description: 'Pro Plan Subscription', qty: 1, unitPrice: 49.00, total: 49.00 }], subtotal: 49.00, tax: 3.92, total: 52.92, status: 'sent', dueDate: '2024-03-31T00:00:00Z', paidAt: null, createdAt: '2024-03-01T09:00:00Z' },
    { id: 'INV-0005', invoiceNumber: 'INV-2024-0005', customerId: 'CUST-011', customerName: 'Karen Liu', items: [{ description: 'Enterprise Plan - Annual', qty: 1, unitPrice: 999.00, total: 999.00 }], subtotal: 999.00, tax: 79.92, total: 1078.92, status: 'overdue', dueDate: '2024-02-28T00:00:00Z', paidAt: null, createdAt: '2024-02-15T09:00:00Z' },
    { id: 'INV-0006', invoiceNumber: 'INV-2024-0006', customerId: 'CUST-017', customerName: 'Quinn Hughes', items: [{ description: 'Enterprise Plan - Annual', qty: 1, unitPrice: 999.00, total: 999.00 }, { description: 'Custom Integration Work', qty: 8, unitPrice: 200.00, total: 1600.00 }], subtotal: 2599.00, tax: 207.92, total: 2806.92, status: 'paid', dueDate: '2024-01-15T00:00:00Z', paidAt: '2024-01-10T11:00:00Z', createdAt: '2024-01-01T09:00:00Z' },
    { id: 'INV-0007', invoiceNumber: 'INV-2024-0007', customerId: 'CUST-003', customerName: 'Carla Mendez', items: [{ description: 'Pro Plan Subscription', qty: 1, unitPrice: 49.00, total: 49.00 }], subtotal: 49.00, tax: 3.92, total: 52.92, status: 'paid', dueDate: '2024-03-01T00:00:00Z', paidAt: '2024-02-27T09:00:00Z', createdAt: '2024-02-15T09:00:00Z' },
    { id: 'INV-0008', invoiceNumber: 'INV-2024-0008', customerId: 'CUST-006', customerName: 'Frank Nguyen', items: [{ description: 'Pro Plan Subscription', qty: 1, unitPrice: 49.00, total: 49.00 }, { description: 'API Call Overage (500k calls)', qty: 1, unitPrice: 25.00, total: 25.00 }], subtotal: 74.00, tax: 5.92, total: 79.92, status: 'sent', dueDate: '2024-03-31T00:00:00Z', paidAt: null, createdAt: '2024-03-01T09:00:00Z' },
    { id: 'INV-0009', invoiceNumber: 'INV-2024-0009', customerId: 'CUST-008', customerName: 'Henry Park', items: [{ description: 'Pro Plan Subscription', qty: 1, unitPrice: 49.00, total: 49.00 }], subtotal: 49.00, tax: 3.92, total: 52.92, status: 'draft', dueDate: '2024-04-15T00:00:00Z', paidAt: null, createdAt: '2024-03-25T09:00:00Z' },
    { id: 'INV-0010', invoiceNumber: 'INV-2024-0010', customerId: 'CUST-015', customerName: 'Olivia Grant', items: [{ description: 'Pro Plan Subscription', qty: 1, unitPrice: 49.00, total: 49.00 }], subtotal: 49.00, tax: 3.92, total: 52.92, status: 'paid', dueDate: '2024-03-01T00:00:00Z', paidAt: '2024-02-25T14:00:00Z', createdAt: '2024-02-15T09:00:00Z' },
    { id: 'INV-0011', invoiceNumber: 'INV-2024-0011', customerId: 'CUST-013', customerName: 'Mia Chen', items: [{ description: 'Pro Plan Subscription', qty: 1, unitPrice: 49.00, total: 49.00 }], subtotal: 49.00, tax: 3.92, total: 52.92, status: 'overdue', dueDate: '2024-02-15T00:00:00Z', paidAt: null, createdAt: '2024-02-01T09:00:00Z' },
    { id: 'INV-0012', invoiceNumber: 'INV-2024-0012', customerId: 'CUST-016', customerName: 'Paul Reyes', items: [{ description: 'Pro Plan Subscription', qty: 1, unitPrice: 49.00, total: 49.00 }], subtotal: 49.00, tax: 3.92, total: 52.92, status: 'sent', dueDate: '2024-03-31T00:00:00Z', paidAt: null, createdAt: '2024-03-15T09:00:00Z' },
    { id: 'INV-0013', invoiceNumber: 'INV-2024-0013', customerId: 'CUST-018', customerName: 'Rachel Stone', items: [{ description: 'Pro Plan Subscription', qty: 1, unitPrice: 49.00, total: 49.00 }], subtotal: 49.00, tax: 3.92, total: 52.92, status: 'paid', dueDate: '2024-03-01T00:00:00Z', paidAt: '2024-02-26T10:00:00Z', createdAt: '2024-02-15T09:00:00Z' },
    { id: 'INV-0014', invoiceNumber: 'INV-2024-0014', customerId: 'CUST-005', customerName: 'Elena Vasquez', items: [{ description: 'Additional User Seats (x5)', qty: 5, unitPrice: 20.00, total: 100.00 }], subtotal: 100.00, tax: 8.00, total: 108.00, status: 'paid', dueDate: '2024-03-15T00:00:00Z', paidAt: '2024-03-12T09:00:00Z', createdAt: '2024-03-01T09:00:00Z' },
    { id: 'INV-0015', invoiceNumber: 'INV-2024-0015', customerId: 'CUST-007', customerName: 'Grace Kim', items: [{ description: 'Enterprise Plan - Monthly', qty: 1, unitPrice: 199.00, total: 199.00 }, { description: 'Priority Support Add-on', qty: 1, unitPrice: 49.00, total: 49.00 }], subtotal: 248.00, tax: 19.84, total: 267.84, status: 'draft', dueDate: '2024-04-01T00:00:00Z', paidAt: null, createdAt: '2024-03-15T09:00:00Z' },
  ];
}

// ─── Payments ────────────────────────────────────────────────────────────────

export function mockPaymentsData() {
  return [
    { id: 'PAY-001', orderId: 'ORD-0001', customerId: 'CUST-001', method: 'card', amount: 129.58, currency: 'USD', status: 'succeeded', transactionId: 'ch_1A2B3C4D5E', createdAt: '2024-03-01T10:05:00Z' },
    { id: 'PAY-002', orderId: 'ORD-0002', customerId: 'CUST-003', method: 'paypal', amount: 139.32, currency: 'USD', status: 'succeeded', transactionId: 'PP-87654XYZ', createdAt: '2024-03-03T09:22:00Z' },
    { id: 'PAY-003', orderId: 'ORD-0003', customerId: 'CUST-005', method: 'card', amount: 194.38, currency: 'USD', status: 'pending', transactionId: 'ch_2B3C4D5E6F', createdAt: '2024-03-07T11:36:00Z' },
    { id: 'PAY-004', orderId: 'ORD-0006', customerId: 'CUST-010', method: 'card', amount: 68.02, currency: 'USD', status: 'succeeded', transactionId: 'ch_3C4D5E6F7G', createdAt: '2024-02-15T10:06:00Z' },
    { id: 'PAY-005', orderId: 'ORD-0005', customerId: 'CUST-002', method: 'card', amount: 376.92, currency: 'USD', status: 'refunded', transactionId: 'ch_4D5E6F7G8H', createdAt: '2024-02-20T08:32:00Z' },
    { id: 'PAY-006', orderId: 'ORD-0008', customerId: 'CUST-006', method: 'bank', amount: 107.97, currency: 'USD', status: 'succeeded', transactionId: 'ACH-11223344', createdAt: '2024-01-28T09:06:00Z' },
    { id: 'PAY-007', orderId: 'ORD-0010', customerId: 'CUST-022', method: 'card', amount: 70.19, currency: 'USD', status: 'succeeded', transactionId: 'ch_5E6F7G8H9I', createdAt: '2024-01-10T14:06:00Z' },
    { id: 'PAY-008', orderId: 'ORD-0007', customerId: 'CUST-013', method: 'paypal', amount: 32.39, currency: 'USD', status: 'succeeded', transactionId: 'PP-98765ABC', createdAt: '2024-03-05T13:06:00Z' },
    { id: 'PAY-009', orderId: 'ORD-0011', customerId: 'CUST-008', method: 'card', amount: 61.54, currency: 'USD', status: 'succeeded', transactionId: 'ch_6F7G8H9I0J', createdAt: '2024-03-06T08:51:00Z' },
    { id: 'PAY-010', orderId: 'ORD-0009', customerId: 'CUST-016', method: 'card', amount: 77.73, currency: 'USD', status: 'pending', transactionId: 'ch_7G8H9I0J1K', createdAt: '2024-03-09T10:36:00Z' },
    { id: 'PAY-011', orderId: 'ORD-0014', customerId: 'CUST-011', method: 'bank', amount: 204.12, currency: 'USD', status: 'succeeded', transactionId: 'ACH-55667788', createdAt: '2024-01-20T10:06:00Z' },
    { id: 'PAY-012', orderId: 'ORD-0013', customerId: 'CUST-024', method: 'card', amount: 90.69, currency: 'USD', status: 'succeeded', transactionId: 'ch_8H9I0J1K2L', createdAt: '2024-02-01T09:36:00Z' },
    { id: 'PAY-013', orderId: 'ORD-0015', customerId: 'CUST-025', method: 'paypal', amount: 48.59, currency: 'USD', status: 'refunded', transactionId: 'PP-24680ZZZ', createdAt: '2024-02-10T08:02:00Z' },
    { id: 'PAY-014', orderId: 'ORD-0016', customerId: 'CUST-015', method: 'card', amount: 62.62, currency: 'USD', status: 'pending', transactionId: 'ch_9I0J1K2L3M', createdAt: '2024-03-04T11:06:00Z' },
    { id: 'PAY-015', orderId: 'ORD-0017', customerId: 'CUST-021', method: 'card', amount: 64.77, currency: 'USD', status: 'succeeded', transactionId: 'ch_0J1K2L3M4N', createdAt: '2024-01-15T14:36:00Z' },
    { id: 'PAY-016', orderId: 'ORD-0019', customerId: 'CUST-012', method: 'card', amount: 29.15, currency: 'USD', status: 'succeeded', transactionId: 'ch_1K2L3M4N5O', createdAt: '2024-02-05T09:36:00Z' },
    { id: 'PAY-017', orderId: 'ORD-0020', customerId: 'CUST-018', method: 'paypal', amount: 45.34, currency: 'USD', status: 'succeeded', transactionId: 'PP-13579WWW', createdAt: '2024-03-07T15:36:00Z' },
    { id: 'PAY-018', orderId: 'ORD-0018', customerId: 'CUST-017', method: 'card', amount: 60.44, currency: 'USD', status: 'pending', transactionId: 'ch_2L3M4N5O6P', createdAt: '2024-03-08T09:06:00Z' },
    { id: 'PAY-019', orderId: 'ORD-0012', customerId: 'CUST-019', method: 'card', amount: 47.50, currency: 'USD', status: 'pending', transactionId: 'ch_3M4N5O6P7Q', createdAt: '2024-03-09T15:06:00Z' },
    { id: 'PAY-020', orderId: 'ORD-0004', customerId: 'CUST-007', method: 'bank', amount: 247.32, currency: 'USD', status: 'pending', transactionId: 'ACH-99001122', createdAt: '2024-03-08T14:06:00Z' },
  ];
}

// ─── Employees ───────────────────────────────────────────────────────────────

export function mockEmployeesData() {
  return [
    { id: 'EMP-001', name: 'Alice Hartwell', email: 'alice.hartwell@acmecorp.example.com', department: 'Engineering', role: 'Software Engineer', salary: 115000, hireDate: '2020-03-01T00:00:00Z', managerId: 'EMP-005', skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'], remote: true, active: true },
    { id: 'EMP-002', name: 'Brian Colton', email: 'brian.colton@acmecorp.example.com', department: 'Product', role: 'Product Manager', salary: 125000, hireDate: '2019-07-15T00:00:00Z', managerId: 'EMP-010', skills: ['Roadmapping', 'User Research', 'SQL', 'Figma'], remote: false, active: true },
    { id: 'EMP-003', name: 'Carla Mendez', email: 'carla.mendez@acmecorp.example.com', department: 'Design', role: 'UX Designer', salary: 105000, hireDate: '2021-01-10T00:00:00Z', managerId: 'EMP-012', skills: ['Figma', 'Accessibility', 'User Testing', 'Prototyping'], remote: true, active: true },
    { id: 'EMP-004', name: 'David Osei', email: 'david.osei@acmecorp.example.com', department: 'Infrastructure', role: 'DevOps Engineer', salary: 118000, hireDate: '2020-06-01T00:00:00Z', managerId: 'EMP-015', skills: ['Kubernetes', 'Terraform', 'AWS', 'CI/CD'], remote: true, active: false },
    { id: 'EMP-005', name: 'Elena Vasquez', email: 'elena.vasquez@acmecorp.example.com', department: 'Engineering', role: 'Engineering Manager', salary: 155000, hireDate: '2018-04-01T00:00:00Z', managerId: 'EMP-010', skills: ['System Design', 'TypeScript', 'Leadership', 'Python'], remote: false, active: true },
    { id: 'EMP-006', name: 'Frank Nguyen', email: 'frank.nguyen@acmecorp.example.com', department: 'Engineering', role: 'Backend Developer', salary: 112000, hireDate: '2021-08-15T00:00:00Z', managerId: 'EMP-005', skills: ['Go', 'PostgreSQL', 'Redis', 'gRPC'], remote: true, active: true },
    { id: 'EMP-007', name: 'Grace Kim', email: 'grace.kim@acmecorp.example.com', department: 'Engineering', role: 'Frontend Developer', salary: 110000, hireDate: '2022-02-01T00:00:00Z', managerId: 'EMP-005', skills: ['React', 'TypeScript', 'CSS', 'Testing Library'], remote: true, active: true },
    { id: 'EMP-008', name: 'Henry Park', email: 'henry.park@acmecorp.example.com', department: 'Security', role: 'Security Analyst', salary: 120000, hireDate: '2020-11-01T00:00:00Z', managerId: 'EMP-015', skills: ['Penetration Testing', 'SIEM', 'Python', 'Compliance'], remote: false, active: true },
    { id: 'EMP-009', name: 'Isla Thompson', email: 'isla.thompson@acmecorp.example.com', department: 'Marketing', role: 'Content Strategist', salary: 88000, hireDate: '2022-05-01T00:00:00Z', managerId: 'EMP-014', skills: ['SEO', 'Copywriting', 'Analytics', 'CMS'], remote: true, active: false },
    { id: 'EMP-010', name: 'James Okafor', email: 'james.okafor@acmecorp.example.com', department: 'Executive', role: 'VP of Engineering', salary: 220000, hireDate: '2016-09-01T00:00:00Z', managerId: null, skills: ['Leadership', 'Strategy', 'Architecture', 'Hiring'], remote: false, active: true },
    { id: 'EMP-011', name: 'Karen Liu', email: 'karen.liu@acmecorp.example.com', department: 'Product', role: 'Scrum Master', salary: 99000, hireDate: '2020-10-01T00:00:00Z', managerId: 'EMP-010', skills: ['Scrum', 'Kanban', 'JIRA', 'Facilitation'], remote: false, active: true },
    { id: 'EMP-012', name: 'Liam Foster', email: 'liam.foster@acmecorp.example.com', department: 'Design', role: 'Design Manager', salary: 135000, hireDate: '2019-03-01T00:00:00Z', managerId: 'EMP-010', skills: ['Figma', 'Design Systems', 'Leadership', 'Brand'], remote: false, active: true },
    { id: 'EMP-013', name: 'Mia Chen', email: 'mia.chen@acmecorp.example.com', department: 'Data Science', role: 'ML Engineer', salary: 130000, hireDate: '2021-06-01T00:00:00Z', managerId: 'EMP-015', skills: ['Python', 'PyTorch', 'MLflow', 'SQL'], remote: true, active: true },
    { id: 'EMP-014', name: 'Nathan Bell', email: 'nathan.bell@acmecorp.example.com', department: 'Marketing', role: 'Marketing Director', salary: 145000, hireDate: '2018-11-01T00:00:00Z', managerId: 'EMP-010', skills: ['Campaigns', 'Analytics', 'Brand', 'SEO'], remote: false, active: false },
    { id: 'EMP-015', name: 'Olivia Grant', email: 'olivia.grant@acmecorp.example.com', department: 'Operations', role: 'VP of Operations', salary: 195000, hireDate: '2017-05-01T00:00:00Z', managerId: null, skills: ['Strategy', 'Budgeting', 'Process', 'Leadership'], remote: false, active: true },
    { id: 'EMP-016', name: 'Paul Reyes', email: 'paul.reyes@acmecorp.example.com', department: 'Sales', role: 'Sales Engineer', salary: 108000, hireDate: '2022-08-01T00:00:00Z', managerId: 'EMP-015', skills: ['Pre-sales', 'Demo', 'Technical Writing', 'CRM'], remote: true, active: true },
    { id: 'EMP-017', name: 'Quinn Hughes', email: 'quinn.hughes@acmecorp.example.com', department: 'Operations', role: 'Project Manager', salary: 95000, hireDate: '2021-03-01T00:00:00Z', managerId: 'EMP-015', skills: ['PMP', 'Asana', 'Risk Management', 'Budgeting'], remote: false, active: true },
    { id: 'EMP-018', name: 'Rachel Stone', email: 'rachel.stone@acmecorp.example.com', department: 'Design', role: 'Creative Director', salary: 140000, hireDate: '2019-09-01T00:00:00Z', managerId: 'EMP-012', skills: ['Branding', 'Illustration', 'Motion', 'Leadership'], remote: false, active: true },
    { id: 'EMP-019', name: 'Samuel Diaz', email: 'samuel.diaz@acmecorp.example.com', department: 'Finance', role: 'Financial Analyst', salary: 92000, hireDate: '2022-01-15T00:00:00Z', managerId: 'EMP-015', skills: ['Excel', 'SQL', 'Forecasting', 'Power BI'], remote: false, active: true },
    { id: 'EMP-020', name: 'Tara Williams', email: 'tara.williams@acmecorp.example.com', department: 'Data Science', role: 'Data Engineer', salary: 122000, hireDate: '2021-10-01T00:00:00Z', managerId: 'EMP-015', skills: ['Spark', 'Airflow', 'dbt', 'Snowflake'], remote: true, active: false },
  ];
}

// ─── Companies ───────────────────────────────────────────────────────────────

export function mockCompaniesData() {
  return [
    { id: 1, name: 'Acme Corp', domain: 'acmecorp.example.com', industry: 'Software', size: '501-1000', founded: 2005, revenue: '$85M', employees: 720, country: 'US', description: 'Enterprise software solutions for mid-market and large businesses.', tags: ['saas', 'enterprise', 'b2b'] },
    { id: 2, name: 'Widgets Inc', domain: 'widgetsinc.example.com', industry: 'Hardware', size: '51-200', founded: 2012, revenue: '$22M', employees: 140, country: 'US', description: 'Consumer hardware accessories and peripherals.', tags: ['hardware', 'consumer', 'accessories'] },
    { id: 3, name: 'TechStart', domain: 'techstart.example.com', industry: 'Software', size: '11-50', founded: 2020, revenue: '$4M', employees: 38, country: 'US', description: 'Developer tools and productivity software for engineering teams.', tags: ['startup', 'developer-tools', 'productivity'] },
    { id: 4, name: 'Global Ops', domain: 'globalops.example.com', industry: 'Consulting', size: '201-500', founded: 2008, revenue: '$60M', employees: 430, country: 'US', description: 'Operations consulting for Fortune 500 companies worldwide.', tags: ['consulting', 'operations', 'enterprise'] },
    { id: 5, name: 'DataCo', domain: 'dataco.example.com', industry: 'Data & Analytics', size: '201-500', founded: 2015, revenue: '$45M', employees: 315, country: 'US', description: 'Data platform and analytics products for data-driven organizations.', tags: ['data', 'analytics', 'ml'] },
    { id: 6, name: 'BuildRight', domain: 'buildright.example.com', industry: 'Construction Tech', size: '51-200', founded: 2017, revenue: '$18M', employees: 90, country: 'US', description: 'Construction project management and estimating software.', tags: ['construction', 'saas', 'project-management'] },
    { id: 7, name: 'CloudNine', domain: 'cloudnine.example.com', industry: 'Cloud Services', size: '501-1000', founded: 2010, revenue: '$120M', employees: 850, country: 'US', description: 'Managed cloud infrastructure and platform services.', tags: ['cloud', 'managed-services', 'infrastructure'] },
    { id: 8, name: 'Nexus LLC', domain: 'nexusllc.example.com', industry: 'Cybersecurity', size: '51-200', founded: 2016, revenue: '$28M', employees: 145, country: 'US', description: 'Cybersecurity consulting and managed security services.', tags: ['security', 'consulting', 'compliance'] },
    { id: 9, name: 'Horizon Media', domain: 'horizonmedia.example.com', industry: 'Media & Marketing', size: '51-200', founded: 2013, revenue: '$14M', employees: 112, country: 'US', description: 'Full-service digital marketing agency and creative studio.', tags: ['media', 'marketing', 'creative'] },
    { id: 10, name: 'Apex Fintech', domain: 'apexfintech.example.com', industry: 'Fintech', size: '51-200', founded: 2018, revenue: '$30M', employees: 160, country: 'US', description: 'Payment processing and financial compliance tools for startups.', tags: ['fintech', 'payments', 'compliance'] },
    { id: 11, name: 'Greenfield AI', domain: 'greenfieldai.example.com', industry: 'Artificial Intelligence', size: '11-50', founded: 2022, revenue: '$6M', employees: 42, country: 'US', description: 'AI-powered product intelligence and demand forecasting.', tags: ['ai', 'ml', 'forecasting'] },
    { id: 12, name: 'Luminary Health', domain: 'luminaryhealth.example.com', industry: 'Healthtech', size: '201-500', founded: 2014, revenue: '$55M', employees: 380, country: 'US', description: 'Telehealth platform and EHR integrations for clinics and hospitals.', tags: ['healthtech', 'telehealth', 'saas'] },
    { id: 13, name: 'StellarEd', domain: 'stellared.example.com', industry: 'Edtech', size: '51-200', founded: 2019, revenue: '$11M', employees: 95, country: 'US', description: 'Online learning management and professional development platform.', tags: ['edtech', 'lms', 'saas'] },
    { id: 14, name: 'FleetWorks', domain: 'fleetworks.example.com', industry: 'Logistics', size: '201-500', founded: 2011, revenue: '$40M', employees: 290, country: 'US', description: 'Fleet management and route optimization software for logistics companies.', tags: ['logistics', 'fleet', 'saas'] },
    { id: 15, name: 'Crestwood Energy', domain: 'crestwoodenergy.example.com', industry: 'Clean Energy', size: '51-200', founded: 2016, revenue: '$25M', employees: 130, country: 'US', description: 'Solar and renewable energy project development and monitoring.', tags: ['energy', 'solar', 'sustainability'] },
  ];
}

// ─── Social Posts ─────────────────────────────────────────────────────────────

export function mockPostsData() {
  return [
    { id: 1, userId: 1, content: 'Just shipped a new feature after a week of deep work. There is nothing quite like clicking "deploy" on a Friday afternoon. #shipping #engineering', likes: 142, shares: 18, comments: 14, createdAt: '2024-03-08T17:30:00Z', media: null, hashtags: ['shipping', 'engineering'] },
    { id: 2, userId: 3, content: 'Spent the morning running accessibility audits on our latest design. WCAG compliance is not optional — it is a baseline expectation. #a11y #design', likes: 87, shares: 31, comments: 9, createdAt: '2024-03-07T10:00:00Z', media: null, hashtags: ['a11y', 'design'] },
    { id: 3, userId: 6, content: 'Our new API hit 1 million requests today. A huge thank you to everyone on the backend team. #milestone #api', likes: 214, shares: 45, comments: 27, createdAt: '2024-03-06T16:00:00Z', media: 'https://placehold.co/800x400?text=1M+Requests', hashtags: ['milestone', 'api'] },
    { id: 4, userId: 7, content: 'Hot take: readable code is a more valuable skill than algorithmic complexity. Write for the next developer, not the compiler. #cleancode', likes: 453, shares: 112, comments: 63, createdAt: '2024-03-05T09:00:00Z', media: null, hashtags: ['cleancode'] },
    { id: 5, userId: 8, content: 'Updated our threat model and ran a tabletop exercise with the team. Security drills are underrated. #infosec #blueTeam', likes: 76, shares: 22, comments: 8, createdAt: '2024-03-04T14:00:00Z', media: null, hashtags: ['infosec', 'blueTeam'] },
    { id: 6, userId: 13, content: 'Finished training a new classifier with 94.2% F1 score on the holdout set. Feature engineering made all the difference. #ml #python', likes: 198, shares: 54, comments: 21, createdAt: '2024-03-03T11:30:00Z', media: 'https://placehold.co/800x400?text=Confusion+Matrix', hashtags: ['ml', 'python'] },
    { id: 7, userId: 2, content: 'Ran our quarterly roadmap review today. The honest conversations about what to cut are the most valuable part of the process. #product #roadmap', likes: 112, shares: 29, comments: 18, createdAt: '2024-03-02T15:00:00Z', media: null, hashtags: ['product', 'roadmap'] },
    { id: 8, userId: 22, content: 'Successfully migrated the last legacy service to Kubernetes this week. The mono-to-micro journey took 18 months but it was worth it. #kubernetes #cloud', likes: 305, shares: 78, comments: 34, createdAt: '2024-03-01T16:00:00Z', media: null, hashtags: ['kubernetes', 'cloud'] },
    { id: 9, userId: 18, content: 'Brand refresh is live! After 3 months of work with the team we have a visual identity we are all proud of. #design #branding', likes: 527, shares: 143, comments: 72, createdAt: '2024-02-29T12:00:00Z', media: 'https://placehold.co/800x400?text=Brand+Refresh', hashtags: ['design', 'branding'] },
    { id: 10, userId: 5, content: 'Pro tip: your data warehouse is not a data lake. Define your schemas before you have 200 un-documented tables. #data #bestpractices', likes: 389, shares: 91, comments: 47, createdAt: '2024-02-28T10:00:00Z', media: null, hashtags: ['data', 'bestpractices'] },
    { id: 11, userId: 10, content: 'Coverage is not the same as confidence. Write tests that actually test behaviour, not just lines of code. #testing #qa', likes: 261, shares: 66, comments: 30, createdAt: '2024-02-27T09:30:00Z', media: null, hashtags: ['testing', 'qa'] },
    { id: 12, userId: 16, content: 'Closed the biggest enterprise deal in company history today. Months of technical demos and patience finally paid off. #sales #enterprise', likes: 184, shares: 37, comments: 22, createdAt: '2024-02-26T18:00:00Z', media: null, hashtags: ['sales', 'enterprise'] },
    { id: 13, userId: 11, content: 'Retrospective formats matter. We switched to a 4Ls format (Liked, Learned, Lacked, Longed For) and the quality of discussion improved immediately. #agile #retrospective', likes: 134, shares: 48, comments: 16, createdAt: '2024-02-25T14:00:00Z', media: null, hashtags: ['agile', 'retrospective'] },
    { id: 14, userId: 4, content: 'Automated our infrastructure provisioning end-to-end with Terraform. Zero manual steps to spin up a production-ready environment. #devops #terraform', likes: 241, shares: 63, comments: 28, createdAt: '2024-02-24T11:00:00Z', media: null, hashtags: ['devops', 'terraform'] },
    { id: 15, userId: 25, content: 'Finished the quarterly business review presentation. Aligning strategy with data is genuinely one of my favourite parts of this job. #strategy #analytics', likes: 68, shares: 14, comments: 7, createdAt: '2024-02-23T16:00:00Z', media: null, hashtags: ['strategy', 'analytics'] },
    { id: 16, userId: 1, content: 'TypeScript 5.4 dropped some great improvements to type inference. The NoInfer utility type alone will save us from so many bugs. #typescript', likes: 312, shares: 87, comments: 39, createdAt: '2024-02-22T09:00:00Z', media: null, hashtags: ['typescript'] },
    { id: 17, userId: 7, content: 'Performance audit results: after switching to a virtualized list we went from 4s render to 120ms for 10k rows. #performance #react', likes: 476, shares: 134, comments: 55, createdAt: '2024-02-21T14:00:00Z', media: 'https://placehold.co/800x400?text=Performance+Chart', hashtags: ['performance', 'react'] },
    { id: 18, userId: 3, content: 'Design tokens are the single best investment our team has made in the last two years. Consistency, speed, and fewer debates. #designsystems #tokens', likes: 203, shares: 72, comments: 24, createdAt: '2024-02-20T10:00:00Z', media: null, hashtags: ['designsystems', 'tokens'] },
    { id: 19, userId: 13, content: 'Data leakage caught during cross-validation review saved us from deploying a model with 40% inflated accuracy. Always check your pipelines. #ml #lessons', likes: 287, shares: 96, comments: 41, createdAt: '2024-02-19T11:00:00Z', media: null, hashtags: ['ml', 'lessons'] },
    { id: 20, userId: 8, content: 'Completed our SOC 2 Type II audit with zero exceptions. Six months of preparation but the trust it builds with customers is immeasurable. #security #compliance', likes: 329, shares: 88, comments: 36, createdAt: '2024-02-18T15:00:00Z', media: null, hashtags: ['security', 'compliance'] },
  ];
}

// ─── Categories ──────────────────────────────────────────────────────────────

export function mockCategoriesData() {
  return [
    { id: 1, name: 'Electronics', slug: 'electronics', description: 'All electronic devices, gadgets, and accessories.', parentId: null, icon: 'cpu', count: 14 },
    { id: 2, name: 'Computers', slug: 'computers', description: 'Desktops, laptops, and computer components.', parentId: 1, icon: 'monitor', count: 5 },
    { id: 3, name: 'Audio', slug: 'audio', description: 'Headphones, speakers, and audio equipment.', parentId: 1, icon: 'headphones', count: 4 },
    { id: 4, name: 'Furniture', slug: 'furniture', description: 'Desks, chairs, and office furniture.', parentId: null, icon: 'armchair', count: 8 },
    { id: 5, name: 'Seating', slug: 'seating', description: 'Office chairs and ergonomic seating solutions.', parentId: 4, icon: 'chair', count: 3 },
    { id: 6, name: 'Desks & Stands', slug: 'desks-stands', description: 'Standing desks, desk converters, and monitor stands.', parentId: 4, icon: 'desktop', count: 4 },
    { id: 7, name: 'Accessories', slug: 'accessories', description: 'Desk and office accessories for everyday productivity.', parentId: null, icon: 'package', count: 9 },
    { id: 8, name: 'Cable Management', slug: 'cable-management', description: 'Cable ties, clips, and desk organizers for cables.', parentId: 7, icon: 'plug', count: 2 },
    { id: 9, name: 'Office Supplies', slug: 'office-supplies', description: 'Stationery, whiteboards, and everyday office supplies.', parentId: null, icon: 'pencil', count: 6 },
    { id: 10, name: 'Storage', slug: 'storage', description: 'Hard drives, SSDs, and removable storage media.', parentId: 1, icon: 'hard-drive', count: 2 },
    { id: 11, name: 'Kitchen', slug: 'kitchen', description: 'Mugs, kettles, and kitchen accessories for the workplace.', parentId: null, icon: 'coffee', count: 2 },
    { id: 12, name: 'Lighting', slug: 'lighting', description: 'Desk lamps, LED strips, and smart lighting.', parentId: null, icon: 'lightbulb', count: 3 },
    { id: 13, name: 'Smart Home', slug: 'smart-home', description: 'Smart plugs, bulbs, and home automation devices.', parentId: 1, icon: 'home', count: 3 },
    { id: 14, name: 'Networking', slug: 'networking', description: 'Routers, switches, and networking peripherals.', parentId: 1, icon: 'wifi', count: 1 },
    { id: 15, name: 'Ergonomics', slug: 'ergonomics', description: 'Ergonomic accessories to improve health at the desk.', parentId: 7, icon: 'activity', count: 4 },
  ];
}

// ─── Shopping Carts ──────────────────────────────────────────────────────────

export function mockShoppingCartData() {
  return [
    {
      id: 'CART-001', userId: 4, updatedAt: '2024-03-09T15:30:00Z',
      items: [
        { id: 1, name: 'Mechanical Keyboard TKL', price: 79.99, qty: 1, image: 'https://placehold.co/80x80?text=Keyboard' },
        { id: 2, name: 'Wireless Ergonomic Mouse', price: 39.99, qty: 1, image: 'https://placehold.co/80x80?text=Mouse' },
      ],
      subtotal: 119.98, discount: 0, total: 119.98,
    },
    {
      id: 'CART-002', userId: 9, updatedAt: '2024-03-09T11:00:00Z',
      items: [
        { id: 3, name: '27-Inch IPS Monitor', price: 349.00, qty: 1, image: 'https://placehold.co/80x80?text=Monitor' },
        { id: 4, name: 'Adjustable Monitor Arm', price: 64.99, qty: 1, image: 'https://placehold.co/80x80?text=MonitorArm' },
        { id: 5, name: 'Screen Privacy Filter', price: 26.99, qty: 1, image: 'https://placehold.co/80x80?text=PrivacyFilter' },
      ],
      subtotal: 440.98, discount: 22.05, total: 418.93,
    },
    {
      id: 'CART-003', userId: 20, updatedAt: '2024-03-08T16:00:00Z',
      items: [
        { id: 6, name: 'Portable SSD 1TB', price: 89.99, qty: 2, image: 'https://placehold.co/80x80?text=SSD' },
      ],
      subtotal: 179.98, discount: 0, total: 179.98,
    },
    {
      id: 'CART-004', userId: 14, updatedAt: '2024-03-09T09:45:00Z',
      items: [
        { id: 7, name: 'Noise-Cancelling Headphones', price: 129.00, qty: 1, image: 'https://placehold.co/80x80?text=Headphones' },
        { id: 8, name: 'Bluetooth Speaker', price: 44.99, qty: 1, image: 'https://placehold.co/80x80?text=BTSpeaker' },
        { id: 9, name: 'Wireless Charging Pad', price: 19.99, qty: 2, image: 'https://placehold.co/80x80?text=ChargingPad' },
      ],
      subtotal: 213.97, discount: 10.70, total: 203.27,
    },
    {
      id: 'CART-005', userId: 23, updatedAt: '2024-03-09T14:20:00Z',
      items: [
        { id: 10, name: 'LED Desk Lamp', price: 34.99, qty: 1, image: 'https://placehold.co/80x80?text=DeskLamp' },
        { id: 11, name: 'Desk Organizer Tray', price: 17.99, qty: 1, image: 'https://placehold.co/80x80?text=DeskTray' },
        { id: 12, name: 'Sticky Notes Value Pack', price: 9.99, qty: 2, image: 'https://placehold.co/80x80?text=StickyNotes' },
        { id: 13, name: 'Cable Management Kit', price: 12.99, qty: 1, image: 'https://placehold.co/80x80?text=CableKit' },
      ],
      subtotal: 85.95, discount: 0, total: 85.95,
    },
  ];
}

// ─── Messages ────────────────────────────────────────────────────────────────

export function mockMessagesData() {
  return [
    { id: 1, conversationId: 'CONV-001', senderId: 1, receiverId: 6, content: 'Hey Frank, do you have a moment to review the PR I just opened?', type: 'text', read: true, createdAt: '2024-03-09T09:00:00Z' },
    { id: 2, conversationId: 'CONV-001', senderId: 6, receiverId: 1, content: 'Sure! Sending feedback in about 20 minutes.', type: 'text', read: true, createdAt: '2024-03-09T09:04:00Z' },
    { id: 3, conversationId: 'CONV-001', senderId: 1, receiverId: 6, content: 'Great, thank you! No rush.', type: 'text', read: true, createdAt: '2024-03-09T09:05:00Z' },
    { id: 4, conversationId: 'CONV-002', senderId: 2, receiverId: 11, content: 'Karen, can you schedule the sprint planning for Monday morning?', type: 'text', read: true, createdAt: '2024-03-08T14:00:00Z' },
    { id: 5, conversationId: 'CONV-002', senderId: 11, receiverId: 2, content: 'Already on it! Calendar invite goes out this afternoon.', type: 'text', read: true, createdAt: '2024-03-08T14:10:00Z' },
    { id: 6, conversationId: 'CONV-003', senderId: 3, receiverId: 18, content: 'Rachel, here is the updated brand guidelines document.', type: 'text', read: false, createdAt: '2024-03-09T10:00:00Z' },
    { id: 7, conversationId: 'CONV-003', senderId: 3, receiverId: 18, content: 'https://placehold.co/800x600?text=Brand+Guidelines+v2', type: 'image', read: false, createdAt: '2024-03-09T10:01:00Z' },
    { id: 8, conversationId: 'CONV-004', senderId: 8, receiverId: 22, content: 'Victor, the security scan flagged one open port on the new service. Can you take a look?', type: 'text', read: true, createdAt: '2024-03-07T11:00:00Z' },
    { id: 9, conversationId: 'CONV-004', senderId: 22, receiverId: 8, content: 'On it. That port should have been closed post-migration. Fixing now.', type: 'text', read: true, createdAt: '2024-03-07T11:15:00Z' },
    { id: 10, conversationId: 'CONV-005', senderId: 5, receiverId: 13, content: 'Mia, can you share the latest model evaluation report?', type: 'text', read: true, createdAt: '2024-03-06T09:00:00Z' },
    { id: 11, conversationId: 'CONV-005', senderId: 13, receiverId: 5, content: 'Sending now. F1 score on holdout is 94.2%.', type: 'text', read: true, createdAt: '2024-03-06T09:10:00Z' },
    { id: 12, conversationId: 'CONV-005', senderId: 13, receiverId: 5, content: 'https://placehold.co/800x600?text=Model+Report', type: 'image', read: true, createdAt: '2024-03-06T09:11:00Z' },
    { id: 13, conversationId: 'CONV-006', senderId: 7, receiverId: 3, content: 'Carla, can you do a quick design review on the new dashboard component?', type: 'text', read: false, createdAt: '2024-03-09T13:00:00Z' },
    { id: 14, conversationId: 'CONV-006', senderId: 3, receiverId: 7, content: 'Yes! Give me 30 minutes and I will leave comments in Figma.', type: 'text', read: false, createdAt: '2024-03-09T13:05:00Z' },
    { id: 15, conversationId: 'CONV-007', senderId: 16, receiverId: 2, content: 'Brian, the prospect wants a technical deep-dive demo next week. Can engineering join?', type: 'text', read: true, createdAt: '2024-03-05T10:00:00Z' },
    { id: 16, conversationId: 'CONV-007', senderId: 2, receiverId: 16, content: 'Absolutely. I will loop in Alice and Frank. What day works for them?', type: 'text', read: true, createdAt: '2024-03-05T10:20:00Z' },
    { id: 17, conversationId: 'CONV-008', senderId: 19, receiverId: 17, content: 'Quinn, I need the latest project spend actuals for the finance report.', type: 'text', read: true, createdAt: '2024-03-04T14:00:00Z' },
    { id: 18, conversationId: 'CONV-008', senderId: 17, receiverId: 19, content: 'Exporting from Asana now. Will have it to you by 5pm.', type: 'text', read: true, createdAt: '2024-03-04T14:12:00Z' },
    { id: 19, conversationId: 'CONV-009', senderId: 10, receiverId: 5, content: 'Elena, great work on the Q1 engineering review. Leadership was impressed.', type: 'text', read: true, createdAt: '2024-03-03T16:00:00Z' },
    { id: 20, conversationId: 'CONV-009', senderId: 5, receiverId: 10, content: 'Thank you James! The team put in a lot of work this quarter.', type: 'text', read: true, createdAt: '2024-03-03T16:15:00Z' },
    { id: 21, conversationId: 'CONV-010', senderId: 24, receiverId: 6, content: 'Frank, the staging environment is returning 502s on the /auth endpoint.', type: 'text', read: false, createdAt: '2024-03-09T15:00:00Z' },
    { id: 22, conversationId: 'CONV-010', senderId: 6, receiverId: 24, content: 'Investigating now. Likely the token validation middleware after the last deploy.', type: 'text', read: false, createdAt: '2024-03-09T15:05:00Z' },
    { id: 23, conversationId: 'CONV-011', senderId: 15, receiverId: 9, content: 'Isla, are you planning to attend the conference in Portland?', type: 'text', read: true, createdAt: '2024-03-01T10:00:00Z' },
    { id: 24, conversationId: 'CONV-011', senderId: 9, receiverId: 15, content: 'I am not sure yet — waiting on budget approval. Will know by end of week.', type: 'text', read: true, createdAt: '2024-03-01T10:30:00Z' },
    { id: 25, conversationId: 'CONV-012', senderId: 12, receiverId: 4, content: 'David, are the Kubernetes nodes back online after the maintenance window?', type: 'text', read: false, createdAt: '2024-03-09T08:00:00Z' },
  ];
}

// ─── Support Tickets ──────────────────────────────────────────────────────────

export function mockSupportTicketsData() {
  return [
    {
      id: 'TKT-0001', customerId: 'CUST-001', subject: 'Order not delivered after 7 days', description: 'I placed order ORD-0001 over a week ago and tracking shows it has been stuck in transit since March 4th.', status: 'resolved', priority: 'high', category: 'shipping', assignedTo: 'support_agent_5', createdAt: '2024-03-09T08:00:00Z', updatedAt: '2024-03-09T14:00:00Z',
      messages: [
        { id: 1, author: 'Alice Hartwell', body: 'My order has been stuck since March 4th. Please advise.', createdAt: '2024-03-09T08:00:00Z' },
        { id: 2, author: 'Support Agent', body: 'We have escalated this with the carrier and issued a replacement shipment. You should receive it within 2 business days.', createdAt: '2024-03-09T14:00:00Z' },
      ],
    },
    {
      id: 'TKT-0002', customerId: 'CUST-003', subject: 'Item received damaged', description: 'The noise-cancelling headphones arrived with a broken headband. I would like a replacement or refund.', status: 'open', priority: 'high', category: 'returns', assignedTo: 'support_agent_2', createdAt: '2024-03-08T11:00:00Z', updatedAt: '2024-03-08T11:30:00Z',
      messages: [
        { id: 1, author: 'Carla Mendez', body: 'The headphones I received have a cracked headband. Attaching a photo.', createdAt: '2024-03-08T11:00:00Z' },
        { id: 2, author: 'Support Agent', body: 'I am so sorry to hear that. Please send us a photo of the damage and we will process a replacement right away.', createdAt: '2024-03-08T11:30:00Z' },
      ],
    },
    {
      id: 'TKT-0003', customerId: 'CUST-005', subject: 'Duplicate charge on my account', description: 'I was charged twice for order ORD-0003. Please refund the duplicate transaction.', status: 'pending', priority: 'urgent', category: 'billing', assignedTo: 'support_agent_1', createdAt: '2024-03-07T12:00:00Z', updatedAt: '2024-03-08T09:00:00Z',
      messages: [
        { id: 1, author: 'Elena Vasquez', body: 'I see two charges of $194.38 on my credit card for the same order.', createdAt: '2024-03-07T12:00:00Z' },
        { id: 2, author: 'Support Agent', body: 'Thank you for flagging this. Our billing team is investigating and you will hear back within one business day.', createdAt: '2024-03-08T09:00:00Z' },
      ],
    },
    {
      id: 'TKT-0004', customerId: 'CUST-010', subject: 'Wrong item shipped', description: 'I ordered a Laptop Stand Aluminum but received a Cable Management Kit instead.', status: 'open', priority: 'medium', category: 'orders', assignedTo: 'support_agent_3', createdAt: '2024-03-06T10:00:00Z', updatedAt: '2024-03-06T10:45:00Z',
      messages: [
        { id: 1, author: 'James Okafor', body: 'The packing slip says laptop stand but the box contains a cable kit.', createdAt: '2024-03-06T10:00:00Z' },
        { id: 2, author: 'Support Agent', body: 'We apologize for the mix-up. We will send the correct item with expedited shipping at no charge.', createdAt: '2024-03-06T10:45:00Z' },
      ],
    },
    {
      id: 'TKT-0005', customerId: 'CUST-011', subject: 'Invoice overdue — requesting extension', description: 'Our accounts payable team is requesting a 15-day extension on invoice INV-2024-0005.', status: 'pending', priority: 'medium', category: 'billing', assignedTo: 'support_agent_4', createdAt: '2024-03-05T09:00:00Z', updatedAt: '2024-03-07T11:00:00Z',
      messages: [
        { id: 1, author: 'Karen Liu', body: 'We need a 15-day extension on INV-2024-0005. Can you accommodate this?', createdAt: '2024-03-05T09:00:00Z' },
        { id: 2, author: 'Support Agent', body: 'Escalating to our finance team. Expect a response within 48 hours.', createdAt: '2024-03-07T11:00:00Z' },
      ],
    },
    {
      id: 'TKT-0006', customerId: 'CUST-007', subject: 'Cannot log in to account', description: 'Receiving "Invalid credentials" on every login attempt even after resetting my password.', status: 'resolved', priority: 'high', category: 'account', assignedTo: 'support_agent_5', createdAt: '2024-03-04T08:30:00Z', updatedAt: '2024-03-04T10:00:00Z',
      messages: [
        { id: 1, author: 'Grace Kim', body: 'Still cannot log in after a password reset. Getting an invalid credentials error.', createdAt: '2024-03-04T08:30:00Z' },
        { id: 2, author: 'Support Agent', body: 'We found an account sync issue and have resolved it. Please try logging in again — it should work now.', createdAt: '2024-03-04T10:00:00Z' },
      ],
    },
    {
      id: 'TKT-0007', customerId: 'CUST-006', subject: 'USB-C hub gets very hot', description: 'The USB-C Docking Station becomes uncomfortably hot during normal use. Is this expected?', status: 'open', priority: 'low', category: 'product', assignedTo: 'support_agent_2', createdAt: '2024-03-03T14:00:00Z', updatedAt: '2024-03-03T14:30:00Z',
      messages: [
        { id: 1, author: 'Frank Nguyen', body: 'The hub gets very warm — is this a defect or normal operation?', createdAt: '2024-03-03T14:00:00Z' },
        { id: 2, author: 'Support Agent', body: 'Some warmth is normal but extreme heat can indicate a fault. Can you share the temperature you are measuring?', createdAt: '2024-03-03T14:30:00Z' },
      ],
    },
    {
      id: 'TKT-0008', customerId: 'CUST-013', subject: 'Promo code not applied at checkout', description: 'I used code WEEKEND20 but the discount was not reflected in my final order total.', status: 'resolved', priority: 'low', category: 'promotions', assignedTo: 'support_agent_3', createdAt: '2024-03-02T11:00:00Z', updatedAt: '2024-03-02T13:00:00Z',
      messages: [
        { id: 1, author: 'Mia Chen', body: 'The WEEKEND20 code showed as applied but my receipt shows full price.', createdAt: '2024-03-02T11:00:00Z' },
        { id: 2, author: 'Support Agent', body: 'We have manually applied a credit of $5.99 to your account for the missed discount. Sorry for the inconvenience.', createdAt: '2024-03-02T13:00:00Z' },
      ],
    },
    {
      id: 'TKT-0009', customerId: 'CUST-016', subject: 'Payment method declined', description: 'My Visa card keeps being declined at checkout despite having sufficient funds.', status: 'open', priority: 'high', category: 'billing', assignedTo: 'support_agent_1', createdAt: '2024-03-09T10:30:00Z', updatedAt: '2024-03-09T10:30:00Z',
      messages: [
        { id: 1, author: 'Paul Reyes', body: 'My card ending in 4242 is being declined. My bank says there are no issues on their end.', createdAt: '2024-03-09T10:30:00Z' },
      ],
    },
    {
      id: 'TKT-0010', customerId: 'CUST-015', subject: 'Order arrived with missing parts', description: 'The Anti-fatigue Mat was missing its non-slip feet and instruction booklet.', status: 'pending', priority: 'medium', category: 'orders', assignedTo: 'support_agent_2', createdAt: '2024-03-08T09:00:00Z', updatedAt: '2024-03-08T15:00:00Z',
      messages: [
        { id: 1, author: 'Olivia Grant', body: 'The mat arrived without the non-slip feet attachments listed in the product description.', createdAt: '2024-03-08T09:00:00Z' },
        { id: 2, author: 'Support Agent', body: 'We are shipping the missing components separately. They will arrive within 3-5 business days.', createdAt: '2024-03-08T15:00:00Z' },
      ],
    },
    {
      id: 'TKT-0011', customerId: 'CUST-008', subject: 'Request for bulk order discount', description: 'We are looking to order 20+ units of the Noise Machine. Is a bulk pricing discount available?', status: 'pending', priority: 'low', category: 'sales', assignedTo: 'support_agent_4', createdAt: '2024-03-07T14:00:00Z', updatedAt: '2024-03-08T10:00:00Z',
      messages: [
        { id: 1, author: 'Henry Park', body: 'Interested in 20-25 units for our office. Do you offer volume pricing?', createdAt: '2024-03-07T14:00:00Z' },
        { id: 2, author: 'Support Agent', body: 'Great news — we do offer volume discounts for 15+ units. A sales rep will reach out to you shortly.', createdAt: '2024-03-08T10:00:00Z' },
      ],
    },
    {
      id: 'TKT-0012', customerId: 'CUST-022', subject: 'Monitor arm wobbles on tightest setting', description: 'The arm is tightened as far as it will go but still drifts downward slowly over the day.', status: 'open', priority: 'medium', category: 'product', assignedTo: 'support_agent_5', createdAt: '2024-03-06T08:00:00Z', updatedAt: '2024-03-06T08:30:00Z',
      messages: [
        { id: 1, author: 'Victor Santos', body: 'The arm sags by about 2 cm over 8 hours even at maximum tension.', createdAt: '2024-03-06T08:00:00Z' },
        { id: 2, author: 'Support Agent', body: 'This sounds like a defective tension mechanism. We will send a replacement unit within 2 business days.', createdAt: '2024-03-06T08:30:00Z' },
      ],
    },
    {
      id: 'TKT-0013', customerId: 'CUST-024', subject: 'Subscription cancellation request', description: 'I would like to cancel my Pro Plan subscription effective at the end of the current billing cycle.', status: 'resolved', priority: 'low', category: 'account', assignedTo: 'support_agent_3', createdAt: '2024-03-04T10:00:00Z', updatedAt: '2024-03-04T11:00:00Z',
      messages: [
        { id: 1, author: 'Xander Brooks', body: 'Please cancel my Pro subscription at end of current billing period.', createdAt: '2024-03-04T10:00:00Z' },
        { id: 2, author: 'Support Agent', body: 'Your subscription has been scheduled for cancellation on March 31st. You will continue to have full access until then.', createdAt: '2024-03-04T11:00:00Z' },
      ],
    },
    {
      id: 'TKT-0014', customerId: 'CUST-019', subject: 'Loyalty points not showing in account', description: 'I made two qualifying purchases last week but my loyalty points balance has not updated.', status: 'closed', priority: 'low', category: 'account', assignedTo: 'support_agent_1', createdAt: '2024-03-03T09:00:00Z', updatedAt: '2024-03-05T10:00:00Z',
      messages: [
        { id: 1, author: 'Samuel Diaz', body: 'My points have not updated after two orders placed on Feb 28th and Mar 1st.', createdAt: '2024-03-03T09:00:00Z' },
        { id: 2, author: 'Support Agent', body: 'There was a 48-hour delay in our points processing pipeline. Your points have now been credited — total of 186 points.', createdAt: '2024-03-05T10:00:00Z' },
      ],
    },
    {
      id: 'TKT-0015', customerId: 'CUST-017', subject: 'API rate limit too low for our use case', description: 'Our enterprise integration is hitting the 10k/hr rate limit. We need a higher limit.', status: 'pending', priority: 'urgent', category: 'technical', assignedTo: 'support_agent_4', createdAt: '2024-03-08T08:00:00Z', updatedAt: '2024-03-09T09:00:00Z',
      messages: [
        { id: 1, author: 'Quinn Hughes', body: 'We are regularly hitting the 10k/hr API limit. Our use case requires at least 50k/hr.', createdAt: '2024-03-08T08:00:00Z' },
        { id: 2, author: 'Support Agent', body: 'Escalating to our platform team. Custom rate limit increases are available for enterprise accounts and require a brief review.', createdAt: '2024-03-09T09:00:00Z' },
      ],
    },
    {
      id: 'TKT-0016', customerId: 'CUST-018', subject: 'Wrong billing address on invoice', description: 'Invoice INV-2024-0013 has my old office address. Can this be corrected and reissued?', status: 'resolved', priority: 'low', category: 'billing', assignedTo: 'support_agent_2', createdAt: '2024-03-05T13:00:00Z', updatedAt: '2024-03-05T15:00:00Z',
      messages: [
        { id: 1, author: 'Rachel Stone', body: 'The address on INV-2024-0013 is outdated. Please use 5 Acacia Rd, Nashville, TN 37201.', createdAt: '2024-03-05T13:00:00Z' },
        { id: 2, author: 'Support Agent', body: 'The invoice has been reissued with the correct address and emailed to you. Apologies for the error.', createdAt: '2024-03-05T15:00:00Z' },
      ],
    },
    {
      id: 'TKT-0017', customerId: 'CUST-012', subject: 'Product not compatible with Mac', description: 'The screen privacy filter I received does not fit my MacBook Pro 14-inch display.', status: 'open', priority: 'medium', category: 'returns', assignedTo: 'support_agent_5', createdAt: '2024-03-07T10:00:00Z', updatedAt: '2024-03-07T10:00:00Z',
      messages: [
        { id: 1, author: 'Liam Foster', body: 'The filter is listed as 24-inch widescreen but my MacBook Pro screen is 14.2 inches. It does not fit at all.', createdAt: '2024-03-07T10:00:00Z' },
      ],
    },
    {
      id: 'TKT-0018', customerId: 'CUST-025', subject: 'Refund not received after 10 days', description: 'My refund for ORD-0015 was issued on Feb 10th but has still not appeared on my bank statement.', status: 'resolved', priority: 'high', category: 'billing', assignedTo: 'support_agent_1', createdAt: '2024-02-20T09:00:00Z', updatedAt: '2024-02-21T14:00:00Z',
      messages: [
        { id: 1, author: 'Yuki Tanaka', body: 'It has been 10 days since the refund was issued and it is still not showing on my card.', createdAt: '2024-02-20T09:00:00Z' },
        { id: 2, author: 'Support Agent', body: 'We confirmed with our payment processor that the refund was sent. Some banks take up to 14 business days. If it does not appear by Feb 28th please contact us again.', createdAt: '2024-02-21T14:00:00Z' },
      ],
    },
    {
      id: 'TKT-0019', customerId: 'CUST-009', subject: 'Account suspended without notice', description: 'My account appears to be suspended. I did not receive any communication about this.', status: 'closed', priority: 'high', category: 'account', assignedTo: 'support_agent_3', createdAt: '2024-02-15T08:00:00Z', updatedAt: '2024-02-16T10:00:00Z',
      messages: [
        { id: 1, author: 'Isla Thompson', body: 'My account is showing suspended and I cannot access any of my order history.', createdAt: '2024-02-15T08:00:00Z' },
        { id: 2, author: 'Support Agent', body: 'The suspension was triggered by our fraud detection system in error. Your account has been reinstated and we have emailed an explanation.', createdAt: '2024-02-16T10:00:00Z' },
      ],
    },
    {
      id: 'TKT-0020', customerId: 'CUST-014', subject: 'Need tax exempt status applied to account', description: 'Our organisation is tax exempt. How do I provide the documentation and have tax removed from future invoices?', status: 'pending', priority: 'medium', category: 'billing', assignedTo: 'support_agent_4', createdAt: '2024-03-09T11:00:00Z', updatedAt: '2024-03-09T11:00:00Z',
      messages: [
        { id: 1, author: 'Nathan Bell', body: 'We are a 501(c)(3) and need tax removed from our account. Where do I upload the exemption certificate?', createdAt: '2024-03-09T11:00:00Z' },
      ],
    },
  ];
}
