# NexaPay Changelog

All notable changes to the NexaPay project will be documented in this file.

## [Unreleased]

### Added
- **Spending Analytics Dashboard**: Added a new `/analytics` screen to the mobile app containing dynamic Pie Charts (Category Breakdown), Line Charts (7-Day Trend), and Bar Charts (Income vs Expense) powered by `react-native-chart-kit`.
- **Sidebar Navigation**: Implemented a slide-out sidebar modal on the Home screen triggered by tapping the profile picture logo.
- **Bank Withdrawals**: Created a dedicated `POST /api/transactions/withdraw` backend route to allow users to securely send money to external bank accounts using Account Number and IFSC code without requiring the receiver to be a registered NexaPay user.
- **Idempotency System**: Implemented `Idempotency-Key` headers on the transfer routes to prevent duplicate transactions if the user clicks "Pay" multiple times due to slow network conditions.
- **AI Fraud Detection**: Integrated a risk-scoring system (`analyzeFraudRisk`) for transfers. Transactions flagged as HIGH risk (>70 score) are placed in a `PENDING` state and require mandatory OTP verification (`/api/transactions/verify-otp`) before processing.
- **Transaction Ledger**: Built a robust transaction ledger system tracking `senderId`, `receiverId`, `status`, `type` (TRANSFER, DEPOSIT, WITHDRAWAL), `reference`, and `fee`.

### Changed
- **Credit Card UI**: Redesigned the "Card Details" input fields to resemble a premium virtual credit card, complete with auto-formatting for 16-digit card numbers, MM/YY expiry slash insertion, and secure bullet hiding for CVV.
- **Transaction Routing**: Updated the frontend "To Bank" screen to point to the new `/transactions/withdraw` API endpoint instead of the internal P2P wallet transfer endpoint.

### Fixed
- Fixed an issue where the "To Bank" feature was crashing MongoDB by attempting to cast a string name into an `ObjectId`.
