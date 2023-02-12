export enum CartStatus {
    CREATED = 'CREATED',// First stage, when the cart is created
    PENDING = 'PENDING',// Second stage, when the cart is pending for payment (loading the payment gateway)
    CANCELED = 'CANCELED',// Third stage, when the cart is canceled by the user or the payment gateway
    PAID = 'PAID',// Fourth stage, when the cart is paid by the user
    EXPIRED = 'EXPIRED'// Fifth stage, when the cart is expired for not being paid in 20 days
}