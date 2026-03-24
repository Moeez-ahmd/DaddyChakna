const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Category = require('./models/Category');
const MenuItem = require('./models/MenuItem');
const Order = require('./models/Order');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('Connected for seeding...')).catch(err => console.error(err));

const seedData = async () => {
    try {
        await User.deleteMany();
        await Category.deleteMany();
        await MenuItem.deleteMany();
        await Order.deleteMany();

        console.log('Data cleared...');

        const users = await User.create([
            { name: 'Admin User', email: 'admin@example.com', password: 'password123', role: 'Admin', phone: '1234567890' },
            { name: 'Jane Staff', email: 'jane@example.com', password: 'password123', role: 'Staff', phone: '1112223333' },
            { name: 'John Staff', email: 'john@example.com', password: 'password123', role: 'Staff', phone: '4445556666' },
            { name: 'Regular Customer', email: 'customer@example.com', password: 'password123', role: 'Customer', phone: '7778889999' }
        ]);

        const categories = await Category.create([
            { name: 'Appetizers', image: 'https://images.unsplash.com/photo-1541014741259-df549fa9ba6f?w=400', status: true },
            { name: 'Main Courses', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', status: true },
            { name: 'Desserts', image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400', status: true }
        ]);

        const items = await MenuItem.create([
            { name: 'Bruschetta', description: 'Toasted bread with tomatoes.', price: 8.99, category: categories[0]._id, image: 'https://images.unsplash.com/photo-1572656631137-7935297eff55?w=400', status: true },
            { name: 'Grilled Salmon', description: 'Fresh salmon grilled.', price: 24.99, category: categories[1]._id, image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400', status: true },
            { name: 'Ribeye Steak', description: '12oz steak.', price: 32.00, category: categories[1]._id, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', status: true },
            { name: 'Tiramisu', description: 'Coffee dessert.', price: 7.50, category: categories[2]._id, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', status: true }
        ]);

        const customer = users.find(u => u.role === 'Customer');
        
        // Create orders sequentially to ensure auto-increment works
        await Order.create({
            user: customer._id,
            items: [
                { menuItem: items[0]._id, quantity: 2, priceAtPurchase: items[0].price },
                { menuItem: items[1]._id, quantity: 1, priceAtPurchase: items[1].price }
            ],
            totalAmount: (items[0].price * 2) + items[1].price,
            status: 'Delivered',
            orderType: 'Delivery',
            deliveryAddress: '123 Foodie Street, Gourmet City'
        });

        await Order.create({
            user: customer._id,
            items: [
                { menuItem: items[2]._id, quantity: 1, priceAtPurchase: items[2].price }
            ],
            totalAmount: items[2].price,
            status: 'Preparing',
            orderType: 'Pickup'
        });

        await Order.create({
            user: customer._id,
            items: [
                { menuItem: items[3]._id, quantity: 3, priceAtPurchase: items[3].price }
            ],
            totalAmount: items[3].price * 3,
            status: 'Pending',
            orderType: 'Delivery',
            deliveryAddress: '456 Hunger Lane, Feast Town'
        });

        console.log('Orders seeded!');
        console.log('Successfully seeded everything!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedData();
