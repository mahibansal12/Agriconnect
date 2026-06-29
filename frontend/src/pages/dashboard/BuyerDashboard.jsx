import { useState } from "react";
import { mockOrders, mockWishlist, mockRecentlyViewed } from "../../mockdata/dashboardMock";
import { formatPrice, formatDate } from "../../utils/formatters";

const statusColors = {
  delivered: "bg-green-100 text-green-700",
  shipped: "bg-blue-100 text-blue-700",
  confirmed: "bg-yellow-100 text-yellow-700",
  placed: "bg-gray-100 text-gray-700",
};

function BuyerDashboard() {
  const [activeTab, setActiveTab] = useState("orders");

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white px-6 py-10">
      <h1 className="text-3xl font-bold text-green-800 mb-1">Buyer Dashboard</h1>
      <p className="text-gray-600 mb-6">Manage your orders and saved crops.</p>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-green-100">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold text-green-700">{mockOrders.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-green-100">
          <p className="text-sm text-gray-500">Wishlist Items</p>
          <p className="text-2xl font-bold text-green-700">{mockWishlist.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-green-100">
          <p className="text-sm text-gray-500">Total Spent</p>
          <p className="text-2xl font-bold text-green-700">₹{mockOrders.reduce((sum, o) => sum + o.totalPrice, 0).toLocaleString("en-IN")}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {["orders", "wishlist", "recently-viewed"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              activeTab === tab ? "bg-green-700 text-white" : "bg-white text-gray-600 border border-green-200 hover:bg-green-50"
            }`}
          >
            {tab.replace("-", " ")}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-green-100 overflow-hidden">
        {activeTab === "orders" && (
          <div className="divide-y">
            <div className="grid grid-cols-5 gap-4 p-4 bg-green-50 font-semibold text-sm text-gray-700">
              <span>Crop</span>
              <span>Quantity</span>
              <span>Total</span>
              <span>Status</span>
              <span>Farmer</span>
            </div>
            {mockOrders.map((order) => (
              <div key={order._id} className="grid grid-cols-5 gap-4 p-4 items-center text-sm hover:bg-green-50">
                <span className="font-medium text-gray-800">{order.cropName}</span>
                <span className="text-gray-600">{order.quantity} {order.unit}</span>
                <span className="font-medium text-green-700">{formatPrice(order.totalPrice)}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[order.orderStatus]} capitalize`}>{order.orderStatus}</span>
                <span className="text-gray-600">{order.farmer.name}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === "wishlist" && (
          <div className="divide-y">
            <div className="grid grid-cols-4 gap-4 p-4 bg-green-50 font-semibold text-sm text-gray-700">
              <span>Crop</span>
              <span>Quantity</span>
              <span>Price/Unit</span>
              <span>Farmer</span>
            </div>
            {mockWishlist.map((item) => (
              <div key={item._id} className="grid grid-cols-4 gap-4 p-4 items-center text-sm hover:bg-green-50">
                <span className="font-medium text-gray-800">{item.crop}</span>
                <span className="text-gray-600">{item.quantity} quintal</span>
                <span className="font-medium text-green-700">{formatPrice(item.pricePerUnit)}</span>
                <span className="text-gray-600">{item.farmer}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === "recently-viewed" && (
          <div className="divide-y">
            <div className="grid grid-cols-4 gap-4 p-4 bg-green-50 font-semibold text-sm text-gray-700">
              <span>Crop</span>
              <span>Quantity</span>
              <span>Price/Unit</span>
              <span>Farmer</span>
            </div>
            {mockRecentlyViewed.map((item) => (
              <div key={item._id} className="grid grid-cols-4 gap-4 p-4 items-center text-sm hover:bg-green-50">
                <span className="font-medium text-gray-800">{item.crop}</span>
                <span className="text-gray-600">{item.quantity} quintal</span>
                <span className="font-medium text-green-700">{formatPrice(item.pricePerUnit)}</span>
                <span className="text-gray-600">{item.farmer}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BuyerDashboard;