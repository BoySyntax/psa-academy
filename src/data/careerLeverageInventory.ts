export type InventoryValue = "5" | "4" | "3" | "2" | "1" | "0" | "";

export const careerLeverageItems = [
  "I would like to stay at the same level in another unit of this organization",
  "I would like to increase the variety of skills I use on this job",
  "I am ready for more responsibility",
  "I wish I could find a job with a more manageable schedule",
  "I would like to open my own business",
  "I want a different job with the same level of responsibility I have now",
  "I like my current job but wish it were more challenging",
  "I would like my manager's job",
  "I would prefer a less demanding position",
  "My values no longer seem to fit this organization",
  "I would like a job at the same level in a different area of the organization",
  "I would like more visibility in my current job",
  "Being in a demanding and challenging position is important to me",
  "I am willing to take a lower level position in order to pursue a different career path",
  "I am considering moving to another company",
  "I would like to stay in the same kind of job in a different geographical location",
  "Training others to do what I do would be challenging for me",
  "I like to feel as if I'm continually advancing in the organization",
  "I would be willing to give up some of my responsibilities at work in order to have more time for my personal interests",
  "There are no more career growth opportunities that appeal to me in this organization",
  "I would be interested in trading my position for one of my colleagues jobs",
  "I would like to expand my current job",
  "I would like to have more decision making power within the organization",
  "Having free time and flexibility are more important than being in a high powered position",
  "I don't think this organization utilizes enough of the skills I have to offer",
  "I would like to think there are other opportunities for me at my level in this organization",
  "I would like to make more of my current job rather than making a move now",
  "I am a person who likes to keep advancing",
  "I would like to take on less responsibility in order to reduce the stress in my life",
  "I believe I have reached my maximum potential in this organization",
  "Before I can move up in this organization, I probably need to work in a different job at the same pay grade",
  "I would like to have more autonomy on my current job",
  "If I advance, I would demonstrate my capacity to handle more responsibility",
  "Lately, I find that my work has become less important to me in defining success for myself",
  "This organization no longer fulfills my career aspirations",
] as const;

export const careerLeverageResponseOptions = [
  { value: "5", label: "Definitely True", short: "5" },
  { value: "4", label: "Probably True", short: "4" },
  { value: "3", label: "Not Sure", short: "3" },
  { value: "2", label: "Probably Not True", short: "2" },
  { value: "1", label: "Not True", short: "1" },
  { value: "0", label: "Not Applicable", short: "0" },
] as const;

export const careerLeverageScoreGroups = [
  { key: "vertical", label: "VERTICAL", items: [3, 8, 13, 18, 23, 28, 33] },
  { key: "enrichment", label: "ENRICHMENT", items: [2, 7, 12, 17, 22, 27, 32] },
  { key: "lateral", label: "LATERAL", items: [1, 6, 11, 16, 21, 26, 31] },
  { key: "relocation", label: "RELOCATION", items: [5, 10, 15, 20, 25, 30, 35] },
  { key: "realignment", label: "REALIGNMENT", items: [4, 9, 14, 19, 24, 29, 34] },
] as const;

export const computeCareerLeverageScores = (answers: Record<number, InventoryValue | string | number | null | undefined>) => {
  const totals = careerLeverageScoreGroups.reduce<Record<string, number>>((acc, group) => {
    acc[group.key] = group.items.reduce((sum, itemNumber) => {
      const raw = answers[itemNumber];
      const numeric = Number(raw ?? 0);
      return sum + (Number.isFinite(numeric) ? numeric : 0);
    }, 0);
    return acc;
  }, {});

  const maxTotal = careerLeverageScoreGroups.reduce((max, group) => {
    const total = totals[group.key] || 0;
    return total > max ? total : max;
  }, Number.NEGATIVE_INFINITY);

  const highestList = careerLeverageScoreGroups
    .map((group) => ({ key: group.key, label: group.label, total: totals[group.key] || 0 }))
    .filter((g) => g.total === maxTotal);

  const highest = highestList[0] || null;

  const overallTotal = Object.values(totals).reduce((sum, value) => sum + value, 0);

  return { totals, highest, highestList, overallTotal };
};
