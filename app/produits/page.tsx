import { getProduits } from "@/lib/products"
import ProduitsContent from "@/components/ProduitsContent"

export default async function ProduitsPage() {
  const { produits, categories } = await getProduits()
  console.log(produits);

  return <ProduitsContent produits={produits} categories={categories} />
}
