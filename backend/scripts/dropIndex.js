import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function dropIndex() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        await db.collection('vendormaps').dropIndex('userId_1_senderEmail_1');

        console.log('Index dropped successfully!');
        process.exit(0);
    } catch (error) {
        if (error.code === 27 || error.message.includes('index not found')) {
            console.log('Index already removed or does not exist');
            process.exit(0);
        } else {
            console.error('Error:', error.message);
            process.exit(1);
        }
    }
}

dropIndex();
