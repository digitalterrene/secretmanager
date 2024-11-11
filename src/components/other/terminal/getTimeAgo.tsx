export const getTimeAgo = (timestamp: number) => {
  const date = new Date(timestamp); // Directly pass the timestamp as a number

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return "Invalid date";
  }

  const secondsAgo = Math.round((+new Date() - +date) / 1000);

  if (secondsAgo <= 59) return `${secondsAgo} seconds ago`;
  else if (secondsAgo <= 3599)
    return `${Math.floor(secondsAgo / 60)} minutes ago`;
  else if (secondsAgo <= 86399)
    return `${Math.floor(secondsAgo / 3600)} hours ago`;
  else return `${Math.floor(secondsAgo / 86400)} days ago`;
};
