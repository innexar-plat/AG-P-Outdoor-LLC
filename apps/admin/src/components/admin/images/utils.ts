export function displayLabel(type: string, t: (k: "displayGallery" | "displayCarousel" | "displaySingle") => string): string {
  switch (type) {
    case "gallery":
      return t("displayGallery");
    case "carousel":
      return t("displayCarousel");
    default:
      return t("displaySingle");
  }
}
