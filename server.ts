import 'dotenv/config';
import cors from 'cors';
import express, { type Request, type Response } from 'express';
import fs from 'fs';
import path from 'path';
import {
  type AuthenticatedRequest,
  requireAuth,
  signToken,
  verifyPassword,
} from './server/auth.ts';
import {
  createProduct,
  createUser,
  deleteProduct,
  findUserByEmail,
  findUserById,
  getStorageMode,
  initDatabase,
  listProducts,
  updateProduct,
} from './server/db.ts';

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

function buildCorsOptions(): cors.CorsOptions {
  const rawOrigin = process.env.CORS_ORIGIN?.trim();
  if (!rawOrigin || rawOrigin === '*') {
    return {
      origin: true,
      credentials: true,
    };
  }

  const allowedOrigins = rawOrigin
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Origem não permitida pela política de CORS.'));
      }
    },
    credentials: true,
  };
}

function generateDefaultSku(name: string): string {
  const clean = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 4)
    .padEnd(3, 'X');
  const suffix = Math.floor(100 + Math.random() * 900);
  return `KR-${clean}-${suffix}`;
}

function validateProductPayload(body: Record<string, unknown>): {
  valid: boolean;
  error?: string;
  data?: {
    name: string;
    description: string;
    price: number;
    category: string;
    sku: string;
    stock: number;
    imageUrl: string;
  };
} {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const description =
    typeof body.description === 'string' ? body.description.trim() : '';
  const category =
    typeof body.category === 'string' ? body.category.trim() : '';
  const skuInput = typeof body.sku === 'string' ? body.sku.trim() : '';
  const imageUrl =
    typeof body.imageUrl === 'string' ? body.imageUrl.trim() : '';
  const price = Number(body.price);
  const stock =
    body.stock === undefined || body.stock === '' ? 1 : Number(body.stock);

  if (name.length < 2 || name.length > 120) {
    return {
      valid: false,
      error: 'O nome do produto deve ter entre 2 e 120 caracteres.',
    };
  }
  if (description.length < 5 || description.length > 600) {
    return {
      valid: false,
      error: 'A descrição do produto deve ter entre 5 e 600 caracteres.',
    };
  }
  if (!Number.isFinite(price) || price <= 0) {
    return {
      valid: false,
      error: 'Informe um preço válido maior que zero.',
    };
  }
  if (!category || category.length > 60) {
    return {
      valid: false,
      error: 'Selecione ou informe uma categoria válida.',
    };
  }
  if (!Number.isFinite(stock) || stock < 0) {
    return {
      valid: false,
      error: 'O estoque deve ser um número igual ou maior que zero.',
    };
  }
  if (imageUrl.length > 4_000_000) {
    return {
      valid: false,
      error: 'A imagem excede o tamanho máximo permitido (4 MB).',
    };
  }

  return {
    valid: true,
    data: {
      name,
      description,
      price: Math.round(price * 100) / 100,
      category,
      sku: skuInput || generateDefaultSku(name),
      stock: Math.floor(stock),
      imageUrl,
    },
  };
}

async function startServer(): Promise<void> {
  await initDatabase();

  const app = express();
  app.use(cors(buildCorsOptions()));
  app.use(express.json({ limit: '6mb' }));

  // Healthcheck
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      database: getStorageMode(),
      timestamp: new Date().toISOString(),
    });
  });

  // Auth: Cadastro de novo usuário
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
      const email =
        typeof req.body?.email === 'string'
          ? req.body.email.trim().toLowerCase()
          : '';
      const password =
        typeof req.body?.password === 'string' ? req.body.password : '';

      if (name.length < 2) {
        res.status(400).json({ error: 'Informe seu nome completo.' });
        return;
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        res.status(400).json({ error: 'Informe um endereço de e-mail válido.' });
        return;
      }
      if (password.length < 6) {
        res
          .status(400)
          .json({ error: 'A senha deve conter no mínimo 6 caracteres.' });
        return;
      }

      const existing = await findUserByEmail(email);
      if (existing) {
        res.status(409).json({
          error: 'Já existe uma conta cadastrada com este e-mail.',
        });
        return;
      }

      const user = await createUser({ name, email, password });
      const token = signToken(user);

      res.status(201).json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      console.error('Erro no cadastro de usuário:', error);
      res.status(500).json({ error: 'Erro interno ao cadastrar usuário.' });
    }
  });

  // Auth: Login com validação no backend
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const email =
        typeof req.body?.email === 'string'
          ? req.body.email.trim().toLowerCase()
          : '';
      const password =
        typeof req.body?.password === 'string' ? req.body.password : '';

      if (!email || !password) {
        res
          .status(400)
          .json({ error: 'Preencha o e-mail e a senha para entrar.' });
        return;
      }

      const user = await findUserByEmail(email);
      if (!user || !verifyPassword(password, user.passwordHash)) {
        res.status(401).json({
          error: 'E-mail ou senha inválidos. Verifique seus dados e tente novamente.',
        });
        return;
      }

      const token = signToken(user);
      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      console.error('Erro na autenticação:', error);
      res.status(500).json({ error: 'Erro interno ao validar login.' });
    }
  });

  // Auth: Validação do token atual no backend
  app.get(
    '/api/auth/me',
    requireAuth,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const userId = req.user?.sub;
        if (!userId) {
          res.status(401).json({ error: 'Sessão inválida.' });
          return;
        }
        const user = await findUserById(userId);
        if (!user) {
          res.status(401).json({ error: 'Usuário não encontrado.' });
          return;
        }
        res.json({
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
          },
        });
      } catch (error) {
        console.error('Erro ao validar sessão:', error);
        res.status(500).json({ error: 'Erro interno ao validar sessão.' });
      }
    },
  );

  // Products: Listagem protegida
  app.get(
    '/api/products',
    requireAuth,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const category =
          typeof req.query.category === 'string'
            ? req.query.category.trim()
            : '';
        const search =
          typeof req.query.search === 'string'
            ? req.query.search.trim().toLowerCase()
            : '';
        const sort =
          typeof req.query.sort === 'string' ? req.query.sort : 'recent';

        let items = await listProducts();

        if (category && category !== 'Todas') {
          items = items.filter((p) => p.category === category);
        }

        if (search) {
          items = items.filter(
            (p) =>
              p.name.toLowerCase().includes(search) ||
              p.description.toLowerCase().includes(search) ||
              p.sku.toLowerCase().includes(search) ||
              p.category.toLowerCase().includes(search),
          );
        }

        if (sort === 'price_asc') {
          items.sort((a, b) => a.price - b.price);
        } else if (sort === 'price_desc') {
          items.sort((a, b) => b.price - a.price);
        } else if (sort === 'name_asc') {
          items.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
        } else {
          items.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
        }

        res.json({ products: items });
      } catch (error) {
        console.error('Erro ao listar produtos:', error);
        res.status(500).json({ error: 'Erro ao carregar produtos.' });
      }
    },
  );

  // Products: Cadastro protegido
  app.post(
    '/api/products',
    requireAuth,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const validation = validateProductPayload(req.body || {});
        if (!validation.valid || !validation.data) {
          res.status(400).json({ error: validation.error });
          return;
        }

        const created = await createProduct({
          ...validation.data,
          createdBy: req.user?.sub || 'unknown',
          createdByName: req.user?.name || 'Operador',
        });

        res.status(201).json({ product: created });
      } catch (error) {
        console.error('Erro ao cadastrar produto:', error);
        res.status(500).json({ error: 'Erro interno ao cadastrar produto.' });
      }
    },
  );

  // Products: Atualização protegida
  app.put(
    '/api/products/:id',
    requireAuth,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const id = req.params.id;
        const validation = validateProductPayload(req.body || {});
        if (!validation.valid || !validation.data) {
          res.status(400).json({ error: validation.error });
          return;
        }

        const updated = await updateProduct(id, validation.data);
        if (!updated) {
          res.status(404).json({ error: 'Produto não encontrado.' });
          return;
        }

        res.json({ product: updated });
      } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        res.status(500).json({ error: 'Erro interno ao atualizar produto.' });
      }
    },
  );

  // Products: Exclusão protegida
  app.delete(
    '/api/products/:id',
    requireAuth,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const deleted = await deleteProduct(req.params.id);
        if (!deleted) {
          res.status(404).json({ error: 'Produto não encontrado.' });
          return;
        }
        res.json({ success: true });
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
        res.status(500).json({ error: 'Erro interno ao excluir produto.' });
      }
    },
  );

  // Rotas desconhecidas da API retornam JSON 404
  app.all('/api/{*splat}', (_req: Request, res: Response) => {
    res.status(404).json({ error: 'Endpoint da API não encontrado.' });
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distDir)) {
      app.use(express.static(distDir));
      app.get('/{*splat}', (_req: Request, res: Response) => {
        res.sendFile(path.join(distDir, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor Express rodando na porta ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Erro fatal ao iniciar servidor:', err);
  process.exit(1);
});
