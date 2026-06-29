import { useState } from "react";
import { mockAdminUsers, mockPendingListings, mockDonations, mockNewsContent, mockOrders } from "../../mockdata/dashboardMock";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white px-6 py-10">
      <h1 className="text-3xl font-bold text-green-800 mb-1">Admin Dashboard</h1>
      <p className="text-gray-600 mb-6">Manage users, listings, donations, and content.</p>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-green-100">
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-2xl font-bold text-green-700">{mockAdminUsers.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-green-100">
          <p className="text-sm text-gray-500">Pending Listings</p>
          <p className="text-2xl font-bold text-amber-700">{mockPendingListings.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-green-100">
          <p className="text-sm text-gray-500">Active Donations</p>
          <p className="text-2xl font-bold text-blue-700">{mockDonations.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-green-100">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold text-purple-700">{mockOrders.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {["overview", "users", "listings", "donations", "news"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-colors ${
              activeTab === tab ? "bg-green-700 text-white" : "bg-white text-gray-600 border border-green-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-green-100 overflow-hidden">
        {activeTab === "overview" && (
          <div className="p-6">
            <h3 className="font-semibold text-green-800 mb-4">Quick Stats</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-gray-600">Farmers: {mockAdminUsers.filter((u) => u.role === "farmer").length}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-gray-600">Buyers: {mockAdminUsers.filter((u) => u.role === "buyer").length}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <p className="text-gray-600">Pending Approvals: {mockPendingListings.length}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-gray-600">Campaigns: {mockDonations.length}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="divide-y">
            <div className="grid grid-cols-4 gap-4 p-4 bg-green-50 font-semibold text-sm text-gray-700">
              <span>Name</span>
              <span>Email</span>
              <span>Role</span>
              <span>Joined</span>
            </div>
            {mockAdminUsers.map((user) => (
              <div key={user._id} className="grid grid-cols-4 gap-4 p-4 text-sm hover:bg-green-50">
                <span className="font-medium">{user.name}</span>
                <span className="text-gray-600">{user.email}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${user.role === "farmer" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>{user.role}</span>
                <span className="text-gray-500 text-xs">{new Date(user.createdAt).toLocaleDateString("en-IN")}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === "listings" && (
          <div className="divide-y">
            <div className="grid grid-cols-4 gap-4 p-4 bg-green-50 font-semibold text-sm text-gray-700">
              <span>Crop</span>
              <span>Quantity</span>
              <span>Farmer</span>
              <span>Action</span>
            </div>
            {mockPendingListings.map((listing) => (
              <div key={listing._id} className="grid grid-cols-4 gap-4 p-4 items-center text-sm hover:bg-green-50">
                <span className="font-medium">{listing.cropName}</span>
                <span className="text-gray-600">{listing.quantity} quintal</span>
                <span className="text-gray-600">{listing.farmer}</span>
                <div className="flex gap-2">
                  <button className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200">Approve</button>
                  <button className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200">Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "donations" && (
          <div className="divide-y">
            <div className="grid grid-cols-4 gap-4 p-4 bg-green-50 font-semibold text-sm text-gray-700">
              <span>Farmer</span>
              <span>Cause</span>
              <span>Progress</span>
              <span>Amount</span>
            </div>
            {mockDonations.map((d) => {
              const percent = Math.min(Math.round((d.raised / d.goal) * 100), 100);
              return (
                <div key={d._id} className="grid grid-cols-4 gap-4 p-4 items-center text-sm hover:bg-green-50">
                  <span className="font-medium">{d.farmer}</span>
                  <span className="text-gray-600 capitalize">{d.cause.replace("-", " ")}</span>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: `${percent}%` }} />
                  </div>
                  <span className="text-gray-600">{percent}%</span>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "news" && (
          <div className="divide-y">
            <div className="grid grid-cols-3 gap-4 p-4 bg-green-50 font-semibold text-sm text-gray-700">
              <span>Title</span>
              <span>Category</span>
              <span>Status</span>
            </div>
            {mockNewsContent.map((news) => (
              <div key={news._id} className="grid grid-cols-3 gap-4 p-4 items-center text-sm hover:bg-green-50">
                <span className="font-medium">{news.title}</span>
                <span className="text-gray-600 text-xs capitalize">{news.category}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${news.status === "published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>{news.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;