export const loginUser = (userData) => {
    try {
        const userDataString = JSON.stringify(userData);
        localStorage.setItem('currentUser', userDataString);
        window.dispatchEvent(new CustomEvent('onAuthChange'));
    } catch (error) {
        console.error("Failed to save user data to localStorage:", error);
    }
};

export const logoutUser = () => {
    try {
        localStorage.removeItem('currentUser');
        window.dispatchEvent(new CustomEvent('onAuthChange'));
    } catch (error) {
        console.error("Failed to remove user data from localStorage:", error);
    }
};