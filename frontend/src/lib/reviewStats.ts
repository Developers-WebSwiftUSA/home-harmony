import { Tour } from "@/types/models";
import { getUserId } from "@/lib/userDisplay";

export const getToursForUser = (tours: Tour[], userId: string) => {
  const uid = getUserId({ _id: userId, id: userId });
  return tours.filter((tour) => {
    const roles = [getUserId(tour.buyerId), getUserId(tour.sellerId), getUserId(tour.agentId)];
    return roles.includes(uid);
  });
};

export const getUserReviewSummary = (tours: Tour[], userId: string, role?: string) => {
  const related = getToursForUser(tours, userId);

  if (role === "agent") {
    const agentReviews = related.filter(
      (t) => getUserId(t.agentId) === getUserId({ _id: userId, id: userId }) && t.feedback?.agentRating
    );
    const average =
      agentReviews.length > 0
        ? agentReviews.reduce((sum, t) => sum + (t.feedback?.agentRating || 0), 0) / agentReviews.length
        : 0;
    return { count: agentReviews.length, average, label: "agent reviews" };
  }

  if (role === "buyer") {
    const given = related.filter(
      (t) => getUserId(t.buyerId) === getUserId({ _id: userId, id: userId })
    );
    return { count: given.length, average: 0, label: "reviews given" };
  }

  if (role === "seller") {
    const propertyReviews = related.filter(
      (t) => getUserId(t.sellerId) === getUserId({ _id: userId, id: userId })
    );
    const average =
      propertyReviews.length > 0
        ? propertyReviews.reduce((sum, t) => sum + (t.feedback?.propertyRating || 0), 0) / propertyReviews.length
        : 0;
    return { count: propertyReviews.length, average, label: "property reviews" };
  }

  return { count: related.length, average: 0, label: "reviews" };
};
