// mock data for buyer and admin dashboards

export const mockOrders = [
  {
    _id: "o1",
    cropName: "Wheat",
    quantity: 10,
    unit: "quintal",
    totalPrice: 25000,
    orderStatus: "delivered",
    paymentStatus: "paid",
    farmer: { name: "Ramesh Yadav" },
    createdAt: "2026-06-10T10:00:00.000Z",
  },
  {
    _id: "o2",
    cropName: "Paddy",
    quantity: 5,
    unit: "quintal",
    totalPrice: 15000,
    orderStatus: "shipped",
    paymentStatus: "paid",
    farmer: { name: "Sita Kumari" },
    createdAt: "2026-06-15T14:30:00.000Z",
  },
  {
    _id: "o3",
    cropName: "Mustard",
    quantity: 8,
    unit: "quintal",
    totalPrice: 18000,
    orderStatus: "confirmed",
    paymentStatus: "pending",
    farmer: { name: "Mahesh Patel" },
    createdAt: "2026-06-18T09:15:00.000Z",
  },
];

export const mockWishlist = [
  { _id: "w1", crop: "Cotton", farmer: "Vikram Singh", quantity: 15, pricePerUnit: 5000 },
  { _id: "w2", crop: "Soybean", farmer: "Anita Devi", quantity: 20, pricePerUnit: 4500 },
];

export const mockRecentlyViewed = [
  { _id: "rv1", crop: "Chana", farmer: "Suresh Sharma", quantity: 12, pricePerUnit: 5500 },
  { _id: "rv2", crop: "Moong", farmer: "Kamla Bai", quantity: 8, pricePerUnit: 6000 },
];

export const mockAdminUsers = [
  { _id: "u1", name: "Ramesh Yadav", email: "ramesh@farm.com", role: "farmer", createdAt: "2026-05-01" },
  { _id: "u2", name: "Sita Kumari", email: "sita@farm.com", role: "farmer", createdAt: "2026-05-05" },
  { _id: "u3", name: "Priya Sharma", email: "priya@buyer.com", role: "buyer", createdAt: "2026-05-10" },
  { _id: "u4", name: "Mahesh Patel", email: "mahesh@farm.com", role: "farmer", createdAt: "2026-05-15" },
];

export const mockPendingListings = [
  { _id: "pl1", cropName: "Turmeric", farmer: "Vikram Singh", quantity: 5, status: "pending" },
  { _id: "pl2", cropName: "Ginger", farmer: "Anita Devi", quantity: 3, status: "pending" },
];

export const mockDonations = [
  { _id: "d1", farmer: "Ramesh Yadav", cause: "disaster relief", raised: 45000, goal: 100000 },
  { _id: "d2", farmer: "Sita Kumari", cause: "education", raised: 32000, goal: 80000 },
];

export const mockNewsContent = [
  { _id: "n1", title: "Govt announces new scheme", category: "government", status: "published" },
  { _id: "n2", title: "Rainfall forecast update", category: "weather", status: "draft" },
];