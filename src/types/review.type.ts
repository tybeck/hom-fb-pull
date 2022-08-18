export type FBReview = {
  created_time: string;
  recommendation_type: string;
  review_text: string;
}

export enum FBRecommendation {
  Positive = 'positive',
  Negative = 'negative',
}

export type FBPost = {
  created_time: string;
  message: string;
  id: string;
  story: string;
}