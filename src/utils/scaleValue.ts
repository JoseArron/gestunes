const scaleValue = (value: number, oldScale: number[], newScale: number[]) => {
  value = 1 - value;
  let scale = (newScale[1] - newScale[0]) / (oldScale[1] - oldScale[0]);

  let capped = Math.min(oldScale[1], Math.max(oldScale[0], value)) - oldScale[0];
  return capped * scale + newScale[0];
};

export default scaleValue;
