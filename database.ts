import { User, UserPreferences } from './types';

const DB_KEY = 'users';

// This function initializes the database from db.json if localStorage is empty.
const initializeDatabase = async (): Promise<User[]> => {
  try {
    const response = await fetch('/db.json');
    if (!response.ok) throw new Error('Could not fetch initial database.');
    const data = await response.json();
    const initialUsers = data.users || [];
    localStorage.setItem(DB_KEY, JSON.stringify(initialUsers));
    return initialUsers;
  } catch (e) {
    console.error("Failed to load initial users from db.json", e);
    // If db.json fails, start with an empty user list
    localStorage.setItem(DB_KEY, JSON.stringify([]));
    return [];
  }
};

// --- Public API for the database ---

/**
 * Retrieves all users from the database.
 * If the database is not initialized, it will be seeded from db.json.
 * @returns A promise that resolves to an array of User objects.
 */
export const getUsers = async (): Promise<User[]> => {
  try {
    const storedUsers = localStorage.getItem(DB_KEY);
    if (storedUsers) {
      return JSON.parse(storedUsers);
    } else {
      return await initializeDatabase();
    }
  } catch (e)
   {
    console.error("Error accessing localStorage. Initializing new DB.", e);
    return await initializeDatabase();
  }
};

/**
 * Saves the entire list of users to the database.
 * @param users - The array of User objects to save.
 */
const saveUsers = (users: User[]): void => {
  localStorage.setItem(DB_KEY, JSON.stringify(users));
};

/**
 * Adds a new user to the database.
 * Throws an error if a user with the same email already exists.
 * @param email - The new user's email.
 * @param password - The new user's password.
 * @returns The newly created User object.
 */
export const addUser = async (email: string, password: string): Promise<User> => {
  const users = await getUsers();

  if (users.find(u => u.email === email)) {
    throw new Error("An account with this email already exists.");
  }

  const newUser: User = {
    email,
    password, // In a real app, hash this!
    preferences: {
      dietaryRestrictions: [],
      allergies: [],
      favoriteCuisines: [],
      dailyCalorieGoal: '',
      healthGoals: [],
      otherHealthGoals: '',
      budget: '',
    },
  };

  const updatedUsers = [...users, newUser];
  saveUsers(updatedUsers);
  return newUser;
};

/**
 * Updates the preferences for a specific user.
 * @param email - The email of the user to update.
 * @param prefs - The new preferences object.
 * @returns The updated User object, or null if the user was not found.
 */
export const updateUserPreferences = async (email: string, prefs: UserPreferences): Promise<User | null> => {
  const users = await getUsers();
  
  let updatedUser: User | null = null;
  const updatedUsers = users.map(u => {
    if (u.email === email) {
      updatedUser = { ...u, preferences: prefs };
      return updatedUser;
    }
    return u;
  });

  if (updatedUser) {
    saveUsers(updatedUsers);
  }

  return updatedUser;
};