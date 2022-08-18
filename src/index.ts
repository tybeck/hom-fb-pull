import mongoose from 'mongoose';
import axios from 'axios';

import { FbReviewModel, IReview, FbPostModel, IPost } from '@hoagiesonmain/shared-be';

import { FBPost, FBRecommendation, FBReview } from './types/review.type';

const main = async () => {
  const {
    FB_PAGE_ACCESS_TOKEN,
    FB_PAGE_ID,
    FB_GRAPH_URL,
    FB_GRAPH_URL_RATING,
    FB_GRAPH_URL_PUBLISHED_POSTS,
    MONGO_URL,
    MONGO_PORT,
    MONGO_DB,
  } = process.env;
  const mongoConnectionString = [[MONGO_URL, MONGO_PORT].join(':'), MONGO_DB].join('/');

  await mongoose.connect(mongoConnectionString);

  const params = new URLSearchParams([['access_token', FB_PAGE_ACCESS_TOKEN]]);
  const ratingsApi = [FB_GRAPH_URL, FB_PAGE_ID, FB_GRAPH_URL_RATING].join('/');
  const publishedPostsApi = [FB_GRAPH_URL, FB_PAGE_ID, FB_GRAPH_URL_PUBLISHED_POSTS].join('/');
  const [fbReviews, fbPosts] = await Promise.all([
    axios.get(ratingsApi, { params }),
    axios.get(publishedPostsApi, { params }),
  ]);

  const reviews = ((fbReviews?.data?.data || []) as FBReview[])
    .filter(review => review.recommendation_type === FBRecommendation.Positive)
    .map(review => (<Partial<IReview>>{
      review: review.review_text,
      createdAt: new Date(review.created_time),
    }))
    .slice(0, 10);
  const posts = ((fbPosts?.data?.data || []) as FBPost[])
    .map(post => (<Partial<IPost>>{
      message: post.message,
      createdAt: new Date(post.created_time),
    }))
    .slice(0, 10);

  await FbReviewModel.deleteMany({}).exec();
  await FbPostModel.deleteMany({}).exec();

  await FbReviewModel.insertMany(reviews);
  await FbPostModel.insertMany(posts);
}

export { main }