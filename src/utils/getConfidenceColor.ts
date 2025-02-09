export const getConfidenceColor = (probability: number): string => {
  const perc = probability * 100;
  if (perc < 20) return "text-red-500";
  else if (perc < 40) return "text-orange-500";
  else if (perc < 60) return "text-yellow-500";
  else if (perc < 80) return "text-green-400";
  else return "text-green-500";
};
