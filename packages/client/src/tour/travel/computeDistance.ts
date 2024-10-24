const toRadians = (value: number) => {
  return (value * Math.PI) / 180;
};

const computeDistance = (
  from?: { latitude: number; longitude: number },
  to?: { latitude: number; longitude: number },
) => {
  if (!from || !to) {
    return 0;
  }
  var R = 6371.071;
  var rlat1 = toRadians(from.latitude);
  var rlat2 = toRadians(to.latitude);
  var difflat = rlat2 - rlat1; 
  var difflon = toRadians(to.longitude - from.longitude); 
  return (
    2 *
    R *
    Math.asin(
      Math.sqrt(
        Math.sin(difflat / 2) * Math.sin(difflat / 2) +
          Math.cos(rlat1) *
            Math.cos(rlat2) *
            Math.sin(difflon / 2) *
            Math.sin(difflon / 2),
      ),
    )
  );
};

export default computeDistance;
