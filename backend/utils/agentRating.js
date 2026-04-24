import User from '../models/User.model.js';

/**
 * Adds one tour feedback agent rating (1–5) to the agent's aggregate rating on User.agentProfile.rating.
 */
export async function incrementAgentRatingFromTourFeedback(agentId, rating) {
  if (!agentId || rating == null || rating < 1 || rating > 5) return;

  const id =
    typeof agentId === 'object' && agentId !== null && agentId._id
      ? agentId._id
      : agentId;

  const agent = await User.findById(id);
  if (!agent || agent.role !== 'agent') return;

  agent.agentProfile = agent.agentProfile || {};
  const prev = agent.agentProfile.rating || {};
  const count = prev.count ?? 0;
  const avg = prev.average ?? 0;
  const newCount = count + 1;
  const newAvg = (avg * count + rating) / newCount;

  agent.agentProfile.rating = {
    average: Number(newAvg.toFixed(2)),
    count: newCount,
  };

  await agent.save();
}
