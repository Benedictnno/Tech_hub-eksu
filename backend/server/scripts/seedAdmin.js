import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const adminEmail = process.env.ADMIN_EMAIL || 'admin@tech-hub-eksu.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@TechHub2025';

        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('Admin user already exists. Updating role to admin...');
            existingAdmin.role = 'admin';
            existingAdmin.accountStatus = 'Active';
            existingAdmin.paymentStatus = 'Paid';
            existingAdmin.isRegistered = true;
            existingAdmin.firstLogin = false;
            await existingAdmin.save();
            console.log('Admin user updated successfully.');
        } else {
            console.log('Creating new admin user...');
            await User.create({
                name: 'System Admin',
                email: adminEmail,
                password: adminPassword,
                role: 'admin',
                accountStatus: 'Active',
                paymentStatus: 'Paid',
                isRegistered: true,
                firstLogin: false,
                onboardingCompleted: true
            });
            console.log('Admin user created successfully.');
            console.log(`Email: ${adminEmail}`);
            console.log(`Password: ${adminPassword}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
