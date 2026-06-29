// mock community data, matches post.model.js and comment.model.js

export const mockPosts = [
  {
    _id: "1",
    title: "Why are my wheat leaves turning yellow?",
    content: "I've noticed yellowing on the lower leaves of my wheat crop over the past week. Soil seemed fine at sowing time. Anyone faced this before?",
    image: null,
    category: "crop-tips",
    author: { name: "Ramesh Yadav" },
    likes: 12,
    createdAt: "2026-06-20T09:00:00.000Z",
  },
  {
    _id: "2",
    title: "Best pesticide for cotton bollworm?",
    content: "Bollworm infestation is getting worse this season. I've tried neem oil but it's not strong enough anymore. What's working for others?",
    image: null,
    category: "pest-control",
    author: { name: "Sita Kumari" },
    likes: 8,
    createdAt: "2026-06-19T14:30:00.000Z",
  },
  {
    _id: "3",
    title: "How to increase yield of tomatoes?",
    content: "Growing tomatoes for the first time on half an acre. Yield has been okay but I think it could be better. Any tips on spacing or fertilizer timing?",
    image: null,
    category: "crop-tips",
    author: { name: "Mahesh Patel" },
    likes: 15,
    createdAt: "2026-06-18T11:15:00.000Z",
  },
  {
    _id: "4",
    title: "Drip vs sprinkler irrigation — which is better?",
    content: "Planning to upgrade my irrigation system this year. Budget allows for either drip or sprinkler. Which gives better results for vegetable crops?",
    image: null,
    category: "general",
    author: { name: "Anita Devi" },
    likes: 6,
    createdAt: "2026-06-17T16:45:00.000Z",
  },
];

export const mockComments = [
  { _id: "c1", post: "1", content: "Could be nitrogen deficiency — try a urea top dressing.", author: { name: "Vikram Singh" }, createdAt: "2026-06-20T10:00:00.000Z" },
  { _id: "c2", post: "1", content: "Check for waterlogging too, that causes yellowing as well.", author: { name: "Kamla Bai" }, createdAt: "2026-06-20T11:30:00.000Z" },
  { _id: "c3", post: "2", content: "Spinosad worked well for me last season against bollworm.", author: { name: "Suresh Sharma" }, createdAt: "2026-06-19T15:00:00.000Z" },
];
