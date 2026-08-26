import { Tour } from "@/types/models";

export type ReviewRatingType = "all" | "property" | "agent";
export type StarRating = 1 | 2 | 3 | 4 | 5;

export type ReviewRatingFilter = {
  ratingType: ReviewRatingType;
  stars: StarRating | null;
};

export const DEFAULT_REVIEW_RATING_FILTER: ReviewRatingFilter = {
  ratingType: "all",
  stars: null,
};

const matchesRating = (value: number | undefined, stars: StarRating) =>
  value !== undefined && value !== null && value === stars;

export const filterToursByRating = (tours: Tour[], filter: ReviewRatingFilter) => {
  if (!filter.stars) return tours;

  return tours.filter((tour) => {
    const propertyRating = tour.feedback?.propertyRating;
    const agentRating = tour.feedback?.agentRating;

    if (filter.ratingType === "property") {
      return matchesRating(propertyRating, filter.stars);
    }
    if (filter.ratingType === "agent") {
      return matchesRating(agentRating, filter.stars);
    }

    return (
      matchesRating(propertyRating, filter.stars) || matchesRating(agentRating, filter.stars)
    );
  });
};

export const countToursByStar = (tours: Tour[], stars: StarRating, ratingType: ReviewRatingType) =>
  filterToursByRating(tours, { ratingType, stars }).length;
