import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { type Collection, type Db, MongoClient } from 'mongodb';
import { hashPassword } from './auth.ts';

export interface UserDoc {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'operator';
  createdAt: string;
}

export interface ProductDoc {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  sku: string;
  stock: number;
  imageUrl: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

interface LocalDatabaseSchema {
  users: UserDoc[];
  products: ProductDoc[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'database.json');

let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;
let storageMode: 'mongodb' | 'local-nosql' = 'local-nosql';

function createInitialSeed(): LocalDatabaseSchema {
  const now = new Date();
  const adminId = 'user-admin-kroma';

  const demoUser: UserDoc = {
    id: adminId,
    name: 'Equipe Kroma',
    email: 'admin@kromastudio.com.br',
    passwordHash: hashPassword('kroma2026'),
    role: 'admin',
    createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  };

  const seededProducts: ProductDoc[] = [
    {
      id: 'prod-kr-mon-01',
      name: 'Monitor de Estúdio Kroma Reference M5',
      description:
        'Monitor ativo nearfield de duas vias com tweeter de domo em berílio, gabinete em alumínio anodizado e laterais em nogueira maciça.',
      price: 3890.0,
      category: 'Monitores de Estúdio',
      sku: 'KR-MON-M5',
      stock: 12,
      imageUrl: '/src/assets/images/product_studio_monitor_1794944555597.jpg',
      createdBy: adminId,
      createdByName: 'Equipe Kroma',
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 48).toISOString(),
      updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 48).toISOString(),
    },
    {
      id: 'prod-kr-dac-02',
      name: 'DAC & Amplificador Desktop A1 Precision',
      description:
        'Conversor digital-analógico 32-bit/768kHz com estágio de amplificação classe A e potenciômetro usinado em alumínio escovado.',
      price: 2450.0,
      category: 'Amplificadores & DACs',
      sku: 'KR-DAC-A1',
      stock: 8,
      imageUrl: '/src/assets/images/product_dac_amplifier_1794944557890.jpg',
      createdBy: adminId,
      createdByName: 'Equipe Kroma',
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 36).toISOString(),
      updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 36).toISOString(),
    },
    {
      id: 'prod-kr-mic-03',
      name: 'Microfone Condensador G1 Brass Edition',
      description:
        'Condensador de diafragma grande com padrão polar selecionável, corpo em latão escovado e suspensão elástica anti-vibração.',
      price: 3190.0,
      category: 'Microfones',
      sku: 'KR-MIC-G1',
      stock: 6,
      imageUrl: '/src/assets/images/product_condenser_mic_1794944557962.jpg',
      createdBy: adminId,
      createdByName: 'Equipe Kroma',
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(),
      updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: 'prod-kr-fon-04',
      name: 'Fone Planar Magnético PM-1 Open Reference',
      description:
        'Transdutores planares de baixa distorção, estrutura aberta em alumínio CNC e almofadas perfuradas para mixagem e masterização.',
      price: 4290.0,
      category: 'Fones de Referência',
      sku: 'KR-FON-PM1',
      stock: 5,
      imageUrl: '/src/assets/images/product_planar_headphones_1794944557693.jpg',
      createdBy: adminId,
      createdByName: 'Equipe Kroma',
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 12).toISOString(),
      updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 12).toISOString(),
    },
    {
      id: 'prod-kr-int-05',
      name: 'Interface de Áudio USB-C Studio 4x4',
      description:
        'Quatro pré-amplificadores discretos com Phantom Power 48V independente, monitoramento direto de latência zero e chassi metálico.',
      price: 1980.0,
      category: 'Interfaces de Áudio',
      sku: 'KR-INT-4X4',
      stock: 15,
      imageUrl: '/src/assets/images/product_audio_interface_1794944558718.jpg',
      createdBy: adminId,
      createdByName: 'Equipe Kroma',
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 4).toISOString(),
      updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 4).toISOString(),
    },
  ];

  return {
    users: [demoUser],
    products: seededProducts,
  };
}

function readLocalDb(): LocalDatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    const initial = createInitialSeed();
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(raw) as LocalDatabaseSchema;
}

function writeLocalDb(data: LocalDatabaseSchema): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function getUsersCollection(): Collection<UserDoc> | null {
  return mongoDb ? mongoDb.collection<UserDoc>('users') : null;
}

function getProductsCollection(): Collection<ProductDoc> | null {
  return mongoDb ? mongoDb.collection<ProductDoc>('products') : null;
}

export async function initDatabase(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI?.trim();
  if (mongoUri) {
    try {
      mongoClient = new MongoClient(mongoUri);
      await mongoClient.connect();
      mongoDb = mongoClient.db();
      storageMode = 'mongodb';

      const usersCol = mongoDb.collection<UserDoc>('users');
      const productsCol = mongoDb.collection<ProductDoc>('products');

      await usersCol.createIndex({ email: 1 }, { unique: true });

      const userCount = await usersCol.countDocuments();
      const productCount = await productsCol.countDocuments();
      if (userCount === 0 && productCount === 0) {
        const seed = createInitialSeed();
        await usersCol.insertMany(seed.users);
        await productsCol.insertMany(seed.products);
      }
      console.log('Banco de dados conectado: MongoDB Atlas');
      return;
    } catch (error) {
      console.error(
        'Falha ao conectar no MongoDB Atlas, usando persistência local JSON:',
        error,
      );
      mongoClient = null;
      mongoDb = null;
    }
  }

  storageMode = 'local-nosql';
  readLocalDb();
  console.log('Banco de dados inicializado: Persistência NoSQL Local (data/database.json)');
}

export function getStorageMode(): 'mongodb' | 'local-nosql' {
  return storageMode;
}

export async function findUserByEmail(email: string): Promise<UserDoc | null> {
  const normalized = email.trim().toLowerCase();
  const col = getUsersCollection();
  if (col) {
    return col.findOne({ email: normalized }, { projection: { _id: 0 } });
  }
  const db = readLocalDb();
  return db.users.find((u) => u.email.toLowerCase() === normalized) || null;
}

export async function findUserById(id: string): Promise<UserDoc | null> {
  const col = getUsersCollection();
  if (col) {
    return col.findOne({ id }, { projection: { _id: 0 } });
  }
  const db = readLocalDb();
  return db.users.find((u) => u.id === id) || null;
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<UserDoc> {
  const user: UserDoc = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    passwordHash: hashPassword(input.password),
    role: 'operator',
    createdAt: new Date().toISOString(),
  };

  const col = getUsersCollection();
  if (col) {
    await col.insertOne({ ...user });
    return user;
  }

  const db = readLocalDb();
  db.users.push(user);
  writeLocalDb(db);
  return user;
}

export async function listProducts(): Promise<ProductDoc[]> {
  const col = getProductsCollection();
  if (col) {
    return col
      .find({}, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .toArray();
  }
  const db = readLocalDb();
  return [...db.products].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function createProduct(input: {
  name: string;
  description: string;
  price: number;
  category: string;
  sku: string;
  stock: number;
  imageUrl: string;
  createdBy: string;
  createdByName: string;
}): Promise<ProductDoc> {
  const now = new Date().toISOString();
  const product: ProductDoc = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    description: input.description.trim(),
    price: Number(input.price),
    category: input.category.trim(),
    sku: input.sku.trim(),
    stock: Math.max(0, Math.floor(Number(input.stock) || 0)),
    imageUrl: input.imageUrl.trim(),
    createdBy: input.createdBy,
    createdByName: input.createdByName,
    createdAt: now,
    updatedAt: now,
  };

  const col = getProductsCollection();
  if (col) {
    await col.insertOne({ ...product });
    return product;
  }

  const db = readLocalDb();
  db.products.unshift(product);
  writeLocalDb(db);
  return product;
}

export async function updateProduct(
  id: string,
  updates: Partial<{
    name: string;
    description: string;
    price: number;
    category: string;
    sku: string;
    stock: number;
    imageUrl: string;
  }>,
): Promise<ProductDoc | null> {
  const now = new Date().toISOString();
  const col = getProductsCollection();
  if (col) {
    const existing = await col.findOne({ id }, { projection: { _id: 0 } });
    if (!existing) return null;
    const next: ProductDoc = {
      ...existing,
      ...updates,
      updatedAt: now,
    };
    await col.updateOne({ id }, { $set: next });
    return next;
  }

  const db = readLocalDb();
  const idx = db.products.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  db.products[idx] = {
    ...db.products[idx],
    ...updates,
    updatedAt: now,
  };
  writeLocalDb(db);
  return db.products[idx];
}

export async function deleteProduct(id: string): Promise<boolean> {
  const col = getProductsCollection();
  if (col) {
    const result = await col.deleteOne({ id });
    return result.deletedCount > 0;
  }

  const db = readLocalDb();
  const before = db.products.length;
  db.products = db.products.filter((p) => p.id !== id);
  if (db.products.length === before) return false;
  writeLocalDb(db);
  return true;
}
