import { ImagePlus, Link as LinkIcon, Trash2, Upload } from 'lucide-react';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { PRODUCT_CATEGORIES, type ProductInput } from '../types.ts';

interface ProductFormProps {
  initialValues?: Partial<ProductInput>;
  submitLabel: string;
  submitting: boolean;
  serverError: string | null;
  onSubmit: (values: ProductInput) => Promise<void>;
  onCancel?: () => void;
  onChangeValues?: (values: ProductInput) => void;
}

export function ProductForm({
  initialValues,
  submitLabel,
  submitting,
  serverError,
  onSubmit,
  onCancel,
  onChangeValues,
}: ProductFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [category, setCategory] = useState(
    initialValues?.category ?? PRODUCT_CATEGORIES[0],
  );
  const [priceStr, setPriceStr] = useState(
    initialValues?.price !== undefined ? String(initialValues.price) : '',
  );
  const [stockStr, setStockStr] = useState(
    initialValues?.stock !== undefined ? String(initialValues.stock) : '10',
  );
  const [sku, setSku] = useState(initialValues?.sku ?? '');
  const [description, setDescription] = useState(
    initialValues?.description ?? '',
  );
  const [imageUrl, setImageUrl] = useState(initialValues?.imageUrl ?? '');
  const [imageMode, setImageMode] = useState<'url' | 'upload'>(
    initialValues?.imageUrl?.startsWith('data:image/') ? 'upload' : 'url',
  );
  const [localError, setLocalError] = useState<string | null>(null);

  const emitPreview = (next: Partial<ProductInput>) => {
    if (!onChangeValues) return;
    onChangeValues({
      name: next.name ?? name,
      category: next.category ?? category,
      price: next.price ?? (Number(priceStr) || 0),
      stock: next.stock ?? (Number(stockStr) || 0),
      sku: next.sku ?? sku,
      description: next.description ?? description,
      imageUrl: next.imageUrl ?? imageUrl,
    });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setLocalError('Selecione um arquivo de imagem válido (PNG, JPG ou WebP).');
      return;
    }

    if (file.size > 2.5 * 1024 * 1024) {
      setLocalError('A imagem selecionada deve ter no máximo 2,5 MB.');
      return;
    }

    setLocalError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
        emitPreview({ imageUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const parsedPrice = Number(priceStr.replace(',', '.'));
    const parsedStock = Number(stockStr);

    if (name.trim().length < 2) {
      setLocalError('Informe o nome do produto (mínimo de 2 caracteres).');
      return;
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setLocalError('Informe um preço válido maior que zero.');
      return;
    }
    if (!Number.isFinite(parsedStock) || parsedStock < 0) {
      setLocalError('Informe uma quantidade em estoque igual ou maior que zero.');
      return;
    }
    if (description.trim().length < 5) {
      setLocalError('Descreva o produto com pelo menos 5 caracteres.');
      return;
    }

    await onSubmit({
      name: name.trim(),
      category,
      price: parsedPrice,
      stock: Math.floor(parsedStock),
      sku: sku.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim(),
    });
  };

  const activeError = localError || serverError;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {activeError && (
        <div
          role="alert"
          className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700"
        >
          {activeError}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label
            htmlFor="prod-name"
            className="block text-sm font-medium text-zinc-800 mb-1.5"
          >
            Nome do produto
          </label>
          <input
            id="prod-name"
            type="text"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              emitPreview({ name: e.target.value });
            }}
            placeholder="Ex: Monitor de Estúdio Kroma Reference M5"
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-300 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="prod-category"
              className="block text-sm font-medium text-zinc-800 mb-1.5"
            >
              Categoria
            </label>
            <select
              id="prod-category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                emitPreview({ category: e.target.value });
              }}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            >
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="prod-price"
              className="block text-sm font-medium text-zinc-800 mb-1.5"
            >
              Preço (R$)
            </label>
            <input
              id="prod-price"
              type="number"
              step="0.01"
              min="0.01"
              required
              value={priceStr}
              onChange={(e) => {
                setPriceStr(e.target.value);
                emitPreview({ price: Number(e.target.value) || 0 });
              }}
              placeholder="2490.00"
              className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums bg-white border border-zinc-300 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="prod-stock"
              className="block text-sm font-medium text-zinc-800 mb-1.5"
            >
              Estoque disponível (un.)
            </label>
            <input
              id="prod-stock"
              type="number"
              min="0"
              step="1"
              value={stockStr}
              onChange={(e) => {
                setStockStr(e.target.value);
                emitPreview({ stock: Number(e.target.value) || 0 });
              }}
              className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums bg-white border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          </div>

          <div>
            <label
              htmlFor="prod-sku"
              className="block text-sm font-medium text-zinc-800 mb-1.5"
            >
              Código SKU <span className="text-zinc-400 font-normal">(opcional)</span>
            </label>
            <input
              id="prod-sku"
              type="text"
              value={sku}
              onChange={(e) => {
                setSku(e.target.value);
                emitPreview({ sku: e.target.value });
              }}
              placeholder="Gerado automaticamente"
              className="w-full px-3.5 py-2.5 text-sm font-mono bg-white border border-zinc-300 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="prod-description"
            className="block text-sm font-medium text-zinc-800 mb-1.5"
          >
            Descrição técnica
          </label>
          <textarea
            id="prod-description"
            required
            rows={4}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              emitPreview({ description: e.target.value });
            }}
            placeholder="Descreva as especificações principais, materiais e aplicação do equipamento..."
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-300 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 resize-y"
          />
        </div>

        <div>
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="text-sm font-medium text-zinc-800">
              Imagem do produto <span className="text-zinc-400 font-normal">(opcional)</span>
            </span>
            <div className="inline-flex items-center p-0.5 bg-zinc-100 rounded-lg border border-zinc-200">
              <button
                type="button"
                onClick={() => setImageMode('url')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  imageMode === 'url'
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" aria-hidden="true" />
                <span>URL</span>
              </button>
              <button
                type="button"
                onClick={() => setImageMode('upload')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  imageMode === 'upload'
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Arquivo Base64</span>
              </button>
            </div>
          </div>

          {imageMode === 'url' ? (
            <input
              id="prod-image-url"
              type="text"
              value={imageUrl.startsWith('data:image/') ? '' : imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                emitPreview({ imageUrl: e.target.value });
              }}
              placeholder="https://exemplo.com/imagem-produto.jpg"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-300 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <label className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-zinc-700 bg-zinc-50 hover:bg-zinc-100 border border-zinc-300 border-dashed rounded-lg cursor-pointer transition-colors">
                <ImagePlus className="w-4 h-4 text-zinc-500" aria-hidden="true" />
                <span>Selecionar imagem (até 2,5 MB)</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setImageUrl('');
                    emitPreview({ imageUrl: '' });
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Remover imagem</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="pt-2 flex items-center justify-end gap-3 border-t border-zinc-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          {submitting ? 'Salvando...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
