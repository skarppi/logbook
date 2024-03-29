export const formatDuration = (seconds: number): string => {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor(seconds / 3600) - days * 24;
  const mins = Math.floor(seconds / 60) - hours * 60;
  const secs = Math.floor(seconds % 60);

  if (days > 0) {
    return `${days}d ${hours}h`.replace(" 0h", "");
  } else if (hours > 0) {
    return `${hours}h ${mins}m`.replace(" 0m", "");
  } else {
    return `${mins}m ${secs}s`.replace(" 0s", " ").replace("/0m /", "");
  }
};

export function parseDurationIntoSeconds(str: string): number | undefined {
  const res = str.match(
    /^((\d+)d){0,1}\s*((\d+)h){0,1}\s*((\d+)m){0,1}\s*((\d+)s){0,1}$/
  );

  if (res && res.length > 0) {
    const [, , days, , hours, , mins, , secs] = res;

    return (
      (parseInt(days) || 0) * 3600 * 24 +
      (parseInt(hours) || 0) * 3600 +
      (parseInt(mins) || 0) * 60 +
      (parseInt(secs) || 0)
    );
  } else {
    return undefined;
  }
}
