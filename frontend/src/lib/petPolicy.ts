export type PetPolicy = "allowed" | "not_allowed" | "negotiable";

export const formatPetPolicy = (policy?: PetPolicy | string | null) => {
  switch (policy) {
    case "allowed":
      return "Pets allowed";
    case "not_allowed":
      return "No pets";
    case "negotiable":
      return "Pets negotiable";
    default:
      return null;
  }
};

export const getPetPolicyShortLabel = (policy?: PetPolicy | string | null) => {
  switch (policy) {
    case "allowed":
      return "Pets OK";
    case "not_allowed":
      return "No pets";
    case "negotiable":
      return "Pets negotiable";
    default:
      return null;
  }
};
