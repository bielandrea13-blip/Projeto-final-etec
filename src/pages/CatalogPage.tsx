import {
  LayoutGrid,
  List,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar.tsx';
import { ProductForm } from '../components/ProductForm.tsx';
import { ProductImage } from '../components/ProductImage.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { api, formatBRL } from '../lib/api.ts';
import {
  PRODUCT_CATEGORIES,
  type Product,
  type ProductInput,
} from '../types.ts';

export function CatalogPage() {
  const { user } = useAuth();
  const location = useLocation();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(
    (location.state as { notice?: string } | null)?.notice || null,
  );

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.listProducts();
      setProducts(res.products);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar os produtos.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (!feedbackBanner) return;
    const timer = window.setTimeout(() => setFeedbackBanner(null), 5000);
    return () => window.clearTimeout(timer);
  }, [feedbackBanner]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = [...products];

    if (selectedCategory !== 'Todas') {
      list = list.filter((item) => item.category === selectedCategory);
    }

    if (q) {
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.sku.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q),
      );
    }

    if (sortBy === 'price_asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name_asc') {
      list.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    } else {
      list.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    return list;
  }, [products, search, selectedCategory, sortBy]);

  const metrics = useMemo(() => {
    const totalCount = products.length;
    const totalUnits = products.reduce((sum, item) => sum + item.stock, 0);
    const totalValue = products.reduce(
      (sum, item) => sum + item.price * item.stock,
      0,
    );
    return { totalCount, totalUnits, totalValue };
  }, [products]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await api.deleteProduct(id);
      setProducts((prev) => prev.filter((item) => item.id !== id));
      setConfirmDeleteId(null);
      setFeedbackBanner('Produto removido do catálogo.');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao excluir o produto.',
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditSubmit = async (values: ProductInput) => {
    if (!editingProduct) return;
    setEditSubmitting(true);
    setEditError(null);
    try {
      const res = await api.updateProduct(editingProduct.id, values);
      setProducts((prev) =>
        prev.map((item) => (item.id === editingProduct.id ? res.product : item)),
      );
      setEditingProduct(null);
      setFeedbackBanner(`Produto "${res.product.name}" atualizado.`);
    } catch (err) {
      setEditError(
        err instanceof Error ? err.message : 'Erro ao atualizar produto.',
      );
    } finally {
      setEditSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="font-display text-3xl font-bold tracking-tight text-zinc-900">
              Catálogo de Produtos
            </h1>
            <p className="text-sm text-zinc-600">
              Operador conectado: <span className="font-medium text-zinc-800">{user?.name}</span>{' '}
              <span aria-hidden="true">·</span> {user?.email}
            </p>
          </div>

          <Link
            to="/produtos/novo"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Novo Produto</span>
          </Link>
        </div>

        {feedbackBanner && (
          <div
            role="status"
            className="flex items-center justify-between gap-4 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-800"
          >
            <span>{feedbackBanner}</span>
            <button
              type="button"
              onClick={() => setFeedbackBanner(null)}
              aria-label="Fechar aviso"
              className="p-1 text-emerald-700 hover:text-emerald-900"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}

        <section
          aria-label="Resumo do inventário"
          className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200 bg-white border border-zinc-200 rounded-xl"
        >
          <div className="p-5 space-y-1">
            <p className="text-xs font-medium text-zinc-500">
              Produtos cadastrados
            </p>
            <p className="font-display text-2xl font-bold tabular-nums text-zinc-900">
              {metrics.totalCount}
            </p>
          </div>
          <div className="p-5 space-y-1">
            <p className="text-xs font-medium text-zinc-500">
              Unidades em estoque
            </p>
            <p className="font-display text-2xl font-bold tabular-nums text-zinc-900">
              {metrics.totalUnits}
            </p>
          </div>
          <div className="p-5 space-y-1">
            <p className="text-xs font-medium text-zinc-500">
              Valor total em inventário
            </p>
            <p className="font-display text-2xl font-bold tabular-nums text-zinc-900">
              {formatBRL(metrics.totalValue)}
            </p>
          </div>
        </section>

        <section aria-label="Filtros e visualização" className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search
                className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome, descrição ou SKU..."
                aria-label="Buscar produtos"
                className="w-full pl-10 pr-3.5 py-2 text-sm bg-white border border-zinc-300 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Ordenar produtos"
                className="px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              >
                <option value="recent">Mais recentes</option>
                <option value="price_asc">Menor preço</option>
                <option value="price_desc">Maior preço</option>
                <option value="name_asc">Nome (A–Z)</option>
              </select>

              <div
                role="group"
                aria-label="Modo de exibição"
                className="inline-flex items-center p-1 bg-zinc-200/70 rounded-lg"
              >
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    viewMode === 'cards'
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    viewMode === 'table'
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <List className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Tabela</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {['Todas', ...PRODUCT_CATEGORIES].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-zinc-900 text-white'
                    : 'bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:border-zinc-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="flex items-center justify-between gap-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={fetchProducts}
              className="font-medium underline whitespace-nowrap shrink-0"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white border border-zinc-200 rounded-xl overflow-hidden animate-pulse"
              >
                <div className="aspect-[4/3] bg-zinc-200" />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-1/2 bg-zinc-200 rounded" />
                  <div className="h-5 w-3/4 bg-zinc-200 rounded" />
                  <div className="h-4 w-full bg-zinc-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center space-y-4">
            <h2 className="font-display text-lg font-semibold text-zinc-900">
              Nenhum produto encontrado
            </h2>
            <p className="text-sm text-zinc-600 max-w-md mx-auto">
              {products.length === 0
                ? 'O catálogo ainda está vazio. Cadastre o primeiro equipamento para iniciar a listagem.'
                : 'Nenhum item corresponde aos filtros ou termos de busca aplicados.'}
            </p>
            <div className="pt-2">
              {products.length === 0 ? (
                <Link
                  to="/produtos/novo"
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  <span>Cadastrar primeiro produto</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setSelectedCategory('Todas');
                  }}
                  className="px-4 py-2 text-sm font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          </div>
        ) : viewMode === 'cards' ? (
          <section
            aria-label="Lista de produtos em cards"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className="group bg-white border border-zinc-200 rounded-xl overflow-hidden flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div>
                  <ProductImage src={product.imageUrl} alt={product.name} />

                  <div className="p-5 space-y-2.5">
                    <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 text-xs text-zinc-500">
                      <span>{product.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{product.sku}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">
                        {product.stock === 0
                          ? 'Sem estoque'
                          : `${product.stock} un.`}
                      </span>
                    </div>

                    <h2 className="font-display text-base font-semibold text-zinc-900 leading-snug">
                      {product.name}
                    </h2>

                    <p className="text-sm text-zinc-600 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-3 border-t border-zinc-100 flex items-center justify-between gap-4">
                  <span className="font-mono text-base font-medium tabular-nums text-zinc-900">
                    {formatBRL(product.price)}
                  </span>

                  {confirmDeleteId === product.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={deletingId === product.id}
                        onClick={() => handleDelete(product.id)}
                        className="px-2.5 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors whitespace-nowrap shrink-0"
                      >
                        {deletingId === product.id ? 'Excluindo...' : 'Confirmar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2.5 py-1 text-xs font-medium text-zinc-600 hover:text-zinc-900 bg-zinc-100 rounded-md transition-colors whitespace-nowrap shrink-0"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditError(null);
                          setEditingProduct(product);
                        }}
                        aria-label={`Editar ${product.name}`}
                        className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                      >
                        <Pencil className="w-4 h-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(product.id)}
                        aria-label={`Excluir ${product.name}`}
                        className="p-2 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section
            aria-label="Lista de produtos em tabela"
            className="bg-white border border-zinc-200 rounded-xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50/70 text-xs font-medium text-zinc-500">
                    <th className="py-3 px-4">Produto</th>
                    <th className="py-3 px-4">Categoria</th>
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4 text-right">Estoque</th>
                    <th className="py-3 px-4 text-right">Preço</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 text-sm">
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-zinc-50/80 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3 min-w-[240px]">
                          <div className="w-14 shrink-0 rounded-md overflow-hidden border border-zinc-200">
                            <ProductImage
                              src={product.imageUrl}
                              alt={product.name}
                              className="aspect-[4/3]"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-zinc-900 truncate max-w-xs">
                              {product.name}
                            </div>
                            <div className="text-xs text-zinc-500 truncate max-w-xs">
                              {product.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-600 whitespace-nowrap">
                        {product.category}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-zinc-600 whitespace-nowrap">
                        {product.sku}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-zinc-700 whitespace-nowrap">
                        {product.stock} un.
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-medium tabular-nums text-zinc-900 whitespace-nowrap">
                        {formatBRL(product.price)}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {confirmDeleteId === product.id ? (
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              disabled={deletingId === product.id}
                              onClick={() => handleDelete(product.id)}
                              className="px-2.5 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                            >
                              Confirmar
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2.5 py-1 text-xs font-medium text-zinc-600 bg-zinc-100 rounded-md"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditError(null);
                                setEditingProduct(product);
                              }}
                              aria-label={`Editar ${product.name}`}
                              className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-md"
                            >
                              <Pencil className="w-4 h-4" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(product.id)}
                              aria-label={`Excluir ${product.name}`}
                              className="p-1.5 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-md"
                            >
                              <Trash2 className="w-4 h-4" aria-hidden="true" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      {editingProduct && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-xs"
        >
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-zinc-200 rounded-xl shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
              <h2
                id="edit-modal-title"
                className="font-display text-lg font-bold text-zinc-900"
              >
                Editar produto
              </h2>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                aria-label="Fechar janela de edição"
                className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            <div className="p-6">
              <ProductForm
                initialValues={editingProduct}
                submitLabel="Salvar alterações"
                submitting={editSubmitting}
                serverError={editError}
                onSubmit={handleEditSubmit}
                onCancel={() => setEditingProduct(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
