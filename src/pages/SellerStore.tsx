import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { productApi } from "@/lib/api";
import Navbar from "@/components/Navbar";
import ProductGrid from "@/components/ProductGrid";
import LoadingSpinner from "@/components/LoadingSpinner";
import SellerStoreSkeleton from "@/components/SellerStoreSkeleton";
import { Store } from "lucide-react";

const SellerStore = () => {
  const { sellerId } = useParams<{ sellerId: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sellerId) return;
    productApi.getStore(sellerId).then(setData).catch(() => {}).finally(() => setLoading(false));
  }, [sellerId]);

  if (loading) return <SellerStoreSkeleton />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-6 space-y-6">
        {data?.seller && (
          <div className="flex items-center gap-4 rounded-xl bg-card p-6 shadow-soft">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              {data.seller.profilePic?.imageUrl ? (
                <img src={data.seller.profilePic.imageUrl} alt="" className="h-full w-full rounded-full object-cover" />
              ) : (
                <Store className="h-8 w-8 text-primary" />
              )}
            </div>
            <div>
              <h1 className="font-satoshi text-2xl font-bold">{data.seller.storeName}</h1>
              {data.seller.storeDescription && <p className="text-sm text-muted-foreground mt-1">{data.seller.storeDescription}</p>}
              {data.seller.location && <p className="text-xs text-muted-foreground mt-1">📍 {data.seller.location}</p>}
            </div>
          </div>
        )}
        <ProductGrid products={data?.products || []} title="Products" />
      </div>
    </div>
  );
};

export default SellerStore;
