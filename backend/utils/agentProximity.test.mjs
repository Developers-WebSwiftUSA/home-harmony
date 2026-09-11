import assert from "node:assert/strict";
import { rankAgentsForProperty } from "./agentProximity.js";
import { sanitizePreferredArea, stripEmptyPreferredArea } from "./preferredArea.js";

const austin = sanitizePreferredArea({
  latitude: 30.2672,
  longitude: -97.7431,
  radiusMiles: 15,
  label: "Austin, Texas",
  city: "Austin",
  state: "Texas",
});

const nearbyAgent = {
  _id: "a1",
  firstName: "Near",
  lastName: "Agent",
  agentProfile: { preferredArea: austin },
};

const farAgent = {
  _id: "a2",
  firstName: "Far",
  lastName: "Agent",
  location: {
    city: "Dallas",
    state: "Texas",
    coordinates: { type: "Point", coordinates: [-96.797, 32.7767] },
  },
};

const otherState = {
  _id: "a3",
  firstName: "Other",
  lastName: "State",
  location: {
    city: "Denver",
    state: "Colorado",
    coordinates: { type: "Point", coordinates: [-104.9903, 39.7392] },
  },
};

const property = {
  location: {
    city: "Austin",
    state: "Texas",
    coordinates: { type: "Point", coordinates: [-97.7431, 30.2672] },
  },
};

const ranked = rankAgentsForProperty([farAgent, otherState, nearbyAgent], property);
assert.equal(ranked[0]._id, "a1");
assert.equal(ranked[0].inPreferredArea, true);
assert.equal(ranked[1]._id, "a2");
assert.equal(ranked[1].sameState, true);
assert.equal(ranked[2]._id, "a3");

const skipped = sanitizePreferredArea(null);
assert.equal(skipped, null);

const invalid = sanitizePreferredArea({ latitude: 200, longitude: 0 });
assert.equal(invalid, null);

const stripped = stripEmptyPreferredArea({
  verified: false,
  preferredArea: { coordinates: { type: "Point", coordinates: [] } },
});
assert.equal(stripped.preferredArea, undefined);
assert.equal(stripped.verified, false);

const kept = stripEmptyPreferredArea({ preferredArea: austin });
assert.equal(kept.preferredArea.city, "Austin");

console.log("agentProximity tests passed");
