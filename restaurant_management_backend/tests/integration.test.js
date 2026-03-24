const request = require('supertest');
const { expect } = require('chai');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const API_URL = `http://localhost:${process.env.PORT || 5000}/api`;

describe('Integration Tests', () => {
    let adminToken;

    before(async () => {
        // Login as admin to get token (using seeded data)
        const res = await request(API_URL)
            .post('/auth/login')
            .send({
                email: 'admin@example.com',
                password: 'password123'
            });
        
        adminToken = res.body.token;
    });

    describe('Categories', () => {
        it('should fetch all categories', async () => {
            const res = await request(API_URL).get('/categories');
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array');
        });

        it('should create a new category', async () => {
            const res = await request(API_URL)
                .post('/categories')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Test Category',
                    image: 'https://example.com/test.jpg'
                });
            
            expect(res.status).to.equal(201);
            expect(res.body.name).to.equal('Test Category');
        });
    });

    describe('Menu Items', () => {
        it('should fetch all menu items', async () => {
            const res = await request(API_URL).get('/menu');
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array');
        });
    });

    describe('Orders', () => {
        it('should fetch all orders', async () => {
            const res = await request(API_URL)
                .get('/orders')
                .set('Authorization', `Bearer ${adminToken}`);
            
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array');
        });
    });
});
