import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar.tsx';
import { ProductForm } from '../components/ProductForm.tsx';
import { ProductImage } from '../components/ProductImage.tsx';
import { api, formatBRL } from '../lib/api.ts';
import { PRODUCT_CATEGORIES, type ProductInput } from '../types.ts';

export function ProductCreatePage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ProductInput>({
    name: '',
    category: PRODUCT_CATEGORIES[0],
    price: 0,
    stock: 10,
    sku: '',
    description: '',
    imageUrl: '',
  });

  const handleCreate = async (values: ProductInput) => {
    setSubmitting(true);
    setServerError(null);
    try {
      const res = await api.createProduct(values);
      navigate('/produtos', {
        replace: true,
        state: {
          notice: `Produto "${res.product.name}" cadastrado com sucesso.`,
        },
      });
    } catch (err) {
      setServerError(
        err instanceof Error
          ? err.message
          : 'Erro ao cadastrar o produto no servidor.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        <div className="space-y-3">
          <Link
            to="/produtos"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Voltar para o catálogo</span>
          </Link>

          <div className="space-y-1">
            <h1 className="font-display text-3xl font-bold tracking-tight text-zinc-900">
              Cadastrar Novo Produto
            </h1>
            <p className="text-sm text-zinc-600">
              Preencha as especificações do equipamento para publicá-lo no banco
              de dados.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <section
            aria-label="Formulário de cadastro"
            className="lg:col-span-7 bg-white border border-zinc-200 rounded-xl p-6 sm:p-8"
          >
            <ProductForm
              submitLabel="Cadastrar Produto"
              submitting={submitting}
              serverError={serverError}
              onSubmit={handleCreate}
              onCancel={() => navigate('/produtos')}
              onChangeValues={setPreview}
            />
          </section>

          <aside
            aria-label="Pré-visualização do produto"
            className="lg:col-span-5 space-y-3 lg:sticky lg:top-24"
          >
            <div className="text-xs font-medium text-zinc-500">
              Pré-visualização no catálogo
            </div>

            <article className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
              <ProductImage
                src={preview.imageUrl}
                alt={preview.name || 'Novo equipamento'}
              />

              <div className="p-5 space-y-2.5">
                <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 text-xs text-zinc-500">
                  <span>{preview.category || PRODUCT_CATEGORIES[0]}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">
                    {preview.sku.trim() || 'SKU automático'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{preview.stock} un.</span>
                </div>

                <h2 className="font-display text-base font-semibold text-zinc-900 leading-snug">
                  {preview.name.trim() || 'Nome do equipamento'}
                </h2>

                <p className="text-sm text-zinc-600 line-clamp-3 leading-relaxed">
                  {preview.description.trim() ||
                    'A descrição técnica informada no formulário aparecerá neste espaço.'}
                </p>

                <div className="pt-3 border-t border-zinc-100">
                  <span className="font-mono text-base font-medium tabular-nums text-zinc-900">
                    {formatBRL(preview.price > 0 ? preview.price : 0)}
                  </span>
                </div>
              </div>
            </article>
          </aside>
        </div>
      </main>
    </div>
  );
}
