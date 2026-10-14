const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting QuickCart Database Seed...');

  // Clear existing records in correct order of relations
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();
  await prisma.zone.deleteMany();

  const defaultPasswordHash = bcrypt.hashSync('password123', 10);

  // 1. Create 3 Zones
  console.log('📍 Seeding Zones...');
  const zone1 = await prisma.zone.create({
    data: {
      name: 'Zone 1: Central District',
      description: 'High-density urban downtown, commercial markets, and residential high-rises.',
    },
  });

  const zone2 = await prisma.zone.create({
    data: {
      name: 'Zone 2: North Sector',
      description: 'Suburban tech corridors, universities, and residential communities.',
    },
  });

  const zone3 = await prisma.zone.create({
    data: {
      name: 'Zone 3: West Hills',
      description: 'Green belt, hillside villas, farmers markets, and fresh bakeries.',
    },
  });

  // 2. Create 1 Admin
  console.log('🛡️ Seeding Admin User...');
  const admin = await prisma.user.create({
    data: {
      name: 'Central Platform Administrator',
      email: 'admin@quickcart.com',
      password_hash: defaultPasswordHash,
      role: 'admin',
      zone_id: zone1.id,
    },
  });

  // 3. Create 1 Delivery Executive
  console.log('🛵 Seeding Delivery Executive...');
  const deliveryExec = await prisma.user.create({
    data: {
      name: 'Ravi Kumar (Express Courier)',
      email: 'delivery@quickcart.com',
      password_hash: defaultPasswordHash,
      role: 'delivery',
      zone_id: zone1.id,
    },
  });

  // 4. Create 3 Customers
  console.log('🛒 Seeding Customers...');
  const customer1 = await prisma.user.create({
    data: {
      name: 'Sarah Jenkins',
      email: 'customer@quickcart.com',
      password_hash: defaultPasswordHash,
      role: 'customer',
      zone_id: zone1.id,
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      name: 'David Miller',
      email: 'david@quickcart.com',
      password_hash: defaultPasswordHash,
      role: 'customer',
      zone_id: zone2.id,
    },
  });

  const customer3 = await prisma.user.create({
    data: {
      name: 'Priya Sharma',
      email: 'priya@quickcart.com',
      password_hash: defaultPasswordHash,
      role: 'customer',
      zone_id: zone1.id,
    },
  });

  // 5. Create 3 Partners with Stores
  console.log('🏪 Seeding Store Partners & Stores...');
  const partner1 = await prisma.user.create({
    data: {
      name: 'Rajesh Gupta (Fresh Basket)',
      email: 'partner@quickcart.com',
      password_hash: defaultPasswordHash,
      role: 'partner',
      zone_id: zone1.id,
    },
  });

  const store1 = await prisma.store.create({
    data: {
      owner_id: partner1.id,
      name: 'Fresh Basket Supermarket',
      zone_id: zone1.id,
      is_open: true,
    },
  });

  const partner2 = await prisma.user.create({
    data: {
      name: 'Maria Dupont (Artisan Bakery)',
      email: 'bakery@quickcart.com',
      password_hash: defaultPasswordHash,
      role: 'partner',
      zone_id: zone1.id,
    },
  });

  const store2 = await prisma.store.create({
    data: {
      owner_id: partner2.id,
      name: 'Artisan Daily Bakery',
      zone_id: zone1.id,
      is_open: true,
    },
  });

  const partner3 = await prisma.user.create({
    data: {
      name: 'Dr. Anita Desai (City Pharmacy)',
      email: 'pharmacy@quickcart.com',
      password_hash: defaultPasswordHash,
      role: 'partner',
      zone_id: zone2.id,
    },
  });

  const store3 = await prisma.store.create({
    data: {
      owner_id: partner3.id,
      name: 'City Care Essentials & Pharmacy',
      zone_id: zone2.id,
      is_open: true,
    },
  });

  // 6. Create 30 Products (10 per store)
  console.log('📦 Seeding 30 Products across 3 stores...');

  const store1ProductsData = [
    { name: 'Organic Whole Milk (1L)', category: 'Dairy', price: 65, stock_qty: 25, image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80' },
    { name: 'Cage-Free Brown Eggs (Pack of 6)', category: 'Dairy & Eggs', price: 85, stock_qty: 40, image_url: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=400&q=80' },
    { name: 'Cold-Pressed Olive Oil (500ml)', category: 'Pantry', price: 499, stock_qty: 15, image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80' },
    { name: 'Crisp Red Gala Apples (1kg)', category: 'Fruits', price: 190, stock_qty: 30, image_url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80' },
    { name: 'Fresh Hass Avocados (Pack of 2)', category: 'Fruits', price: 240, stock_qty: 8, image_url: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=400&q=80' },
    { name: 'Fresh Organic Spinach (250g)', category: 'Produce', price: 40, stock_qty: 18, image_url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=400&q=80' },
    { name: 'Greek Yogurt Unsweetened (400g)', category: 'Dairy', price: 120, stock_qty: 12, image_url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80' },
    { name: 'Basmati Rice Premium (1kg)', category: 'Pantry', price: 160, stock_qty: 50, image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80' },
    { name: 'Pure Clover Honey (350g)', category: 'Pantry', price: 280, stock_qty: 20, image_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=400&q=80' },
    { name: 'Ripe Cavendish Bananas (1kg)', category: 'Fruits', price: 55, stock_qty: 35, image_url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=400&q=80' },
  ];

  const store2ProductsData = [
    { name: 'Artisan Sourdough Loaf (500g)', category: 'Bakery', price: 140, stock_qty: 15, image_url: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=400&q=80' },
    { name: 'Butter Croissants (Pack of 2)', category: 'Bakery', price: 110, stock_qty: 20, image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=400&q=80' },
    { name: 'Blueberry Muffins (Pack of 2)', category: 'Bakery', price: 95, stock_qty: 18, image_url: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=400&q=80' },
    { name: 'Multigrain Seeded Bread (400g)', category: 'Bakery', price: 80, stock_qty: 25, image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80' },
    { name: 'Chocolate Chip Cookies (Box of 6)', category: 'Snacks', price: 150, stock_qty: 30, image_url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=400&q=80' },
    { name: 'French Baguette (Traditional)', category: 'Bakery', price: 75, stock_qty: 14, image_url: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=400&q=80' },
    { name: 'Cinnamon Swirl Rolls (Pack of 2)', category: 'Bakery', price: 120, stock_qty: 16, image_url: 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&w=400&q=80' },
    { name: 'Garlic Herb Focaccia (Slice)', category: 'Bakery', price: 90, stock_qty: 10, image_url: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&w=400&q=80' },
    { name: 'Banana Walnut Tea Cake', category: 'Bakery', price: 210, stock_qty: 8, image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80' },
    { name: 'Cheese Pretzel Bites', category: 'Snacks', price: 130, stock_qty: 22, image_url: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=400&q=80' },
  ];

  const store3ProductsData = [
    { name: 'Electrolyte Hydration Drink (500ml)', category: 'Health', price: 45, stock_qty: 40, image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=400&q=80' },
    { name: 'Herbal Hand Sanitizer (100ml)', category: 'Essentials', price: 60, stock_qty: 50, image_url: 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?auto=format&fit=crop&w=400&q=80' },
    { name: 'Vitamin C Chews 500mg (60 tabs)', category: 'Supplements', price: 240, stock_qty: 25, image_url: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=400&q=80' },
    { name: 'Antibacterial Wet Wipes (80s)', category: 'Essentials', price: 130, stock_qty: 35, image_url: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=400&q=80' },
    { name: 'Herbal Toothpaste Neem & Mint', category: 'Personal Care', price: 95, stock_qty: 30, image_url: 'https://images.unsplash.com/photo-1559563458-527698bf5295?auto=format&fit=crop&w=400&q=80' },
    { name: 'Cooling Mint Lip Balm', category: 'Personal Care', price: 75, stock_qty: 40, image_url: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&w=400&q=80' },
    { name: 'First Aid Waterproof Bandages (20s)', category: 'Health', price: 65, stock_qty: 60, image_url: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=400&q=80' },
    { name: 'Calming Chamomile Tea Bags (25s)', category: 'Wellness', price: 180, stock_qty: 20, image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=80' },
    { name: 'Instant Pain Relief Spray (55g)', category: 'Health', price: 155, stock_qty: 15, image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80' },
    { name: 'Daily Multivitamin Complex (30s)', category: 'Supplements', price: 320, stock_qty: 22, image_url: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?auto=format&fit=crop&w=400&q=80' },
  ];

  const createdProducts = [];

  for (const item of store1ProductsData) {
    const prod = await prisma.product.create({
      data: { ...item, store_id: store1.id },
    });
    createdProducts.push(prod);
  }

  for (const item of store2ProductsData) {
    const prod = await prisma.product.create({
      data: { ...item, store_id: store2.id },
    });
    createdProducts.push(prod);
  }

  for (const item of store3ProductsData) {
    const prod = await prisma.product.create({
      data: { ...item, store_id: store3.id },
    });
    createdProducts.push(prod);
  }

  // 7. Create 10 Sample Orders in Varied Statuses
  console.log('📝 Seeding 10 Sample Orders in varied statuses...');

  const sampleOrdersPlan = [
    {
      customer: customer1,
      store: store1,
      status: 'placed',
      items: [{ prod: createdProducts[0], qty: 2 }, { prod: createdProducts[1], qty: 1 }],
      history: [{ status: 'placed', changed_by: 'Customer' }],
    },
    {
      customer: customer2,
      store: store2,
      status: 'accepted',
      items: [{ prod: createdProducts[10], qty: 1 }, { prod: createdProducts[11], qty: 2 }],
      history: [
        { status: 'placed', changed_by: 'Customer' },
        { status: 'accepted', changed_by: 'Store Partner' },
      ],
    },
    {
      customer: customer3,
      store: store1,
      status: 'packed',
      items: [{ prod: createdProducts[3], qty: 2 }, { prod: createdProducts[4], qty: 1 }],
      history: [
        { status: 'placed', changed_by: 'Customer' },
        { status: 'accepted', changed_by: 'Store Partner' },
        { status: 'packed', changed_by: 'Store Partner' },
      ],
    },
    {
      customer: customer1,
      store: store1,
      status: 'out_for_delivery',
      delivery_exec: deliveryExec,
      items: [{ prod: createdProducts[0], qty: 1 }, { prod: createdProducts[2], qty: 1 }],
      history: [
        { status: 'placed', changed_by: 'Customer' },
        { status: 'accepted', changed_by: 'Store Partner' },
        { status: 'packed', changed_by: 'Store Partner' },
        { status: 'out_for_delivery', changed_by: 'Delivery Executive' },
      ],
    },
    {
      customer: customer2,
      store: store2,
      status: 'delivered',
      delivery_exec: deliveryExec,
      items: [{ prod: createdProducts[12], qty: 2 }, { prod: createdProducts[13], qty: 1 }],
      history: [
        { status: 'placed', changed_by: 'Customer' },
        { status: 'accepted', changed_by: 'Store Partner' },
        { status: 'packed', changed_by: 'Store Partner' },
        { status: 'out_for_delivery', changed_by: 'Delivery Executive' },
        { status: 'delivered', changed_by: 'Delivery Executive' },
      ],
    },
    {
      customer: customer3,
      store: store3,
      status: 'delivered',
      delivery_exec: deliveryExec,
      items: [{ prod: createdProducts[20], qty: 2 }, { prod: createdProducts[22], qty: 1 }],
      history: [
        { status: 'placed', changed_by: 'Customer' },
        { status: 'accepted', changed_by: 'Store Partner' },
        { status: 'packed', changed_by: 'Store Partner' },
        { status: 'out_for_delivery', changed_by: 'Delivery Executive' },
        { status: 'delivered', changed_by: 'Delivery Executive' },
      ],
    },
    {
      customer: customer1,
      store: store2,
      status: 'rejected',
      items: [{ prod: createdProducts[14], qty: 1 }],
      history: [
        { status: 'placed', changed_by: 'Customer' },
        { status: 'rejected', changed_by: 'Store Partner' },
      ],
    },
    {
      customer: customer2,
      store: store1,
      status: 'cancelled',
      items: [{ prod: createdProducts[5], qty: 3 }],
      history: [
        { status: 'placed', changed_by: 'Customer' },
        { status: 'cancelled', changed_by: 'Customer' },
      ],
    },
    {
      customer: customer3,
      store: store2,
      status: 'delivered',
      delivery_exec: deliveryExec,
      items: [{ prod: createdProducts[15], qty: 2 }, { prod: createdProducts[16], qty: 1 }],
      history: [
        { status: 'placed', changed_by: 'Customer' },
        { status: 'accepted', changed_by: 'Store Partner' },
        { status: 'packed', changed_by: 'Store Partner' },
        { status: 'out_for_delivery', changed_by: 'Delivery Executive' },
        { status: 'delivered', changed_by: 'Delivery Executive' },
      ],
    },
    {
      customer: customer1,
      store: store3,
      status: 'placed',
      items: [{ prod: createdProducts[24], qty: 1 }, { prod: createdProducts[26], qty: 2 }],
      history: [{ status: 'placed', changed_by: 'Customer' }],
    },
  ];

  for (let idx = 0; idx < sampleOrdersPlan.length; idx++) {
    const plan = sampleOrdersPlan[idx];
    const totalAmount = plan.items.reduce(
      (sum, i) => sum + Number(i.prod.price) * i.qty,
      40 // includes 40 delivery & platform fees
    );

    const order = await prisma.order.create({
      data: {
        customer_id: plan.customer.id,
        store_id: plan.store.id,
        zone_id: plan.store.zone_id,
        status: plan.status,
        total: totalAmount,
        delivery_address: `Apt ${100 + idx}, Landmark Residency, ${plan.store.name} Area`,
        delivery_exec_id: plan.delivery_exec ? plan.delivery_exec.id : null,
      },
    });

    for (const item of plan.items) {
      await prisma.orderItem.create({
        data: {
          order_id: order.id,
          product_id: item.prod.id,
          qty: item.qty,
          unit_price: item.prod.price,
        },
      });
    }

    let timestampOffsetMinutes = plan.history.length * 10;
    for (const h of plan.history) {
      await prisma.orderStatusHistory.create({
        data: {
          order_id: order.id,
          status: h.status,
          changed_by: h.changed_by,
          changed_at: new Date(Date.now() - 1000 * 60 * timestampOffsetMinutes),
        },
      });
      timestampOffsetMinutes -= 10;
    }
  }

  console.log('✅ QuickCart Database Seeding Completed Successfully!');
  console.log('   - 3 Zones created');
  console.log('   - 1 Admin user (admin@quickcart.com)');
  console.log('   - 3 Store partners with stores (partner@quickcart.com, bakery@quickcart.com, pharmacy@quickcart.com)');
  console.log('   - 30 Catalog products created');
  console.log('   - 3 Customers created (customer@quickcart.com, david@quickcart.com, priya@quickcart.com)');
  console.log('   - 1 Delivery Executive created (delivery@quickcart.com)');
  console.log('   - 10 Sample orders with order items and status histories seeded');
  console.log('   - Default password for all accounts: password123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
