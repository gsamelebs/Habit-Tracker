import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Syncs habits to the To-Do list based on their frequency and start date.
 */
export const syncHabitsToTasks = async () => {
  try {
    const habitsJson = await AsyncStorage.getItem('bloomly_habits');
    const tasksJson = await AsyncStorage.getItem('bloomly_tasks');

    if (!habitsJson) return;

    const habits = JSON.parse(habitsJson);
    let tasks = tasksJson ? JSON.parse(tasksJson) : [];
    const now = new Date();
    const todayStr = now.toDateString();
    const currentDay = now.getDay(); // 0 (Sun) to 6 (Sat)
    const currentDate = now.getDate(); // 1 to 31

    let tasksAdded = false;

    habits.forEach(habit => {
      const { id, name, frequency, time, startDate, targetDay } = habit;
      
      const start = new Date(startDate || 0);
      start.setHours(0,0,0,0);
      const today = new Date();
      today.setHours(0,0,0,0);

      // Rule 1: Must be on or after start date
      if (today < start) return;

      let isDueToday = false;

      if (frequency === 'Daily') {
        isDueToday = true;
      } else if (frequency === 'Weekly') {
        // Weekly habits trigger on Mondays (1)
        isDueToday = currentDay === 1; 
      } else if (frequency === 'Monthly') {
        // Monthly habits trigger on the 1st
        isDueToday = currentDate === 1;
      } else if (frequency === 'Specific Day') {
        // Trigger on the selected day of the week (e.g., Every Sunday = 0)
        isDueToday = currentDay === parseInt(targetDay);
      }

      if (isDueToday) {
        // Check if already exists for today
        const alreadyExists = tasks.find(t => 
          t.habitId === id && 
          new Date(t.createdAt).toDateString() === todayStr
        );

        if (!alreadyExists) {
          tasks.push({
            id: `habit-${id}-${Date.now()}`,
            habitId: id,
            text: `${name}${time ? ` at ${time}` : ''}`,
            completed: false,
            isFromHabit: true,
            createdAt: new Date().toISOString()
          });
          tasksAdded = true;
        }
      }
    });

    if (tasksAdded) {
      await AsyncStorage.setItem('bloomly_tasks', JSON.stringify(tasks));
    }
    
    return tasks;
  } catch (e) {
    console.error('Sync Error:', e);
    return null;
  }
};

/**
 * Records a completed habit in the history.
 */
export const recordCompletion = async (habitId = 'global') => {
  try {
    const historyJson = await AsyncStorage.getItem('bloomly_history');
    let history = historyJson ? JSON.parse(historyJson) : {};
    
    if (!history[habitId]) history[habitId] = {};
    
    const today = new Date().toISOString().split('T')[0];
    history[habitId][today] = (history[habitId][today] || 0) + 1;

    if (habitId !== 'global') {
      if (!history['global']) history['global'] = {};
      history['global'][today] = (history['global'][today] || 0) + 1;
    }

    await AsyncStorage.setItem('bloomly_history', JSON.stringify(history));
  } catch (e) {
    console.error('Record Error:', e);
  }
};

/**
 * Gets history data for charts.
 */
export const getWeeklyHistory = async (habitId = 'global') => {
  try {
    const historyJson = await AsyncStorage.getItem('bloomly_history');
    const history = historyJson ? JSON.parse(historyJson) : {};
    const habitHistory = history[habitId] || {};
    
    const labels = [];
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString([], { weekday: 'short' });
      
      labels.push(dayName[0]); 
      data.push(habitHistory[key] || 0);
    }
    
    return { labels, datasets: [{ data }] };
  } catch (e) {
    console.error('History Fetch Error:', e);
    return { labels: ['S','M','T','W','T','F','S'], datasets: [{ data: [0,0,0,0,0,0,0] }] };
  }
};

/**
 * Clears history for a specific habit when deleted.
 */
export const clearHabitHistory = async (habitId) => {
  try {
    const historyJson = await AsyncStorage.getItem('bloomly_history');
    if (!historyJson) return;
    let history = JSON.parse(historyJson);
    if (history[habitId]) {
      delete history[habitId];
      await AsyncStorage.setItem('bloomly_history', JSON.stringify(history));
    }
  } catch (e) { console.error(e); }
};

/**
 * Clears tasks for a specific habit when deleted.
 */
export const clearHabitTasks = async (habitId) => {
  try {
    const tasksJson = await AsyncStorage.getItem('bloomly_tasks');
    if (!tasksJson) return;
    const tasks = JSON.parse(tasksJson);
    const updatedTasks = tasks.filter(t => t.habitId !== habitId);
    await AsyncStorage.setItem('bloomly_tasks', JSON.stringify(updatedTasks));
  } catch (e) { console.error('Clear Tasks Error:', e); }
};
