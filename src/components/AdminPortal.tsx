import React, { useMemo, useState } from 'react';
import {
  Product,
  Season,
  LadiesUnstitchedCategory,
  PieceType,
  ProductReview,
  PreviewAppointment,
} from '../types/clothing';
import { storeApi } from '../lib/storeApi';
import {
  SiteConfig,
  NavigationConfig,
  CraftsmanshipConfig,
  DEFAULT_SITE_CONFIG,
  mergeSiteConfig,
  HeroSlideConfig,
} from '../types/siteConfig';
import { buildDefaultHeroSlides } from '../utils/heroSlides';
import { replaceBrandName, useBrandName } from '../context/BrandNameContext';
import {
  HERO_IMAGE,
  SUMMER_LAWN_IMAGE,
  LAWN_PRINTS_IMAGE,
  DHANAK_KHADDAR_IMAGE,
  VELVET_CRAFT_IMAGE,
  EDITORIAL_MODEL_IMAGE,
} from '../data/products';
import {
  Lock,
  Unlock,
  ShieldCheck,
  Eye,
  LogOut,
  Save,
  RotateCcw,
  Check,
  Plus,
  Trash2,
  Edit,
  LayoutTemplate,
  Layers,
  ShoppingBag,
  CreditCard,
  Share2,
  FileText,
  Calendar,
  Key,
  ExternalLink,
  Search,
  ArrowRight,
  Sparkles,
  Phone,
  Instagram,
  AlertCircle,
  BarChart3,
  Database,
  Download,
  GripVertical,
  ImageUp,
  Crop,
  SlidersHorizontal,
} from 'lucide-react';

export interface AdminPortalProps {
  siteConfig: SiteConfig;
  onUpdateSiteConfig: (newConfig: SiteConfig) => Promise<void> | void;
  products: Product[];
  onUpdateProducts: (newProducts: Product[]) => Promise<void> | void;
  appointments: PreviewAppointment[];
  reviews: ProductReview[];
  onUpdateReviews?: (reviews: ProductReview[]) => void;
  onUpdateAppointments?: (appointments: PreviewAppointment[]) => void;
  onDeleteReview: (reviewId: string) => void;
  onExitAdmin: () => void;
}

export const PRESET_ASSET_IMAGES = [
  { name: 'Editorial Lawn Banner', url: HERO_IMAGE },
  { name: 'Summer Lawn Suit', url: SUMMER_LAWN_IMAGE },
  { name: 'Lawn Digital Prints', url: LAWN_PRINTS_IMAGE },
  { name: 'Winter Dhanak & Khaddar', url: DHANAK_KHADDAR_IMAGE },
  { name: 'Summer Model Feature', url: EDITORIAL_MODEL_IMAGE },
];

export const AdminPortal: React.FC<AdminPortalProps> = ({
  siteConfig,
  onUpdateSiteConfig,
  products,
  onUpdateProducts,
  appointments,
  reviews,
  onUpdateReviews,
  onUpdateAppointments,
  onDeleteReview,
  onExitAdmin,
}) => {
  const brandName = useBrandName();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return Boolean(sessionStorage.getItem('zavraan_admin_token'));
    } catch {
      return false;
    }
  });
  const [passcodeAttempt, setPasscodeAttempt] = useState('');
  const [newAdminPasscode, setNewAdminPasscode] = useState('');
  const [authError, setAuthError] = useState('');

  // Active Tab in Management Center
  type AdminTab =
    | 'dashboard'
    | 'home'
    | 'categories'
    | 'storefront_layout'
    | 'products'
    | 'payments'
    | 'social'
    | 'footer'
    | 'appointments_reviews'
    | 'security';
  const [activeTab, setActiveTab] = useState<AdminTab>('home');

  // Local drafts
  const [draftConfig, setDraftConfig] = useState<SiteConfig>(() => mergeSiteConfig(siteConfig));
  const [draftProducts, setDraftProducts] = useState<Product[]>(products);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [draggedProductId, setDraggedProductId] = useState<string | null>(null);
  const [dropTargetProductId, setDropTargetProductId] = useState<string | null>(null);
  const [cropEditor, setCropEditor] = useState<{
    source: string;
    target: 'hero' | 'product' | 'heroSlide' | 'summerFeature' | 'winterFeature';
    slideId?: string;
    cropX: number;
    cropY: number;
    cropWidth: number;
    cropHeight: number;
    outputWidth: number;
    outputHeight: number;
  } | null>(null);

  // Product Editing / Creation State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productSeasonFilter, setProductSeasonFilter] = useState<'all' | Season>('all');
  const draftHeroSlides =
    draftConfig.homeScreen.heroSlides ??
    buildDefaultHeroSlides(draftProducts, draftConfig.homeScreen.heroImage);

  const updateDraftHeroSlides = (heroSlides: HeroSlideConfig[]) => {
    setDraftConfig((current) => ({
      ...current,
      homeScreen: {
        ...current.homeScreen,
        heroSlides,
      },
    }));
  };

  const updateNavigationLink = <K extends keyof NavigationConfig>(
    key: K,
    updates: Partial<NavigationConfig[K]>
  ) => {
    setDraftConfig((current) => ({
      ...current,
      navigation: {
        ...current.navigation,
        [key]: { ...current.navigation[key], ...updates },
      },
    }));
  };

  const updateCraftsmanshipRoot = (
    updates: Partial<Pick<CraftsmanshipConfig, 'visible' | 'eyebrow' | 'title' | 'titleAccent' | 'description'>>
  ) => {
    setDraftConfig((current) => ({
      ...current,
      craftsmanship: { ...current.craftsmanship, ...updates },
    }));
  };

  const updateCraftsmanshipCard = <K extends 'tailoring' | 'summerFeature' | 'winterFeature' | 'preview'>(
    key: K,
    updates: Partial<CraftsmanshipConfig[K]>
  ) => {
    setDraftConfig((current) => ({
      ...current,
      craftsmanship: {
        ...current.craftsmanship,
        [key]: { ...current.craftsmanship[key], ...updates },
      },
    }));
  };

  // Blank product template for creation
  const blankProduct: Product = {
    id: `zv-${Date.now().toString().slice(-6)}`,
    name: '',
    sku: `ZV-${Math.floor(100 + Math.random() * 900)}`,
    season: 'summer',
    category: 'Lawn Printed Suits',
    pieces: '3-Piece Suit',
    pricePKR: 6500,
    priceUSD: 24,
    primaryImage: LAWN_PRINTS_IMAGE,
    secondaryImage: SUMMER_LAWN_IMAGE,
    macroImage: LAWN_PRINTS_IMAGE,
    fabricDetails: {
      shirt: '3.10M Combed Swiss Lawn',
      dupattaOrTrouser: '2.50M Chiffon Dupatta',
      trouser: '2.50M Dyed Cambric',
      embroideryPatches: 'Embroidered neckline lace',
      fabricCutMeters: '8.10 Meters',
      weightGrams: 500,
      weaveSpec: '80s Combed Lawn',
    },
    colorName: 'Rose Petal',
    colorHex: '#DCAE96',
    description: '',
    stylingTips: '',
    isNewArrival: true,
    isBestseller: false,
    inStock: true,
    averageRating: 5.0,
    totalReviews: 0,
  };

  const showToast = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const downloadTextFile = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const getMigrationPayload = () => ({
    siteConfig: draftConfig,
    products: draftProducts,
    reviews,
    appointments,
  });

  const generateSqlMigration = () => {
    const payload = getMigrationPayload();
    const escapeSqlValue = (value: string) =>
      value
        .replace(/'/g, "''")
        .replace(/\r/g, '');

    const siteConfigSql = `INSERT OR REPLACE INTO site_config (id, data) VALUES (1, '${escapeSqlValue(JSON.stringify(payload.siteConfig))}');`;
    const productsSql = `INSERT OR REPLACE INTO products (id, data) VALUES (1, '${escapeSqlValue(JSON.stringify(payload.products))}');`;
    const reviewsSql = `INSERT OR REPLACE INTO reviews (id, data) VALUES (1, '${escapeSqlValue(JSON.stringify(payload.reviews))}');`;
    const appointmentsSql = `INSERT OR REPLACE INTO appointments (id, data) VALUES (1, '${escapeSqlValue(JSON.stringify(payload.appointments))}');`;

    return `-- Zavraan SQLite migration\nBEGIN;\nCREATE TABLE IF NOT EXISTS site_config (id INTEGER PRIMARY KEY CHECK (id = 1), data TEXT NOT NULL);\nCREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY CHECK (id = 1), data TEXT NOT NULL);\nCREATE TABLE IF NOT EXISTS reviews (id INTEGER PRIMARY KEY CHECK (id = 1), data TEXT NOT NULL);\nCREATE TABLE IF NOT EXISTS appointments (id INTEGER PRIMARY KEY CHECK (id = 1), data TEXT NOT NULL);\n${siteConfigSql}\n${productsSql}\n${reviewsSql}\n${appointmentsSql}\nCOMMIT;`;
  };

  const generateFirebasePayload = () => ({
    siteConfig: draftConfig,
    products: draftProducts,
    reviews,
    appointments,
  });

  const handleExportSqlMigration = () => {
    downloadTextFile('zavraan-sql-migration.sql', generateSqlMigration(), 'application/sql');
    showToast('SQL migration generated and downloaded.');
  };

  const handleExportFirebaseMigration = () => {
    const payload = generateFirebasePayload();
    downloadTextFile(
      'zavraan-firebase-migration.json',
      JSON.stringify(payload, null, 2),
      'application/json'
    );
    showToast('Firebase-ready export generated and downloaded.');
  };

  const handleImportMigrationFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const raw = await file.text();
      const parsed = JSON.parse(raw);

      if (parsed.siteConfig || parsed.products || parsed.reviews || parsed.appointments) {
        const nextConfig = mergeSiteConfig(parsed.siteConfig ?? draftConfig);
        const nextProducts = parsed.products ?? draftProducts;
        const nextReviews = parsed.reviews ?? reviews;
        const nextAppointments = parsed.appointments ?? appointments;

        setDraftConfig(nextConfig);
        setDraftProducts(nextProducts);
        onUpdateSiteConfig(nextConfig);
        onUpdateProducts(nextProducts);
        onUpdateReviews?.(nextReviews);
        onUpdateAppointments?.(nextAppointments);
        showToast('Migrated content applied successfully.');
        return;
      }

      throw new Error('Unsupported migration file');
    } catch (error) {
      console.error(error);
      showToast('Migration import failed. Use a valid JSON export from this admin panel.');
    } finally {
      event.target.value = '';
    }
  };

  const dashboardStats = useMemo(() => {
    const stockCount = draftProducts.filter((product) => product.inStock).length;
    const saleValuePKR = draftProducts.reduce((total, product) => total + product.pricePKR, 0);
    const bestsellerCount = draftProducts.filter((product) => product.isBestseller).length;
    const averagePricePKR = draftProducts.length ? Math.round(saleValuePKR / draftProducts.length) : 0;

    return {
      totalProducts: draftProducts.length,
      inStock: stockCount,
      outOfStock: draftProducts.length - stockCount,
      totalReviews: reviews.length,
      totalAppointments: appointments.length,
      bestsellerCount,
      averagePricePKR,
      enabledPaymentMethods: Object.values(draftConfig.paymentMethods).filter(
        (method) => 'enabled' in method && method.enabled
      ).length,
    };
  }, [appointments.length, draftConfig.paymentMethods, draftProducts, reviews.length]);

  const openCropEditor = (
    file: File,
    target: 'hero' | 'product' | 'heroSlide' | 'summerFeature' | 'winterFeature',
    slideId?: string
  ) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      const source = typeof fileReader.result === 'string' ? fileReader.result : '';
      if (!source) {
        showToast('Image could not be processed. Please try another file.');
        return;
      }

      setCropEditor({
        source,
        target,
        slideId,
        cropX: 0,
        cropY: 0,
        cropWidth: 100,
        cropHeight: 100,
        outputWidth: 1200,
        outputHeight: 1200,
      });
    };
    fileReader.readAsDataURL(file);
  };

  const applyCropToImage = async () => {
    if (!cropEditor) {
      return;
    }

    const image = new Image();
    image.onload = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = cropEditor.outputWidth;
      canvas.height = cropEditor.outputHeight;

      const context = canvas.getContext('2d');
      if (!context) {
        showToast('Image editor is unavailable in this browser.');
        return;
      }

      const cropX = (image.width * cropEditor.cropX) / 100;
      const cropY = (image.height * cropEditor.cropY) / 100;
      const cropWidth = (image.width * cropEditor.cropWidth) / 100;
      const cropHeight = (image.height * cropEditor.cropHeight) / 100;

      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, cropEditor.outputWidth, cropEditor.outputHeight);
      context.drawImage(
        image,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropEditor.outputWidth,
        cropEditor.outputHeight
      );

      const blob = await new Promise<Blob>((resolve) => canvas.toBlob((value) => resolve(value ?? new Blob()), 'image/jpeg', 0.92));
      const file = new File([blob], `cropped-${Date.now()}.jpg`, { type: 'image/jpeg' });

      try {
        const result = await storeApi.uploadImage(file);
        const imageUrl = result.url;

        if (cropEditor.target === 'hero') {
          setDraftConfig({
            ...draftConfig,
            homeScreen: {
              ...draftConfig.homeScreen,
              heroImage: imageUrl,
            },
          });
        } else if (cropEditor.target === 'heroSlide' && cropEditor.slideId) {
          updateDraftHeroSlides(
            draftHeroSlides.map((slide) =>
              slide.id === cropEditor.slideId ? { ...slide, image: imageUrl } : slide
            )
          );
        } else if (cropEditor.target === 'summerFeature' || cropEditor.target === 'winterFeature') {
          updateCraftsmanshipCard(cropEditor.target, { image: imageUrl });
        } else if (editingProduct) {
          setEditingProduct({
            ...editingProduct,
            primaryImage: imageUrl,
          });
        }

        showToast('Image cropped, resized, and uploaded successfully.');
      } catch (error) {
        console.error(error);
        showToast('Crop upload failed. Please try another image.');
      } finally {
        setCropEditor(null);
      }
    };

    image.src = cropEditor.source;
  };

  const handleExportStore = async () => {
    try {
      const payload = await storeApi.exportStore();
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'zavraan-store-export.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Store content exported successfully.');
    } catch (error) {
      console.error(error);
      showToast('Export failed. Please try again.');
    }
  };

  const handleImportStore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      const nextConfig = mergeSiteConfig(payload.siteConfig ?? draftConfig);
      const nextProducts = payload.products ?? draftProducts;
      const nextReviews = payload.reviews ?? reviews;
      const nextAppointments = payload.appointments ?? appointments;

      setDraftConfig(nextConfig);
      setDraftProducts(nextProducts);
      onUpdateSiteConfig(nextConfig);
      onUpdateProducts(nextProducts);
      onUpdateReviews?.(nextReviews);
      onUpdateAppointments?.(nextAppointments);
      showToast('Store data imported successfully.');
    } catch (error) {
      console.error(error);
      showToast('Import failed. Please choose a valid JSON export file.');
    } finally {
      event.target.value = '';
    }
  };

  const handleUploadAsset = async (
    file: File,
    target: 'hero' | 'product' | 'heroSlide' | 'summerFeature' | 'winterFeature',
    slideId?: string
  ) => {
    openCropEditor(file, target, slideId);
  };

  const handleProductDragStart = (productId: string) => {
    setDraggedProductId(productId);
    setDropTargetProductId(productId);
  };

  const handleProductDrop = (targetProductId: string) => {
    if (!draggedProductId || draggedProductId === targetProductId) {
      setDraggedProductId(null);
      setDropTargetProductId(null);
      return;
    }

    const reordered = [...draftProducts];
    const sourceIndex = reordered.findIndex((product) => product.id === draggedProductId);
    const targetIndex = reordered.findIndex((product) => product.id === targetProductId);

    if (sourceIndex < 0 || targetIndex < 0) {
      setDraggedProductId(null);
      setDropTargetProductId(null);
      return;
    }

    const [moved] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, moved);
    setDraftProducts(reordered);
    onUpdateProducts(reordered);
    setDraggedProductId(null);
    setDropTargetProductId(null);
  };

  // Auth Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await storeApi.loginAdmin(passcodeAttempt);
      sessionStorage.setItem('zavraan_admin_token', result.token);
      setIsAuthenticated(true);
      setAuthError('');
    } catch {
      setAuthError('Incorrect passcode or admin service unavailable.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      sessionStorage.removeItem('zavraan_admin_token');
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangeAdminPasscode = async () => {
    try {
      await storeApi.changeAdminPasscode(newAdminPasscode);
      setNewAdminPasscode('');
      showToast('Admin passcode updated successfully.');
    } catch (error) {
      console.error('Unable to update admin passcode:', error);
      showToast('Passcode must be at least 8 characters and the admin session must be active.');
    }
  };

  // Save changes to Global App State & Storage
  const handleSaveConfig = async (): Promise<boolean> => {
    const brandName = draftConfig.brandName.trim();
    if (!brandName) {
      showToast('Enter a website brand name before publishing.');
      return false;
    }

    try {
      const nextConfig = { ...draftConfig, brandName };
      setDraftConfig(nextConfig);
      await onUpdateSiteConfig(nextConfig);
      showToast('Atelier settings saved and published to customer store.');
      return true;
    } catch (error) {
      console.error('Unable to save site settings:', error);
      showToast('Settings could not be saved. Check that the backend is running and try again.');
      return false;
    }
  };

  const handleSaveProducts = async (updatedProds: Product[]) => {
    setDraftProducts(updatedProds);
    try {
      await onUpdateProducts(updatedProds);
      showToast('Catalog saved successfully.');
    } catch (error) {
      console.error('Unable to save product catalog:', error);
      showToast('Catalog could not be saved. Check that the backend is running and try again.');
    }
  };

  const handlePreviewStore = async () => {
    if (await handleSaveConfig()) {
      onExitAdmin();
    }
  };

  // Reset to Factory Defaults
  const handleResetDefaults = () => {
    if (
      window.confirm(
        'Are you sure you want to reset all site titles, home content, payment accounts, and categories to factory defaults?'
      )
    ) {
      setDraftConfig(DEFAULT_SITE_CONFIG);
      onUpdateSiteConfig(DEFAULT_SITE_CONFIG);
      showToast('All site configurations reset to factory defaults.');
    }
  };

  // ================= RENDER ACCESS GATE (IF UNAUTHENTICATED) =================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#141211] text-stone-200 flex flex-col justify-center items-center p-4 selection:bg-amber-800">
        <div className="max-w-md w-full bg-[#1C1A18] border border-stone-800 rounded-sm p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-700 via-amber-500 to-amber-800" />

          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-stone-900 border border-amber-900/60 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Lock className="w-6 h-6" />
            </div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-amber-500/90 font-semibold block mb-1">
              Restricted Management Portal
            </span>
            <h1 className="text-2xl font-serif text-white tracking-wide">
              {replaceBrandName('Zavraan Atelier System', brandName)}
            </h1>
            <p className="text-xs text-stone-400 mt-2 leading-relaxed font-light">
              This area is strictly restricted to store directors and administrative staff. Normal customers and visitors cannot access this console.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-400 font-medium mb-1.5">
                Master Security Passcode
              </label>
              <input
                type="password"
                required
                autoFocus
                value={passcodeAttempt}
                onChange={(e) => {
                  setPasscodeAttempt(e.target.value);
                  setAuthError('');
                }}
                placeholder="Enter admin passcode"
                className="w-full bg-[#121110] border border-stone-700 rounded-xs px-3.5 py-2.5 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono transition-all"
              />
            </div>

            {authError && (
              <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-start gap-2 rounded-xs animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-amber-700 hover:bg-amber-600 text-white text-xs uppercase tracking-[0.2em] font-medium py-3 rounded-xs cursor-pointer shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>Unlock Admin Panel</span>
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-500">
            <span className="text-[11px]">Enter the current admin passcode configured in Security & Reset.</span>
            <button
              onClick={onExitAdmin}
              className="text-stone-400 hover:text-amber-400 cursor-pointer flex items-center gap-1 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Back to Store</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================= RENDER DEDICATED ADMIN CONTROL CENTER =================
  return (
    <div className="min-h-screen bg-[#F4F3EF] text-stone-900 flex flex-col font-sans">
      {/* Toast Alert */}
      {feedbackMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-5 py-3 text-xs font-medium shadow-2xl flex items-center gap-2.5 border border-amber-600/50 rounded-xs animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Admin Top Navigation Bar */}
      <header className="bg-[#1A1817] text-white border-b border-stone-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-700/80 border border-amber-500/50 flex items-center justify-center font-serif font-bold text-amber-200 text-sm">
              {brandName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg tracking-wider font-medium text-white">
                  {brandName.toUpperCase()}
                </span>
                <span className="bg-amber-900/60 border border-amber-700/60 text-amber-300 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold">
                  Separate Master Admin
                </span>
              </div>
              <p className="text-[10px] text-stone-400 font-light">
                Secure management workspace · Isolated from customer view
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveConfig}
              className="bg-amber-600 hover:bg-amber-500 text-white text-xs px-4 py-2 font-medium flex items-center gap-1.5 rounded-xs transition-colors shadow-sm cursor-pointer"
              title="Save all changes live"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Publish All Changes</span>
            </button>

            <button
              onClick={handlePreviewStore}
              className="bg-white/10 hover:bg-white/20 text-stone-200 text-xs px-3.5 py-2 font-medium flex items-center gap-1.5 rounded-xs transition-colors cursor-pointer border border-white/15"
              title="Preview Customer Website"
            >
              <Eye className="w-3.5 h-3.5 text-amber-300" />
              <span>View Customer Store</span>
            </button>

            <button
              onClick={handleLogout}
              className="text-stone-400 hover:text-white p-2 cursor-pointer transition-colors"
              title="Lock Admin Panel"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Strip */}
        <div className="bg-[#121110] border-t border-stone-800/80 px-4 sm:px-6 lg:px-8 overflow-x-auto">
          <div className="max-w-7xl mx-auto flex items-center gap-1 text-xs py-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-2 font-medium flex items-center gap-2 rounded-xs whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-amber-800/90 text-white'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>0. Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('home')}
              className={`px-3.5 py-2 font-medium flex items-center gap-2 rounded-xs whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-amber-800/90 text-white'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
              }`}
            >
              <LayoutTemplate className="w-3.5 h-3.5" />
              <span>1. Home Screen Content</span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`px-3.5 py-2 font-medium flex items-center gap-2 rounded-xs whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'categories'
                  ? 'bg-amber-800/90 text-white'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2. Categories & Titles</span>
            </button>

            <button
              onClick={() => setActiveTab('storefront_layout')}
              className={`px-3.5 py-2 font-medium flex items-center gap-2 rounded-xs whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'storefront_layout'
                  ? 'bg-amber-800/90 text-white'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
              }`}
            >
              <LayoutTemplate className="w-3.5 h-3.5" />
              <span>Navigation & Story Section</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`px-3.5 py-2 font-medium flex items-center gap-2 rounded-xs whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-amber-800/90 text-white'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>3. Products & Prices ({draftProducts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('payments')}
              className={`px-3.5 py-2 font-medium flex items-center gap-2 rounded-xs whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'payments'
                  ? 'bg-amber-800/90 text-white'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>4. Payment Methods</span>
            </button>

            <button
              onClick={() => setActiveTab('social')}
              className={`px-3.5 py-2 font-medium flex items-center gap-2 rounded-xs whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'social'
                  ? 'bg-amber-800/90 text-white'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>5. WhatsApp & Social Links</span>
            </button>

            <button
              onClick={() => setActiveTab('footer')}
              className={`px-3.5 py-2 font-medium flex items-center gap-2 rounded-xs whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'footer'
                  ? 'bg-amber-800/90 text-white'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>6. Bottom Footer & Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('appointments_reviews')}
              className={`px-3.5 py-2 font-medium flex items-center gap-2 rounded-xs whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'appointments_reviews'
                  ? 'bg-amber-800/90 text-white'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>7. Appts & Reviews ({appointments.length}/{reviews.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`px-3.5 py-2 font-medium flex items-center gap-2 rounded-xs whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'security'
                  ? 'bg-amber-800/90 text-white'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>8. Security & Reset</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {activeTab === 'dashboard' && (
          <div className="bg-white border border-stone-200 rounded-xs shadow-xs p-6 sm:p-8 space-y-6">
            <div>
              <span className="text-[11px] uppercase tracking-widest text-amber-900 font-semibold">
                Store Performance Snapshot
              </span>
              <h2 className="text-2xl font-serif text-stone-900 mt-1">
                Business Dashboard & Content Health
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Monitor inventory, customer touchpoints, and content quality from a single operations view.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Catalog Items', value: dashboardStats.totalProducts, accent: 'amber' },
                { label: 'In Stock', value: dashboardStats.inStock, accent: 'emerald' },
                { label: 'Reviews', value: dashboardStats.totalReviews, accent: 'violet' },
                { label: 'Appointments', value: dashboardStats.totalAppointments, accent: 'sky' },
              ].map((item) => (
                <div key={item.label} className="border border-stone-200 bg-stone-50 p-4 rounded-xs">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500">{item.label}</p>
                  <p className="mt-3 text-3xl font-serif text-stone-900">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="border border-stone-200 rounded-xs p-4 bg-stone-50">
                <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500">Average Pricing</p>
                <p className="mt-3 text-2xl font-bold text-stone-900">PKR {dashboardStats.averagePricePKR.toLocaleString()}</p>
                <p className="mt-2 text-[11px] text-stone-500">Current catalog average across all product listings.</p>
              </div>

              <div className="border border-stone-200 rounded-xs p-4 bg-stone-50">
                <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500">Bestsellers</p>
                <p className="mt-3 text-2xl font-bold text-stone-900">{dashboardStats.bestsellerCount}</p>
                <p className="mt-2 text-[11px] text-stone-500">Featured products highlighted in the storefront.</p>
              </div>

              <div className="border border-stone-200 rounded-xs p-4 bg-stone-50">
                <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500">Payment Channels</p>
                <p className="mt-3 text-2xl font-bold text-stone-900">{dashboardStats.enabledPaymentMethods}</p>
                <p className="mt-2 text-[11px] text-stone-500">Active checkout methods currently published to customers.</p>
              </div>
            </div>

            <div className="p-4 border border-amber-200 bg-amber-50 rounded-xs space-y-3">
              <div className="flex items-center gap-2 text-amber-950">
                <Database className="w-4 h-4" />
                <span className="text-[11px] uppercase tracking-[0.2em] font-semibold">Migration Tools</span>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleExportSqlMigration}
                  className="bg-stone-900 text-white text-[10px] uppercase tracking-wider px-3 py-2 font-medium rounded-xs cursor-pointer"
                >
                  Export SQL Migration
                </button>
                <button
                  type="button"
                  onClick={handleExportFirebaseMigration}
                  className="bg-amber-700 text-white text-[10px] uppercase tracking-wider px-3 py-2 font-medium rounded-xs cursor-pointer"
                >
                  Export Firebase JSON
                </button>
                <label className="bg-white border border-stone-300 text-stone-800 text-[10px] uppercase tracking-wider px-3 py-2 font-medium rounded-xs cursor-pointer">
                  Import Migration JSON
                  <input type="file" accept="application/json" className="hidden" onChange={handleImportMigrationFile} />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ================= 1. HOME SCREEN CONTENT TAB ================= */}
        {activeTab === 'home' && (
          <div className="bg-white border border-stone-200 rounded-xs shadow-xs p-6 sm:p-8 space-y-6">
            <div>
              <span className="text-[11px] uppercase tracking-widest text-amber-900 font-semibold">
                Homepage Hero & Headlines Management
              </span>
              <h2 className="text-2xl font-serif text-stone-900 mt-1">
                Home Screen Content Elements
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Customize every title, subtitle, announcement badge, statistics, and button labels on the customer homepage.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={handleExportStore}
                className="bg-stone-900 text-white text-[10px] uppercase tracking-wider px-3 py-2 font-medium rounded-xs cursor-pointer"
              >
                Export Store JSON
              </button>

              <label className="bg-amber-700 text-white text-[10px] uppercase tracking-wider px-3 py-2 font-medium rounded-xs cursor-pointer">
                Import Store JSON
                <input type="file" accept="application/json" className="hidden" onChange={handleImportStore} />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-stone-100">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Announcement Badge / Kicker Text
                  </label>
                  <input
                    type="text"
                    value={draftConfig.homeScreen.announcementBadge}
                    onChange={(e) =>
                      setDraftConfig({
                        ...draftConfig,
                        homeScreen: {
                          ...draftConfig.homeScreen,
                          announcementBadge: e.target.value,
                        },
                      })
                    }
                    className="w-full border border-stone-300 p-2.5 text-xs text-stone-900 focus:outline-stone-800"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">
                    Displayed above the main headline on the home screen.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                      Main Headline (Line 1)
                    </label>
                    <input
                      type="text"
                      value={draftConfig.homeScreen.headlinePart1}
                      onChange={(e) =>
                        setDraftConfig({
                          ...draftConfig,
                          homeScreen: {
                            ...draftConfig.homeScreen,
                            headlinePart1: e.target.value,
                          },
                        })
                      }
                      className="w-full border border-stone-300 p-2.5 text-xs text-stone-900 focus:outline-stone-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                      Headline (Line 2 - Italic)
                    </label>
                    <input
                      type="text"
                      value={draftConfig.homeScreen.headlinePart2}
                      onChange={(e) =>
                        setDraftConfig({
                          ...draftConfig,
                          homeScreen: {
                            ...draftConfig.homeScreen,
                            headlinePart2: e.target.value,
                          },
                        })
                      }
                      className="w-full border border-stone-300 p-2.5 text-xs text-stone-900 focus:outline-stone-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Sub-Headline / Brand Description
                  </label>
                  <textarea
                    rows={3}
                    value={draftConfig.homeScreen.subheadline}
                    onChange={(e) =>
                      setDraftConfig({
                        ...draftConfig,
                        homeScreen: {
                          ...draftConfig.homeScreen,
                          subheadline: e.target.value,
                        },
                      })
                    }
                    className="w-full border border-stone-300 p-2.5 text-xs text-stone-900 focus:outline-stone-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                      Primary CTA Button Text
                    </label>
                    <input
                      type="text"
                      value={draftConfig.homeScreen.primaryButtonText}
                      onChange={(e) =>
                        setDraftConfig({
                          ...draftConfig,
                          homeScreen: {
                            ...draftConfig.homeScreen,
                            primaryButtonText: e.target.value,
                          },
                        })
                      }
                      className="w-full border border-stone-300 p-2.5 text-xs text-stone-900 focus:outline-stone-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                      Secondary CTA Button Text
                    </label>
                    <input
                      type="text"
                      value={draftConfig.homeScreen.secondaryButtonText}
                      onChange={(e) =>
                        setDraftConfig({
                          ...draftConfig,
                          homeScreen: {
                            ...draftConfig.homeScreen,
                            secondaryButtonText: e.target.value,
                          },
                        })
                      }
                      className="w-full border border-stone-300 p-2.5 text-xs text-stone-900 focus:outline-stone-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Fabric Preview Assurance Note
                  </label>
                  <input
                    type="text"
                    value={draftConfig.homeScreen.previewNotice}
                    onChange={(e) =>
                      setDraftConfig({
                        ...draftConfig,
                        homeScreen: {
                          ...draftConfig.homeScreen,
                          previewNotice: e.target.value,
                        },
                      })
                    }
                    className="w-full border border-stone-300 p-2.5 text-xs text-stone-900 focus:outline-stone-800"
                  />
                </div>
              </div>

              {/* Homepage Statistics */}
              <div className="space-y-4">
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Homepage Metric Badges (3 Pillars)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 bg-stone-50 border border-stone-200">
                    <input
                      type="text"
                      placeholder="Value"
                      value={draftConfig.homeScreen.stat1Value}
                      onChange={(e) =>
                        setDraftConfig({
                          ...draftConfig,
                          homeScreen: {
                            ...draftConfig.homeScreen,
                            stat1Value: e.target.value,
                          },
                        })
                      }
                      className="w-full border border-stone-300 p-1.5 text-xs font-mono font-bold"
                    />
                    <input
                      type="text"
                      placeholder="Label"
                      value={draftConfig.homeScreen.stat1Label}
                      onChange={(e) =>
                        setDraftConfig({
                          ...draftConfig,
                          homeScreen: {
                            ...draftConfig.homeScreen,
                            stat1Label: e.target.value,
                          },
                        })
                      }
                      className="w-full border border-stone-300 p-1.5 text-xs mt-1"
                    />
                  </div>

                  <div className="p-3 bg-stone-50 border border-stone-200">
                    <input
                      type="text"
                      placeholder="Value"
                      value={draftConfig.homeScreen.stat2Value}
                      onChange={(e) =>
                        setDraftConfig({
                          ...draftConfig,
                          homeScreen: {
                            ...draftConfig.homeScreen,
                            stat2Value: e.target.value,
                          },
                        })
                      }
                      className="w-full border border-stone-300 p-1.5 text-xs font-mono font-bold"
                    />
                    <input
                      type="text"
                      placeholder="Label"
                      value={draftConfig.homeScreen.stat2Label}
                      onChange={(e) =>
                        setDraftConfig({
                          ...draftConfig,
                          homeScreen: {
                            ...draftConfig.homeScreen,
                            stat2Label: e.target.value,
                          },
                        })
                      }
                      className="w-full border border-stone-300 p-1.5 text-xs mt-1"
                    />
                  </div>

                  <div className="p-3 bg-stone-50 border border-stone-200">
                    <input
                      type="text"
                      placeholder="Value"
                      value={draftConfig.homeScreen.stat3Value}
                      onChange={(e) =>
                        setDraftConfig({
                          ...draftConfig,
                          homeScreen: {
                            ...draftConfig.homeScreen,
                            stat3Value: e.target.value,
                          },
                        })
                      }
                      className="w-full border border-stone-300 p-1.5 text-xs font-mono font-bold"
                    />
                    <input
                      type="text"
                      placeholder="Label"
                      value={draftConfig.homeScreen.stat3Label}
                      onChange={(e) =>
                        setDraftConfig({
                          ...draftConfig,
                          homeScreen: {
                            ...draftConfig.homeScreen,
                            stat3Label: e.target.value,
                          },
                        })
                      }
                      className="w-full border border-stone-300 p-1.5 text-xs mt-1"
                    />
                  </div>
                </div>
              </div>

              <section className="md:col-span-2 space-y-4 pt-5 border-t border-stone-100">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                        Homepage slideshow
                      </label>
                      <p className="text-[10px] text-stone-500 mt-1">
                        {draftHeroSlides.length} slides are shown on the storefront.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        updateDraftHeroSlides([
                          ...draftHeroSlides,
                          {
                            id: `hero-slide-${Date.now()}`,
                            image: draftHeroSlides[0]?.image ?? HERO_IMAGE,
                            category: 'New collection',
                            season: 'summer',
                            caption: 'Add a short description for this collection.',
                            dropTag: 'NEW DROP',
                          },
                        ])
                      }
                      className="bg-amber-800 hover:bg-amber-700 text-white text-[10px] uppercase tracking-wider px-3 py-2 font-medium rounded-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add slide
                    </button>
                  </div>

                  <div className="space-y-3">
                    {draftHeroSlides.map((slide, index) => (
                      <article
                        key={slide.id}
                        className="grid grid-cols-1 lg:grid-cols-[150px_1fr] gap-4 p-4 border border-stone-200 bg-stone-50 rounded-xs"
                      >
                        <div className="space-y-2">
                          <img
                            src={slide.image}
                            alt={slide.category}
                            className="w-full aspect-[4/3] object-cover border border-stone-200 bg-stone-100"
                          />
                          <label className="flex items-center justify-center gap-1.5 bg-stone-900 text-white text-[10px] uppercase tracking-wider px-3 py-2 rounded-xs cursor-pointer">
                            <ImageUp className="w-3.5 h-3.5" />
                            Crop & upload
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (file) {
                                  handleUploadAsset(file, 'heroSlide', slide.id);
                                }
                                event.target.value = '';
                              }}
                            />
                          </label>
                          <select
                            aria-label={`Choose preset image for slide ${index + 1}`}
                            value={PRESET_ASSET_IMAGES.some((preset) => preset.url === slide.image) ? slide.image : ''}
                            onChange={(event) => {
                              if (event.target.value) {
                                updateDraftHeroSlides(
                                  draftHeroSlides.map((item) =>
                                    item.id === slide.id ? { ...item, image: event.target.value } : item
                                  )
                                );
                              }
                            }}
                            className="w-full border border-stone-300 bg-white p-2 text-[10px]"
                          >
                            <option value="">Choose preset image</option>
                            {PRESET_ASSET_IMAGES.map((preset) => (
                              <option key={preset.name} value={preset.url}>{preset.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-amber-900">
                              Slide {index + 1}
                            </span>
                            <button
                              type="button"
                              disabled={draftHeroSlides.length <= 1}
                              onClick={() => updateDraftHeroSlides(draftHeroSlides.filter((item) => item.id !== slide.id))}
                              className="p-1.5 text-stone-400 hover:text-red-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              title="Remove slide"
                              aria-label={`Remove slide ${index + 1}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-semibold text-stone-600 mb-1">Image URL</label>
                              <input
                                type="text"
                                value={slide.image}
                                onChange={(event) =>
                                  updateDraftHeroSlides(draftHeroSlides.map((item) =>
                                    item.id === slide.id ? { ...item, image: event.target.value } : item
                                  ))
                                }
                                className="w-full border border-stone-300 bg-white p-2 text-xs font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-stone-600 mb-1">Category / button text</label>
                              <input
                                type="text"
                                value={slide.category}
                                onChange={(event) =>
                                  updateDraftHeroSlides(draftHeroSlides.map((item) =>
                                    item.id === slide.id ? { ...item, category: event.target.value } : item
                                  ))
                                }
                                className="w-full border border-stone-300 bg-white p-2 text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-stone-600 mb-1">Collection badge</label>
                              <input
                                type="text"
                                value={slide.dropTag ?? ''}
                                onChange={(event) =>
                                  updateDraftHeroSlides(draftHeroSlides.map((item) =>
                                    item.id === slide.id ? { ...item, dropTag: event.target.value } : item
                                  ))
                                }
                                className="w-full border border-stone-300 bg-white p-2 text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-stone-600 mb-1">Season</label>
                              <select
                                value={slide.season}
                                onChange={(event) =>
                                  updateDraftHeroSlides(draftHeroSlides.map((item) =>
                                    item.id === slide.id
                                      ? { ...item, season: event.target.value as Season }
                                      : item
                                  ))
                                }
                                className="w-full border border-stone-300 bg-white p-2 text-xs"
                              >
                                <option value="summer">Summer</option>
                                <option value="winter">Winter</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-semibold text-stone-600 mb-1">Slide description</label>
                            <textarea
                              rows={2}
                              value={slide.caption}
                              onChange={(event) =>
                                updateDraftHeroSlides(draftHeroSlides.map((item) =>
                                  item.id === slide.id ? { ...item, caption: event.target.value } : item
                                ))
                              }
                              className="w-full border border-stone-300 bg-white p-2 text-xs"
                            />
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
              </section>
            </div>

            <div className="pt-4 border-t border-stone-200 flex justify-end">
              <button
                onClick={handleSaveConfig}
                className="bg-stone-900 hover:bg-stone-800 text-white text-xs uppercase tracking-wider px-6 py-2.5 font-medium cursor-pointer shadow-sm flex items-center gap-2"
              >
                <Save className="w-3.5 h-3.5 text-amber-300" />
                <span>Save Home Screen Content</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= 2. CATEGORIES & TITLES TAB ================= */}
        {activeTab === 'categories' && (
          <div className="bg-white border border-stone-200 rounded-xs shadow-xs p-6 sm:p-8 space-y-8">
            <div>
              <span className="text-[11px] uppercase tracking-widest text-amber-900 font-semibold">
                Ladies Unstitched Fabric Taxonomies
              </span>
              <h2 className="text-2xl font-serif text-stone-900 mt-1">
                Category Titles & Seasonal Collections
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Manage collection headlines and specific categories for Summer (Lawn/Cotton) and Winter (Khaddar/Dhanak).
              </p>
            </div>

            {/* Summer Collection Categories */}
            <div className="p-5 bg-amber-50/50 border border-amber-200/80 rounded-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-amber-950 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-600" />
                  <span>Summer Collection Setup</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Summer Collection Title
                  </label>
                  <input
                    type="text"
                    value={draftConfig.categories.summerCollectionTitle}
                    onChange={(e) =>
                      setDraftConfig({
                        ...draftConfig,
                        categories: {
                          ...draftConfig.categories,
                          summerCollectionTitle: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-white border border-stone-300 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Summer Collection Subtitle
                  </label>
                  <input
                    type="text"
                    value={draftConfig.categories.summerCollectionSubtitle}
                    onChange={(e) =>
                      setDraftConfig({
                        ...draftConfig,
                        categories: {
                          ...draftConfig.categories,
                          summerCollectionSubtitle: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-white border border-stone-300 p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                  Summer Fabric Subcategories
                </label>
                <div className="space-y-2">
                  {draftConfig.categories.summerCategories.map((cat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs font-mono text-stone-400 w-5">
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        value={cat}
                        onChange={(e) => {
                          const updated = [...draftConfig.categories.summerCategories];
                          updated[idx] = e.target.value;
                          setDraftConfig({
                            ...draftConfig,
                            categories: {
                              ...draftConfig.categories,
                              summerCategories: updated,
                            },
                          });
                        }}
                        className="flex-1 bg-white border border-stone-300 p-2 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = draftConfig.categories.summerCategories.filter(
                            (_, i) => i !== idx
                          );
                          setDraftConfig({
                            ...draftConfig,
                            categories: {
                              ...draftConfig.categories,
                              summerCategories: updated,
                            },
                          });
                        }}
                        className="p-2 text-stone-400 hover:text-red-600 cursor-pointer"
                        title="Delete category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setDraftConfig({
                      ...draftConfig,
                      categories: {
                        ...draftConfig.categories,
                        summerCategories: [
                          ...draftConfig.categories.summerCategories,
                          'New Summer Category',
                        ],
                      },
                    });
                  }}
                  className="mt-3 text-xs text-amber-900 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Summer Category</span>
                </button>
              </div>
            </div>

            {/* Winter Collection Categories */}
            <div className="p-5 bg-stone-100 border border-stone-300/80 rounded-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-stone-800" />
                  <span>Winter Collection Setup</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Winter Collection Title
                  </label>
                  <input
                    type="text"
                    value={draftConfig.categories.winterCollectionTitle}
                    onChange={(e) =>
                      setDraftConfig({
                        ...draftConfig,
                        categories: {
                          ...draftConfig.categories,
                          winterCollectionTitle: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-white border border-stone-300 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Winter Collection Subtitle
                  </label>
                  <input
                    type="text"
                    value={draftConfig.categories.winterCollectionSubtitle}
                    onChange={(e) =>
                      setDraftConfig({
                        ...draftConfig,
                        categories: {
                          ...draftConfig.categories,
                          winterCollectionSubtitle: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-white border border-stone-300 p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                  Winter Fabric Subcategories
                </label>
                <div className="space-y-2">
                  {draftConfig.categories.winterCategories.map((cat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs font-mono text-stone-400 w-5">
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        value={cat}
                        onChange={(e) => {
                          const updated = [...draftConfig.categories.winterCategories];
                          updated[idx] = e.target.value;
                          setDraftConfig({
                            ...draftConfig,
                            categories: {
                              ...draftConfig.categories,
                              winterCategories: updated,
                            },
                          });
                        }}
                        className="flex-1 bg-white border border-stone-300 p-2 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = draftConfig.categories.winterCategories.filter(
                            (_, i) => i !== idx
                          );
                          setDraftConfig({
                            ...draftConfig,
                            categories: {
                              ...draftConfig.categories,
                              winterCategories: updated,
                            },
                          });
                        }}
                        className="p-2 text-stone-400 hover:text-red-600 cursor-pointer"
                        title="Delete category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setDraftConfig({
                      ...draftConfig,
                      categories: {
                        ...draftConfig.categories,
                        winterCategories: [
                          ...draftConfig.categories.winterCategories,
                          'New Winter Category',
                        ],
                      },
                    });
                  }}
                  className="mt-3 text-xs text-stone-900 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Winter Category</span>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200 flex justify-end">
              <button
                onClick={handleSaveConfig}
                className="bg-stone-900 hover:bg-stone-800 text-white text-xs uppercase tracking-wider px-6 py-2.5 font-medium cursor-pointer shadow-sm flex items-center gap-2"
              >
                <Save className="w-3.5 h-3.5 text-amber-300" />
                <span>Save Category Titles</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'storefront_layout' && (
          <div className="bg-white border border-stone-200 rounded-xs shadow-xs p-6 sm:p-8 space-y-8">
            <div>
              <span className="text-[11px] uppercase tracking-widest text-amber-900 font-semibold">
                Storefront Display Controls
              </span>
              <h2 className="text-2xl font-serif text-stone-900 mt-1">Navigation & Story Section</h2>
              <p className="text-xs text-stone-500 mt-1">
                Rename or hide top navigation links and edit the pictured editorial section.
              </p>
            </div>

            <section className="border-t border-stone-100 pt-5">
              <label className="block text-xs font-semibold text-stone-700 mb-1" htmlFor="store-brand-name">
                Website brand name
              </label>
              <input
                id="store-brand-name"
                type="text"
                required
                maxLength={48}
                value={draftConfig.brandName}
                onChange={(event) =>
                  setDraftConfig((current) => ({ ...current, brandName: event.target.value }))
                }
                placeholder="Enter the brand name"
                className="w-full max-w-xl border border-stone-300 p-2.5 text-sm"
              />
              <p className="text-[11px] text-stone-500 mt-1">
                Updates visible brand mentions throughout the storefront and page title.
              </p>
            </section>

            <section className="space-y-4 border-t border-stone-100 pt-5">
              <div>
                <h3 className="text-sm font-semibold text-stone-900">Top navigation links</h3>
                <p className="text-[11px] text-stone-500 mt-1">Hidden links are removed from desktop and mobile navigation.</p>
              </div>
              {(Object.keys(draftConfig.navigation) as (keyof NavigationConfig)[]).map((key) => {
                const labels: Record<keyof NavigationConfig, string> = {
                  allDrops: 'All products',
                  summer: 'Summer collection',
                  winter: 'Winter collection',
                  preview: 'Video preview',
                };
                const link = draftConfig.navigation[key];

                return (
                  <div key={key} className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-3 items-center p-3 bg-stone-50 border border-stone-200">
                    <label className="flex items-center gap-2 text-xs font-semibold text-stone-800">
                      <input
                        type="checkbox"
                        checked={link.visible}
                        onChange={(event) => updateNavigationLink(key, { visible: event.target.checked })}
                      />
                      Show {labels[key]}
                    </label>
                    <input
                      type="text"
                      value={link.label}
                      onChange={(event) => updateNavigationLink(key, { label: event.target.value })}
                      aria-label={`${labels[key]} navigation label`}
                      className="w-full border border-stone-300 bg-white p-2 text-xs"
                    />
                  </div>
                );
              })}
            </section>

            <section className="space-y-4 border-t border-stone-100 pt-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-stone-900">Editorial story section</h3>
                  <p className="text-[11px] text-stone-500 mt-1">Control the entire section and its individual cards.</p>
                </div>
                <label className="flex items-center gap-2 text-xs font-semibold text-stone-800">
                  <input
                    type="checkbox"
                    checked={draftConfig.craftsmanship.visible}
                    onChange={(event) => updateCraftsmanshipRoot({ visible: event.target.checked })}
                  />
                  Show section
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-stone-600 mb-1">Section eyebrow</label>
                  <input
                    type="text"
                    value={draftConfig.craftsmanship.eyebrow}
                    onChange={(event) => updateCraftsmanshipRoot({ eyebrow: event.target.value })}
                    className="w-full border border-stone-300 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-stone-600 mb-1">Heading</label>
                  <input
                    type="text"
                    value={draftConfig.craftsmanship.title}
                    onChange={(event) => updateCraftsmanshipRoot({ title: event.target.value })}
                    className="w-full border border-stone-300 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-stone-600 mb-1">Heading accent</label>
                  <input
                    type="text"
                    value={draftConfig.craftsmanship.titleAccent}
                    onChange={(event) => updateCraftsmanshipRoot({ titleAccent: event.target.value })}
                    className="w-full border border-stone-300 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-stone-600 mb-1">Intro text</label>
                  <textarea
                    rows={2}
                    value={draftConfig.craftsmanship.description}
                    onChange={(event) => updateCraftsmanshipRoot({ description: event.target.value })}
                    className="w-full border border-stone-300 p-2 text-xs"
                  />
                </div>
              </div>

              <div className="border border-stone-200 p-4 space-y-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-stone-800">
                  <input
                    type="checkbox"
                    checked={draftConfig.craftsmanship.tailoring.visible}
                    onChange={(event) => updateCraftsmanshipCard('tailoring', { visible: event.target.checked })}
                  />
                  Show tailoring card
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input aria-label="Tailoring card badge" value={draftConfig.craftsmanship.tailoring.badge} onChange={(event) => updateCraftsmanshipCard('tailoring', { badge: event.target.value })} className="w-full border border-stone-300 p-2 text-xs" />
                  <input aria-label="Tailoring card metric" value={draftConfig.craftsmanship.tailoring.metric} onChange={(event) => updateCraftsmanshipCard('tailoring', { metric: event.target.value })} className="w-full border border-stone-300 p-2 text-xs" />
                  <input aria-label="Tailoring card heading" value={draftConfig.craftsmanship.tailoring.title} onChange={(event) => updateCraftsmanshipCard('tailoring', { title: event.target.value })} className="w-full border border-stone-300 p-2 text-xs" />
                  <input aria-label="Tailoring card heading accent" value={draftConfig.craftsmanship.tailoring.accent} onChange={(event) => updateCraftsmanshipCard('tailoring', { accent: event.target.value })} className="w-full border border-stone-300 p-2 text-xs" />
                  <textarea aria-label="Tailoring card description" rows={3} value={draftConfig.craftsmanship.tailoring.description} onChange={(event) => updateCraftsmanshipCard('tailoring', { description: event.target.value })} className="w-full border border-stone-300 p-2 text-xs md:col-span-2" />
                  <input aria-label="Tailoring benefit one" value={draftConfig.craftsmanship.tailoring.benefitOne} onChange={(event) => updateCraftsmanshipCard('tailoring', { benefitOne: event.target.value })} className="w-full border border-stone-300 p-2 text-xs" />
                  <input aria-label="Tailoring benefit two" value={draftConfig.craftsmanship.tailoring.benefitTwo} onChange={(event) => updateCraftsmanshipCard('tailoring', { benefitTwo: event.target.value })} className="w-full border border-stone-300 p-2 text-xs" />
                </div>
              </div>

              {(['summerFeature', 'winterFeature'] as const).map((key) => {
                const feature = draftConfig.craftsmanship[key];
                const title = key === 'summerFeature' ? 'Summer image card' : 'Winter image card';

                return (
                  <div key={key} className="border border-stone-200 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-xs font-semibold text-stone-900">{title}</h4>
                      <label className="flex items-center gap-2 text-xs text-stone-700">
                        <input
                          type="checkbox"
                          checked={feature.visible}
                          onChange={(event) => updateCraftsmanshipCard(key, { visible: event.target.checked })}
                        />
                        Show card
                      </label>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-[140px_1fr] gap-3">
                      <div className="space-y-2">
                        <img src={feature.image} alt={feature.imageAlt} className="w-full aspect-[4/3] object-cover border border-stone-200" />
                        <label className="flex items-center justify-center gap-1.5 bg-stone-900 text-white text-[10px] uppercase tracking-wider px-3 py-2 cursor-pointer">
                          <ImageUp className="w-3.5 h-3.5" /> Upload image
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              if (file) {
                                handleUploadAsset(file, key);
                              }
                              event.target.value = '';
                            }}
                          />
                        </label>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input aria-label={`${title} image URL`} value={feature.image} onChange={(event) => updateCraftsmanshipCard(key, { image: event.target.value })} className="w-full border border-stone-300 p-2 text-xs font-mono sm:col-span-2" />
                        <input aria-label={`${title} image description`} value={feature.imageAlt} onChange={(event) => updateCraftsmanshipCard(key, { imageAlt: event.target.value })} className="w-full border border-stone-300 p-2 text-xs sm:col-span-2" />
                        <input aria-label={`${title} eyebrow`} value={feature.eyebrow} onChange={(event) => updateCraftsmanshipCard(key, { eyebrow: event.target.value })} className="w-full border border-stone-300 p-2 text-xs" />
                        <input aria-label={`${title} heading`} value={feature.title} onChange={(event) => updateCraftsmanshipCard(key, { title: event.target.value })} className="w-full border border-stone-300 p-2 text-xs" />
                        <textarea aria-label={`${title} description`} rows={3} value={feature.description} onChange={(event) => updateCraftsmanshipCard(key, { description: event.target.value })} className="w-full border border-stone-300 p-2 text-xs sm:col-span-2" />
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="border border-stone-200 p-4 space-y-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-stone-800">
                  <input
                    type="checkbox"
                    checked={draftConfig.craftsmanship.preview.visible}
                    onChange={(event) => updateCraftsmanshipCard('preview', { visible: event.target.checked })}
                  />
                  Show video preview card
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input aria-label="Preview card badge" value={draftConfig.craftsmanship.preview.badge} onChange={(event) => updateCraftsmanshipCard('preview', { badge: event.target.value })} className="w-full border border-stone-300 p-2 text-xs" />
                  <input aria-label="Preview status text" value={draftConfig.craftsmanship.preview.status} onChange={(event) => updateCraftsmanshipCard('preview', { status: event.target.value })} className="w-full border border-stone-300 p-2 text-xs" />
                  <input aria-label="Preview card heading" value={draftConfig.craftsmanship.preview.title} onChange={(event) => updateCraftsmanshipCard('preview', { title: event.target.value })} className="w-full border border-stone-300 p-2 text-xs" />
                  <input aria-label="Preview card heading accent" value={draftConfig.craftsmanship.preview.accent} onChange={(event) => updateCraftsmanshipCard('preview', { accent: event.target.value })} className="w-full border border-stone-300 p-2 text-xs" />
                  <textarea aria-label="Preview card description" rows={3} value={draftConfig.craftsmanship.preview.description} onChange={(event) => updateCraftsmanshipCard('preview', { description: event.target.value })} className="w-full border border-stone-300 p-2 text-xs md:col-span-2" />
                  <input aria-label="Preview assurance text" value={draftConfig.craftsmanship.preview.assurance} onChange={(event) => updateCraftsmanshipCard('preview', { assurance: event.target.value })} className="w-full border border-stone-300 p-2 text-xs" />
                  <input aria-label="Preview button text" value={draftConfig.craftsmanship.preview.buttonText} onChange={(event) => updateCraftsmanshipCard('preview', { buttonText: event.target.value })} className="w-full border border-stone-300 p-2 text-xs" />
                </div>
              </div>
            </section>

            <div className="pt-4 border-t border-stone-200 flex justify-end">
              <button
                onClick={handleSaveConfig}
                className="bg-stone-900 hover:bg-stone-800 text-white text-xs uppercase tracking-wider px-6 py-2.5 font-medium cursor-pointer shadow-sm flex items-center gap-2"
              >
                <Save className="w-3.5 h-3.5 text-amber-300" />
                Save Navigation & Section
              </button>
            </div>
          </div>
        )}

        {/* ================= 3. PRODUCTS & PRICES TAB ================= */}
        {activeTab === 'products' && (
          <div className="bg-white border border-stone-200 rounded-xs shadow-xs p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-amber-900 font-semibold">
                  Catalog & Raw Fabric Inventory
                </span>
                <h2 className="text-2xl font-serif text-stone-900 mt-1">
                  Product Management (Prices, Images & Details)
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Edit prices in PKR/USD, update descriptions, swap photos, and manage fabric cuts.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingProduct({ ...blankProduct, id: `zv-${Date.now()}` });
                  setIsCreatingProduct(true);
                }}
                className="bg-amber-800 hover:bg-amber-700 text-white text-xs uppercase tracking-wider px-4 py-2.5 font-medium flex items-center gap-2 rounded-xs shadow-sm cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Unstitched Suit</span>
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-stone-100 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setProductSeasonFilter('all')}
                  className={`px-3 py-1.5 rounded-xs cursor-pointer ${
                    productSeasonFilter === 'all'
                      ? 'bg-stone-900 text-white font-medium'
                      : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  All ({draftProducts.length})
                </button>
                <button
                  onClick={() => setProductSeasonFilter('summer')}
                  className={`px-3 py-1.5 rounded-xs cursor-pointer ${
                    productSeasonFilter === 'summer'
                      ? 'bg-amber-800 text-white font-medium'
                      : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  Summer ({draftProducts.filter((p) => p.season === 'summer').length})
                </button>
                <button
                  onClick={() => setProductSeasonFilter('winter')}
                  className={`px-3 py-1.5 rounded-xs cursor-pointer ${
                    productSeasonFilter === 'winter'
                      ? 'bg-amber-950 text-white font-medium'
                      : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  Winter ({draftProducts.filter((p) => p.season === 'winter').length})
                </button>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search products by title or SKU..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full bg-white border border-stone-300 pl-8 pr-3 py-1.5 text-xs text-stone-800 focus:outline-stone-800"
                />
              </div>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto border border-stone-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-100 text-stone-700 uppercase tracking-wider text-[10px] font-semibold border-b border-stone-200">
                  <tr>
                    <th className="p-3">Product / Image</th>
                    <th className="p-3">Category & Season</th>
                    <th className="p-3">Price (PKR)</th>
                    <th className="p-3">Price (USD)</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {draftProducts
                    .filter((p) => {
                      if (productSeasonFilter !== 'all' && p.season !== productSeasonFilter) {
                        return false;
                      }
                      if (productSearch.trim()) {
                        const q = productSearch.toLowerCase();
                        return (
                          p.name.toLowerCase().includes(q) ||
                          p.sku.toLowerCase().includes(q) ||
                          p.category.toLowerCase().includes(q)
                        );
                      }
                      return true;
                    })
                    .map((prod) => (
                      <tr
                        key={prod.id}
                        onDragEnter={() => setDropTargetProductId(prod.id)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => handleProductDrop(prod.id)}
                        className={`hover:bg-stone-50/80 transition-all cursor-pointer ${
                          draggedProductId === prod.id ? 'opacity-50' : ''
                        } ${dropTargetProductId === prod.id ? 'bg-amber-50 ring-1 ring-amber-200' : ''}`}
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                draggable
                                onDragStart={() => handleProductDragStart(prod.id)}
                                onDragEnd={() => {
                                  setDraggedProductId(null);
                                  setDropTargetProductId(null);
                                }}
                                className="flex items-center justify-center w-7 h-7 rounded-xs border border-stone-200 bg-stone-100 text-stone-500 cursor-grab active:cursor-grabbing"
                                title="Drag to reorder product"
                                aria-label={`Reorder ${prod.name}`}
                              >
                                <GripVertical className="w-3.5 h-3.5" />
                              </button>
                              <img
                                src={prod.primaryImage}
                                alt={prod.name}
                                className="w-12 h-14 object-cover rounded-2xs border border-stone-200 shrink-0"
                              />
                            </div>
                            <div>
                              <p className="font-semibold text-stone-900 leading-tight">
                                {prod.name}
                              </p>
                              {dropTargetProductId === prod.id && draggedProductId && (
                                <p className="text-[10px] text-amber-700 font-semibold uppercase tracking-[0.18em] mt-1">
                                  Drop to reorder
                                </p>
                              )}
                              <p className="text-[10px] text-stone-400 font-mono mt-0.5">
                                SKU: {prod.sku} · {prod.pieces}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="font-medium text-stone-800">{prod.category}</span>
                          <span
                            className={`block text-[10px] uppercase font-semibold mt-0.5 ${
                              prod.season === 'summer' ? 'text-amber-700' : 'text-stone-600'
                            }`}
                          >
                            {prod.season}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-semibold text-stone-900">
                          PKR {prod.pricePKR.toLocaleString()}
                        </td>
                        <td className="p-3 font-mono text-stone-600">${prod.priceUSD}</td>
                        <td className="p-3">
                          <div className="flex flex-col gap-1 text-[10px]">
                            {prod.inStock ? (
                              <span className="text-emerald-700 font-medium">● In Stock</span>
                            ) : (
                              <span className="text-rose-600 font-medium">○ Sold Out</span>
                            )}
                            {prod.isBestseller && (
                              <span className="bg-amber-100 text-amber-900 px-1 py-0.2 rounded-2xs w-fit">
                                Bestseller
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setEditingProduct({ ...prod });
                              setIsCreatingProduct(false);
                            }}
                            className="p-1.5 text-stone-600 hover:text-amber-900 hover:bg-stone-200/60 rounded-xs cursor-pointer"
                            title="Edit Product Details"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (
                                window.confirm(`Delete product "${prod.name}" from catalog?`)
                              ) {
                                const remaining = draftProducts.filter((p) => p.id !== prod.id);
                                handleSaveProducts(remaining);
                              }
                            }}
                            className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-xs cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Product Edit / Create Modal */}
            {editingProduct && (
              <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white border border-stone-300 max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-xs shadow-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-amber-900 font-semibold">
                        {isCreatingProduct ? 'Create New Item' : 'Edit Catalog Item'}
                      </span>
                      <h3 className="text-lg font-serif text-stone-900 font-medium">
                        {editingProduct.name || 'Untitled Fabric Set'}
                      </h3>
                    </div>
                    <button
                      onClick={() => setEditingProduct(null)}
                      className="text-stone-400 hover:text-stone-800 text-sm font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">
                        Product Title / Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingProduct.name}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, name: e.target.value })
                        }
                        className="w-full border border-stone-300 p-2"
                        placeholder="e.g. Bahar Flora Digital Lawn 3-Piece"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">SKU</label>
                      <input
                        type="text"
                        value={editingProduct.sku}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, sku: e.target.value })
                        }
                        className="w-full border border-stone-300 p-2 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Season</label>
                      <select
                        value={editingProduct.season}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            season: e.target.value as Season,
                          })
                        }
                        className="w-full border border-stone-300 p-2"
                      >
                        <option value="summer">Summer (Lawn & Cotton)</option>
                        <option value="winter">Winter (Khaddar & Dhanak)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Category</label>
                      <select
                        value={editingProduct.category}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            category: e.target.value as LadiesUnstitchedCategory,
                          })
                        }
                        className="w-full border border-stone-300 p-2"
                      >
                        {editingProduct.season === 'summer'
                          ? draftConfig.categories.summerCategories.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))
                          : draftConfig.categories.winterCategories.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">
                        Price in PKR *
                      </label>
                      <input
                        type="number"
                        value={editingProduct.pricePKR}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            pricePKR: Number(e.target.value),
                          })
                        }
                        className="w-full border border-stone-300 p-2 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">
                        Price in USD *
                      </label>
                      <input
                        type="number"
                        value={editingProduct.priceUSD}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            priceUSD: Number(e.target.value),
                          })
                        }
                        className="w-full border border-stone-300 p-2 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">
                        Color Name & Swatch Hex
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editingProduct.colorName}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              colorName: e.target.value,
                            })
                          }
                          placeholder="e.g. Sage Green"
                          className="w-full border border-stone-300 p-2"
                        />
                        <input
                          type="color"
                          value={editingProduct.colorHex || '#A0A0A0'}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              colorHex: e.target.value,
                            })
                          }
                          className="w-12 h-9 p-0.5 border border-stone-300 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">
                        Pieces Configuration
                      </label>
                      <select
                        value={editingProduct.pieces}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            pieces: e.target.value as PieceType,
                          })
                        }
                        className="w-full border border-stone-300 p-2"
                      >
                        <option value="3-Piece Suit">3-Piece Suit (Shirt, Dupatta, Trouser)</option>
                        <option value="2-Piece Suit">2-Piece Suit (Shirt & Dupatta/Trouser)</option>
                        <option value="Plain Fabric (Per Yard/Meter)">
                          Plain Fabric (Per Yard/Meter)
                        </option>
                      </select>
                    </div>

                    <div className="md:col-span-2 space-y-1">
                      <label className="block font-semibold text-stone-700">
                        Primary Image URL
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editingProduct.primaryImage}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              primaryImage: e.target.value,
                            })
                          }
                          className="w-full border border-stone-300 p-2 font-mono"
                        />
                        <label className="inline-flex items-center justify-center bg-stone-900 text-white text-[10px] uppercase tracking-wider px-3 py-2 rounded-xs cursor-pointer whitespace-nowrap">
                          Crop & Upload
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              if (file) {
                                handleUploadAsset(file, 'product');
                              }
                              event.target.value = '';
                            }}
                          />
                        </label>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <span className="text-[10px] text-stone-400 self-center">
                          Preset Quick Select:
                        </span>
                        {PRESET_ASSET_IMAGES.map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() =>
                              setEditingProduct({
                                ...editingProduct,
                                primaryImage: preset.url,
                              })
                            }
                            className="text-[10px] bg-stone-100 hover:bg-stone-200 px-2 py-0.5 rounded-2xs border border-stone-200 cursor-pointer"
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block font-semibold text-stone-700 mb-1">
                        Description / Fabric Story
                      </label>
                      <textarea
                        rows={2}
                        value={editingProduct.description}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            description: e.target.value,
                          })
                        }
                        className="w-full border border-stone-300 p-2"
                        placeholder="Detailed fabric story, weave texture, organza work, etc."
                      />
                    </div>

                    {/* Fabric Breakdown details */}
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">
                        Shirt Fabric Cut & Weave
                      </label>
                      <input
                        type="text"
                        value={editingProduct.fabricDetails.shirt}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            fabricDetails: {
                              ...editingProduct.fabricDetails,
                              shirt: e.target.value,
                            },
                          })
                        }
                        className="w-full border border-stone-300 p-1.5"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">
                        Dupatta Fabric
                      </label>
                      <input
                        type="text"
                        value={editingProduct.fabricDetails.dupattaOrTrouser}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            fabricDetails: {
                              ...editingProduct.fabricDetails,
                              dupattaOrTrouser: e.target.value,
                            },
                          })
                        }
                        className="w-full border border-stone-300 p-1.5"
                      />
                    </div>

                    <div className="flex items-center gap-6 md:col-span-2 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer font-medium">
                        <input
                          type="checkbox"
                          checked={editingProduct.inStock}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              inStock: e.target.checked,
                            })
                          }
                          className="rounded-2xs"
                        />
                        <span>In Stock / Available for Sale</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer font-medium">
                        <input
                          type="checkbox"
                          checked={editingProduct.isBestseller || false}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              isBestseller: e.target.checked,
                            })
                          }
                          className="rounded-2xs"
                        />
                        <span>Feature as Bestseller</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer font-medium">
                        <input
                          type="checkbox"
                          checked={editingProduct.isNewArrival || false}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              isNewArrival: e.target.checked,
                            })
                          }
                          className="rounded-2xs"
                        />
                        <span>Mark as New Arrival Drop</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
                    <button
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      className="px-4 py-2 border border-stone-300 text-stone-700 hover:bg-stone-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!editingProduct.name.trim()) {
                          alert('Please provide a product title');
                          return;
                        }
                        let updatedList: Product[];
                        if (isCreatingProduct) {
                          updatedList = [editingProduct, ...draftProducts];
                        } else {
                          updatedList = draftProducts.map((p) =>
                            p.id === editingProduct.id ? editingProduct : p
                          );
                        }
                        handleSaveProducts(updatedList);
                        setEditingProduct(null);
                      }}
                      className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-medium cursor-pointer shadow-sm"
                    >
                      {isCreatingProduct ? 'Add to Catalog' : 'Save Product Changes'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= 4. PAYMENT METHODS TAB ================= */}
        {activeTab === 'payments' && (
          <div className="bg-white border border-stone-200 rounded-xs shadow-xs p-6 sm:p-8 space-y-6">
            <div>
              <span className="text-[11px] uppercase tracking-widest text-amber-900 font-semibold">
                Financial Channels & Gateway Accounts
              </span>
              <h2 className="text-2xl font-serif text-stone-900 mt-1">
                Multi-Platform Payment Methods Configuration
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Toggle active payment channels (COD, Studio Counter, Bank Wire, JazzCash, EasyPaisa, SadaPay, Cards) and update your atelier bank credentials shown at checkout.
              </p>
            </div>

            <div className="space-y-5 pt-4 border-t border-stone-100 text-xs">
              {/* COD */}
              <div className="p-4 border border-stone-200 rounded-xs bg-stone-50/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      id="enable_cod"
                      checked={draftConfig.paymentMethods.cod.enabled}
                      onChange={(e) =>
                        setDraftConfig({
                          ...draftConfig,
                          paymentMethods: {
                            ...draftConfig.paymentMethods,
                            cod: {
                              ...draftConfig.paymentMethods.cod,
                              enabled: e.target.checked,
                            },
                          },
                        })
                      }
                      className="cursor-pointer"
                    />
                    <label htmlFor="enable_cod" className="font-semibold text-stone-900 text-sm cursor-pointer">
                      Cash on Delivery (COD Nationwide)
                    </label>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    draftConfig.paymentMethods.cod.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                  }`}>
                    {draftConfig.paymentMethods.cod.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-600 mb-1">Display Title</label>
                    <input
                      type="text"
                      value={draftConfig.paymentMethods.cod.title}
                      onChange={(e) =>
                        setDraftConfig({
                          ...draftConfig,
                          paymentMethods: {
                            ...draftConfig.paymentMethods,
                            cod: {
                              ...draftConfig.paymentMethods.cod,
                              title: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-full bg-white border border-stone-300 p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-1">Customer Instructions</label>
                    <input
                      type="text"
                      value={draftConfig.paymentMethods.cod.instructions}
                      onChange={(e) =>
                        setDraftConfig({
                          ...draftConfig,
                          paymentMethods: {
                            ...draftConfig.paymentMethods,
                            cod: {
                              ...draftConfig.paymentMethods.cod,
                              instructions: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-full bg-white border border-stone-300 p-2"
                    />
                  </div>
                </div>
              </div>

              {/* Pay at Studio */}
              <div className="p-4 border border-stone-200 rounded-xs bg-stone-50/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      id="enable_studio"
                      checked={draftConfig.paymentMethods.pay_at_studio.enabled}
                      onChange={(e) =>
                        setDraftConfig({
                          ...draftConfig,
                          paymentMethods: {
                            ...draftConfig.paymentMethods,
                            pay_at_studio: {
                              ...draftConfig.paymentMethods.pay_at_studio,
                              enabled: e.target.checked,
                            },
                          },
                        })
                      }
                      className="cursor-pointer"
                    />
                    <label htmlFor="enable_studio" className="font-semibold text-stone-900 text-sm cursor-pointer">
                      Pay at Studio Counter (Self Pickup)
                    </label>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    draftConfig.paymentMethods.pay_at_studio.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                  }`}>
                    {draftConfig.paymentMethods.pay_at_studio.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div>
                  <label className="block text-stone-600 mb-1">Studio Pickup Address for Reception</label>
                  <input
                    type="text"
                    value={draftConfig.paymentMethods.pay_at_studio.address}
                    onChange={(e) =>
                      setDraftConfig({
                        ...draftConfig,
                        paymentMethods: {
                          ...draftConfig.paymentMethods,
                          pay_at_studio: {
                            ...draftConfig.paymentMethods.pay_at_studio,
                            address: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full bg-white border border-stone-300 p-2"
                  />
                </div>
              </div>

              {/* Direct Bank Wire */}
              <div className="p-4 border border-stone-200 rounded-xs bg-stone-50/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      id="enable_bank"
                      checked={draftConfig.paymentMethods.bank_transfer.enabled}
                      onChange={(e) =>
                        setDraftConfig({
                          ...draftConfig,
                          paymentMethods: {
                            ...draftConfig.paymentMethods,
                            bank_transfer: {
                              ...draftConfig.paymentMethods.bank_transfer,
                              enabled: e.target.checked,
                            },
                          },
                        })
                      }
                      className="cursor-pointer"
                    />
                    <label htmlFor="enable_bank" className="font-semibold text-stone-900 text-sm cursor-pointer">
                      Direct Bank Transfer / Wire
                    </label>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    draftConfig.paymentMethods.bank_transfer.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                  }`}>
                    {draftConfig.paymentMethods.bank_transfer.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-stone-600 mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={draftConfig.paymentMethods.bank_transfer.bankName}
                      onChange={(e) =>
                        setDraftConfig({
                          ...draftConfig,
                          paymentMethods: {
                            ...draftConfig.paymentMethods,
                            bank_transfer: {
                              ...draftConfig.paymentMethods.bank_transfer,
                              bankName: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-full bg-white border border-stone-300 p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-1">Account Title</label>
                    <input
                      type="text"
                      value={draftConfig.paymentMethods.bank_transfer.accountTitle}
                      onChange={(e) =>
                        setDraftConfig({
                          ...draftConfig,
                          paymentMethods: {
                            ...draftConfig.paymentMethods,
                            bank_transfer: {
                              ...draftConfig.paymentMethods.bank_transfer,
                              accountTitle: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-full bg-white border border-stone-300 p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-1">IBAN / Account #</label>
                    <input
                      type="text"
                      value={draftConfig.paymentMethods.bank_transfer.iban}
                      onChange={(e) =>
                        setDraftConfig({
                          ...draftConfig,
                          paymentMethods: {
                            ...draftConfig.paymentMethods,
                            bank_transfer: {
                              ...draftConfig.paymentMethods.bank_transfer,
                              iban: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-full bg-white border border-stone-300 p-2 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* JazzCash & EasyPaisa */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-stone-200 rounded-xs bg-stone-50/50">
                  <div className="flex items-center justify-between mb-3">
                    <label className="font-semibold text-stone-900 text-sm flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={draftConfig.paymentMethods.jazzcash.enabled}
                        onChange={(e) =>
                          setDraftConfig({
                            ...draftConfig,
                            paymentMethods: {
                              ...draftConfig.paymentMethods,
                              jazzcash: {
                                ...draftConfig.paymentMethods.jazzcash,
                                enabled: e.target.checked,
                              },
                            },
                          })
                        }
                      />
                      <span>JazzCash Mobile Account</span>
                    </label>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-stone-600 text-[11px] mb-0.5">Account Number</label>
                      <input
                        type="text"
                        value={draftConfig.paymentMethods.jazzcash.accountNumber}
                        onChange={(e) =>
                          setDraftConfig({
                            ...draftConfig,
                            paymentMethods: {
                              ...draftConfig.paymentMethods,
                              jazzcash: {
                                ...draftConfig.paymentMethods.jazzcash,
                                accountNumber: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full bg-white border border-stone-300 p-1.5 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-600 text-[11px] mb-0.5">Account Title</label>
                      <input
                        type="text"
                        value={draftConfig.paymentMethods.jazzcash.accountTitle}
                        onChange={(e) =>
                          setDraftConfig({
                            ...draftConfig,
                            paymentMethods: {
                              ...draftConfig.paymentMethods,
                              jazzcash: {
                                ...draftConfig.paymentMethods.jazzcash,
                                accountTitle: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full bg-white border border-stone-300 p-1.5"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-stone-200 rounded-xs bg-stone-50/50">
                  <div className="flex items-center justify-between mb-3">
                    <label className="font-semibold text-stone-900 text-sm flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={draftConfig.paymentMethods.easypaisa.enabled}
                        onChange={(e) =>
                          setDraftConfig({
                            ...draftConfig,
                            paymentMethods: {
                              ...draftConfig.paymentMethods,
                              easypaisa: {
                                ...draftConfig.paymentMethods.easypaisa,
                                enabled: e.target.checked,
                              },
                            },
                          })
                        }
                      />
                      <span>Easypaisa Mobile Account</span>
                    </label>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-stone-600 text-[11px] mb-0.5">Account Number</label>
                      <input
                        type="text"
                        value={draftConfig.paymentMethods.easypaisa.accountNumber}
                        onChange={(e) =>
                          setDraftConfig({
                            ...draftConfig,
                            paymentMethods: {
                              ...draftConfig.paymentMethods,
                              easypaisa: {
                                ...draftConfig.paymentMethods.easypaisa,
                                accountNumber: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full bg-white border border-stone-300 p-1.5 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-600 text-[11px] mb-0.5">Account Title</label>
                      <input
                        type="text"
                        value={draftConfig.paymentMethods.easypaisa.accountTitle}
                        onChange={(e) =>
                          setDraftConfig({
                            ...draftConfig,
                            paymentMethods: {
                              ...draftConfig.paymentMethods,
                              easypaisa: {
                                ...draftConfig.paymentMethods.easypaisa,
                                accountTitle: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full bg-white border border-stone-300 p-1.5"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SadaPay / NayaPay Handle */}
              <div className="p-4 border border-stone-200 rounded-xs bg-stone-50/50">
                <div className="flex items-center justify-between mb-3">
                  <label className="font-semibold text-stone-900 text-sm flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={draftConfig.paymentMethods.nayapay_sadapay.enabled}
                      onChange={(e) =>
                        setDraftConfig({
                          ...draftConfig,
                          paymentMethods: {
                            ...draftConfig.paymentMethods,
                            nayapay_sadapay: {
                              ...draftConfig.paymentMethods.nayapay_sadapay,
                              enabled: e.target.checked,
                            },
                          },
                        })
                      }
                    />
                    <span>SadaPay & NayaPay Instant Handle</span>
                  </label>
                </div>
                <div>
                  <label className="block text-stone-600 mb-1">Handle / Wallet ID</label>
                  <input
                    type="text"
                    value={draftConfig.paymentMethods.nayapay_sadapay.handle}
                    onChange={(e) =>
                      setDraftConfig({
                        ...draftConfig,
                        paymentMethods: {
                          ...draftConfig.paymentMethods,
                          nayapay_sadapay: {
                            ...draftConfig.paymentMethods.nayapay_sadapay,
                            handle: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full bg-white border border-stone-300 p-2 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200 flex justify-end">
              <button
                onClick={handleSaveConfig}
                className="bg-stone-900 hover:bg-stone-800 text-white text-xs uppercase tracking-wider px-6 py-2.5 font-medium cursor-pointer shadow-sm flex items-center gap-2"
              >
                <Save className="w-3.5 h-3.5 text-amber-300" />
                <span>Save Payment Configurations</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= 5. SOCIAL PLATFORMS & WHATSAPP TAB ================= */}
        {activeTab === 'social' && (
          <div className="bg-white border border-stone-200 rounded-xs shadow-xs p-6 sm:p-8 space-y-6">
            <div>
              <span className="text-[11px] uppercase tracking-widest text-amber-900 font-semibold">
                Social Platforms & Live Communication
              </span>
              <h2 className="text-2xl font-serif text-stone-900 mt-1">
                WhatsApp Concierge & Instagram Channels
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Configure your official WhatsApp phone number and Instagram profile. Changes take effect on the floating concierge and header links immediately.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-stone-100 text-xs">
              {/* WhatsApp Config */}
              <div className="p-5 border border-emerald-200 bg-emerald-50/40 rounded-xs space-y-4">
                <div className="flex items-center gap-2 text-emerald-900 font-semibold text-sm">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp Business Setup</span>
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">
                    WhatsApp Phone Number (with Country Code) *
                  </label>
                  <input
                    type="text"
                    required
                    value={draftConfig.social.whatsappNumber}
                    onChange={(e) =>
                      setDraftConfig({
                        ...draftConfig,
                        social: {
                          ...draftConfig.social,
                          whatsappNumber: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. 923008472911"
                    className="w-full bg-white border border-emerald-300 p-2 font-mono text-stone-900"
                  />
                  <p className="text-[10px] text-stone-500 mt-1">
                    Country code + number without dashes or spaces (e.g., 923001234567).
                  </p>
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">
                    Default Auto-Filled Inquiry Message
                  </label>
                  <textarea
                    rows={3}
                    value={draftConfig.social.whatsappDefaultMessage}
                    onChange={(e) =>
                      setDraftConfig({
                        ...draftConfig,
                        social: {
                          ...draftConfig.social,
                          whatsappDefaultMessage: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-white border border-emerald-300 p-2 text-stone-900"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const clean = draftConfig.social.whatsappNumber.replace(/[^0-9]/g, '');
                      window.open(
                        `https://wa.me/${clean}?text=${encodeURIComponent(
                          draftConfig.social.whatsappDefaultMessage
                        )}`,
                        '_blank'
                      );
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Test WhatsApp Redirection</span>
                  </button>
                </div>
              </div>

              {/* Instagram & Other Socials */}
              <div className="p-5 border border-pink-200 bg-pink-50/30 rounded-xs space-y-4">
                <div className="flex items-center gap-2 text-pink-900 font-semibold text-sm">
                  <Instagram className="w-4 h-4 text-pink-600" />
                  <span>Instagram & Social Platforms</span>
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">
                    Official Instagram Page URL *
                  </label>
                  <input
                    type="text"
                    required
                    value={draftConfig.social.instagramUrl}
                    onChange={(e) =>
                      setDraftConfig({
                        ...draftConfig,
                        social: {
                          ...draftConfig.social,
                          instagramUrl: e.target.value,
                        },
                      })
                    }
                    placeholder="https://instagram.com/zavraan.official"
                    className="w-full bg-white border border-pink-300 p-2 text-stone-900"
                  />
                  <p className="text-[10px] text-stone-500 mt-1">
                    Direct link to your verified brand page.
                  </p>
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">
                    Facebook Page URL
                  </label>
                  <input
                    type="text"
                    value={draftConfig.social.facebookUrl}
                    onChange={(e) =>
                      setDraftConfig({
                        ...draftConfig,
                        social: {
                          ...draftConfig.social,
                          facebookUrl: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-white border border-stone-300 p-2 text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">
                    TikTok Profile URL
                  </label>
                  <input
                    type="text"
                    value={draftConfig.social.tiktokUrl}
                    onChange={(e) =>
                      setDraftConfig({
                        ...draftConfig,
                        social: {
                          ...draftConfig.social,
                          tiktokUrl: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-white border border-stone-300 p-2 text-stone-900"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      let target = draftConfig.social.instagramUrl.trim();
                      if (!target.startsWith('http://') && !target.startsWith('https://')) {
                        target = `https://${target.replace('@', 'instagram.com/')}`;
                      }
                      window.open(target, '_blank');
                    }}
                    className="px-4 py-2 bg-pink-700 hover:bg-pink-800 text-white rounded-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Test Instagram Navigation</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200 flex justify-end">
              <button
                onClick={handleSaveConfig}
                className="bg-stone-900 hover:bg-stone-800 text-white text-xs uppercase tracking-wider px-6 py-2.5 font-medium cursor-pointer shadow-sm flex items-center gap-2"
              >
                <Save className="w-3.5 h-3.5 text-amber-300" />
                <span>Save Social Platforms</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= 6. BOTTOM FOOTER & STUDIO TAB ================= */}
        {activeTab === 'footer' && (
          <div className="bg-white border border-stone-200 rounded-xs shadow-xs p-6 sm:p-8 space-y-6">
            <div>
              <span className="text-[11px] uppercase tracking-widest text-amber-900 font-semibold">
                Storefront Footer & Legal Elements
              </span>
              <h2 className="text-2xl font-serif text-stone-900 mt-1">
                Bottom Footer & Atelier Contact Details
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Manage the brand bio, studio physical address, contact emails, showroom hours, and copyright line displayed in the footer.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-stone-100 text-xs">
              <div className="space-y-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Brand Bio / Footer Statement
                  </label>
                  <textarea
                    rows={3}
                    value={draftConfig.footer.brandBio}
                    onChange={(e) =>
                      setDraftConfig({
                        ...draftConfig,
                        footer: {
                          ...draftConfig.footer,
                          brandBio: e.target.value,
                        },
                      })
                    }
                    className="w-full border border-stone-300 p-2 text-xs text-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Studio / Showroom Physical Address
                  </label>
                  <input
                    type="text"
                    value={draftConfig.footer.studioAddress}
                    onChange={(e) =>
                      setDraftConfig({
                        ...draftConfig,
                        footer: {
                          ...draftConfig.footer,
                          studioAddress: e.target.value,
                        },
                      })
                    }
                    className="w-full border border-stone-300 p-2 text-xs text-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Customer Care Phone Line
                  </label>
                  <input
                    type="text"
                    value={draftConfig.footer.phone}
                    onChange={(e) =>
                      setDraftConfig({
                        ...draftConfig,
                        footer: {
                          ...draftConfig.footer,
                          phone: e.target.value,
                        },
                      })
                    }
                    className="w-full border border-stone-300 p-2 text-xs text-stone-900"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Support Email Address
                  </label>
                  <input
                    type="email"
                    value={draftConfig.footer.email}
                    onChange={(e) =>
                      setDraftConfig({
                        ...draftConfig,
                        footer: {
                          ...draftConfig.footer,
                          email: e.target.value,
                        },
                      })
                    }
                    className="w-full border border-stone-300 p-2 text-xs text-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Boutique Timings / Operating Hours
                  </label>
                  <input
                    type="text"
                    value={draftConfig.footer.timings}
                    onChange={(e) =>
                      setDraftConfig({
                        ...draftConfig,
                        footer: {
                          ...draftConfig.footer,
                          timings: e.target.value,
                        },
                      })
                    }
                    className="w-full border border-stone-300 p-2 text-xs text-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Copyright Line
                  </label>
                  <input
                    type="text"
                    value={draftConfig.footer.copyrightText}
                    onChange={(e) =>
                      setDraftConfig({
                        ...draftConfig,
                        footer: {
                          ...draftConfig.footer,
                          copyrightText: e.target.value,
                        },
                      })
                    }
                    className="w-full border border-stone-300 p-2 text-xs text-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Bottom Trust Notice Strip
                  </label>
                  <input
                    type="text"
                    value={draftConfig.footer.noticeBanner}
                    onChange={(e) =>
                      setDraftConfig({
                        ...draftConfig,
                        footer: {
                          ...draftConfig.footer,
                          noticeBanner: e.target.value,
                        },
                      })
                    }
                    className="w-full border border-stone-300 p-2 text-xs text-stone-900"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200 flex justify-end">
              <button
                onClick={handleSaveConfig}
                className="bg-stone-900 hover:bg-stone-800 text-white text-xs uppercase tracking-wider px-6 py-2.5 font-medium cursor-pointer shadow-sm flex items-center gap-2"
              >
                <Save className="w-3.5 h-3.5 text-amber-300" />
                <span>Save Footer Elements</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= 7. APPOINTMENTS & REVIEWS TAB ================= */}
        {activeTab === 'appointments_reviews' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Appointments */}
            <div className="bg-white border border-stone-200 rounded-xs shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-amber-900 font-semibold">
                    Studio Fabric Previews
                  </span>
                  <h3 className="text-lg font-serif text-stone-900 font-medium">
                    Scheduled Appointments ({appointments.length})
                  </h3>
                </div>
              </div>

              {appointments.length === 0 ? (
                <p className="text-xs text-stone-400 py-6 text-center italic">
                  No fabric preview appointments scheduled yet.
                </p>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {appointments.map((appt) => (
                    <div
                      key={appt.id}
                      className="p-3.5 border border-stone-200 bg-stone-50/60 rounded-xl space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-stone-900">
                          {appt.customerName} ({appt.city})
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              appt.appointmentType === 'in_person_atelier'
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                            }`}
                          >
                            {appt.appointmentType === 'in_person_atelier'
                              ? 'In-Person Studio'
                              : 'Virtual Video Call (Free)'}
                          </span>
                          {appt.appointmentType === 'in_person_atelier' && (
                            <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full font-mono">
                              PAID Rs. {appt.feePKR || 1500}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-stone-600 text-[11px]">
                        <span>
                          Date: <strong>{appt.date}</strong> at <strong>{appt.timeSlot}</strong>
                        </span>
                        <span className="font-mono text-stone-400 text-[10px]">{appt.id}</span>
                      </div>

                      <p className="text-stone-500 font-mono text-[11px]">
                        Phone: {appt.phone} {appt.email && appt.email !== 'Not specified' ? `· Email: ${appt.email}` : ''}
                      </p>

                      {/* In-House Verified Payment Details */}
                      {appt.appointmentType === 'in_person_atelier' && (
                        <div className="p-2 bg-white border border-stone-200 rounded-lg text-[11px] font-mono space-y-1">
                          <div className="flex justify-between text-stone-700">
                            <span className="text-stone-500">Payment Channel:</span>
                            <span className="font-bold uppercase text-stone-900">
                              {appt.paymentMethod?.replace('_', ' ') || 'Bank Transfer'}
                            </span>
                          </div>
                          {appt.transactionId && (
                            <div className="flex justify-between text-stone-700">
                              <span className="text-stone-500">Transaction ID:</span>
                              <span className="font-bold text-emerald-700">{appt.transactionId}</span>
                            </div>
                          )}
                          {appt.senderAccount && (
                            <div className="flex justify-between text-stone-700">
                              <span className="text-stone-500">Sender Account:</span>
                              <span className="text-stone-800">{appt.senderAccount}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {appt.productNames && appt.productNames.length > 0 && (
                        <p className="text-stone-600 text-[11px]">
                          Requested: {appt.productNames.join(', ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Customer Reviews Moderation */}
            <div className="bg-white border border-stone-200 rounded-xs shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-amber-900 font-semibold">
                    Customer Feedback System
                  </span>
                  <h3 className="text-lg font-serif text-stone-900 font-medium">
                    Verified Product Reviews ({reviews.length})
                  </h3>
                </div>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3.5 border border-stone-200 bg-stone-50/60 rounded-xs space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-stone-900">
                        {rev.author} ({rev.city}) · {'★'.repeat(rev.rating)}
                      </span>
                      <button
                        onClick={() => {
                          if (window.confirm('Delete this customer review?')) {
                            onDeleteReview(rev.id);
                            showToast('Review removed from storefront.');
                          }
                        }}
                        className="text-stone-400 hover:text-red-600 p-1 cursor-pointer"
                        title="Delete review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="font-medium text-stone-800">{rev.title}</p>
                    <p className="text-stone-500 font-light text-[11px] leading-relaxed">
                      "{rev.comment}"
                    </p>
                    <span className="text-[10px] text-stone-400 block pt-1">
                      Date: {rev.date} · SKU: {rev.productId}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= 8. SECURITY & RESET TAB ================= */}
        {activeTab === 'security' && (
          <div className="bg-white border border-stone-200 rounded-xs shadow-xs p-6 sm:p-8 space-y-8 max-w-2xl">
            <div>
              <span className="text-[11px] uppercase tracking-widest text-amber-900 font-semibold">
                Portal Credentials & System Maintenance
              </span>
              <h2 className="text-2xl font-serif text-stone-900 mt-1">
                Admin Security & Configuration Restoral
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Change the secret master passcode that guards access to this console, or restore factory defaults.
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-stone-100 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Change Master Admin Passcode
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    minLength={8}
                    value={newAdminPasscode}
                    onChange={(e) => setNewAdminPasscode(e.target.value)}
                    placeholder="Enter a new passcode (at least 8 characters)"
                    className="w-full border border-stone-300 p-2 font-mono"
                  />
                  <button
                    onClick={handleChangeAdminPasscode}
                    className="bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 font-medium cursor-pointer shrink-0"
                  >
                    Update Passcode
                  </button>
                </div>
                <p className="text-[11px] text-stone-400 mt-1">
                  Keep this passcode confidential. Only authorized atelier staff should have it.
                </p>
              </div>

              <div className="p-4 bg-stone-50 border border-stone-200 rounded-xs space-y-3">
                <div className="flex items-center gap-2 text-stone-900">
                  <Database className="w-4 h-4 text-amber-700" />
                  <span className="font-semibold text-sm">Direct data migration</span>
                </div>
                <p className="text-stone-600 text-[11px]">
                  Export the live catalog as direct SQL for database migration or as Firebase-ready JSON for JSON-based CMS imports.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleExportSqlMigration}
                    className="bg-stone-900 text-white text-[10px] uppercase tracking-wider px-3 py-2 font-medium rounded-xs cursor-pointer"
                  >
                    SQL Script
                  </button>
                  <button
                    type="button"
                    onClick={handleExportFirebaseMigration}
                    className="bg-amber-700 text-white text-[10px] uppercase tracking-wider px-3 py-2 font-medium rounded-xs cursor-pointer"
                  >
                    Firebase JSON
                  </button>
                  <label className="bg-white border border-stone-300 text-stone-800 text-[10px] uppercase tracking-wider px-3 py-2 font-medium rounded-xs cursor-pointer">
                    Import JSON
                    <input type="file" accept="application/json" className="hidden" onChange={handleImportMigrationFile} />
                  </label>
                </div>
              </div>

              <div className="p-4 bg-red-50 border border-red-200 rounded-xs space-y-2 mt-6">
                <h4 className="font-semibold text-red-900 text-xs uppercase tracking-wider">
                  Danger Zone: Factory Reset
                </h4>
                <p className="text-stone-600 text-xs">
                  Revert all home headlines, category titles, payment account details, social links, and footer texts back to original factory defaults.
                </p>
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="bg-red-700 hover:bg-red-800 text-white text-xs px-4 py-2 rounded-xs font-medium cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Site Config to Factory Defaults</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {cropEditor && (
          <div className="fixed inset-0 z-60 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-stone-300 max-w-2xl w-full rounded-xs shadow-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-amber-800 font-semibold">Image crop & resize</p>
                  <h3 className="text-xl font-serif text-stone-900 mt-1">Finalize media upload</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setCropEditor(null)}
                  className="text-stone-400 hover:text-stone-800 text-lg cursor-pointer"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-4">
                <div className="relative border border-stone-200 rounded-xs p-2 bg-stone-50">
                  <div className="relative w-full h-[360px] overflow-hidden rounded-xs bg-stone-200">
                    <img
                      src={cropEditor.source}
                      alt="Crop preview"
                      className="w-full h-full object-fill"
                    />
                    <div
                      className="absolute border-2 border-amber-400 bg-amber-300/10 shadow-[0_0_0_999px_rgba(20,18,17,0.48)] pointer-events-none"
                      style={{
                        left: `${cropEditor.cropX}%`,
                        top: `${cropEditor.cropY}%`,
                        width: `${cropEditor.cropWidth}%`,
                        height: `${cropEditor.cropHeight}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="flex items-center gap-2 text-stone-700">
                    <Crop className="w-4 h-4 text-amber-700" />
                    <span className="font-semibold uppercase tracking-[0.15em]">Crop settings</span>
                  </div>

                  {[
                    { label: 'Horizontal crop', value: cropEditor.cropX, setValue: (value: number) => setCropEditor((current) => current ? { ...current, cropX: value } : current), min: 0, max: 100 - cropEditor.cropWidth },
                    { label: 'Vertical crop', value: cropEditor.cropY, setValue: (value: number) => setCropEditor((current) => current ? { ...current, cropY: value } : current), min: 0, max: 100 - cropEditor.cropHeight },
                    { label: 'Crop width', value: cropEditor.cropWidth, setValue: (value: number) => setCropEditor((current) => current ? { ...current, cropWidth: value, cropX: Math.min(current.cropX, 100 - value) } : current), min: 5, max: 100 - cropEditor.cropX },
                    { label: 'Crop height', value: cropEditor.cropHeight, setValue: (value: number) => setCropEditor((current) => current ? { ...current, cropHeight: value, cropY: Math.min(current.cropY, 100 - value) } : current), min: 5, max: 100 - cropEditor.cropY },
                  ].map((field) => (
                    <div key={field.label}>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-stone-600">{field.label}</label>
                        <span className="font-mono text-stone-500">{field.value}%</span>
                      </div>
                      <input
                        type="range"
                        min={field.min}
                        max={field.max}
                        value={field.value}
                        onChange={(e) => field.setValue(Number(e.target.value))}
                        className="w-full accent-amber-700"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="block text-stone-600 mb-1">Output size</label>
                    <select
                      value={`${cropEditor.outputWidth}x${cropEditor.outputHeight}`}
                      onChange={(e) => {
                        const [width, height] = e.target.value.split('x').map(Number);
                        setCropEditor((current) => current ? { ...current, outputWidth: width, outputHeight: height } : current);
                      }}
                      className="w-full border border-stone-300 p-2 text-stone-800"
                    >
                      <option value="1200x1200">Square 1200 × 1200</option>
                      <option value="1600x1200">Landscape 1600 × 1200</option>
                      <option value="1200x1600">Portrait 1200 × 1600</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setCropEditor(null)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyCropToImage}
                  className="px-5 py-2 bg-amber-700 hover:bg-amber-600 text-white font-medium cursor-pointer flex items-center gap-2"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Apply & Upload
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
