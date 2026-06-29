export default function formatTimeAgo(pastTime) {
  const now = new Date();
  const past = new Date(pastTime);

  // Calculate difference in milliseconds
  const diffInMs = now - past;

  // Convert to larger units
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  // Handle Minutes
  if (diffInMinutes < 60) {
    if (diffInMinutes <= 0) {
      return "just now";
    }

    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  }

  // Handle Hours
  if (diffInMinutes >= 60 && diffInHours < 24) {
    return `${diffInHours} hours${diffInHours > 1 ? "s" : ""} ago`;
  }

  // Handle Days
  if (diffInHours >= 24) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  }
}
