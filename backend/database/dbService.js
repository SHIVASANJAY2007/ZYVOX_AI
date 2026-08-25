import bcrypt from 'bcrypt';
import { query } from './db.js';

// Helper to generate sequential user ID of form ZYV0001, ZYV0002, etc.
export const generatePersonId = async () => {
  const result = await query(
    `SELECT MAX(CAST(SUBSTRING(person_id FROM 4) AS INTEGER)) as max_val 
     FROM personal_details 
     WHERE person_id LIKE 'ZYV%'`
  );
  const maxVal = result.rows[0].max_val;
  const nextVal = maxVal ? maxVal + 1 : 1;
  return 'ZYV' + String(nextVal).padStart(4, '0');
};

// ==========================================
// USER SERVICE OPERATIONS
// ==========================================

export const createUser = async (name, phone, email, password) => {
  const cleanEmail = String(email || '').trim().toLowerCase();
  
  // Check if duplicate email exists
  const existingUser = await findUserByEmail(cleanEmail);
  if (existingUser) {
    const error = new Error('An account with this email already exists');
    error.status = 409; // Conflict
    throw error;
  }

  const personId = await generatePersonId();
  const passwordHash = await bcrypt.hash(password, 10);

  const result = await query(
    `INSERT INTO personal_details (person_id, name, phone, email, password_hash)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING person_id, name, phone, email, created_at, last_login`,
    [personId, name, phone, cleanEmail, passwordHash]
  );

  return result.rows[0];
};

export const findUserByEmail = async (email) => {
  const cleanEmail = String(email || '').trim().toLowerCase();
  const result = await query(
    `SELECT person_id, name, phone, email, password_hash, created_at, last_login 
     FROM personal_details 
     WHERE email = $1`,
    [cleanEmail]
  );
  return result.rows[0] || null;
};

export const findUserById = async (personId) => {
  const result = await query(
    `SELECT person_id, name, phone, email, created_at, last_login 
     FROM personal_details 
     WHERE person_id = $1`,
    [personId]
  );
  return result.rows[0] || null;
};

export const updateLastLogin = async (personId) => {
  const result = await query(
    `UPDATE personal_details 
     SET last_login = CURRENT_TIMESTAMP 
     WHERE person_id = $1 
     RETURNING person_id, name, phone, email, created_at, last_login`,
    [personId]
  );
  return result.rows[0] || null;
};

// ==========================================
// TRAVEL SERVICE OPERATIONS
// ==========================================

export const createTravelPlan = async (
  personId,
  source,
  destination,
  dateOfGoing = null,
  dateOfReturning = null,
  activities = '',
  modeOfTransport = '',
  hotelRequired = false,
  hotelName = '',
  carRent = false
) => {
  // Validate personId exists first
  const user = await findUserById(personId);
  if (!user) {
    const error = new Error(`Invalid person_id: User ${personId} does not exist`);
    error.status = 400;
    throw error;
  }

  const result = await query(
    `INSERT INTO travel_details (
      person_id, source, destination, date_of_going, date_of_returning, 
      activities, mode_of_transport, hotel_required, hotel_name, car_rent
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      personId,
      source,
      destination,
      dateOfGoing || null,
      dateOfReturning || null,
      activities || '',
      modeOfTransport || '',
      hotelRequired || false,
      hotelName || '',
      carRent || false
    ]
  );
  return result.rows[0];
};

export const getTravelPlansByUser = async (personId) => {
  const result = await query(
    `SELECT * FROM travel_details WHERE person_id = $1 ORDER BY date_of_going ASC`,
    [personId]
  );
  return result.rows;
};

export const getTravelPlanById = async (travelId) => {
  const result = await query(
    `SELECT * FROM travel_details WHERE travel_id = $1`,
    [travelId]
  );
  return result.rows[0] || null;
};

export const updateTravelPlan = async (travelId, updateData) => {
  const fields = [];
  const values = [];
  let index = 1;

  const allowedUpdates = [
    'source', 'destination', 'date_of_going', 'date_of_returning',
    'activities', 'mode_of_transport', 'hotel_required', 'hotel_name', 'car_rent'
  ];

  for (const key of allowedUpdates) {
    if (updateData[key] !== undefined) {
      fields.push(`${key} = $${index}`);
      values.push(updateData[key]);
      index++;
    }
  }

  if (fields.length === 0) {
    throw new Error('No valid fields provided for update');
  }

  values.push(travelId);
  const queryText = `
    UPDATE travel_details 
    SET ${fields.join(', ')} 
    WHERE travel_id = $${index} 
    RETURNING *`;

  const result = await query(queryText, values);
  return result.rows[0] || null;
};

export const deleteTravelPlan = async (travelId) => {
  const result = await query(
    `DELETE FROM travel_details WHERE travel_id = $1 RETURNING *`,
    [travelId]
  );
  return result.rows[0] || null;
};

// ==========================================
// CHAT SERVICE OPERATIONS
// ==========================================

export const saveMessage = async (personId, sessionId, role, message) => {
  // Validate personId exists first
  const user = await findUserById(personId);
  if (!user) {
    const error = new Error(`Invalid person_id: User ${personId} does not exist`);
    error.status = 400;
    throw error;
  }

  const result = await query(
    `INSERT INTO chat_history (person_id, session_id, role, message)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [personId, sessionId || null, role, message]
  );
  return result.rows[0];
};

export const getChatHistory = async (personId, sessionId = null) => {
  let queryText = `SELECT * FROM chat_history WHERE person_id = $1`;
  const params = [personId];

  if (sessionId) {
    queryText += ` AND session_id = $2`;
    params.push(sessionId);
  }

  queryText += ` ORDER BY created_at ASC`;

  const result = await query(queryText, params);
  return result.rows;
};

export const getRecentChatHistory = async (limit = 100) => {
  const result = await query(
    `SELECT * FROM chat_history ORDER BY created_at DESC LIMIT $1`,
    [limit]
  );
  return result.rows;
};
