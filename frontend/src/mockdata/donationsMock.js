// mock campaign data — NOTE: backend's donation.model.js is only a transaction
// log (no campaign/goal/story fields), so this models a "Campaign" concept
// that doesn't exist on the backend yet. Flag to team before going live.

export const mockCampaigns = [
  {
    _id: "1",
    farmerName: "Ramesh Yadav",
    location: "Bharatpur, Rajasthan",
    photo: "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=500",
    cause: "education",
    story: "Ramesh has worked tirelessly on his 3-acre farm to support his family, but this year's unseasonal rains destroyed half his wheat crop. He's raising funds to help his daughter continue her college education despite the loss.",
    goal: 120000,
    raised: 45000,
  },
  {
    _id: "2",
    farmerName: "Sita Devi",
    location: "Alwar, Rajasthan",
    photo: "https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?w=500",
    cause: "healthcare",
    story: "Sita Devi needs urgent medical treatment for a long-standing illness. As the sole earner on her small mustard farm, her family is struggling to cover the hospital costs while keeping the farm running.",
    goal: 80000,
    raised: 32000,
  },
  {
    _id: "3",
    farmerName: "Mahesh Patel",
    location: "Kota, Rajasthan",
    photo: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=500",
    cause: "disaster relief",
    story: "Flash floods washed away Mahesh's entire soybean harvest just weeks before he could sell it. He's seeking support to recover lost income and replant for the next season.",
    goal: 150000,
    raised: 78000,
  },
  {
    _id: "4",
    farmerName: "Kamla Bai",
    location: "Ajmer, Rajasthan",
    photo: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500",
    cause: "equipment",
    story: "Kamla Bai's only irrigation pump broke down right before the critical sowing window. Without it, her entire season's crop is at risk. She needs help to repair or replace it urgently.",
    goal: 35000,
    raised: 28000,
  },
];