/**
 * Client-side utility to log user actions to MongoDB via /api/user-actions-logs
 */
export async function logUserAction(actionType, property, details = {}) {
  try {
    let currentUser = null;
    if (typeof window !== "undefined") {
      const userJson = localStorage.getItem("currentUser");
      if (userJson) {
        currentUser = JSON.parse(userJson);
      }
    }

    if (!currentUser || !(currentUser.phoneNumber || currentUser.phone)) {
      // Do not log if user is not logged in
      return;
    }

    const payload = {
      userPhoneNumber: currentUser?.phoneNumber || currentUser?.phone || "",
      userName: currentUser?.name || "",
      userEmail: currentUser?.email || "",
      actionType: actionType,
      location: typeof window !== "undefined" ? (localStorage.getItem("selectedCity") || property?.address?.city || property?.city || "") : "",
      details: {
        propertyId: property?._id || property?.id || "",
        propertyName: property?.propertyName || property?.name || "",
        brandName: property?.builderDetails?.builderName || property?.brandDetails?.name || property?.builderName || property?.builder || "",
        ...details
      }
    };

    // Send the log asynchronously to the server (non-blocking)
    fetch("/api/user-actions-logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    }).catch(err => console.error("Error sending user action log:", err));

  } catch (error) {
    console.error("Failed to log user action:", error);
  }
}
