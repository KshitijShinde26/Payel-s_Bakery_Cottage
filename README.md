# 🍰 Payal's Bakery Cottage

## 📋 Project Description
**Payal's Bakery Cottage** is a real homemade bakery business. This application is currently under development and is being built as a production-grade bakery management system designed to streamline online ordering, cake customization, inventory tracking, manual payment verification, and delivery scheduling.

---

## 🚦 Project Status
🚧 Production-grade bakery management system currently under active development.

---

## 💳 Payment Methods & Workflow

### Payment Methods
* **High Resolution Dynamic UPI QR Code** (Integrated directly into the checkout interface)
* **Cash on Delivery (CoD)** (Optional checkout method, globally toggled by the Admin)

### Payment Workflow
```
Generate High-Resolution UPI QR Code
                 ↓
      3-Minute Countdown Timer
                 ↓
        Customer Makes Payment
                 ↓
   Customer Uploads Payment Screenshot
                 ↓
Customer Enters UPI Transaction ID (Mandatory)
                 ↓
 Admin Verifies Screenshot & Transaction ID
                 ↓
          Payment Verified
                 ↓
           Order Accepted
```

* **Clear & Unblurred:** The generated UPI QR Code remains high-resolution and never becomes blurred during its validity period.
* **Expiry Window:** The QR Code expires after exactly 3 minutes. If the timer runs out, the customer must regenerate a new QR Code to submit payment proof.
* **Mandatory Input:** A payment screenshot alone is not sufficient; entering the **UPI Transaction ID** is mandatory for checkout submission.

---

## 🚚 Delivery & Pickup Options

### Delivery & Pickup Features
* **Freshness Guaranteed:** All bakery products are freshly prepared after order confirmation.
* **Advance Order Placement:** Customers are encouraged to place orders at least one day before the desired delivery date to allow ample preparation time.
* **Checkout Preferences:** Customers select:
  - **Preferred Delivery Date**
  - **Preferred Time Window (Optional)**
  - **Occasion Selection** (e.g. Birthday, Anniversary, Wedding, Baby Shower, Festival, Corporate Event, Other)
  - **Delivery Options:** Choose between **Home Delivery** and **Store Pickup**.
* **Admin-Driven Scheduling:** The Admin decides and schedules:
  - Preparation Time
  - Exact Delivery Time
  - Dispatch Time
* **Status Alerts:** The customer receives email notifications once the order is accepted and scheduled, and during key status milestones (Preparing, Out for Delivery, Delivered).

---

## 🕒 Business Hours & Holiday Management
* **Configurable Business Hours:** The bakery operates within configurable working hours (e.g., 9:00 AM – 8:00 PM) managed by the Admin.
* **Off-Hours Queueing:** Orders placed outside of configured business hours are automatically queued and processed on the next operational business day.
* **Holiday Constraints:** The Admin can mark specific calendar dates as holidays (Festival closures, Emergency closures, Maintenance closures), which disables them in the customer delivery date picker.

---

## 🛠️ Admin Features
* **Payment Verification:** Manual verification queue inspecting screenshots and mandatory UPI Transaction IDs.
* **Holiday Management:** Calendar controls to flag bakery closures.
* **Business Hour Configuration:** Tools to edit opening, closing, and next-day processing thresholds.
* **Preparation Scheduling:** Priority queues and kitchen production queue assignments.
* **Delivery Scheduling:** Setting exact dispatch and delivery times, and assigning staff.
* **Inventory Management:** Expiring ingredients tracker and reorder alerts.
* **Occasion Management:** Dashboard widgets filtering orders by occasions.

---

## 🌟 Key Application Features
* **Occasion Selection:** Easy checkout dropdown to flag orders for specific events.
* **Store Pickup:** Option to skip delivery address details and fees.
* **Dynamic Delivery Charges:** Calculated automatically based on distance slabs.
* **Holiday Calendar:** Live checkout validation restricting unavailable dates.
* **Business Hours Gates:** Server-side order scheduling gates.
* **Seasonal & Festival Products:** Dynamic availability tags configured in the catalog.
* **Ingredient Inventory & Low Stock Alerts:** Real-time stock level and reorder warning monitors.

---

## 🗺️ Roadmap & Timeline
* **Development Phase:** 8-Phase Structured Development
* **Timeline:** 8-Week Implementation Timeline

---

## 🚀 Future Enhancements
* **WhatsApp Notifications:** Automatic status updates and payment receipts sent directly to WhatsApp.
* **SMS Notifications:** Backup offline alerts via SMS gateways.
* **AI Demand Prediction:** Historical order modeling for seasonal production spikes.
* **AI Inventory Forecasting:** Predicting ingredient stock needs to prevent wastage.
* **Loyalty Rewards:** Points-based customer retention program.
* **Referral System:** Sharing discounts to grow the bakery's local customer base.
