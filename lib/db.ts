import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'thel_blood',
  password: process.env.DB_PASS || 'blood',
  database: process.env.DB_NAME || 'thel_blood',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};

// Create connection pool
let pool: mysql.Pool | null = null;

export async function getConnection() {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

export async function query<T = any>(sql: string, params?: any[]): Promise<T> {
  try {
    const connection = await getConnection();
    const [results] = await connection.execute(sql, params);
    return results as T;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Helper function to test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await getConnection();
    await connection.execute('SELECT 1');
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Helper function to close connection pool
export async function closeConnection() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('Database connection pool closed');
  }
}

// Type definitions for database models
export interface User {
  id: number;
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role: 'donor' | 'recipient' | 'admin' | 'partner';
  profile_image?: string;
  is_verified: boolean;
  verification_token?: string;
  reset_token?: string;
  reset_token_expiry?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface DonorEntry {
  id: number;
  user_id?: number;
  full_name: string;
  email: string;
  phone: string;
  blood_group: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  age: number;
  weight?: number;
  gender: 'Male' | 'Female' | 'Other';
  address: string;
  city: string;
  state: string;
  pincode: string;
  last_donation_date?: Date;
  medical_conditions?: string;
  is_available: boolean;
  total_donations: number;
  latitude?: number;
  longitude?: number;
  status: 'pending' | 'approved' | 'rejected' | 'inactive';
  created_at: Date;
  updated_at: Date;
}

export interface BloodRequest {
  id: number;
  user_id?: number;
  patient_name: string;
  requester_name: string;
  requester_email: string;
  requester_phone: string;
  blood_group: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  units_needed: number;
  hospital_name: string;
  hospital_address: string;
  city: string;
  state: string;
  pincode: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  required_date: Date;
  reason?: string;
  additional_notes?: string;
  latitude?: number;
  longitude?: number;
  status: 'pending' | 'in_progress' | 'fulfilled' | 'cancelled' | 'expired';
  fulfilled_date?: Date;
  matched_donors?: any;
  created_at: Date;
  updated_at: Date;
}

export interface DonorMessage {
  id: number;
  request_id: number;
  donor_id?: number;
  donor_name: string;
  donor_email: string;
  donor_phone: string;
  message?: string;
  willing_to_donate: boolean;
  preferred_date?: Date;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  created_at: Date;
  updated_at: Date;
}

export interface CurrentOrder {
  id: number;
  request_id: number;
  donor_id?: number;
  order_number: string;
  patient_name: string;
  donor_name?: string;
  blood_group: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  units: number;
  hospital_name: string;
  donation_date: Date;
  donation_time?: string;
  status: 'scheduled' | 'in_transit' | 'donated' | 'completed' | 'cancelled';
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CommunityPost {
  id: number;
  user_id?: number;
  author_name: string;
  author_email: string;
  title: string;
  content: string;
  post_type: 'story' | 'announcement' | 'event' | 'achievement' | 'general';
  image_url?: string;
  likes_count: number;
  comments_count: number;
  is_featured: boolean;
  is_published: boolean;
  tags?: any;
  created_at: Date;
  updated_at: Date;
}

export interface Notification {
  id: number;
  user_id?: number;
  title: string;
  message: string;
  type: 'request_match' | 'donation_scheduled' | 'donation_reminder' | 'request_fulfilled' | 'system' | 'urgent';
  related_id?: number;
  related_type?: 'blood_request' | 'donor_entry' | 'current_order' | 'community_post';
  is_read: boolean;
  priority: 'low' | 'medium' | 'high';
  action_url?: string;
  created_at: Date;
  read_at?: Date;
}

export interface DonorCertificate {
  id: number;
  donor_id: number;
  order_id?: number;
  certificate_number: string;
  donor_name: string;
  blood_group: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  donation_date: Date;
  hospital_name?: string;
  units_donated: number;
  certificate_url?: string;
  issued_at: Date;
  expires_at?: Date;
}

export default { query, getConnection, testConnection, closeConnection };
