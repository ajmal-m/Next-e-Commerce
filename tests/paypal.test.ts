import { generateAccessToken, paypal } from "../lib/paypal";

// Test to generate Access Token from paypal
test("access token from paypal",async () => {
    const tokenResponse = await generateAccessToken();
    console.log(tokenResponse);
    expect(typeof tokenResponse).toBe('string');
    expect(tokenResponse.length).toBeGreaterThan(0);
});

// Test to Create paypal order
test("create a paypal order", async () => {
    const token = await generateAccessToken();
    const price = 10.5;

    const orderResponse = await paypal.createOrder(price);

    console.log(orderResponse);

    expect(orderResponse).toHaveProperty('id');
    expect(orderResponse).toHaveProperty('status');
    expect(orderResponse.status).toBe('CREATED');
    
});


// Test to capture payment with mock order
test('simulating captuaring payment from a order', async()=> {
    const orderId = '100';
    const capturePayment = jest.spyOn(paypal, 'capturePayment').mockResolvedValue({
        status:"COMPLETED"
    });

    const captureResponse = await paypal.capturePayment(orderId);
    console.log(captureResponse);
    expect(captureResponse).toHaveProperty('status', 'COMPLETED');
    capturePayment.mockRestore();
});