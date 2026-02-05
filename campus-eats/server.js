// Find and replace these functions in Manager.js:

const addRestaurant = async (restaurantData) => {
  const newRestaurant = {
    id: restaurantData.name.toLowerCase().replace(/\s+/g, '-'),
    name: restaurantData.name,
    type: restaurantData.type,
    isOpen: true,
    description: restaurantData.description || '',
    img: 'https://placehold.co/150x120/4ade80/fff?text=' + restaurantData.name.replace(/\s+/g, '+'),
    menu: { main: [], starters: [], drinks: [] }
  };

  try {
    await fetch('http://localhost:5000/api/restaurant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRestaurant)
    });
    
    // Reload restaurants
    const response = await fetch('http://localhost:5000/api/restaurants');
    const updatedRestaurants = await response.json();
    setLocalRestaurants(updatedRestaurants);
    
    showMessage(`${restaurantData.name} added successfully!`, 'success');
    closeDrawer();
  } catch (error) {
    console.error('Error adding restaurant:', error);
    showMessage('Failed to add restaurant!', 'error');
  }
};

const toggleRestaurant = async (id, currentStatus) => {
  try {
    await fetch(`http://localhost:5000/api/restaurant/${id}/toggle`, {
      method: 'POST'
    });
    
    // Reload restaurants
    const response = await fetch('http://localhost:5000/api/restaurants');
    const updatedRestaurants = await response.json();
    setLocalRestaurants(updatedRestaurants);
    
    showMessage(`Restaurant ${currentStatus ? 'closed' : 'opened'}!`, 'info');
  } catch (error) {
    console.error('Error toggling restaurant:', error);
    showMessage('Failed to toggle restaurant!', 'error');
  }
};

const addMenuItem = async (restaurantId, item) => {
  const menuItem = {
    n: item.name,
    d: item.description,
    p: parseInt(item.price)
  };

  try {
    await fetch(`http://localhost:5000/api/restaurant/${restaurantId}/menu`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item: menuItem, section: item.section })
    });
    
    // Reload restaurants
    const response = await fetch('http://localhost:5000/api/restaurants');
    const updatedRestaurants = await response.json();
    setLocalRestaurants(updatedRestaurants);
    
    showMessage(`${item.name} added to menu!`, 'success');
  } catch (error) {
    console.error('Error adding menu item:', error);
    showMessage('Failed to add menu item!', 'error');
  }
};

// Also update the useEffect to load restaurants from backend:
useEffect(() => {
  fetch('http://localhost:5000/api/restaurants')
    .then(response => response.json())
    .then(data => setLocalRestaurants(data))
    .catch(error => console.log('Error loading restaurants:', error));
}, []);
